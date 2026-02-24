# User routes - Preferences, Bookmarks, Settings
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict

from services.user_service import (
    get_bookmarks,
    add_bookmark,
    remove_bookmark,
    get_preferences,
    update_preferences,
    get_settings,
    update_settings,
    get_voice_profiles
)

router = APIRouter(prefix="/api", tags=["user"])


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
    return get_bookmarks(user_id)


@router.post("/articles/save")
async def save_article(
    user_id: str = Query("guest"),
    bookmark: Bookmark = None
):
    """Save/bookmark an article"""
    if not bookmark:
        raise HTTPException(status_code=400, detail="Bookmark data required")
    
    try:
        return add_bookmark(user_id, bookmark.dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/articles/saved/{story_id}")
async def remove_saved_article(
    story_id: str,
    user_id: str = Query("guest")
):
    """Remove a saved article"""
    if not remove_bookmark(user_id, story_id):
        raise HTTPException(status_code=404, detail="Bookmark not found")
    return {"status": "removed", "story_id": story_id}


# Preferences
@router.get("/user/preferences")
async def get_user_preferences(user_id: str = Query("guest")):
    """Get user preferences"""
    return get_preferences(user_id)


@router.post("/user/preferences")
async def update_user_preferences(
    user_id: str = Query("guest"),
    preferences: UserPreferences = None
):
    """Update user preferences"""
    if not preferences:
        raise HTTPException(status_code=400, detail="Preferences data required")
    
    return update_preferences(user_id, preferences.dict())


# Settings
@router.get("/user/settings")
async def get_user_settings(user_id: str = Query("guest")):
    """Get user settings"""
    return get_settings(user_id)


@router.post("/user/settings")
async def update_user_settings(
    user_id: str = Query("guest"),
    settings: UserSettings = None
):
    """Update user settings"""
    if not settings:
        raise HTTPException(status_code=400, detail="Settings data required")
    
    return update_settings(user_id, settings.dict())


# Voices
@router.get("/voices")
async def get_available_voices():
    """Get available TTS voices"""
    return get_voice_profiles()
