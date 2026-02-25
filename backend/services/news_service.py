# News service for RSS feed fetching and processing
import asyncio
import hashlib
import aiohttp
import feedparser
from datetime import datetime, timezone
from typing import List, Dict, Optional

# RSS Feed Sources - Populated from Narvo Content Sources Document
RSS_FEEDS = [
    # === LOCAL (NIGERIA) ===
    {"url": "https://www.bbc.com/hausa/topics/c2dwqd1zr92t/rss.xml", "source": "BBC Hausa", "category": "General", "region": "local"},
    {"url": "https://www.channelstv.com/feed/", "source": "Channels TV", "category": "General", "region": "local"},
    {"url": "https://dailytrust.com/feed/", "source": "Daily Trust", "category": "General", "region": "local"},
    {"url": "https://www.vanguardngr.com/feed/", "source": "Vanguard Nigeria", "category": "General", "region": "local"},
    {"url": "https://guardian.ng/feed/", "source": "Guardian Nigeria", "category": "General", "region": "local"},
    {"url": "https://punchng.com/feed/", "source": "Punch Nigeria", "category": "General", "region": "local"},
    {"url": "https://www.premiumtimesng.com/feed", "source": "Premium Times", "category": "Politics", "region": "local"},
    {"url": "http://saharareporters.com/rss.xml", "source": "Sahara Reporters", "category": "Politics", "region": "local"},
    {"url": "https://nairametrics.com/feed/", "source": "Nairametrics", "category": "Economy", "region": "local"},
    {"url": "https://www.thisdaylive.com/feed/", "source": "ThisDay", "category": "General", "region": "local"},
    {"url": "https://tribuneonlineng.com/feed/", "source": "Nigerian Tribune", "category": "General", "region": "local"},
    {"url": "https://leadership.ng/feed/", "source": "Leadership", "category": "Politics", "region": "local"},
    {"url": "https://businessday.ng/feed/", "source": "Business Day Nigeria", "category": "Economy", "region": "local"},
    {"url": "https://www.pulse.ng/rss", "source": "Pulse Nigeria", "category": "Entertainment", "region": "local"},
    {"url": "https://techpoint.africa/feed/", "source": "Techpoint Africa", "category": "Tech", "region": "local"},
    {"url": "https://ripplesnigeria.com/feed/", "source": "Ripples Nigeria", "category": "Economy", "region": "local"},
    
    # === INTERNATIONAL ===
    {"url": "https://feeds.bbci.co.uk/news/world/africa/rss.xml", "source": "BBC Africa", "category": "General", "region": "international"},
    {"url": "http://rss.cnn.com/rss/edition_africa.rss", "source": "CNN Africa", "category": "General", "region": "international"},
    {"url": "https://www.aljazeera.com/xml/rss/all.xml", "source": "Al Jazeera", "category": "General", "region": "international"},
    {"url": "https://www.reuters.com/rssFeed/worldNews", "source": "Reuters World", "category": "General", "region": "international"},
    {"url": "https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf", "source": "AllAfrica", "category": "General", "region": "international"},
    
    # === SPORTS ===
    {"url": "https://www.espn.com/espn/rss/soccer/news", "source": "ESPN Soccer", "category": "Sports", "region": "international"},
    {"url": "https://www.goal.com/en-ng/feeds/news", "source": "Goal Nigeria", "category": "Sports", "region": "local"},
]

