# User routes - Preferences, Bookmarks, Settings
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime, timezone
import os
from pymongo import MongoClient

router = APIRouter(prefix="/api", tags=["user"])

# MongoDB connection
mongo_client = MongoClient(os.environ.get("MONGO_URL"))
db = mongo_client[os.environ.get("DB_NAME", "narvo")]
bookmarks_col = db["bookmarks"]
preferences_col = db["user_preferences"]

# Create indexes
bookmarks_col.create_index([("user_id", 1), ("story_id", 1)], unique=True)
preferences_col.create_index("user_id", unique=True)


class Bookmark(BaseModel):
    story_id: str
    title: str
    summary: Optional[str] = ""
    source: Optional[str] = ""


class UserPreferences(BaseModel):
    voice_id: str = "nova"
    playback_speed: float = 1.0
    categories: List[str] = []
    notifications_enabled: bool = True


class UserSettings(BaseModel):
    system: Optional[Dict] = None
    accessibility: Optional[Dict] = None
    notifications: Optional[Dict] = None
    privacy: Optional[Dict] = None


# Bookmarks
@router.get("/articles/saved")
async def get_saved_articles(user_id: str = Query("guest")):
    """Get user's saved/bookmarked articles"""
    bookmarks = list(bookmarks_col.find(
        {"user_id": user_id},
        {"_id": 0, "user_id": 0}
    ).sort("saved_at", -1))
    return bookmarks


@router.post("/articles/save")
async def save_article(
    user_id: str = Query("guest"),
    bookmark: Bookmark = None
):
    """Save/bookmark an article"""
    if not bookmark:
        raise HTTPException(status_code=400, detail="Bookmark data required")
    
    doc = bookmark.dict()
    doc["user_id"] = user_id
    doc["saved_at"] = datetime.now(timezone.utc).isoformat()
    
    try:
        bookmarks_col.update_one(
            {"user_id": user_id, "story_id": bookmark.story_id},
            {"$set": doc},
            upsert=True
        )
        return {"status": "saved", "story_id": bookmark.story_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/articles/saved/{story_id}")
async def remove_saved_article(
    story_id: str,
    user_id: str = Query("guest")
):
    """Remove a saved article"""
    result = bookmarks_col.delete_one({"user_id": user_id, "story_id": story_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    return {"status": "removed", "story_id": story_id}


# Preferences
@router.get("/user/preferences")
async def get_user_preferences(user_id: str = Query("guest")):
    """Get user preferences"""
    prefs = preferences_col.find_one({"user_id": user_id}, {"_id": 0, "user_id": 0})
    if not prefs:
        return UserPreferences().dict()
    return prefs


@router.post("/user/preferences")
async def update_user_preferences(
    user_id: str = Query("guest"),
    preferences: UserPreferences = None
):
    """Update user preferences"""
    if not preferences:
        raise HTTPException(status_code=400, detail="Preferences data required")
    
    doc = preferences.dict()
    doc["user_id"] = user_id
    doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    preferences_col.update_one(
        {"user_id": user_id},
        {"$set": doc},
        upsert=True
    )
    return {"status": "updated"}


# Settings
@router.get("/user/settings")
async def get_user_settings(user_id: str = Query("guest")):
    """Get user settings"""
    settings = preferences_col.find_one(
        {"user_id": user_id},
        {"_id": 0, "user_id": 0, "settings": 1}
    )
    if not settings or "settings" not in settings:
        return UserSettings().dict()
    return settings["settings"]


@router.post("/user/settings")
async def update_user_settings(
    user_id: str = Query("guest"),
    settings: UserSettings = None
):
    """Update user settings"""
    if not settings:
        raise HTTPException(status_code=400, detail="Settings data required")
    
    preferences_col.update_one(
        {"user_id": user_id},
        {"$set": {
            "settings": settings.dict(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    return {"status": "updated"}


# Voices
@router.get("/voices")
async def get_available_voices():
    """Get available TTS voices"""
    return [
        {"id": "nova", "name": "Nova", "accent": "Standard", "description": "Energetic, upbeat broadcast voice"},
        {"id": "onyx", "name": "Onyx", "accent": "Pidgin", "description": "Deep, authoritative Pidgin-style voice"},
        {"id": "echo", "name": "Echo", "accent": "Yoruba", "description": "Smooth, calm Yoruba-style delivery"},
        {"id": "alloy", "name": "Alloy", "accent": "Hausa", "description": "Neutral, balanced Hausa-style voice"},
        {"id": "shimmer", "name": "Shimmer", "accent": "Igbo", "description": "Bright, cheerful Igbo-style voice"},
    ]
