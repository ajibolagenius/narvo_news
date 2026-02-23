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

class BriefingStory(BaseModel):
    id: str
    title: str
    summary: str
    source: str
    category: str

class MorningBriefing(BaseModel):
    id: str
    title: str
    generated_at: str
    duration_estimate: str
    stories: List[BriefingStory]
    script: str
    audio_url: Optional[str] = None
    voice_id: str = "nova"

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
    voice_id: str = "nova"
    region: str = "Nigeria"
    interests: List[str] = []

class BookmarkRequest(BaseModel):
    user_id: str
    story_id: str
    title: str
    summary: str = ""
    source: str = ""
    category: str = "General"
    source_url: str = ""
    saved_at: str = ""

# In-memory bookmark store (keyed by user_id)
_bookmarks_store: dict = {}

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

# Morning Briefing Cache
_briefing_cache = {
    "briefing": None,
    "generated_at": None
}

async def generate_briefing_script(stories: List[dict]) -> str:
    """Generate a broadcast script from top stories using Gemini"""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        # Limit story summaries to reduce processing load
        stories_text = "\n\n".join([
            f"**{s['title'][:100]}** ({s['source']})\n{s['summary'][:200]}"
            for s in stories[:5]
        ])
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"briefing-{datetime.now().timestamp()}",
            system_message="""You are a professional broadcast journalist for Narvo. Create a concise 3-minute radio-style briefing script.

Requirements:
- Open with a brief greeting
- Cover each story in 2-3 sentences
- Use smooth transitions
- End with a short sign-off
- Keep it under 500 words
- Plain text only, no markdown"""
        ).with_model("gemini", "gemini-2.0-flash")
        
        user_message = UserMessage(
            text=f"Create a brief morning news script:\n\n{stories_text}"
        )
        response = await chat.send_message(user_message)
        return response.strip()
    except Exception as e:
        print(f"Error generating briefing script: {e}")
        # Fallback to simple concatenation
        script = f"Good morning, this is your Narvo Morning Briefing for {datetime.now().strftime('%A, %B %d, %Y')}.\n\n"
        for i, story in enumerate(stories[:5], 1):
            script += f"Story {i}: {story['title'][:100]}. {story['summary'][:150]}.\n\n"
        script += "That's all for this morning's briefing. Stay informed with Narvo."
        return script

@app.get("/api/briefing/generate")
async def generate_morning_briefing(
    voice_id: str = Query("nova", description="Voice for TTS"),
    force_regenerate: bool = Query(False, description="Force regeneration")
):
    """Generate or retrieve morning briefing with audio"""
    global _briefing_cache
    
    now = datetime.now(timezone.utc)
    cache_valid = (
        _briefing_cache["briefing"] is not None and 
        _briefing_cache["generated_at"] is not None and
        (now - _briefing_cache["generated_at"]).total_seconds() < 3600  # 1 hour cache
    )
    
    if cache_valid and not force_regenerate:
        return _briefing_cache["briefing"]
    
    try:
        # Fetch top stories with timeout
        all_news = []
        tasks = [fetch_rss_feed(feed) for feed in RSS_FEEDS[:4]]  # Limit feeds for faster response
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for items in results:
            if isinstance(items, list):
                all_news.extend(items)
        
        # Sort by recency and get top 5
        all_news.sort(key=lambda x: x.get("published", ""), reverse=True)
        top_stories = all_news[:5]
        
        if not top_stories:
            raise HTTPException(status_code=404, detail="No stories available for briefing")
        
        # Generate briefing script
        script = await generate_briefing_script(top_stories)
        
        # Generate TTS audio with shorter text
        audio_url = None
        try:
            from emergentintegrations.llm.openai import OpenAITextToSpeech
            
            # Truncate to reduce processing time
            tts_text = script[:2500] if len(script) > 2500 else script
            
            tts = OpenAITextToSpeech(api_key=EMERGENT_LLM_KEY)
            audio_bytes = await tts.generate_speech(
                text=tts_text,
                model="tts-1",
                voice=voice_id,
                response_format="mp3",
                speed=1.0
            )
            audio_b64 = base64.b64encode(audio_bytes).decode()
            audio_url = f"data:audio/mpeg;base64,{audio_b64}"
        except Exception as e:
            print(f"TTS Error for briefing: {e}")
        
        # Build briefing response
        briefing = MorningBriefing(
            id=f"briefing-{now.strftime('%Y%m%d-%H%M')}",
            title=f"Morning Briefing - {now.strftime('%B %d, %Y')}",
            generated_at=now.isoformat(),
            duration_estimate="~3 minutes",
            stories=[
                BriefingStory(
                    id=s["id"],
                    title=s["title"][:100],
                    summary=s["summary"][:150] + "..." if len(s.get("summary", "")) > 150 else s.get("summary", ""),
                    source=s["source"],
                    category=s.get("category", "General")
                )
                for s in top_stories
            ],
            script=script,
            audio_url=audio_url,
            voice_id=voice_id
        )
        
        # Cache the briefing
        _briefing_cache = {
            "briefing": briefing,
            "generated_at": now
        }
        
        return briefing
    except HTTPException:
        raise
    except Exception as e:
        print(f"Briefing generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate briefing: {str(e)}")

