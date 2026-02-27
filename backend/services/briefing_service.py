# Briefing Service for Morning Briefing generation (Supabase)
from datetime import datetime, timezone
from typing import Dict, List, Optional

from lib.supabase_db import get_supabase_db
from services.news_service import fetch_all_news
from services.tts_service import generate_tts_audio
from services.llm_gemini import generate_gemini


async def generate_briefing_script(stories: List[Dict]) -> str:
    """Generate a broadcast script from top stories using Gemini (standalone)."""
    system = """You are a professional broadcast journalist for Narvo. Create a concise 3-minute radio-style briefing script.

Requirements:
- Open with a brief greeting (refer yourself as "your Narvo Briefing")
- Cover each story in 2-3 sentences
- Use smooth transitions
- End with a short sign-off (refer yourself as "your Narvo Briefing")
- Keep it under 500 words
- Plain text only, no markdown"""
    stories_text = "\n\n".join([
        f"**{s['title'][:100]}** ({s['source']})\n{s['summary'][:200]}"
        for s in stories[:5]
    ])
    user = f"Create a brief morning news script:\n\n{stories_text}"
    try:
        response = await generate_gemini(system, user)
        if response:
            return response.strip()
    except Exception as e:
        print(f"Error generating briefing script: {e}")
    script = f"Good morning, this is your Narvo Briefing for {datetime.now().strftime('%A, %B %d, %Y')}.\n\n"
    for i, story in enumerate(stories[:5], 1):
        script += f"Story {i}: {story['title'][:100]}. {story['summary'][:150]}.\n\n"
    script += "That's all for this briefing. Stay informed with Narvo."
    return script


async def generate_briefing(voice_id: str = "nova", force_regenerate: bool = False) -> Dict:
    """Generate or retrieve morning briefing"""
    now = datetime.now(timezone.utc)
    today_date = now.strftime("%Y-%m-%d")
    db = get_supabase_db()

    if not force_regenerate:
        r = db.table("briefings").select("*").eq("date", today_date).limit(1).execute()
        if r.data and len(r.data) > 0:
            row = r.data[0]
            return _briefing_row_to_dict(row)

    all_news = await fetch_all_news(limit=10)
    top_stories = all_news[:5]
    if not top_stories:
        return None

    script = await generate_briefing_script(top_stories)
    audio_url = await generate_tts_audio(script[:2500], voice_id)

    briefing_data = {
        "id": f"briefing-{now.strftime('%Y%m%d-%H%M')}",
        "date": today_date,
        "title": f"Morning Briefing - {now.strftime('%B %d, %Y')}",
        "generated_at": now.isoformat(),
        "duration_estimate": "~3 minutes",
        "stories": [
            {
                "id": s.get("id"),
                "title": (s.get("title") or "")[:100],
                "summary": (s.get("summary") or "")[:150] + "..." if len(s.get("summary") or "") > 150 else (s.get("summary") or ""),
                "source": s.get("source"),
                "category": s.get("category", "General"),
            }
            for s in top_stories
        ],
        "script": script,
        "audio_url": audio_url,
        "voice_id": voice_id,
    }
    db.table("briefings").upsert(briefing_data, on_conflict="date").execute()
    return briefing_data


def _briefing_row_to_dict(row: dict) -> dict:
    out = dict(row)
    for k in ("generated_at",):
        if k in out and hasattr(out[k], "isoformat"):
            out[k] = out[k].isoformat()
    return out


def get_latest_briefing() -> Optional[Dict]:
    """Get the most recent briefing"""
    db = get_supabase_db()
    r = db.table("briefings").select("*").order("date", desc=True).limit(1).execute()
    if not r.data:
        return None
    return _briefing_row_to_dict(r.data[0])


def get_briefing_history(limit: int = 30, skip: int = 0) -> Dict:
    """Get historical briefings list"""
    db = get_supabase_db()
    r = db.table("briefings").select("id, date, title, generated_at, duration_estimate, stories, voice_id").order("date", desc=True).range(skip, skip + limit - 1).execute()
    total_r = db.table("briefings").select("id", count="exact").execute()
    total = getattr(total_r, "count", None) or len(total_r.data or [])
    briefings = [_briefing_row_to_dict(x) for x in (r.data or [])]
    return {"briefings": briefings, "total": total}


def get_briefing_by_date(date: str) -> Optional[Dict]:
    """Get a specific briefing by date"""
    db = get_supabase_db()
    r = db.table("briefings").select("*").eq("date", date).limit(1).execute()
    if not r.data:
        return None
    return _briefing_row_to_dict(r.data[0])
