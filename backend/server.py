import os
import io
import base64
import hashlib
import asyncio
from datetime import datetime, timezone
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from supabase import create_client, Client
import feedparser
import httpx

# Initialize FastAPI
app = FastAPI(title="Narvo API", version="2.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize clients
supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_ANON_KEY")
)

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

# African News RSS Feeds
RSS_FEEDS = [
    {"name": "Vanguard Nigeria", "url": "https://www.vanguardngr.com/feed/", "region": "Nigeria"},
    {"name": "Punch Nigeria", "url": "https://punchng.com/feed/", "region": "Nigeria"},
    {"name": "Daily Trust", "url": "https://dailytrust.com/feed/", "region": "Nigeria"},
    {"name": "Premium Times", "url": "https://www.premiumtimesng.com/feed", "region": "Nigeria"},
    {"name": "The Guardian Nigeria", "url": "https://guardian.ng/feed/", "region": "Nigeria"},
    {"name": "BBC Africa", "url": "https://feeds.bbci.co.uk/news/world/africa/rss.xml", "region": "Continental"},
    {"name": "Al Jazeera Africa", "url": "https://www.aljazeera.com/xml/rss/all.xml", "region": "Continental"},
]

# Voice configurations for regional accents (mapped to OpenAI voices)
VOICE_PROFILES = [
    {"id": "nova", "name": "Nova", "accent": "Standard", "description": "Energetic, upbeat broadcast voice"},
    {"id": "onyx", "name": "Onyx", "accent": "Pidgin", "description": "Deep, authoritative Pidgin-style voice"},
    {"id": "echo", "name": "Echo", "accent": "Yoruba", "description": "Smooth, calm Yoruba-style delivery"},
    {"id": "alloy", "name": "Alloy", "accent": "Hausa", "description": "Neutral, balanced Hausa-style voice"},
    {"id": "shimmer", "name": "Shimmer", "accent": "Igbo", "description": "Bright, cheerful Igbo-style voice"},
]

# Pydantic Models
class NewsItem(BaseModel):
    id: str
    title: str
    summary: str
    narrative: Optional[str] = None
    source: str
    source_url: str
    published: str
    region: str
    category: str = "General"
    truth_score: int = 100
    audio_url: Optional[str] = None
    listen_count: int = 0
    tags: List[str] = []

class TTSRequest(BaseModel):
    text: str
    voice_id: str = "nova"
    stability: float = 0.5
    similarity_boost: float = 0.75

class TTSResponse(BaseModel):
    audio_url: str
    text: str
    voice_id: str

class ParaphraseRequest(BaseModel):
    text: str
    style: str = "broadcast"

class ParaphraseResponse(BaseModel):
    original: str
    narrative: str
    key_takeaways: List[str]

class VoiceProfile(BaseModel):
    id: str
    name: str
    accent: str
    description: str

class UserPreferences(BaseModel):
    voice_id: str = "21m00Tcm4TlvDq8ikWAM"
    region: str = "Nigeria"
    interests: List[str] = []

# Helper Functions
def generate_news_id(title: str, source: str) -> str:
    """Generate unique ID for news item"""
    content = f"{title}{source}".encode()
    return hashlib.md5(content).hexdigest()[:12]

def extract_category(title: str, summary: str) -> str:
    """Simple category extraction based on keywords"""
    text = (title + " " + summary).lower()
    if any(word in text for word in ["election", "government", "president", "minister", "policy"]):
        return "Politics"
    elif any(word in text for word in ["economy", "market", "stock", "naira", "inflation", "trade"]):
        return "Economy"
    elif any(word in text for word in ["tech", "digital", "app", "startup", "innovation"]):
        return "Tech"
    elif any(word in text for word in ["sport", "football", "match", "player", "league"]):
        return "Sports"
    elif any(word in text for word in ["health", "hospital", "disease", "medical", "doctor"]):
        return "Health"
    return "General"