async def fetch_rss_feed(feed_config: Dict, timeout: int = 10) -> List[Dict]:
    """Fetch and parse a single RSS feed with error handling"""
    items = []
    try:
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=timeout)) as session:
            async with session.get(feed_config["url"], headers={"User-Agent": "NarvoBot/2.0"}) as response:
                if response.status == 200:
                    content = await response.text()
                    parsed = feedparser.parse(content)
                    
                    for entry in parsed.entries[:15]:
                        item_id = hashlib.md5(f"{entry.get('link', '')}{entry.get('title', '')}".encode()).hexdigest()[:12]
                        
                        published = None
                        if hasattr(entry, 'published_parsed') and entry.published_parsed:
                            try:
                                published = datetime(*entry.published_parsed[:6]).isoformat()
                            except (TypeError, ValueError):
                                pass
                        
                        image_url = None
                        if hasattr(entry, 'media_content') and entry.media_content:
                            image_url = entry.media_content[0].get('url')
                        elif hasattr(entry, 'enclosures') and entry.enclosures:
                            for enc in entry.enclosures:
                                if enc.get('type', '').startswith('image'):
                                    image_url = enc.get('href')
                                    break
                        
                        summary = entry.get('summary', entry.get('description', ''))[:500]
                        if '<' in summary:
                            import re
                            summary = re.sub(r'<[^>]+>', '', summary)
                        
                        items.append({
                            "id": item_id,
                            "title": entry.get('title', 'Untitled')[:200],
                            "summary": summary,
                            "source": feed_config["source"],
                            "source_url": entry.get('link'),
                            "image_url": image_url,
                            "published": published,
                            "category": feed_config.get("category", "General"),
                            "region": "Africa",
                            "tags": [t.get('term', '') for t in entry.get('tags', [])][:5] if hasattr(entry, 'tags') else [],
                        })
    except Exception as e:
        print(f"Error fetching {feed_config['source']}: {e}")
    
    return items

async def fetch_all_news(limit: int = 50, category: Optional[str] = None) -> List[Dict]:
    """Fetch news from all RSS feeds"""
    all_news = []
    tasks = [fetch_rss_feed(feed) for feed in RSS_FEEDS]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    for items in results:
        if isinstance(items, list):
            all_news.extend(items)
    
    # Filter by category if specified
    if category:
        all_news = [item for item in all_news if item.get("category", "").lower() == category.lower()]
    
    # Sort by published date (newest first) and remove duplicates
    seen_titles = set()
    unique_news = []
    for item in sorted(all_news, key=lambda x: x.get("published") or "", reverse=True):
        title_key = item["title"][:50].lower()
        if title_key not in seen_titles:
            seen_titles.add(title_key)
            unique_news.append(item)
    
    return unique_news[:limit]

async def search_news(query: str, category: Optional[str] = None, limit: int = 20) -> Dict:
    """Search news articles by query"""
    all_news = await fetch_all_news(limit=100)
    
    query_lower = query.lower()
    filtered = []
    
    for item in all_news:
        title_match = query_lower in item.get("title", "").lower()
        summary_match = query_lower in item.get("summary", "").lower()
        
        if title_match or summary_match:
            if category and item.get("category", "").lower() != category.lower():
                continue
            filtered.append(item)
    
    # Sort by relevance
    filtered.sort(key=lambda x: (
        query_lower not in x.get("title", "").lower(),
        x.get("published", "")
    ), reverse=True)
    
    return {
        "results": filtered[:limit],
        "total": len(filtered),
        "query": query
    }

async def get_breaking_news() -> Optional[Dict]:
    """Get breaking/developing news"""
    all_news = await fetch_all_news(limit=30)
    
    breaking_keywords = ['breaking', 'urgent', 'flash', 'just in', 'developing', 'live']
    
    for item in all_news:
        title_lower = item.get("title", "").lower()
        if any(kw in title_lower for kw in breaking_keywords):
            return {**item, "is_breaking": True}
    
    # Return latest as developing
    if all_news:
        return {**all_news[0], "is_developing": True}
    
    return None

async def get_trending_topics() -> Dict:
    """Get trending topics from recent news"""
    all_news = await fetch_all_news(limit=50)
    
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
    
    top_categories = sorted(category_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    top_keywords = sorted(keyword_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    
    return {
        "tags": [f"#{cat.upper()}" for cat, _ in top_categories],
        "topics": [{"name": kw.title(), "count": f"{cnt * 100}+"} for kw, cnt in top_keywords][:5],
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