@app.get("/api/briefing/latest")
async def get_latest_briefing():
    """Get the most recent cached briefing (without regenerating)"""
    if _briefing_cache["briefing"] is None:
        raise HTTPException(status_code=404, detail="No briefing available. Generate one first.")
    return _briefing_cache["briefing"]

@app.post("/api/briefing/audio")
async def generate_briefing_audio(
    script: str = Query(..., description="Briefing script text"),
    voice_id: str = Query("nova", description="Voice for TTS")
):
    """Generate audio for a custom briefing script"""
    try:
        from emergentintegrations.llm.openai import OpenAITextToSpeech
        
        tts_text = script[:4000] if len(script) > 4000 else script
        
        tts = OpenAITextToSpeech(api_key=EMERGENT_LLM_KEY)
        audio_bytes = await tts.generate_speech(
            text=tts_text,
            model="tts-1",
            voice=voice_id,
            response_format="mp3",
            speed=1.0
        )
        audio_b64 = base64.b64encode(audio_bytes).decode()
        
        return {
            "audio_url": f"data:audio/mpeg;base64,{audio_b64}",
            "voice_id": voice_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio generation failed: {str(e)}")

# ===========================================
# BOOKMARK ENDPOINTS
# ===========================================
@app.post("/api/bookmarks")
async def add_bookmark(request: BookmarkRequest):
    """Add a bookmark for a user"""
    user_id = request.user_id
    if user_id not in _bookmarks_store:
        _bookmarks_store[user_id] = []
    
    # Remove existing bookmark with same story_id
    _bookmarks_store[user_id] = [b for b in _bookmarks_store[user_id] if b["story_id"] != request.story_id]
    
    bookmark = {
        "story_id": request.story_id,
        "title": request.title,
        "summary": request.summary,
        "source": request.source,
        "category": request.category,
        "source_url": request.source_url,
        "saved_at": request.saved_at or datetime.now(timezone.utc).isoformat(),
    }
    _bookmarks_store[user_id].append(bookmark)
    return {"status": "ok", "bookmark": bookmark}

@app.get("/api/bookmarks")
async def get_bookmarks(user_id: str = Query(..., description="User ID")):
    """Get all bookmarks for a user"""
    return _bookmarks_store.get(user_id, [])

@app.delete("/api/bookmarks/{story_id}")
async def remove_bookmark(story_id: str, user_id: str = Query(..., description="User ID")):
    """Remove a bookmark"""
    if user_id in _bookmarks_store:
        _bookmarks_store[user_id] = [b for b in _bookmarks_store[user_id] if b["story_id"] != story_id]
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