def extract_tags(title: str, category: str) -> List[str]:
    """Extract hashtags from content"""
    tags = [f"#{category.upper()}"]
    if "nigeria" in title.lower():
        tags.append("#NIGERIA")
    if "africa" in title.lower():
        tags.append("#AFRICA")
    return tags[:3]

async def fetch_rss_feed(feed_info: dict) -> List[dict]:
    """Fetch and parse RSS feed"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(feed_info["url"])
            if response.status_code == 200:
                feed = feedparser.parse(response.text)
                items = []
                for entry in feed.entries[:5]:  # Limit to 5 per source
                    title = entry.get("title", "")
                    summary = entry.get("summary", entry.get("description", ""))[:500]
                    # Clean HTML from summary
                    import re
                    summary = re.sub(r'<[^>]+>', '', summary)
                    
                    category = extract_category(title, summary)
                    items.append({
                        "id": generate_news_id(title, feed_info["name"]),
                        "title": title,
                        "summary": summary,
                        "source": feed_info["name"],
                        "source_url": entry.get("link", ""),
                        "published": entry.get("published", datetime.now(timezone.utc).isoformat()),
                        "region": feed_info["region"],
                        "category": category,
                        "truth_score": 100,
                        "tags": extract_tags(title, category),
                        "listen_count": 0
                    })
                return items
    except Exception as e:
        print(f"Error fetching {feed_info['name']}: {e}")
    return []

async def generate_narrative(text: str) -> dict:
    """Generate broadcast narrative using Gemini via emergentintegrations"""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"narvo-{datetime.now().timestamp()}",
            system_message="""You are a professional broadcast journalist for Narvo, an African news platform. 
Your task is to transform news summaries into engaging broadcast narratives.

Style Guidelines:
- Write in a clear, authoritative broadcast tone
- Keep narratives concise but informative (2-3 paragraphs max)
- Include context that helps listeners understand the significance
- Extract 2-3 key takeaways as bullet points
- Maintain journalistic objectivity

