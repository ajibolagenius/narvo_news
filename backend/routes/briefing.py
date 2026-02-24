# Briefing routes
from fastapi import APIRouter, Query, HTTPException

from services.briefing_service import (
    generate_briefing, get_latest_briefing, get_briefing_history, get_briefing_by_date
)
from services.tts_service import generate_tts_audio, get_available_voices

router = APIRouter(prefix="/api/briefing", tags=["briefing"])

@router.get("/generate")
async def generate_morning_briefing(
    voice_id: str = Query("nova", description="Voice for TTS"),
    force_regenerate: bool = Query(False, description="Force regeneration")
):
    """Generate or retrieve morning briefing with audio"""
    briefing = await generate_briefing(voice_id, force_regenerate)
    if not briefing:
        raise HTTPException(status_code=404, detail="No stories available for briefing")
    return briefing

@router.get("/latest")
async def get_latest():
    """Get the most recent briefing"""
    briefing = get_latest_briefing()
    if not briefing:
        raise HTTPException(status_code=404, detail="No briefing available. Generate one first.")
    return briefing

@router.get("/history")
async def get_history(
    limit: int = Query(30, le=90),
    skip: int = Query(0)
):
    """Get historical briefings list"""
    return get_briefing_history(limit, skip)

@router.get("/{briefing_date}")
async def get_by_date(briefing_date: str):
    """Get a specific briefing by date (YYYY-MM-DD)"""
    briefing = get_briefing_by_date(briefing_date)
    if not briefing:
        raise HTTPException(status_code=404, detail=f"No briefing found for {briefing_date}")
    return briefing

@router.post("/audio")
async def generate_audio(
    script: str = Query(..., description="Briefing script text"),
    voice_id: str = Query("nova", description="Voice for TTS")
):
    """Generate audio for a custom briefing script"""
    audio_url = await generate_tts_audio(script, voice_id)
    if not audio_url:
        raise HTTPException(status_code=500, detail="Audio generation failed")
    return {"audio_url": audio_url, "voice_id": voice_id}
