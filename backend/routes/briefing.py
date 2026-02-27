# Briefing routes — single module for /api/briefing/*
import logging
from fastapi import APIRouter, Query, HTTPException

from services.briefing_service import (
    generate_briefing,
    get_latest_briefing,
    get_briefing_history,
    get_briefing_by_date,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/briefing", tags=["briefing"])


@router.get("/generate")
async def generate_morning_briefing(
    voice_id: str = Query("emma", description="Voice for TTS"),
    force_regenerate: bool = Query(False, description="Force regeneration"),
):
    """Generate or retrieve morning briefing with audio"""
    try:
        out = await generate_briefing(voice_id=voice_id, force_regenerate=force_regenerate)
        if out is None:
            raise HTTPException(status_code=404, detail="No stories available for briefing")
        return out
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Briefing generation error: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed to generate briefing: {str(e)}")


@router.get("/latest")
async def get_latest():
    """Get the most recent briefing from database"""
    latest = get_latest_briefing()
    if latest:
        return latest
    raise HTTPException(status_code=404, detail="No briefing available. Generate one first.")


@router.get("/history")
async def get_history(
    limit: int = Query(30, le=90, description="Number of briefings to return"),
    skip: int = Query(0, description="Number to skip for pagination"),
):
    """Get historical briefings list"""
    return get_briefing_history(limit=limit, skip=skip)


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
    voice_id: str = Query("emma", description="Voice for TTS"),
):
    """Generate audio for a custom briefing script (YarnGPT TTS)."""
    try:
        from services.yarngpt_service import generate_tts as yarn_generate_tts
        tts_text = script[:4000] if len(script) > 4000 else script
        audio_url = await yarn_generate_tts(text=tts_text, voice_id=voice_id, language="en")
        if not audio_url:
            raise Exception("TTS generation failed")
        return {"audio_url": audio_url, "voice_id": voice_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio generation failed: {str(e)}")