Respond in JSON format:
{
  "narrative": "The broadcast narrative text...",
  "key_takeaways": ["Point 1", "Point 2", "Point 3"]
}"""
        ).with_model("gemini", "gemini-2.0-flash")
        
        user_message = UserMessage(text=f"Transform this news into a broadcast narrative:\n\n{text}")
        response = await chat.send_message(user_message)
        
        # Parse JSON response
        import json
        # Clean response if it has markdown code blocks
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("```")[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
        cleaned = cleaned.strip()
        
        result = json.loads(cleaned)
        return result
    except Exception as e:
        print(f"Error generating narrative: {e}")
        return {
            "narrative": text,
            "key_takeaways": ["Story details available in full article"]
        }

# API Endpoints
@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "service": "Narvo API",
        "version": "2.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/api/news", response_model=List[NewsItem])
async def get_news(
    region: Optional[str] = Query(None, description="Filter by region"),
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(20, le=50, description="Number of items to return")
):
    """Fetch aggregated news from RSS feeds"""
    all_news = []
    
    # Fetch from all RSS feeds concurrently
    tasks = [fetch_rss_feed(feed) for feed in RSS_FEEDS]
    results = await asyncio.gather(*tasks)
    
    for items in results:
        all_news.extend(items)
    
    # Apply filters
    if region:
        all_news = [n for n in all_news if n["region"].lower() == region.lower()]
    if category:
        all_news = [n for n in all_news if n["category"].lower() == category.lower()]
    
    # Sort by recency and return
    all_news.sort(key=lambda x: x.get("published", ""), reverse=True)
    return all_news[:limit]

@app.get("/api/news/{news_id}")
async def get_news_detail(news_id: str):
    """Get detailed news item with narrative"""
    # Fetch fresh news to find the item
    all_news = []
    tasks = [fetch_rss_feed(feed) for feed in RSS_FEEDS]
    results = await asyncio.gather(*tasks)
    
    for items in results:
        all_news.extend(items)
    
    # Find the news item
    news_item = next((n for n in all_news if n["id"] == news_id), None)
    
    if not news_item:
        raise HTTPException(status_code=404, detail="News item not found")
    
    # Generate narrative if not present
    if not news_item.get("narrative"):
        narrative_data = await generate_narrative(f"{news_item['title']}\n\n{news_item['summary']}")
        news_item["narrative"] = narrative_data.get("narrative", news_item["summary"])
        news_item["key_takeaways"] = narrative_data.get("key_takeaways", [])
    
    return news_item

@app.post("/api/paraphrase", response_model=ParaphraseResponse)
async def paraphrase_content(request: ParaphraseRequest):
    """Generate broadcast narrative from text"""
    narrative_data = await generate_narrative(request.text)
    
    return ParaphraseResponse(
        original=request.text,
        narrative=narrative_data.get("narrative", request.text),
        key_takeaways=narrative_data.get("key_takeaways", [])
    )

@app.post("/api/tts/generate", response_model=TTSResponse)
async def generate_tts(request: TTSRequest):
    """Generate text-to-speech audio using OpenAI TTS via Emergent"""
    try:
        from emergentintegrations.llm.openai import OpenAITextToSpeech
        
        # Map voice_id to OpenAI voice if needed
        voice = request.voice_id if request.voice_id in ["alloy", "ash", "coral", "echo", "fable", "nova", "onyx", "sage", "shimmer"] else "nova"
        
        # Truncate text to 4096 chars (OpenAI limit)
        text = request.text[:4096] if len(request.text) > 4096 else request.text
        
        tts = OpenAITextToSpeech(api_key=EMERGENT_LLM_KEY)
        
        # Generate speech using tts-1 model
        audio_bytes = await tts.generate_speech(
            text=text,
            model="tts-1",
            voice=voice,
            response_format="mp3",
            speed=1.0
        )
        
        # Convert to base64
        audio_b64 = base64.b64encode(audio_bytes).decode()
        
        return TTSResponse(
            audio_url=f"data:audio/mpeg;base64,{audio_b64}",
            text=request.text,
            voice_id=voice
        )
    except Exception as e:
        print(f"TTS Error: {e}")
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {str(e)}")

@app.get("/api/voices", response_model=List[VoiceProfile])
async def get_voices():
    """Get available voice profiles"""
    return VOICE_PROFILES

@app.get("/api/regions")
async def get_regions():
    """Get available news regions"""
    return [
        {"id": "nigeria", "name": "Nigeria", "icon": "NG"},
        {"id": "continental", "name": "Continental", "icon": "AF"},
    ]

@app.get("/api/categories")
async def get_categories():
    """Get news categories"""
    return [
        {"id": "politics", "name": "Politics", "icon": "building"},
        {"id": "economy", "name": "Economy", "icon": "chart"},
        {"id": "tech", "name": "Tech", "icon": "cpu"},
        {"id": "sports", "name": "Sports", "icon": "trophy"},
        {"id": "health", "name": "Health", "icon": "heart"},
        {"id": "general", "name": "General", "icon": "newspaper"},
    ]

@app.get("/api/trending")
async def get_trending():
    """Get trending tags and topics"""
    return {
        "tags": ["#POLITICS", "#ECONOMY", "#NIGERIA", "#AFRICA", "#TECH"],
        "topics": [
            {"name": "Elections 2025", "count": "12.5k"},
            {"name": "Naira Exchange", "count": "8.2k"},
            {"name": "AfCFTA Trade", "count": "5.1k"},
        ]
    }

@app.get("/api/metrics")
async def get_metrics():
    """Get platform metrics for dashboard"""
    return {
        "listeners_today": "14.2k",
        "sources_online": 89,
        "stories_processed": 342,
        "signal_strength": "98%",
        "network_load": "42%"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
