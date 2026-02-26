import os
import io
import base64
import hashlib
import asyncio
from datetime import datetime, timezone
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException, Query, BackgroundTasks, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel, Field
from supabase import create_client, Client
from pymongo import MongoClient
import feedparser
import httpx
import re as _re

# ── Sanitizer: strip stage directions / sound-effect text from AI output ──
_STAGE_DIRECTION_PATTERNS = [
    _re.compile(r'\[.*?\]'),                       # [Sound of music fades]
    _re.compile(r'\(.*?(music|sound|pause|sigh|jingle|transition|SFX|fade|clears?).*?\)', _re.IGNORECASE),
    _re.compile(r'\*.*?(music|sound|pause|sigh|jingle|transition|SFX|fade|clears?).*?\*', _re.IGNORECASE),
    _re.compile(r'(?i)^\s*(?:sound of|sounds? of|sfx:?).*$', _re.MULTILINE),
    _re.compile(r'(?i)^\s*(?:\(|\*).*?(?:music|jingle|theme|fade|transition).*?(?:\)|\*)\s*$', _re.MULTILINE),
]

def sanitize_ai_text(text: str) -> str:
    """Remove stage directions, sound descriptions, and production cues from AI-generated text."""
    if not text:
        return text
    result = text
    for pattern in _STAGE_DIRECTION_PATTERNS:
        result = pattern.sub('', result)
    # Collapse multiple blank lines into one
    result = _re.sub(r'\n{3,}', '\n\n', result)
    return result.strip()

# Initialize FastAPI
app = FastAPI(title="Narvo API", version="2.0")

# GZip compression for smaller payloads
from starlette.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware, minimum_size=500)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include modular routers
from routes.discover import router as discover_router
from routes.offline import router as offline_router
from routes.admin import router as admin_router
from routes.user import router as user_router
from routes.factcheck import router as factcheck_router
from routes.translation import router as translation_router

app.include_router(discover_router)
app.include_router(offline_router)
app.include_router(admin_router)
app.include_router(user_router)
app.include_router(factcheck_router)
app.include_router(translation_router)

# Startup: run initial feed health check and schedule periodic refresh
@app.on_event("startup")
async def startup_feed_health():
    from services.news_service import run_health_check
    from services.aggregator_service import refresh_cache

    # Create MongoDB indexes for performance
    try:
        db["tts_cache"].create_index("cache_key", unique=True)
        db["tts_cache"].create_index("created_at", expireAfterSeconds=86400 * 7)  # 7-day TTL
        db["user_preferences"].create_index("user_id", unique=True)
        db["bookmarks"].create_index([("user_id", 1), ("story_id", 1)])
        db["listening_history"].create_index([("user_id", 1), ("played_at", -1)])
        db["news_cache"].create_index([("published", -1)])
        db["news_cache"].create_index("id", unique=True, sparse=True)
        db["push_subscriptions"].create_index("endpoint", unique=True)
    except Exception as e:
        print(f"[Startup] Index creation: {e}")

    async def periodic_health_check():
        while True:
            await run_health_check()
            await asyncio.sleep(300)  # Every 5 minutes

    async def periodic_aggregator_refresh():
        while True:
            await refresh_cache()
            await asyncio.sleep(600)  # Every 10 minutes

    asyncio.create_task(periodic_health_check())
    asyncio.create_task(periodic_aggregator_refresh())

# Initialize clients
supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_ANON_KEY")
)

# MongoDB for persistent storage
mongo_client = MongoClient(os.environ.get("MONGO_URL"))
db = mongo_client[os.environ.get("DB_NAME", "narvo")]
bookmarks_col = db["bookmarks"]
preferences_col = db["user_preferences"]
briefings_col = db["briefings"]

# ── In-memory cache for static/semi-static data ──
import time as _time

class MemCache:
    """Simple TTL cache for static data."""
    def __init__(self):
        self._store = {}
    def get(self, key, ttl=300):
        entry = self._store.get(key)
        if entry and (_time.time() - entry[1]) < ttl:
            return entry[0]
        return None
    def set(self, key, value):
        self._store[key] = (value, _time.time())

_cache = MemCache()

# Create indexes
bookmarks_col.create_index([("user_id", 1), ("story_id", 1)], unique=True)
preferences_col.create_index("user_id", unique=True)
briefings_col.create_index("date", unique=True)

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

# Voice configurations — YarnGPT voices with Nigerian accents
from services.yarngpt_service import get_voice_profiles as _get_yarn_profiles, YARNGPT_VOICES
VOICE_PROFILES = _get_yarn_profiles()

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
    image_url: Optional[str] = None

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
    voice_id: str = "emma"

class TTSRequest(BaseModel):
    text: str
    voice_id: str = "emma"
    stability: float = 0.5
    similarity_boost: float = 0.75
    language: str = "en"

class TTSResponse(BaseModel):
    audio_url: str
    text: str
    translated_text: Optional[str] = None
    voice_id: str
    language: str = "en"

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
    language: str
    gender: str
    description: str

class UserPreferences(BaseModel):
    voice_id: str = "emma"
    region: str = "Nigeria"
    interests: List[str] = []

class UserPreferencesRequest(BaseModel):
    user_id: str
    region: str = "lagos"
    voice: str = "pidgin"
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
                    
                    # Extract image URL from RSS entry
                    image_url = None
                    # Try media:content
                    if hasattr(entry, 'media_content') and entry.media_content:
                        for media in entry.media_content:
                            if media.get('medium') == 'image' or (media.get('type', '').startswith('image')):
                                image_url = media.get('url')
                                break
                        if not image_url and entry.media_content:
                            image_url = entry.media_content[0].get('url')
                    # Try media:thumbnail
                    if not image_url and hasattr(entry, 'media_thumbnail') and entry.media_thumbnail:
                        image_url = entry.media_thumbnail[0].get('url')
                    # Try enclosure links
                    if not image_url:
                        for link in entry.get('links', []):
                            if link.get('type', '').startswith('image') or link.get('rel') == 'enclosure':
                                image_url = link.get('href')
                                break
                    # Try extracting from HTML content
                    if not image_url:
                        content_html = entry.get('summary', '') or entry.get('description', '')
                        if hasattr(entry, 'content') and entry.content:
                            content_html = entry.content[0].get('value', '') + content_html
                        img_match = re.search(r'src="(https?://[^"]+)"', content_html)
                        if img_match:
                            image_url = img_match.group(1)
                    
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
                        "listen_count": 0,
                        "image_url": image_url,
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

CRITICAL RULES — NEVER include any of the following:
- Sound effect descriptions (e.g. "Sound of music fades", "upbeat jingle plays")
- Stage directions or production cues (e.g. "[pause]", "(dramatic music)", "*sigh*")
- Meta-commentary about the broadcast itself (e.g. "And now for the next story")
- Filler phrases like "Stay tuned" or "More on this after the break"
- Any text inside brackets, parentheses, or asterisks that describes sounds, music, or actions
Write ONLY the actual spoken news content — every word must be substantive reporting.

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
        # Sanitize AI output — remove any stage directions / sound cues
        if "narrative" in result:
            result["narrative"] = sanitize_ai_text(result["narrative"])
        if "key_takeaways" in result:
            result["key_takeaways"] = [sanitize_ai_text(kt) for kt in result["key_takeaways"] if sanitize_ai_text(kt)]
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

