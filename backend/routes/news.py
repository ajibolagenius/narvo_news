# News routes
from fastapi import APIRouter, Query, HTTPException
from typing import Optional

from services.news_service import (
    fetch_all_news, search_news, get_breaking_news, get_trending_topics, RSS_FEEDS
)
from services.tts_service import generate_tts_audio

router = APIRouter(prefix="/api", tags=["news"])

@router.get("/news")
async def get_news(
    limit: int = Query(20, le=50),
    category: Optional[str] = None
):
    """Get latest news from RSS feeds"""
    news = await fetch_all_news(limit=limit, category=category)
    return news

@router.get("/news/breaking")
async def get_breaking():
    """Get breaking/developing news"""
    breaking = await get_breaking_news()
    if not breaking:
        raise HTTPException(status_code=404, detail="No breaking news available")
    return breaking

@router.get("/news/{news_id}")
async def get_news_item(news_id: str):
    """Get a specific news item by ID"""
    all_news = await fetch_all_news(limit=100)
    for item in all_news:
        if item["id"] == news_id:
            return item
    raise HTTPException(status_code=404, detail="News item not found")

@router.get("/search")
async def search(
    q: str = Query(..., description="Search query"),
    category: Optional[str] = None,
    limit: int = Query(20, le=50)
):
    """Search news articles"""
    return await search_news(q, category, limit)

@router.get("/trending")
async def get_trending():
    """Get trending topics"""
    return await get_trending_topics()

@router.get("/categories")
def get_categories():
    """Get available news categories"""
    return [
        {"id": "politics", "name": "Politics", "icon": "vote"},
        {"id": "business", "name": "Business", "icon": "briefcase"},
        {"id": "tech", "name": "Technology", "icon": "cpu"},
        {"id": "sports", "name": "Sports", "icon": "trophy"},
        {"id": "entertainment", "name": "Entertainment", "icon": "film"},
        {"id": "health", "name": "Health", "icon": "heart"},
        {"id": "general", "name": "General", "icon": "newspaper"},
    ]

@router.get("/sources")
def get_sources():
    """Get available news sources"""
    return [{"name": feed["source"], "category": feed["category"]} for feed in RSS_FEEDS]

@router.post("/tts/generate")
async def generate_tts(
    text: str = Query(..., description="Text to convert to speech"),
    voice_id: str = Query("nova", description="Voice ID")
):
    """Generate TTS audio"""
    audio_url = await generate_tts_audio(text, voice_id)
    if not audio_url:
        raise HTTPException(status_code=500, detail="TTS generation failed")
    return {"audio_url": audio_url, "voice_id": voice_id}
