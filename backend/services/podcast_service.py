# Podcast Service - Podcast episode management and streaming
from typing import List, Dict, Optional

# Sample audio URLs from free sources
SAMPLE_AUDIO_URLS = [
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
]

# Curated podcast episodes
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


def get_podcasts(limit: int = 6, sort: str = "latest") -> List[Dict]:
    """Get curated podcast episodes"""
    episodes = PODCAST_EPISODES.copy()
    
    if sort == "popular":
        import random
        random.seed(42)
        random.shuffle(episodes)
    
    return episodes[:limit]


def get_podcast_by_id(podcast_id: str) -> Optional[Dict]:
    """Get specific podcast episode by ID"""
    for ep in PODCAST_EPISODES:
        if ep["id"] == podcast_id:
            return ep
    return None


def get_podcast_audio_url(podcast_id: str) -> Optional[str]:
    """Get audio URL for a podcast episode"""
    podcast = get_podcast_by_id(podcast_id)
    if podcast:
        return podcast.get("audio_url")
    return None


async def search_podcasts(query: str, limit: int = 10) -> List[Dict]:
    """Search podcast episodes by title/description."""
    q = query.lower()
    results = []
    for ep in PODCAST_EPISODES:
        if q in ep.get("title", "").lower() or q in ep.get("description", "").lower():
            results.append(ep)
    return results[:limit]
