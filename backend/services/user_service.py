# User Service - User preferences, bookmarks, and settings management
import os
from datetime import datetime, timezone
from typing import Dict, List, Optional
from pymongo import MongoClient

mongo_client = MongoClient(os.environ.get("MONGO_URL"))
db = mongo_client[os.environ.get("DB_NAME", "narvo")]
bookmarks_col = db["bookmarks"]
preferences_col = db["user_preferences"]

# Create indexes
bookmarks_col.create_index([("user_id", 1), ("story_id", 1)], unique=True)
preferences_col.create_index("user_id", unique=True)

# Default values
DEFAULT_PREFERENCES = {
    "voice_id": "nova",
    "playback_speed": 1.0,
    "categories": [],
    "notifications_enabled": True
}

DEFAULT_SETTINGS = {
    "system": None,
    "accessibility": None,
    "notifications": None,
    "privacy": None
}


# Bookmark functions
def get_bookmarks(user_id: str) -> List[Dict]:
    """Get user's saved/bookmarked articles"""
    return list(bookmarks_col.find(
        {"user_id": user_id},
        {"_id": 0, "user_id": 0}
    ).sort("saved_at", -1))


def add_bookmark(user_id: str, bookmark_data: Dict) -> Dict:
    """Save/bookmark an article"""
    doc = {
        "user_id": user_id,
        "story_id": bookmark_data.get("story_id"),
        "title": bookmark_data.get("title"),
        "summary": bookmark_data.get("summary", ""),
        "source": bookmark_data.get("source", ""),
        "saved_at": datetime.now(timezone.utc).isoformat()
    }
    
    bookmarks_col.update_one(
        {"user_id": user_id, "story_id": doc["story_id"]},
        {"$set": doc},
        upsert=True
    )
    
    return {"status": "saved", "story_id": doc["story_id"]}


def remove_bookmark(user_id: str, story_id: str) -> bool:
    """Remove a saved article"""
    result = bookmarks_col.delete_one({"user_id": user_id, "story_id": story_id})
    return result.deleted_count > 0


# Preferences functions
def get_preferences(user_id: str) -> Dict:
    """Get user preferences"""
    prefs = preferences_col.find_one({"user_id": user_id}, {"_id": 0, "user_id": 0})
    if not prefs:
        return DEFAULT_PREFERENCES.copy()
    return prefs


def update_preferences(user_id: str, preferences: Dict) -> Dict:
    """Update user preferences"""
    doc = {**preferences}
    doc["user_id"] = user_id
    doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    preferences_col.update_one(
        {"user_id": user_id},
        {"$set": doc},
        upsert=True
    )
    
    return {"status": "updated"}


# Settings functions
def get_settings(user_id: str) -> Dict:
    """Get user settings"""
    settings = preferences_col.find_one(
        {"user_id": user_id},
        {"_id": 0, "user_id": 0, "settings": 1}
    )
    if not settings or "settings" not in settings:
        return DEFAULT_SETTINGS.copy()
    return settings["settings"]


def update_settings(user_id: str, settings: Dict) -> Dict:
    """Update user settings"""
    preferences_col.update_one(
        {"user_id": user_id},
        {"$set": {
            "settings": settings,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    
    return {"status": "updated"}


# Voice profiles — sourced from YarnGPT service (primary TTS)
def get_voice_profiles() -> List[Dict]:
    """Get available voice profiles from YarnGPT"""
    from services.yarngpt_service import get_voice_profiles as _yarn_profiles
    return _yarn_profiles()
