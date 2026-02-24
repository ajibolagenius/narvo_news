# Briefing Service for Morning Briefing generation
import os
import asyncio
from datetime import datetime, timezone
from typing import List, Dict, Optional
from pymongo import MongoClient

from services.news_service import fetch_all_news
from services.tts_service import generate_tts_audio

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
mongo_client = MongoClient(os.environ.get("MONGO_URL"))
db = mongo_client[os.environ.get("DB_NAME", "narvo")]
briefings_col = db["briefings"]

async def generate_briefing_script(stories: List[Dict]) -> str:
    """Generate a broadcast script from top stories using Gemini"""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        stories_text = "\n\n".join([
            f"**{s['title'][:100]}** ({s['source']})\n{s['summary'][:200]}"
            for s in stories[:5]
        ])
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"briefing-{datetime.now().timestamp()}",
            system_message="""You are a professional broadcast journalist for Narvo. Create a concise 3-minute radio-style briefing script.

Requirements:
- Open with a brief greeting
- Cover each story in 2-3 sentences
- Use smooth transitions
- End with a short sign-off
- Keep it under 500 words
- Plain text only, no markdown"""
        ).with_model("gemini", "gemini-2.0-flash")
        
        user_message = UserMessage(text=f"Create a brief morning news script:\n\n{stories_text}")
        response = await chat.send_message(user_message)
        return response.strip()
    except Exception as e:
        print(f"Error generating briefing script: {e}")
        # Fallback to simple concatenation
        script = f"Good morning, this is your Narvo Morning Briefing for {datetime.now().strftime('%A, %B %d, %Y')}.\n\n"
        for i, story in enumerate(stories[:5], 1):
            script += f"Story {i}: {story['title'][:100]}. {story['summary'][:150]}.\n\n"
        script += "That's all for this morning's briefing. Stay informed with Narvo."
        return script

async def generate_briefing(voice_id: str = "nova", force_regenerate: bool = False) -> Dict:
    """Generate or retrieve morning briefing"""
    now = datetime.now(timezone.utc)
    today_date = now.strftime('%Y-%m-%d')
    
    # Check if today's briefing exists
    if not force_regenerate:
        existing = briefings_col.find_one({"date": today_date}, {"_id": 0})
        if existing:
            return existing
    
    # Fetch top stories
    all_news = await fetch_all_news(limit=10)
    top_stories = all_news[:5]
    
    if not top_stories:
        return None
    
    # Generate script
    script = await generate_briefing_script(top_stories)
    
    # Generate audio
    audio_url = await generate_tts_audio(script[:2500], voice_id)
    
    # Build briefing
    briefing_data = {
        "id": f"briefing-{now.strftime('%Y%m%d-%H%M')}",
        "date": today_date,
        "title": f"Morning Briefing - {now.strftime('%B %d, %Y')}",
        "generated_at": now.isoformat(),
        "duration_estimate": "~3 minutes",
        "stories": [
            {
                "id": s["id"],
                "title": s["title"][:100],
                "summary": s["summary"][:150] + "..." if len(s.get("summary", "")) > 150 else s.get("summary", ""),
                "source": s["source"],
                "category": s.get("category", "General")
            }
            for s in top_stories
        ],
        "script": script,
        "audio_url": audio_url,
        "voice_id": voice_id
    }
    
    # Store in MongoDB
    briefings_col.update_one(
        {"date": today_date},
        {"$set": briefing_data},
        upsert=True
    )
    
    return briefing_data

def get_latest_briefing() -> Optional[Dict]:
    """Get the most recent briefing"""
    return briefings_col.find_one({}, {"_id": 0}, sort=[("date", -1)])

def get_briefing_history(limit: int = 30, skip: int = 0) -> Dict:
    """Get historical briefings list"""
    briefings = list(
        briefings_col.find({}, {"_id": 0, "script": 0, "audio_url": 0})
        .sort("date", -1)
        .skip(skip)
        .limit(limit)
    )
    total = briefings_col.count_documents({})
    return {"briefings": briefings, "total": total}

def get_briefing_by_date(date: str) -> Optional[Dict]:
    """Get a specific briefing by date"""
    return briefings_col.find_one({"date": date}, {"_id": 0})
