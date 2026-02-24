# Discover routes - Podcasts, Trending, Radio integration
from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from datetime import datetime, timezone
import httpx

router = APIRouter(prefix="/api", tags=["discover"])

# Sample audio URLs from free sources for testing
# Using Internet Archive's public domain audio samples
SAMPLE_AUDIO_URLS = [
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",  # ~6MB
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",  # ~6MB
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",  # ~6MB
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",  # ~6MB
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",  # ~6MB
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",  # ~6MB
]

# Curated podcast episodes with real audio URLs for offline caching
PODCAST_EPISODES = [
    {
        "id": "ep402", "episode": "EP. 402", 
        "title": "The Geopolitical Shift: Arctic Routes", 
        "duration": "45:00", "category": "World Affairs",
        "description": "Understanding the opening trade routes incident at the North Pole and environmental impact analysis.",
        "audio_url": SAMPLE_AUDIO_URLS[0]
    },
    {
        "id": "ep089", "episode": "EP. 089", 
        "title": "Tech Horizons: Quantum Synthesis", 
        "duration": "22:15", "category": "Technology",
        "description": "Exclusive breakthrough from Zurich Labs on neural interface ready for human trials phase 1.",
        "audio_url": SAMPLE_AUDIO_URLS[1]
    },
    {
        "id": "ep012", "episode": "EP. 012", 
        "title": "Urban Architecture: Megacities", 
        "duration": "60:00", "category": "Development",
        "description": "Reimagining dense metropolitan spaces with Nigeria 2050 infrastructure planning data.",
        "audio_url": SAMPLE_AUDIO_URLS[2]
    },
    {
        "id": "ep201", "episode": "EP. 201", 
        "title": "Soundscapes: Amazon Rainforest", 
        "duration": "33:45", "category": "Environment",
        "description": "Binaural field recordings with biodiversity metrics and audio sample analysis.",
        "audio_url": SAMPLE_AUDIO_URLS[3]
    },
    {
        "id": "ep156", "episode": "EP. 156", 
        "title": "African Markets: Digital Currency Revolution", 
        "duration": "38:30", "category": "Finance",
        "description": "Analysis of cryptocurrency adoption across African nations and regulatory frameworks.",
        "audio_url": SAMPLE_AUDIO_URLS[4]
    },
    {
        "id": "ep078", "episode": "EP. 078", 
        "title": "Climate Dispatch: Sahel Region Report", 
        "duration": "28:15", "category": "Climate",
        "description": "Latest climate data from the Sahel region covering desertification and water security.",
        "audio_url": SAMPLE_AUDIO_URLS[5]
    },
]

# African countries for radio
AFRICAN_COUNTRIES = [
    {"code": "NG", "name": "Nigeria"},
    {"code": "GH", "name": "Ghana"},
    {"code": "KE", "name": "Kenya"},
    {"code": "ZA", "name": "South Africa"},
    {"code": "EG", "name": "Egypt"},
    {"code": "MA", "name": "Morocco"},
    {"code": "TZ", "name": "Tanzania"},
    {"code": "UG", "name": "Uganda"},
    {"code": "ET", "name": "Ethiopia"},
    {"code": "SN", "name": "Senegal"},
    {"code": "CM", "name": "Cameroon"},
    {"code": "CI", "name": "Ivory Coast"},
]


@router.get("/podcasts")
async def get_podcasts(
    limit: int = Query(6, le=20),
    sort: str = Query("latest", regex="^(latest|popular)$")
):
    """Get curated podcast episodes"""
    episodes = PODCAST_EPISODES.copy()
    
    if sort == "popular":
        # Shuffle for "popular" sort (in production, would use actual metrics)
        import random
        random.seed(42)  # Consistent ordering
        random.shuffle(episodes)
    
    return episodes[:limit]


@router.get("/podcasts/{podcast_id}")
async def get_podcast_detail(podcast_id: str):
    """Get specific podcast episode details"""
    for ep in PODCAST_EPISODES:
        if ep["id"] == podcast_id:
            return ep
    raise HTTPException(status_code=404, detail="Podcast not found")


from fastapi.responses import StreamingResponse
import asyncio

@router.get("/podcasts/{podcast_id}/audio")
async def stream_podcast_audio(podcast_id: str):
    """Stream podcast audio file (proxy to avoid CORS issues)"""
    podcast = None
    for ep in PODCAST_EPISODES:
        if ep["id"] == podcast_id:
            podcast = ep
            break
    
    if not podcast or not podcast.get("audio_url"):
        raise HTTPException(status_code=404, detail="Podcast audio not found")
    
    async def audio_stream():
        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream("GET", podcast["audio_url"]) as response:
                async for chunk in response.aiter_bytes(chunk_size=8192):
                    yield chunk
    
    return StreamingResponse(
        audio_stream(),
        media_type="audio/mpeg",
        headers={
            "Content-Disposition": f'attachment; filename="{podcast_id}.mp3"',
            "Cache-Control": "public, max-age=86400"
        }
    )


@router.get("/discover/trending")
async def get_trending_topics():
    """Get trending topics from news analysis"""
    # In production, this would analyze real news data
    trending = [
        {"topic": "ELECTION_2027", "count": "2.4K", "trend": "up", "category": "Politics"},
        {"topic": "NAIRA_FOREX", "count": "1.8K", "trend": "up", "category": "Economy"},
        {"topic": "TECH_STARTUPS", "count": "1.2K", "trend": "stable", "category": "Technology"},
        {"topic": "AFCON_2025", "count": "980", "trend": "up", "category": "Sports"},
        {"topic": "CLIMATE_SAHEL", "count": "756", "trend": "down", "category": "Environment"},
        {"topic": "HEALTH_INITIATIVE", "count": "654", "trend": "stable", "category": "Health"},
    ]
    return trending


@router.get("/radio/countries")
async def get_radio_countries():
    """Get list of African countries with radio stations"""
    return AFRICAN_COUNTRIES


@router.get("/radio/stations")
async def get_radio_stations(
    country: str = Query("NG", description="Country code"),
    limit: int = Query(20, le=50)
):
    """Get radio stations for a specific African country"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://de1.api.radio-browser.info/json/stations/bycountrycodeexact/" + country,
                headers={"User-Agent": "NarvoApp/2.0"},
                params={"limit": limit, "order": "votes", "reverse": "true"}
            )
            if response.status_code == 200:
                stations = response.json()
                return [
                    {
                        "id": s.get("stationuuid", ""),
                        "name": s.get("name", "Unknown"),
                        "url": s.get("url_resolved") or s.get("url", ""),
                        "country": s.get("country", ""),
                        "countrycode": s.get("countrycode", ""),
                        "language": s.get("language", ""),
                        "tags": s.get("tags", ""),
                        "favicon": s.get("favicon", ""),
                        "codec": s.get("codec", ""),
                        "bitrate": s.get("bitrate", 0),
                    }
                    for s in stations[:limit]
                ]
    except Exception as e:
        print(f"Radio API error: {e}")
    
    # Fallback stations
    return [
        {"id": "ng1", "name": "Wazobia FM", "url": "https://stream.zeno.fm/wazobiafm", 
         "country": "Nigeria", "countrycode": "NG", "language": "English/Pidgin", "tags": "pop,music"},
        {"id": "ng2", "name": "Cool FM Lagos", "url": "https://stream.zeno.fm/coolfm", 
         "country": "Nigeria", "countrycode": "NG", "language": "English", "tags": "pop,hits"},
    ]