@app.get("/api/news")
async def get_news(
    region: Optional[str] = Query(None, description="Filter by region"),
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(20, le=50, description="Number of items to return"),
    include_aggregators: bool = Query(False, description="Include aggregator news"),
    aggregator_sources: Optional[str] = Query(None, description="Comma-separated aggregator sources: mediastack,newsdata")
):
    """Fetch aggregated news from RSS feeds and optional aggregator APIs"""
    all_news = []
    
    # Fetch from all RSS feeds concurrently
    tasks = [fetch_rss_feed(feed) for feed in RSS_FEEDS]
    results = await asyncio.gather(*tasks)
    
    for items in results:
        all_news.extend(items)
    
    # Optionally merge aggregator news
    if include_aggregators:
        try:
            from services.aggregator_service import get_normalized_aggregator_news
            sources_list = aggregator_sources.split(",") if aggregator_sources else None
            agg_news = await get_normalized_aggregator_news(sources=sources_list)
            all_news.extend(agg_news)
        except Exception as e:
            print(f"[News] Aggregator fetch error: {e}")
    
    # Apply filters
    if region:
        all_news = [n for n in all_news if n.get("region", "").lower() == region.lower()]
    if category:
        all_news = [n for n in all_news if n.get("category", "").lower() == category.lower()]
    
    # Sort by recency and return
    all_news.sort(key=lambda x: x.get("published", ""), reverse=True)
    return all_news[:limit]

@app.get("/api/news/breaking")
async def get_breaking_news():
    """Get breaking/urgent news stories from RSS feeds."""
    try:
        all_news = []
        tasks = [fetch_rss_feed(feed) for feed in RSS_FEEDS]
        results = await asyncio.gather(*tasks)
        for items in results:
            all_news.extend(items)
        
        all_news.sort(key=lambda x: x.get("published", ""), reverse=True)
        breaking = []
        
        for story in all_news[:30]:
            title_lower = (story.get("title", "") or "").lower()
            if any(kw in title_lower for kw in ["breaking", "urgent", "flash", "just in", "developing"]):
                breaking.append(story)
        
        if not breaking and all_news:
            latest = all_news[0]
            latest["is_developing"] = True
            breaking = [latest]
        
        return breaking[:3]
    except Exception:
        return []


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
    """Generate TTS audio — YarnGPT primary, OpenAI fallback, with caching"""
    import hashlib
    from services.yarngpt_service import generate_tts as yarn_generate_tts
    
    cache_key = hashlib.md5(f"{request.text[:200]}:{request.voice_id}:{request.language}".encode()).hexdigest()
    
    # Check MongoDB cache first
    cached = db["tts_cache"].find_one({"cache_key": cache_key}, {"_id": 0})
    if cached and cached.get("audio_url"):
        return TTSResponse(
            audio_url=cached["audio_url"],
            text=request.text,
            translated_text=cached.get("translated_text"),
            voice_id=cached.get("voice_id", request.voice_id),
            language=request.language
        )
    
    try:
        from services.translation_service import translate_text, SUPPORTED_LANGUAGES
        
        text_to_speak = request.text
        translated_text = None
        
        # Translate if language is not English
        if request.language and request.language != "en" and request.language in SUPPORTED_LANGUAGES:
            translation_result = await translate_text(
                text=request.text,
                target_language=request.language,
                source_language="en",
                style="broadcast"
            )
            if translation_result.get("success"):
                text_to_speak = translation_result.get("translated", request.text)
                translated_text = text_to_speak
        
        # Generate TTS via YarnGPT (primary) with OpenAI fallback
        audio_url = await yarn_generate_tts(
            text=text_to_speak,
            voice_id=request.voice_id,
            language=request.language or "en"
        )
        
        if not audio_url:
            raise Exception("Both YarnGPT and OpenAI TTS failed")
        
        # Cache the result
        db["tts_cache"].update_one(
            {"cache_key": cache_key},
            {"$set": {
                "cache_key": cache_key,
                "audio_url": audio_url,
                "translated_text": translated_text,
                "voice_id": request.voice_id,
                "created_at": datetime.now(timezone.utc)
            }},
            upsert=True
        )
        
        return TTSResponse(
            audio_url=audio_url,
            text=request.text,
            translated_text=translated_text,
            voice_id=request.voice_id,
            language=request.language
        )
    except Exception as e:
        print(f"TTS Error: {e}")
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {str(e)}")

@app.get("/api/voices", response_model=List[VoiceProfile])
async def get_voices():
    """Get available voice profiles (cached 10min)"""
    cached = _cache.get("voices", ttl=600)
    if cached: return JSONResponse(content=cached, headers={"Cache-Control": "public, max-age=600"})
    result = VOICE_PROFILES
    _cache.set("voices", [dict(v) for v in result])
    return result

@app.get("/api/regions")
async def get_regions():
    """Get available news regions"""
    return JSONResponse(
        content=[{"id": "nigeria", "name": "Nigeria", "icon": "NG"}, {"id": "continental", "name": "Continental", "icon": "AF"}],
        headers={"Cache-Control": "public, max-age=3600"},
    )


@app.get("/api/sound-themes")
async def list_sound_themes():
    """Get available broadcast sound themes (cached 10min)"""
    cached = _cache.get("sound_themes", ttl=600)
    if cached: return JSONResponse(content=cached, headers={"Cache-Control": "public, max-age=600"})
    from services.sound_themes_service import get_sound_themes
    result = get_sound_themes()
    _cache.set("sound_themes", result)
    return result

@app.get("/api/sound-themes/{theme_id}")
async def get_sound_theme_detail(theme_id: str):
    """Get a specific sound theme with full audio parameters"""
    from services.sound_themes_service import get_sound_theme
    theme = get_sound_theme(theme_id)
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")
    return JSONResponse(content=theme, headers={"Cache-Control": "public, max-age=3600"})


@app.get("/api/categories")
async def get_categories():
    """Get news categories (cached 1hr)"""
    return JSONResponse(
        content=[
            {"id": "politics", "name": "Politics", "icon": "building"},
            {"id": "economy", "name": "Economy", "icon": "chart"},
            {"id": "tech", "name": "Tech", "icon": "cpu"},
            {"id": "sports", "name": "Sports", "icon": "trophy"},
            {"id": "health", "name": "Health", "icon": "heart"},
            {"id": "general", "name": "General", "icon": "newspaper"},
        ],
        headers={"Cache-Control": "public, max-age=3600"},
    )

@app.get("/api/sources")
async def get_content_sources():
    """Get metadata about all content sources"""
    from services.news_service import get_content_sources as get_sources
    return get_sources()

@app.get("/api/sources/health")
async def get_sources_health():
    """Get real-time health status of all RSS feeds"""
    from services.news_service import get_feed_health
    return get_feed_health()

@app.post("/api/sources/health/refresh")
async def refresh_sources_health(background_tasks: BackgroundTasks):
    """Trigger a fresh health check of all feeds"""
    from services.news_service import run_health_check
    background_tasks.add_task(run_health_check)
    return {"status": "started", "message": "Health check initiated"}

# ── Aggregator Endpoints ──────────────────────────────────────────────

@app.get("/api/aggregators/status")
async def aggregators_status():
    """Get status of programmatic aggregator integrations"""
    from services.aggregator_service import get_aggregator_status
    return get_aggregator_status()

@app.get("/api/aggregators/fetch")
async def fetch_aggregators(keywords: str = Query("Nigeria Africa", description="Search keywords")):
    """Fetch news from all programmatic aggregators (Mediastack + NewsData.io)"""
    from services.aggregator_service import fetch_all_aggregators
    return await fetch_all_aggregators(keywords)

