# Offline routes - Save articles, manage offline content
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from services.offline_service import (
    save_article,
    get_articles,
    remove_article,
    clear_all_articles,
    get_stats
)

router = APIRouter(prefix="/api/offline", tags=["offline"])


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
    try:
        return save_article(article.dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save article: {str(e)}")


@router.get("/articles", response_model=List[OfflineArticleResponse])
async def get_offline_articles():
    """Get all saved offline articles"""
    return get_articles()


@router.delete("/articles/{story_id}")
async def remove_offline_article(story_id: str):
    """Remove a specific article from offline storage"""
    if not remove_article(story_id):
        raise HTTPException(status_code=404, detail="Article not found")
    return {"status": "deleted", "story_id": story_id}


@router.delete("/articles")
async def clear_all_offline_articles():
    """Clear all saved offline articles"""
    deleted_count = clear_all_articles()
    return {"status": "cleared", "deleted_count": deleted_count}


@router.get("/stats")
async def get_offline_stats():
    """Get offline storage statistics"""
    return get_stats()
