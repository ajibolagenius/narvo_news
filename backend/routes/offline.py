# Offline routes - Save articles, manage offline content
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import os
from pymongo import MongoClient

router = APIRouter(prefix="/api/offline", tags=["offline"])

# MongoDB connection
mongo_client = MongoClient(os.environ.get("MONGO_URL"))
db = mongo_client[os.environ.get("DB_NAME", "narvo")]
offline_articles_col = db["offline_articles"]

# Create index
offline_articles_col.create_index("story_id", unique=True)


class OfflineArticle(BaseModel):
    story_id: str
    title: str
    summary: Optional[str] = ""
    narrative: Optional[str] = ""
    source: Optional[str] = ""
    category: Optional[str] = "General"
    image_url: Optional[str] = None


class OfflineArticleResponse(BaseModel):
    story_id: str
    title: str
    summary: Optional[str] = ""
    narrative: Optional[str] = ""
    source: Optional[str] = ""
    category: Optional[str] = "General"
    image_url: Optional[str] = None
    saved_at: str


@router.post("/save")
async def save_article_offline(article: OfflineArticle):
    """Save an article for offline reading"""
    doc = article.dict()
    doc["saved_at"] = datetime.now(timezone.utc).isoformat()
    
    try:
        offline_articles_col.update_one(
            {"story_id": article.story_id},
            {"$set": doc},
            upsert=True
        )
        return {"status": "saved", "story_id": article.story_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save article: {str(e)}")


@router.get("/articles", response_model=List[OfflineArticleResponse])
async def get_offline_articles():
    """Get all saved offline articles"""
    articles = list(offline_articles_col.find({}, {"_id": 0}).sort("saved_at", -1))
    return articles


@router.delete("/articles/{story_id}")
async def remove_offline_article(story_id: str):
    """Remove a specific article from offline storage"""
    result = offline_articles_col.delete_one({"story_id": story_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"status": "deleted", "story_id": story_id}


@router.delete("/articles")
async def clear_all_offline_articles():
    """Clear all saved offline articles"""
    result = offline_articles_col.delete_many({})
    return {"status": "cleared", "deleted_count": result.deleted_count}


@router.get("/stats")
async def get_offline_stats():
    """Get offline storage statistics"""
    article_count = offline_articles_col.count_documents({})
    return {
        "article_count": article_count,
        "audio_note": "Audio caching is managed client-side via IndexedDB"
    }