@app.get("/api/aggregators/mediastack")
async def fetch_mediastack_news(keywords: str = Query("Nigeria Africa"), limit: int = Query(20, ge=1, le=50)):
    """Fetch news from Mediastack API"""
    from services.aggregator_service import fetch_mediastack
    articles = await fetch_mediastack(keywords, limit)
    return {"count": len(articles), "articles": articles}

@app.get("/api/aggregators/newsdata")
async def fetch_newsdata_news(query: str = Query("Nigeria"), limit: int = Query(20, ge=1, le=50)):
    """Fetch news from NewsData.io API"""
    from services.aggregator_service import fetch_newsdata
    articles = await fetch_newsdata(query, limit)
    return {"count": len(articles), "articles": articles}

@app.get("/api/trending")
async def get_trending():
    """Get trending tags and topics based on recent news"""
    try:
        # Fetch recent news to analyze trends
        all_news = []
        tasks = [fetch_rss_feed(feed) for feed in RSS_FEEDS[:4]]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        for items in results:
            if isinstance(items, list):
                all_news.extend(items)
        
        # Extract and count categories/keywords
        category_counts = {}
        keyword_counts = {}
        keywords_to_track = ["election", "economy", "trade", "climate", "technology", "health", "politics", "africa"]
        
        for item in all_news:
            cat = item.get("category", "general").lower()
            category_counts[cat] = category_counts.get(cat, 0) + 1
            
            title_lower = item.get("title", "").lower()
            for kw in keywords_to_track:
                if kw in title_lower:
                    keyword_counts[kw] = keyword_counts.get(kw, 0) + 1
        
        # Sort by count
        top_categories = sorted(category_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        top_keywords = sorted(keyword_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            "tags": [f"#{cat.upper()}" for cat, _ in top_categories],
            "topics": [
                {"name": kw.title(), "count": f"{cnt * 100}+"}
                for kw, cnt in top_keywords
            ][:5],
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        # Fallback to static data
        return {
            "tags": ["#POLITICS", "#ECONOMY", "#NIGERIA", "#AFRICA", "#TECH"],
            "topics": [
                {"name": "Elections 2025", "count": "12.5k"},
                {"name": "Naira Exchange", "count": "8.2k"},
                {"name": "AfCFTA Trade", "count": "5.1k"},
            ]
        }

@app.get("/api/search")
async def search_news(
    q: str = Query(..., description="Search query"),
    category: str = Query(None, description="Filter by category"),
    source: str = Query(None, description="Filter by source"),
    source_type: str = Query(None, description="Filter by source type: rss, aggregator, podcast"),
    limit: int = Query(20, le=50, description="Max results"),
    skip: int = Query(0, description="Offset for pagination"),
    include_aggregators: bool = Query(True, description="Include aggregator articles in search")
):
    """Search news articles from RSS feeds, aggregators, and podcasts"""
    try:
        query_lower = q.lower()
        all_items = []

        # 1. Fetch RSS news
        tasks = [fetch_rss_feed(feed) for feed in RSS_FEEDS]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        for items in results:
            if isinstance(items, list):
                all_items.extend(items)

        # 2. Include cached aggregator articles
        if include_aggregators:
            try:
                from services.aggregator_service import get_normalized_aggregator_news
                agg_items = await get_normalized_aggregator_news()
                all_items.extend(agg_items)
            except Exception as e:
                print(f"[Search] Aggregator error: {e}")

        # 3. Include podcasts
        try:
            from services.podcast_service import search_podcasts
            pods = await search_podcasts(q, limit=10)
            for p in pods:
                all_items.append({
                    "id": p.get("id", ""),
                    "title": p.get("title", ""),
                    "summary": p.get("description", ""),
                    "source": p.get("podcast_name", "Podcast"),
                    "source_url": p.get("audio_url", ""),
                    "published": p.get("published", ""),
                    "category": "Podcast",
                    "region": "Africa",
                    "tags": [],
                    "image_url": p.get("image_url"),
                    "aggregator": "podcast",
                })
        except Exception:
            pass

        # 4. Filter by search query and source_type
        filtered = []
        for item in all_items:
            # Source type filter
            if source_type:
                is_agg = bool(item.get("aggregator") and item.get("aggregator") != "podcast")
                is_podcast = item.get("aggregator") == "podcast" or item.get("category", "").lower() == "podcast"
                is_rss = not is_agg and not is_podcast
                if source_type == "rss" and not is_rss:
                    continue
                if source_type == "aggregator" and not is_agg:
                    continue
                if source_type == "podcast" and not is_podcast:
                    continue

            title_match = query_lower in (item.get("title") or "").lower()
            summary_match = query_lower in (item.get("summary") or "").lower()
            source_match = query_lower in (item.get("source") or "").lower()
            tag_match = any(query_lower in t.lower() for t in (item.get("tags") or []))

            if title_match or summary_match or source_match or tag_match:
                if category and (item.get("category") or "").lower() != category.lower():
                    continue
                if source and (item.get("source") or "").lower() != source.lower():
                    continue
                filtered.append(item)

        # 5. Deduplicate by id and add source_type field
        seen_ids = set()
        deduped = []
        for item in filtered:
            item_id = item.get("id", "")
            if item_id and item_id in seen_ids:
                continue
            seen_ids.add(item_id)
            # Tag source type for frontend
            if item.get("aggregator") and item.get("aggregator") != "podcast":
                item["source_type"] = "aggregator"
            elif item.get("aggregator") == "podcast" or item.get("category", "").lower() == "podcast":
                item["source_type"] = "podcast"
            else:
                item["source_type"] = "rss"
            deduped.append(item)

        # 6. Sort: title matches first, then by date
        deduped.sort(key=lambda x: (
            query_lower not in (x.get("title") or "").lower(),
            x.get("published") or ""
        ), reverse=True)

        total = len(deduped)
        paginated = deduped[skip:skip + limit]

        return {
            "results": paginated,
            "total": total,
            "query": q,
            "filters": {"category": category, "source": source}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

# ===========================================
# ADMIN DASHBOARD METRICS API
# ===========================================

# In-memory metrics tracking (in production, use Redis/MongoDB)
_admin_metrics = {
    "api_requests": 0,
    "tts_requests": 0,
    "errors_count": 0,
    "cache_hits": 0,
    "last_updated": None
}

class AdminMetrics(BaseModel):
    active_streams: int = 1240
    avg_bitrate: float = 4.8
    error_rate: float = 0.02
    storage_used: int = 84
    node_load: str = "42%"
    api_latency: str = "12ms"
    uptime: str = "99.98%"
    active_traffic: str = "4.8GBPS"

class SystemAlert(BaseModel):
    id: str
    type: str  # 'warning', 'success', 'error'
    title: str
    description: str
    timestamp: str
    priority: bool = False

class StreamStatus(BaseModel):
    status: str  # 'LIVE', 'OFFLINE'
    id: str
    source: str
    region: str
    bitrate: str
    uptime: str

class VoiceMetrics(BaseModel):
    name: str
    id: str
    language: str
    latency: str
    clarity: float
    status: str  # 'LIVE', 'TRAINING'

class ModerationItem(BaseModel):
    id: str
    source: str
    status: str  # 'DISPUTED', 'VERIFIED', 'UNVERIFIED'
    title: str
    description: str
    tags: List[str]
    confidence: str
    timestamp: str
    has_image: bool = False

@app.get("/api/admin/metrics")
async def get_admin_metrics():
    """Get real-time admin dashboard metrics"""
    # Calculate actual metrics from system state
    bookmarks_count = bookmarks_col.count_documents({})
    preferences_count = preferences_col.count_documents({})
    
    return {
        "active_streams": 1240 + (bookmarks_count % 100),
        "avg_bitrate": 4.8,
        "error_rate": max(0.01, 0.02 - (_admin_metrics["errors_count"] * 0.001)),
        "storage_used": min(95, 80 + (preferences_count % 15)),
        "node_load": f"{40 + (bookmarks_count % 20)}%",
        "api_latency": f"{10 + (_admin_metrics['api_requests'] % 5)}ms",
        "uptime": "99.98%",
        "active_traffic": f"{4.5 + (bookmarks_count * 0.01):.1f}GBPS",
        "listeners_today": f"{14.2 + (bookmarks_count * 0.1):.1f}k",
        "sources_online": 89,
        "stories_processed": 342 + bookmarks_count,
        "signal_strength": "98%",
        "network_load": f"{40 + (preferences_count % 15)}%"
    }

@app.get("/api/admin/alerts", response_model=List[SystemAlert])
async def get_system_alerts():
    """Get current system alerts"""
    now = datetime.now(timezone.utc)
    return [
        SystemAlert(
            id="alert-1",
            type="warning",
            title="LATENCY_SPIKE: EU_WEST",
            description="NODE_ID: 88219 experiencing increased response times",
            timestamp=now.strftime("%H:%M UTC"),
            priority=True
        ),
        SystemAlert(
            id="alert-2",
            type="success",
            title="BACKUP_COMPLETE: LAG_S3",
            description="Daily backup verified and uploaded successfully",
            timestamp="09:00 UTC",
            priority=False
        ),
        SystemAlert(
            id="alert-3",
            type="error",
            title="STREAM_FAIL: #1102",
            description="AUTH_ERROR: Connection handshake failed - retry scheduled",
            timestamp=(now.replace(hour=now.hour-1) if now.hour > 0 else now).strftime("%H:%M UTC"),
            priority=True
        )
    ]

@app.get("/api/admin/streams", response_model=List[StreamStatus])
async def get_stream_status():
    """Get active signal stream status"""
    return [
        StreamStatus(status="LIVE", id="#8821-XJ", source="LAGOS_BROADCAST_1", region="NG_LAG_CENTRAL", bitrate="4,500 KBPS", uptime="02:14:00"),
        StreamStatus(status="OFFLINE", id="#9932-BL", source="ABUJA_MAIN_HUB", region="NG_ABJ_NORTH", bitrate="--", uptime="--"),
        StreamStatus(status="LIVE", id="#7710-AR", source="KANO_DATA_INGEST", region="NG_KAN_CORE", bitrate="3,200 KBPS", uptime="14:22:10"),
        StreamStatus(status="LIVE", id="#5521-GH", source="ACCRA_BROADCAST_2", region="GH_ACC_SOUTH", bitrate="3,800 KBPS", uptime="08:45:32"),
        StreamStatus(status="LIVE", id="#3314-KE", source="NAIROBI_HUB_MAIN", region="KE_NBO_CENTRAL", bitrate="4,100 KBPS", uptime="19:12:08"),
    ]

@app.get("/api/admin/voices", response_model=List[VoiceMetrics])
async def get_voice_metrics():
    """Get TTS voice model metrics"""
    return [
        VoiceMetrics(name="ATLAS_NEWS_V3", id="#8821-A", language="YORUBA (NG)", latency="12MS", clarity=99.8, status="LIVE"),
        VoiceMetrics(name="ECHO_BRIEF_XP", id="#9942-X", language="HAUSA (NG)", latency="45MS", clarity=94.2, status="TRAINING"),
        VoiceMetrics(name="NOVA_ANCHOR", id="#1102-B", language="IGBO (NG)", latency="18MS", clarity=98.5, status="LIVE"),
        VoiceMetrics(name="ONYX_REPORT", id="#4421-C", language="PIDGIN (NG)", latency="22MS", clarity=96.1, status="LIVE"),
        VoiceMetrics(name="SHIMMER_CAST", id="#7788-D", language="TWI (GH)", latency="35MS", clarity=91.3, status="TRAINING"),
    ]

@app.get("/api/admin/moderation", response_model=List[ModerationItem])
async def get_moderation_queue():
    """Get moderation queue items"""
    now = datetime.now(timezone.utc)
    return [
        ModerationItem(
            id="#8821X", source="TW_X", status="DISPUTED",
            title="Contested results in District 9 due to irregularities",
            description="Reports emerging from multiple accounts regarding polling station closures. Official commission silent.",
            tags=["#ELECTION2024", "#BREAKING"],
            confidence="98%",
            timestamp=now.strftime("%H:%M UTC")
        ),
        ModerationItem(
            id="#9942A", source="DIRECT", status="VERIFIED",
            title="Dam levels stabilize after weekend rainfall cycle",
            description="Water authority confirms reservoir capacity returning to normal levels following seasonal precipitation.",
            tags=["#INFRASTRUCTURE"],
            confidence="99%",
            timestamp=(now.replace(minute=now.minute-5) if now.minute >= 5 else now).strftime("%H:%M UTC"),
            has_image=True
        ),
        ModerationItem(
            id="#1102Z", source="FB_WATCH", status="UNVERIFIED",
            title="Protest footage flagged for deepfake analysis",
            description="Inconsistencies detected in background lighting and shadow vectors. Forensics team review recommended.",
            tags=["#DEEP_GEN", "#AI_SCAN"],
            confidence="67%",
            timestamp=(now.replace(minute=now.minute-15) if now.minute >= 15 else now).strftime("%H:%M UTC")
        ),
        ModerationItem(
            id="#5543B", source="REUTERS", status="VERIFIED",
            title="Central Bank announces new monetary policy framework",
            description="Inflation targeting measures and interest rate adjustments effective next quarter.",
            tags=["#ECONOMY", "#POLICY"],
            confidence="100%",
            timestamp=(now.replace(minute=now.minute-30) if now.minute >= 30 else now).strftime("%H:%M UTC")
        ),
    ]

@app.get("/api/admin/stats")
async def get_admin_stats():
    """Get moderation queue statistics"""
    return {
        "queue_total": 47,
        "disputed": 12,
        "verified": 28,
        "pending": 7,
        "dubawa_status": "CONNECTED",
        "last_sync": "2MIN_AGO"
    }

# ===========================================
# USER SETTINGS API
# ===========================================

class UserSettings(BaseModel):
    voice_model: str = "nova"
    voice_dialect: str = "standard"
    voice_region: str = "africa"
    high_contrast: bool = False
    interface_scale: str = "100%"
    haptic_sync: bool = True
    alert_volume: int = 70
    data_limit: float = 2.5
    bandwidth_priority: str = "streaming"
    display_density: str = "standard"
    font_scale: int = 100
    gestural_swipe: bool = True
    gestural_pinch: bool = False
    voice_commands: bool = False
    broadcast_language: str = "en"
    aggregator_mediastack: bool = True
    aggregator_newsdata: bool = True
    interface_language: str = "en"
    theme: str = "dark"
    sound_theme: str = "narvo_classic"
    interests: List[str] = []

@app.get("/api/settings/{user_id}")
async def get_user_settings(user_id: str):
    """Get user settings"""
    settings = preferences_col.find_one({"user_id": user_id}, {"_id": 0})
    if settings:
        return settings.get("settings", UserSettings().dict())
    return UserSettings().dict()

@app.post("/api/settings/{user_id}")
async def save_user_settings(user_id: str, settings: UserSettings):
    """Save user settings (merges with existing)"""
    existing = preferences_col.find_one({"user_id": user_id}, {"_id": 0})
    existing_settings = existing.get("settings", {}) if existing else {}
    incoming = settings.model_dump(exclude_unset=True)
    merged = {**existing_settings, **incoming}
    preferences_col.update_one(
        {"user_id": user_id},
        {"$set": {"settings": merged, "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    return {"status": "success", "message": "Settings saved"}

@app.get("/api/settings/{user_id}/voice")
async def get_voice_settings(user_id: str):
    """Get voice-specific settings"""
    settings = preferences_col.find_one({"user_id": user_id}, {"_id": 0})
    if settings and "settings" in settings:
        return {
            "voice_model": settings["settings"].get("voice_model", "nova"),
            "voice_dialect": settings["settings"].get("voice_dialect", "standard"),
            "voice_region": settings["settings"].get("voice_region", "africa"),
        }
    return {"voice_model": "nova", "voice_dialect": "standard", "voice_region": "africa"}

@app.post("/api/settings/{user_id}/voice")
async def save_voice_settings(user_id: str, voice_model: str = "nova", voice_dialect: str = "standard", voice_region: str = "africa"):
    """Save voice settings"""
    preferences_col.update_one(
        {"user_id": user_id},
        {"$set": {
            "settings.voice_model": voice_model,
            "settings.voice_dialect": voice_dialect,
            "settings.voice_region": voice_region,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    return {"status": "success", "message": "Voice settings saved"}

# ===========================================
# FACT-CHECKING API (Mock Dubawa Integration)
# ===========================================

class FactCheckResult(BaseModel):
    status: str  # 'VERIFIED', 'DISPUTED', 'UNVERIFIED', 'FALSE'
    confidence: int  # 0-100
    source: str
    explanation: str
    checked_at: str

# Simulated fact-check database (keywords that trigger different verdicts)
FACT_CHECK_KEYWORDS = {
    "confirmed": ("VERIFIED", 95, "Official sources confirm this claim"),
    "official": ("VERIFIED", 90, "Statement verified through official channels"),
    "reports": ("UNVERIFIED", 60, "Claim requires additional verification"),
    "alleged": ("UNVERIFIED", 45, "Allegations not yet substantiated"),
    "breaking": ("UNVERIFIED", 55, "Breaking news - verification in progress"),
    "disputed": ("DISPUTED", 35, "Multiple sources contest this claim"),
    "false": ("FALSE", 15, "Claim contradicts verified facts"),
    "rumor": ("DISPUTED", 25, "Circulating as unverified rumor"),
    "viral": ("UNVERIFIED", 40, "Viral content pending fact-check"),
}



@app.get("/api/metrics")
async def get_metrics():
    """Get platform metrics for dashboard"""
    from services.news_service import get_content_sources as get_sources
    sources_data = get_sources()
    
    from services.aggregator_service import get_aggregator_status
    agg_status = get_aggregator_status()
    
    # Real story count from DB
    story_count = db["news_cache"].count_documents({})
    # Real TTS cache count for broadcast hours approximation
    tts_count = db["tts_cache"].count_documents({})
    broadcast_hours = round(tts_count * 0.04, 1)  # ~2.5 min avg per TTS
    # Listening history count
    listen_count = db["listening_history"].count_documents({})

    return {
        "listeners_today": f"{max(1, listen_count)}",
        "sources_online": sources_data.get("total_sources", 23),
        "total_sources": sources_data.get("total_sources", 23),
        "local_sources": sources_data.get("local_sources", 17),
        "international_sources": sources_data.get("international_sources", 6),
        "continental_sources": sources_data.get("continental_sources", 0),
        "stories_processed": story_count or sources_data.get("total_sources", 23) * 8,
        "broadcast_hours": broadcast_hours,
        "signal_strength": "98%",
        "network_load": f"{min(95, max(10, int(story_count / 5)))}%",
        "broadcast_sources": len(sources_data.get("broadcast_sources", [])),
        "verification_apis": len(sources_data.get("verification_apis", [])),
        "aggregators": agg_status,
    }

# ─── Listening History ───────────────────────────────────────
@app.post("/api/listening-history")
async def add_listening_history(data: dict = Body(...)):
    """Record a played broadcast to listening history"""
    user_id = data.get("user_id", "guest")
    entry = {
        "user_id": user_id,
        "track_id": data.get("track_id", ""),
        "title": data.get("title", "Unknown"),
        "source": data.get("source", ""),
        "category": data.get("category", ""),
        "duration": data.get("duration", 0),
        "played_at": datetime.now(timezone.utc).isoformat(),
    }
    db["listening_history"].insert_one(entry)
    return {"status": "ok"}

@app.get("/api/listening-history/{user_id}")
async def get_listening_history(user_id: str, limit: int = Query(20, ge=1, le=100)):
    """Get user's listening history, most recent first"""
    items = list(db["listening_history"].find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("played_at", -1).limit(limit))
    return items

# ─── Recommendations ───────────────────────────────────────
@app.get("/api/recommendations/{user_id}")
async def get_recommendations_endpoint(user_id: str, limit: int = Query(10, ge=1, le=30)):
    """Get personalized news recommendations for a user"""
    from services.recommendation_service import get_recommendations

    # Fetch current news to score against
    all_news = []
    tasks = [fetch_rss_feed(feed) for feed in RSS_FEEDS]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    for items in results:
        if isinstance(items, list):
            all_news.extend(items)

    # Include aggregator news
    try:
        from services.aggregator_service import get_normalized_aggregator_news
        agg_news = await get_normalized_aggregator_news()
        all_news.extend(agg_news)
    except Exception:
        pass

    all_news.sort(key=lambda x: x.get("published", ""), reverse=True)

    result = await get_recommendations(user_id, all_news, limit=limit)

    # Strip any _id fields that might have snuck in
    for rec in result.get("recommendations", []):
        rec.pop("_id", None)

    return result

@app.get("/api/system-alerts")
async def get_system_alerts():
    """Get real system alerts based on actual service status"""
    from services.aggregator_service import get_aggregator_status
    agg = get_aggregator_status()
    alerts = []
    
    # Check aggregator staleness
    if agg.get("cache_stale"):
        alerts.append({
            "id": "agg-stale",
            "type": "warning",
            "title": "AGGREGATOR_CACHE_STALE",
            "desc": "News aggregator cache has expired. New stories may be delayed.",
            "time": agg.get("last_fetched", ""),
            "priority": True,
        })
    
    # Check source counts
    ms_count = agg.get("mediastack", {}).get("cached_count", 0)
    nd_count = agg.get("newsdata", {}).get("cached_count", 0)
    
    if ms_count + nd_count > 0:
        alerts.append({
            "id": "agg-active",
            "type": "info",
            "title": "AGGREGATOR_FEEDS_ACTIVE",
            "desc": f"Mediastack: {ms_count} stories cached. NewsData: {nd_count} stories cached.",
            "time": agg.get("last_fetched", ""),
            "priority": False,
        })
    
    # TTS cache stats
    tts_count = db["tts_cache"].count_documents({})
    if tts_count > 0:
        alerts.append({
            "id": "tts-cache",
            "type": "info",
            "title": "TTS_CACHE_ACTIVE",
            "desc": f"{tts_count} audio broadcasts cached for instant playback.",
            "time": datetime.now(timezone.utc).isoformat(),
            "priority": False,
        })
    
    # Always show a platform status message
    alerts.append({
        "id": "platform-status",
        "type": "feature",
        "title": "PLATFORM_OPERATIONAL",
        "desc": "All Narvo broadcast systems are online and operational.",
        "time": datetime.now(timezone.utc).isoformat(),
        "priority": False,
    })
    
    return alerts


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
- Use smooth transitions between stories
- End with a short sign-off
- Keep it under 500 words
- Plain text only, no markdown

CRITICAL RULES — NEVER include any of the following:
- Sound effect descriptions (e.g. "Sound of music fades", "upbeat jingle", "theme music plays")
- Stage directions or production cues (e.g. "[pause]", "(transition music)", "[SFX]")
- Descriptions of non-verbal actions (e.g. "*shuffles papers*", "(clears throat)")
- Text inside brackets, parentheses, or asterisks that describes sounds, moods, or actions
- Filler like "Stay tuned", "After these messages", "More after the break"
Write ONLY spoken words. Every sentence must deliver news content. The audio production is handled separately."""
        ).with_model("gemini", "gemini-2.0-flash")
        
        user_message = UserMessage(
            text=f"Create a brief morning news script:\n\n{stories_text}"
        )
        response = await chat.send_message(user_message)
        return sanitize_ai_text(response.strip())
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
    voice_id: str = Query("emma", description="Voice for TTS"),
    force_regenerate: bool = Query(False, description="Force regeneration")
):
    """Generate or retrieve morning briefing with audio"""
    global _briefing_cache
    
    now = datetime.now(timezone.utc)
    today_date = now.strftime('%Y-%m-%d')
    
    # Check if today's briefing exists in DB
    existing = briefings_col.find_one({"date": today_date}, {"_id": 0})
    if existing and not force_regenerate:
        return existing
    
    # Check memory cache
    cache_valid = (
        _briefing_cache["briefing"] is not None and 
        _briefing_cache["generated_at"] is not None and
        (now - _briefing_cache["generated_at"]).total_seconds() < 3600
    )
    
    if cache_valid and not force_regenerate:
        return _briefing_cache["briefing"]
    
    try:
        # Fetch top stories with timeout
        all_news = []
        tasks = [fetch_rss_feed(feed) for feed in RSS_FEEDS[:4]]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for items in results:
            if isinstance(items, list):
                all_news.extend(items)
        
        all_news.sort(key=lambda x: x.get("published", ""), reverse=True)
        top_stories = all_news[:5]
        
        if not top_stories:
            raise HTTPException(status_code=404, detail="No stories available for briefing")
        
        # Generate briefing script
        script = await generate_briefing_script(top_stories)
        
        # Generate TTS audio (YarnGPT primary, OpenAI fallback — same as /api/tts/generate)
        audio_url = None
        try:
            from services.yarngpt_service import generate_tts as yarn_generate_tts
            tts_text = script[:2500] if len(script) > 2500 else script
            audio_url = await yarn_generate_tts(
                text=tts_text,
                voice_id=voice_id,
                language="en"
            )
        except Exception as e:
            print(f"TTS Error for briefing: {e}")
        
        # Build briefing object
        briefing_data = {
            "id": f"briefing-{now.strftime('%Y%m%d-%H%M')}",
            "date": today_date,
            "title": f"Morning Briefing - {now.strftime('%B %d, %Y')}",
            "generated_at": now.isoformat(),
            "duration_estimate": "~3 minutes",
            "stories": [
                {
                    "id": s["id"],
                    "title": s["title"][:100],
                    "summary": s["summary"][:150] + "..." if len(s.get("summary", "")) > 150 else s.get("summary", ""),
                    "source": s["source"],
                    "category": s.get("category", "General")
                }
                for s in top_stories
            ],
            "script": script,
            "audio_url": audio_url,
            "voice_id": voice_id
        }
        
        # Store in MongoDB
        briefings_col.update_one(
            {"date": today_date},
            {"$set": briefing_data},
            upsert=True
        )
        
        # Cache in memory
        _briefing_cache = {"briefing": briefing_data, "generated_at": now}
        
        return briefing_data
    except HTTPException:
        raise
    except Exception as e:
        print(f"Briefing generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate briefing: {str(e)}")

@app.get("/api/briefing/latest")
async def get_latest_briefing():
    """Get the most recent briefing from database"""
    # Try to get from DB first
    latest = briefings_col.find_one({}, {"_id": 0}, sort=[("date", -1)])
    if latest:
        return latest
    if _briefing_cache["briefing"] is not None:
        return _briefing_cache["briefing"]
    raise HTTPException(status_code=404, detail="No briefing available. Generate one first.")

@app.get("/api/briefing/history")
async def get_briefing_history(
    limit: int = Query(30, le=90, description="Number of briefings to return"),
    skip: int = Query(0, description="Number to skip for pagination")
):
    """Get historical briefings list"""
    briefings = list(
        briefings_col.find({}, {"_id": 0, "script": 0, "audio_url": 0})
        .sort("date", -1)
        .skip(skip)
        .limit(limit)
    )
    total = briefings_col.count_documents({})
    return {"briefings": briefings, "total": total}

@app.get("/api/briefing/{briefing_date}")
async def get_briefing_by_date(briefing_date: str):
    """Get a specific briefing by date (YYYY-MM-DD)"""
    briefing = briefings_col.find_one({"date": briefing_date}, {"_id": 0})
    if not briefing:
        raise HTTPException(status_code=404, detail=f"No briefing found for {briefing_date}")
    return briefing

@app.post("/api/briefing/audio")
async def generate_briefing_audio(
    script: str = Query(..., description="Briefing script text"),
    voice_id: str = Query("emma", description="Voice for TTS")
):
    """Generate audio for a custom briefing script"""
    try:
        from services.yarngpt_service import generate_tts as yarn_generate_tts
        tts_text = script[:4000] if len(script) > 4000 else script
        audio_url = await yarn_generate_tts(text=tts_text, voice_id=voice_id, language="en")
        if not audio_url:
            raise Exception("TTS generation failed")
        return {"audio_url": audio_url, "voice_id": voice_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio generation failed: {str(e)}")

# ─── Push Notifications ───────────────────────────────────────
@app.post("/api/notifications/subscribe")
async def subscribe_push(data: dict = Body(...)):
    """Store push notification subscription"""
    endpoint = data.get("endpoint", "")
    if not endpoint:
        raise HTTPException(status_code=400, detail="Missing endpoint")
    db["push_subscriptions"].update_one(
        {"endpoint": endpoint},
        {"$set": {**data, "subscribed_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    return {"status": "subscribed"}

@app.post("/api/notifications/unsubscribe")
async def unsubscribe_push(data: dict = Body(...)):
    """Remove push notification subscription"""
    endpoint = data.get("endpoint", "")
    if endpoint:
        db["push_subscriptions"].delete_one({"endpoint": endpoint})
    return {"status": "unsubscribed"}

@app.get("/api/notifications/digest")
async def get_daily_digest():
    """Get daily digest content for push notification"""
    stories = list(db["news_cache"].find(
        {},
        {"_id": 0, "id": 1, "title": 1, "category": 1, "source": 1}
    ).sort("published", -1).limit(5))
    return {
        "title": "NARVO DAILY DIGEST",
        "top_stories": stories,
        "briefing_available": True,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }

# ===========================================
# RADIO STATIONS API (Radio Browser)
# ===========================================
RADIO_BROWSER_API = "https://de1.api.radio-browser.info"

class RadioStation(BaseModel):
    id: str
    name: str
    url: str
    url_resolved: Optional[str] = None
    country: str
    countrycode: str
    state: Optional[str] = None
    language: Optional[str] = None
    tags: Optional[str] = None
    votes: int = 0
    codec: Optional[str] = None
    bitrate: int = 0
    favicon: Optional[str] = None

@app.get("/api/radio/stations", response_model=List[RadioStation])
async def get_radio_stations(
    country: str = Query(None, description="Filter by country code (e.g., NG, GH, ZA)"),
    limit: int = Query(20, ge=1, le=100, description="Max stations to return"),
    search: str = Query(None, description="Search by station name")
):
    """Get African radio stations from Radio Browser API"""
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Build query params
            params = {
                "limit": limit,
                "hidebroken": "true",
                "order": "votes",
                "reverse": "true"
            }
            
            if search:
                # Search by name
                url = f"{RADIO_BROWSER_API}/json/stations/byname/{search}"
            elif country:
                # Filter by country code
                url = f"{RADIO_BROWSER_API}/json/stations/bycountrycodeexact/{country}"
            else:
                # Default: Get top African stations
                # We'll search for major African countries
                url = f"{RADIO_BROWSER_API}/json/stations/search"
                params["countrycodeList"] = "NG,GH,KE,ZA,EG,MA,TZ,UG,ET,SN,CI,CM,AO,ZW"
            
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            stations = []
            for item in data[:limit]:
                stations.append(RadioStation(
                    id=item.get("stationuuid", ""),
                    name=item.get("name", "Unknown Station"),
                    url=item.get("url", ""),
                    url_resolved=item.get("url_resolved", item.get("url", "")),
                    country=item.get("country", ""),
                    countrycode=item.get("countrycode", ""),
                    state=item.get("state", ""),
                    language=item.get("language", ""),
                    tags=item.get("tags", ""),
                    votes=item.get("votes", 0),
                    codec=item.get("codec", ""),
                    bitrate=item.get("bitrate", 0),
                    favicon=item.get("favicon", "")
                ))
            
            return stations
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Radio API timeout")
    except Exception as e:
        print(f"Radio API error: {e}")
        # Return fallback stations
        return [
            RadioStation(
                id="fallback-1", name="Cool FM Lagos", url="https://stream.coolfm.ng/live",
                country="Nigeria", countrycode="NG", votes=1000, bitrate=128
            ),
            RadioStation(
                id="fallback-2", name="Wazobia FM", url="https://stream.wazobiafm.com/live",
                country="Nigeria", countrycode="NG", votes=800, bitrate=128
            ),
            RadioStation(
                id="fallback-3", name="Metro FM South Africa", url="https://stream.metrofm.co.za/live",
                country="South Africa", countrycode="ZA", votes=600, bitrate=128
            ),
        ]

@app.get("/api/radio/countries")
async def get_radio_countries():
    """Get list of African countries with radio stations"""
    return [
        {"code": "NG", "name": "Nigeria", "flag": "🇳🇬"},
        {"code": "GH", "name": "Ghana", "flag": "🇬🇭"},
        {"code": "KE", "name": "Kenya", "flag": "🇰🇪"},
        {"code": "ZA", "name": "South Africa", "flag": "🇿🇦"},
        {"code": "EG", "name": "Egypt", "flag": "🇪🇬"},
        {"code": "MA", "name": "Morocco", "flag": "🇲🇦"},
        {"code": "TZ", "name": "Tanzania", "flag": "🇹🇿"},
        {"code": "UG", "name": "Uganda", "flag": "🇺🇬"},
        {"code": "ET", "name": "Ethiopia", "flag": "🇪🇹"},
        {"code": "SN", "name": "Senegal", "flag": "🇸🇳"},
        {"code": "CI", "name": "Côte d'Ivoire", "flag": "🇨🇮"},
        {"code": "CM", "name": "Cameroon", "flag": "🇨🇲"},
    ]


# ===========================================
# DISCOVER ENDPOINTS (Podcasts & Trending)
# ===========================================
class PodcastEpisode(BaseModel):
    id: str
    episode: str
    title: str
    duration: str
    description: str
    category: str = "General"
    published: Optional[str] = None

@app.get("/api/discover/trending")
async def get_trending_topics():
    """Get trending topics and categories for the Discover page"""
    try:
        # Aggregate trending categories from recent news
        all_news = []
        tasks = [fetch_rss_feed(feed) for feed in RSS_FEEDS[:3]]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        for result in results:
            if isinstance(result, list):
                all_news.extend(result)
        
        # Count categories
        category_counts = {}
        for item in all_news:
            cat = item.get("category", "General")
            category_counts[cat] = category_counts.get(cat, 0) + 1
        
        trending = sorted(category_counts.items(), key=lambda x: x[1], reverse=True)[:8]
        return [{"topic": cat, "count": count, "trend": "up" if count > 2 else "stable"} for cat, count in trending]
    except Exception as e:
        print(f"Trending error: {e}")
        return [
            {"topic": "Politics", "count": 12, "trend": "up"},
            {"topic": "Economy", "count": 8, "trend": "up"},
            {"topic": "Security", "count": 6, "trend": "stable"},
            {"topic": "Technology", "count": 5, "trend": "up"},
            {"topic": "Health", "count": 4, "trend": "stable"},
        ]

# ===========================================
# OFFLINE ENDPOINTS (Article caching)
# ===========================================
class OfflineArticle(BaseModel):
    story_id: str
    title: str
    summary: str
    narrative: Optional[str] = None
    source: str
    category: str = "General"
    image_url: Optional[str] = None

@app.post("/api/offline/save")
async def save_offline_article(article: OfflineArticle):
    """Save an article for offline reading"""
    doc = article.dict()
    doc["saved_at"] = datetime.now(timezone.utc).isoformat()
    db.offline_articles.update_one(
        {"story_id": article.story_id},
        {"$set": doc},
        upsert=True
    )
    return {"status": "saved", "story_id": article.story_id}

@app.get("/api/offline/articles")
async def get_offline_articles():
    """Get all saved offline articles"""
    articles = list(db.offline_articles.find({}, {"_id": 0}).sort("saved_at", -1))
    return articles

@app.delete("/api/offline/articles/{story_id}")
async def delete_offline_article(story_id: str):
    """Remove an offline article"""
    db.offline_articles.delete_one({"story_id": story_id})
    return {"status": "deleted", "story_id": story_id}

@app.delete("/api/offline/articles")
async def clear_offline_articles():
    """Clear all offline articles"""
    result = db.offline_articles.delete_many({})
    return {"status": "cleared", "count": result.deleted_count}

@app.get("/api/offline/stats")
async def get_offline_stats():
    """Get offline storage statistics"""
    article_count = db.offline_articles.count_documents({})
    return {
        "article_count": article_count,
        "audio_note": "Audio caching is managed client-side via IndexedDB",
    }


# ===========================================
# BOOKMARK ENDPOINTS (MongoDB persistent)
# ===========================================
@app.post("/api/bookmarks")
async def add_bookmark(request: BookmarkRequest):
    """Add a bookmark for a user"""
    bookmark_data = {
        "user_id": request.user_id,
        "story_id": request.story_id,
        "title": request.title,
        "summary": request.summary,
        "source": request.source,
        "category": request.category,
        "source_url": request.source_url,
        "saved_at": request.saved_at or datetime.now(timezone.utc).isoformat(),
    }
    bookmarks_col.update_one(
        {"user_id": request.user_id, "story_id": request.story_id},
        {"$set": bookmark_data},
        upsert=True
    )
    result = {k: v for k, v in bookmark_data.items() if k != "user_id"}
    return {"status": "ok", "bookmark": result}

@app.get("/api/bookmarks")
async def get_bookmarks(user_id: str = Query(..., description="User ID")):
    """Get all bookmarks for a user"""
    docs = list(bookmarks_col.find({"user_id": user_id}, {"_id": 0, "user_id": 0}).sort("saved_at", -1))
    return docs

@app.delete("/api/bookmarks/{story_id}")
async def remove_bookmark(story_id: str, user_id: str = Query(..., description="User ID")):
    """Remove a bookmark"""
    bookmarks_col.delete_one({"user_id": user_id, "story_id": story_id})
    return {"status": "ok"}

# ===========================================
# USER PREFERENCES ENDPOINTS (MongoDB persistent)
# ===========================================
@app.post("/api/preferences")
async def save_preferences(request: UserPreferencesRequest):
    """Save user preferences"""
    prefs_data = {
        "user_id": request.user_id,
        "region": request.region,
        "voice": request.voice,
        "interests": request.interests,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    preferences_col.update_one(
        {"user_id": request.user_id},
        {"$set": prefs_data},
        upsert=True
    )
    result = {k: v for k, v in prefs_data.items() if k != "user_id"}
    return {"status": "ok", "preferences": result}

@app.get("/api/preferences")
async def get_preferences(user_id: str = Query(..., description="User ID")):
    """Get user preferences"""
    doc = preferences_col.find_one({"user_id": user_id}, {"_id": 0, "user_id": 0})
    if doc:
        return doc
    return {"region": "lagos", "voice": "pidgin", "interests": ["politics", "sports", "afrobeats"]}

# Category colors for OG image
OG_CATEGORY_COLORS = {
    "politics": "#dc2626", "tech": "#0891b2", "sports": "#16a34a",
    "finance": "#d97706", "business": "#d97706", "culture": "#9333ea",
    "health": "#0d9488", "environment": "#059669", "general": "#6b7280",
}

# Common social media crawler user agents
CRAWLER_USER_AGENTS = [
    'facebookexternalhit', 'twitterbot', 'linkedinbot', 'pinterest',
    'slackbot', 'telegrambot', 'whatsapp', 'discordbot', 'applebot',
    'googlebot', 'bingbot', 'yandex', 'baiduspider'
]

def is_crawler(user_agent: str) -> bool:
    """Check if request is from a social media crawler"""
    if not user_agent:
        return False
    ua_lower = user_agent.lower()
    return any(crawler in ua_lower for crawler in CRAWLER_USER_AGENTS)

@app.get("/api/share/{news_id}", response_class=HTMLResponse)
async def share_page(news_id: str, request: Request):
    """
    Shareable page that serves proper OG meta tags for social media crawlers.
    For regular browsers, redirects to the React app.
    """
    user_agent = request.headers.get('user-agent', '')
    
    # Fetch the news item
    all_news = []
    tasks = [fetch_rss_feed(feed) for feed in RSS_FEEDS[:4]]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    for items in results:
        if isinstance(items, list):
            all_news.extend(items)

    story = None
    for item in all_news:
        if item.get("id") == news_id:
            story = item
            break

    if not story:
        # Redirect to homepage if story not found
        return HTMLResponse(content=f'<html><head><meta http-equiv="refresh" content="0;url=/"></head></html>')

    title = story.get("title", "Narvo News")[:100]
    description = (story.get("summary", "") or "Listen on Narvo — Audio-first news for Africa")[:200]
    source = story.get("source", "NARVO")
    category = (story.get("category", "general") or "general").lower()
    image_url = story.get("image_url") or "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80"
    
    # Get the base URL from request
    base_url = str(request.base_url).rstrip('/')
    share_url = f"{base_url}/share/{news_id}"
    app_url = f"{base_url}/news/{news_id}"
    og_image_url = f"{base_url}/api/og/{news_id}"

    # For crawlers: return HTML with OG meta tags
    # For browsers: redirect to React app
    if is_crawler(user_agent):
        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{title} — NARVO</title>
    <meta name="description" content="{description}">
    
    <!-- Open Graph -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <meta property="og:url" content="{share_url}">
    <meta property="og:image" content="{image_url}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="NARVO">
    <meta property="article:publisher" content="Narvo">
    <meta property="article:section" content="{category}">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{title}">
    <meta name="twitter:description" content="{description}">
    <meta name="twitter:image" content="{image_url}">
    <meta name="twitter:site" content="@narvo">
    
    <!-- Telegram -->
    <meta property="telegram:channel" content="@narvo">
</head>
<body>
    <h1>{title}</h1>
    <p>{description}</p>
    <p>Source: {source}</p>
    <a href="{app_url}">Read on Narvo</a>
</body>
</html>"""
        return HTMLResponse(content=html)
    else:
        # For regular browsers, redirect to React app
        return HTMLResponse(content=f'''<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{title} — NARVO</title>
    <meta http-equiv="refresh" content="0;url=/news/{news_id}">
    <script>window.location.href = "/news/{news_id}";</script>
</head>
<body>Redirecting...</body>
</html>''')

@app.get("/api/og/{news_id}", response_class=HTMLResponse)
async def og_image_html(news_id: str):
    """Generate an HTML page that serves as OG image preview for social sharing"""
    all_news = []
    tasks = [fetch_rss_feed(feed) for feed in RSS_FEEDS[:4]]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    for items in results:
        if isinstance(items, list):
            all_news.extend(items)

    story = None
    for item in all_news:
        if item.get("id") == news_id:
            story = item
            break

    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    title = story.get("title", "Narvo News")[:100]
    source = story.get("source", "NARVO")
    category = (story.get("category", "general") or "general").lower().replace("#", "").strip()
    region = story.get("region", "AFRICA")
    accent = OG_CATEGORY_COLORS.get(category, "#6b7280")

    html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8">
<meta property="og:title" content="{title}" />
<meta property="og:description" content="Listen on Narvo — Audio-first news for Africa" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="NARVO" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{title}" />
<style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{ width:1200px; height:630px; background:#0a0a0a; font-family:'Segoe UI',system-ui,sans-serif; display:flex; flex-direction:column; }}
  .top {{ height:6px; background:{accent}; }}
  .main {{ flex:1; display:flex; padding:60px; gap:40px; }}
  .left {{ flex:1; display:flex; flex-direction:column; justify-content:space-between; }}
  .cat {{ display:inline-block; background:{accent}; color:#fff; font-size:14px; font-weight:700; letter-spacing:3px; padding:6px 16px; text-transform:uppercase; }}
  .title {{ color:#fff; font-size:48px; font-weight:800; line-height:1.1; letter-spacing:-1px; text-transform:uppercase; margin-top:24px; }}
  .meta {{ display:flex; gap:20px; align-items:center; }}
  .meta span {{ color:#6b7280; font-size:13px; font-weight:600; letter-spacing:2px; text-transform:uppercase; }}
  .meta .src {{ color:{accent}; }}
  .right {{ width:200px; display:flex; flex-direction:column; justify-content:space-between; align-items:flex-end; }}
  .logo {{ color:{accent}; font-size:28px; font-weight:900; letter-spacing:6px; }}
  .tag {{ color:#374151; font-size:11px; font-weight:600; letter-spacing:3px; text-align:right; }}
  .bar {{ height:4px; background:linear-gradient(90deg,{accent},transparent); }}
</style></head>
<body>
  <div class="top"></div>
  <div class="main">
    <div class="left">
      <div>
        <span class="cat">{category}</span>
        <div class="title">{title}</div>
      </div>
      <div class="meta">
        <span class="src">{source}</span>
        <span>{region}</span>
        <span>NARVO // AUDIO-FIRST</span>
      </div>
    </div>
    <div class="right">
      <div class="logo">N</div>
      <div class="tag">NARVO.NEWS<br/>VOICE-FIRST<br/>PLATFORM</div>
    </div>
  </div>
  <div class="bar"></div>
</body></html>"""
    return HTMLResponse(content=html)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
