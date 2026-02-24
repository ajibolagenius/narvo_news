# Admin routes - Operations, Moderation, Voice Management
from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel

router = APIRouter(prefix="/api/admin", tags=["admin"])


class AlertResponse(BaseModel):
    id: str
    type: str
    title: str
    description: str
    timestamp: str
    priority: bool = False


class StreamStatus(BaseModel):
    status: str
    id: str
    source: str
    region: str
    bitrate: str
    uptime: str


class VoiceMetric(BaseModel):
    name: str
    id: str
    language: str
    latency: str
    clarity: float
    status: str


class ModerationItem(BaseModel):
    id: str
    source: str
    status: str
    title: str
    description: str
    tags: List[str]
    confidence: str


@router.get("/metrics")
async def get_admin_metrics():
    """Get real-time system metrics for admin dashboard"""
    return {
        "active_streams": 1240,
        "avg_bitrate": 4.8,
        "error_rate": 0.02,
        "storage_used": 84,
        "node_load": "42%",
        "api_latency": "12ms",
        "uptime": "99.98%",
        "active_traffic": "4.8GBPS"
    }


@router.get("/alerts", response_model=List[AlertResponse])
async def get_system_alerts():
    """Get current system alerts"""
    now = datetime.now(timezone.utc).isoformat()
    return [
        {"id": "alert1", "type": "warning", "title": "HIGH_TRAFFIC_DETECTED", 
         "description": "Traffic spike on Nigeria node cluster. Auto-scaling initiated.", 
         "timestamp": now, "priority": True},
        {"id": "alert2", "type": "success", "title": "TTS_ENGINE_OPTIMIZED", 
         "description": "Voice synthesis latency reduced by 23% after optimization.", 
         "timestamp": now, "priority": False},
        {"id": "alert3", "type": "error", "title": "RSS_FEED_TIMEOUT", 
         "description": "Premium Times feed experiencing intermittent timeouts.", 
         "timestamp": now, "priority": True},
    ]


@router.get("/streams", response_model=List[StreamStatus])
async def get_stream_status():
    """Get status of all active streams"""
    return [
        {"status": "LIVE", "id": "NG_LGS_01", "source": "Vanguard Nigeria", "region": "Lagos", "bitrate": "4.8Mbps", "uptime": "23:45:12"},
        {"status": "LIVE", "id": "NG_ABJ_02", "source": "Premium Times", "region": "Abuja", "bitrate": "4.2Mbps", "uptime": "18:22:45"},
        {"status": "OFFLINE", "id": "KE_NBI_01", "source": "Nation Kenya", "region": "Nairobi", "bitrate": "0Mbps", "uptime": "00:00:00"},
        {"status": "LIVE", "id": "ZA_JNB_01", "source": "News24", "region": "Johannesburg", "bitrate": "5.1Mbps", "uptime": "48:12:33"},
        {"status": "LIVE", "id": "GH_ACC_01", "source": "GhanaWeb", "region": "Accra", "bitrate": "3.9Mbps", "uptime": "12:33:18"},
    ]


@router.get("/voices", response_model=List[VoiceMetric])
async def get_voice_metrics():
    """Get voice synthesis metrics"""
    return [
        {"name": "Nova", "id": "nova", "language": "English (Standard)", "latency": "120ms", "clarity": 98.2, "status": "LIVE"},
        {"name": "Onyx", "id": "onyx", "language": "Pidgin English", "latency": "145ms", "clarity": 96.8, "status": "LIVE"},
        {"name": "Echo", "id": "echo", "language": "Yoruba Accent", "latency": "135ms", "clarity": 97.5, "status": "LIVE"},
        {"name": "Alloy", "id": "alloy", "language": "Hausa Accent", "latency": "140ms", "clarity": 96.2, "status": "TRAINING"},
        {"name": "Shimmer", "id": "shimmer", "language": "Igbo Accent", "latency": "138ms", "clarity": 97.1, "status": "LIVE"},
    ]


@router.get("/moderation", response_model=List[ModerationItem])
async def get_moderation_queue():
    """Get content moderation queue"""
    return [
        {
            "id": "mod1", "source": "Vanguard", "status": "DISPUTED",
            "title": "Government announces new policy",
            "description": "Claims about economic impact require verification",
            "tags": ["#POLITICS", "#ECONOMY"], "confidence": "67%"
        },
        {
            "id": "mod2", "source": "Premium Times", "status": "VERIFIED",
            "title": "Tech startup raises funding",
            "description": "Investment figures confirmed with multiple sources",
            "tags": ["#TECH", "#BUSINESS"], "confidence": "94%"
        },
        {
            "id": "mod3", "source": "Daily Trust", "status": "UNVERIFIED",
            "title": "Health ministry statement",
            "description": "Awaiting official confirmation from ministry",
            "tags": ["#HEALTH", "#GOVERNMENT"], "confidence": "45%"
        },
    ]


@router.get("/curation/stories")
async def get_curation_stories():
    """Get stories for editorial curation"""
    return [
        {"id": "cur1", "title": "Election Updates 2027", "source": "Multiple", "status": "featured", "priority": 1},
        {"id": "cur2", "title": "Economic Reforms Analysis", "source": "Premium Times", "status": "pending", "priority": 2},
        {"id": "cur3", "title": "Tech Innovation Summit", "source": "TechCabal", "status": "approved", "priority": 3},
    ]


@router.post("/curation/stories/{story_id}/action")
async def curation_action(
    story_id: str,
    action: str = Query(..., regex="^(feature|archive|remove)$")
):
    """Perform curation action on a story"""
    return {"story_id": story_id, "action": action, "status": "success"}
