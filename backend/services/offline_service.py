# Offline Service - Article caching and management (Supabase)
from datetime import datetime, timezone
from typing import Dict, List

from lib.supabase_db import get_supabase_db


def save_article(article_data: Dict) -> Dict:
    """Save an article for offline reading"""
    db = get_supabase_db()
    doc = {
        "story_id": article_data.get("story_id"),
        "title": article_data.get("title"),
        "summary": article_data.get("summary", ""),
        "narrative": article_data.get("narrative", ""),
        "source": article_data.get("source", ""),
        "category": article_data.get("category", "General"),
        "image_url": article_data.get("image_url"),
        "saved_at": datetime.now(timezone.utc).isoformat(),
    }
    db.table("offline_articles").upsert(doc, on_conflict="story_id").execute()
    return {"status": "saved", "story_id": doc["story_id"]}


def get_articles() -> List[Dict]:
    """Get all saved offline articles"""
    db = get_supabase_db()
    r = db.table("offline_articles").select("*").order("saved_at", desc=True).execute()
    rows = r.data or []
    return [{k: v for k, v in row.items() if k != "id"} for row in rows]


def remove_article(story_id: str) -> bool:
    """Remove a specific article from offline storage"""
    db = get_supabase_db()
    r = db.table("offline_articles").delete().eq("story_id", story_id).execute()
    return len(r.data or []) > 0


def clear_all_articles() -> int:
    """Clear all saved offline articles"""
    db = get_supabase_db()
    # Supabase delete requires a filter; delete non-empty then empty story_id to clear all
    r1 = db.table("offline_articles").delete().neq("story_id", "").execute()
    r2 = db.table("offline_articles").delete().eq("story_id", "").execute()
    return len(r1.data or []) + len(r2.data or [])


def get_stats() -> Dict:
    """Get offline storage statistics"""
    db = get_supabase_db()
    r = db.table("offline_articles").select("story_id", count="exact").execute()
    count = r.count if getattr(r, "count", None) is not None else len(r.data or [])
    return {
        "article_count": count,
        "audio_note": "Audio caching is managed client-side via IndexedDB",
    }
