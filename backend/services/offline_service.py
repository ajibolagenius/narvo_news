# Offline Service - Article caching and management
import os
from datetime import datetime, timezone
from typing import List, Dict, Optional
from pymongo import MongoClient

mongo_client = MongoClient(os.environ.get("MONGO_URL"))
db = mongo_client[os.environ.get("DB_NAME", "narvo")]
offline_articles_col = db["offline_articles"]

try:
    offline_articles_col.create_index("story_id", unique=True)
except Exception as e:
    print(f"[offline_service] Index creation skipped (MongoDB may be down): {e}")


def save_article(article_data: Dict) -> Dict:
    """Save an article for offline reading"""
    doc = {
        "story_id": article_data.get("story_id"),
        "title": article_data.get("title"),
        "summary": article_data.get("summary", ""),
        "narrative": article_data.get("narrative", ""),
        "source": article_data.get("source", ""),
        "category": article_data.get("category", "General"),
        "image_url": article_data.get("image_url"),
        "saved_at": datetime.now(timezone.utc).isoformat()
    }
    
    offline_articles_col.update_one(
        {"story_id": doc["story_id"]},
        {"$set": doc},
        upsert=True
    )
    
    return {"status": "saved", "story_id": doc["story_id"]}


def get_articles() -> List[Dict]:
    """Get all saved offline articles"""
    return list(offline_articles_col.find({}, {"_id": 0}).sort("saved_at", -1))


def remove_article(story_id: str) -> bool:
    """Remove a specific article from offline storage"""
    result = offline_articles_col.delete_one({"story_id": story_id})
    return result.deleted_count > 0


def clear_all_articles() -> int:
    """Clear all saved offline articles"""
    result = offline_articles_col.delete_many({})
    return result.deleted_count


def get_stats() -> Dict:
    """Get offline storage statistics"""
    article_count = offline_articles_col.count_documents({})
    return {
        "article_count": article_count,
        "audio_note": "Audio caching is managed client-side via IndexedDB"
    }
