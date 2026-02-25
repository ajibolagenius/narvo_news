# Aggregator service for Mediastack and NewsData.io
import os
import aiohttp
import hashlib
from datetime import datetime, timezone
from typing import List, Dict

MEDIASTACK_KEY = os.environ.get("MEDIASTACK_API_KEY", "")
NEWSDATA_KEY = os.environ.get("NEWSDATA_API_KEY", "")

_aggregator_cache: Dict = {"mediastack": [], "newsdata": [], "last_fetched": None}


async def fetch_mediastack(keywords: str = "Nigeria Africa", limit: int = 20) -> List[Dict]:
    """Fetch news from Mediastack API."""
    if not MEDIASTACK_KEY:
        return []
    url = "http://api.mediastack.com/v1/news"
    params = {
        "access_key": MEDIASTACK_KEY,
        "keywords": keywords,
        "languages": "en",
        "limit": limit,
        "sort": "published_desc",
    }
    try:
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=15)) as session:
            async with session.get(url, params=params) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    articles = data.get("data", [])
                    results = []
                    for a in articles:
                        item_id = hashlib.md5((a.get("url", "") + a.get("title", "")).encode()).hexdigest()[:12]
                        results.append({
                            "id": f"ms_{item_id}",
                            "title": (a.get("title") or "Untitled")[:200],
                            "summary": (a.get("description") or "")[:500],
                            "source": a.get("source") or "Mediastack",
                            "source_url": a.get("url"),
                            "image_url": a.get("image"),
                            "published": a.get("published_at"),
                            "category": a.get("category") or "General",
                            "region": "Africa",
                            "tags": [],
                            "aggregator": "mediastack",
                        })
                    _aggregator_cache["mediastack"] = results
                    _aggregator_cache["last_fetched"] = datetime.now(timezone.utc).isoformat()
                    return results
                else:
                    print(f"[Mediastack] Error: HTTP {resp.status}")
    except Exception as e:
        print(f"[Mediastack] Error: {e}")
    return _aggregator_cache.get("mediastack", [])


async def fetch_newsdata(query: str = "Nigeria", limit: int = 20) -> List[Dict]:
    """Fetch news from NewsData.io API."""
    if not NEWSDATA_KEY:
        return []
    url = "https://newsdata.io/api/1/latest"
    params = {
        "apikey": NEWSDATA_KEY,
        "q": query,
        "country": "ng",
        "language": "en",
        "size": limit,
    }
    try:
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=15)) as session:
            async with session.get(url, params=params) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    articles = data.get("results", [])
                    results = []
                    for a in articles:
                        item_id = hashlib.md5((a.get("link", "") + a.get("title", "")).encode()).hexdigest()[:12]
                        results.append({
                            "id": f"nd_{item_id}",
                            "title": (a.get("title") or "Untitled")[:200],
                            "summary": (a.get("description") or "")[:500],
                            "source": (a.get("source_id") or "NewsData").replace("_", " ").title(),
                            "source_url": a.get("link"),
                            "image_url": a.get("image_url"),
                            "published": a.get("pubDate"),
                            "category": (a.get("category") or ["General"])[0] if isinstance(a.get("category"), list) else "General",
                            "region": "Africa",
                            "tags": a.get("keywords", [])[:5] if a.get("keywords") else [],
                            "aggregator": "newsdata",
                        })
                    _aggregator_cache["newsdata"] = results
                    _aggregator_cache["last_fetched"] = datetime.now(timezone.utc).isoformat()
                    return results
                else:
                    print(f"[NewsData] Error: HTTP {resp.status}")
    except Exception as e:
        print(f"[NewsData] Error: {e}")
    return _aggregator_cache.get("newsdata", [])


async def fetch_all_aggregators(keywords: str = "Nigeria Africa") -> Dict:
    """Fetch from all programmatic aggregators."""
    import asyncio
    ms_task = fetch_mediastack(keywords)
    nd_task = fetch_newsdata(keywords.split()[0] if keywords else "Nigeria")
    ms_results, nd_results = await asyncio.gather(ms_task, nd_task)
    return {
        "mediastack": {"count": len(ms_results), "articles": ms_results},
        "newsdata": {"count": len(nd_results), "articles": nd_results},
        "total": len(ms_results) + len(nd_results),
        "last_fetched": _aggregator_cache.get("last_fetched"),
    }


def get_aggregator_status() -> Dict:
    """Return current aggregator cache status."""
    return {
        "mediastack": {
            "configured": bool(MEDIASTACK_KEY),
            "cached_count": len(_aggregator_cache.get("mediastack", [])),
        },
        "newsdata": {
            "configured": bool(NEWSDATA_KEY),
            "cached_count": len(_aggregator_cache.get("newsdata", [])),
        },
        "last_fetched": _aggregator_cache.get("last_fetched"),
    }
