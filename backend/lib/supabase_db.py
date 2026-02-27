"""
Supabase DB client (service role) for server-side access to app tables.
Replaces MongoDB for: bookmarks, user_preferences, briefings, offline_articles,
listening_history, push_subscriptions, tts_cache.
"""
import os
from supabase import create_client, Client

_db: Client | None = None


def get_supabase_db() -> Client:
    """Return Supabase client with service role (server-side only)."""
    global _db
    if _db is None:
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_ANON_KEY")
        if not url or not key:
            raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) required")
        _db = create_client(url, key)
    return _db
