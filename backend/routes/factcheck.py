# Fact-check routes - Dubawa integration for content verification
from fastapi import APIRouter, Query
from pydantic import BaseModel

from services.factcheck_service import check_story_facts, analyze_claim

router = APIRouter(prefix="/api/factcheck", tags=["factcheck"])


class FactCheckResult(BaseModel):
    status: str  # 'VERIFIED', 'DISPUTED', 'UNVERIFIED', 'FALSE'
    confidence: int  # 0-100
    source: str
    explanation: str
    checked_at: str


@router.get("/{story_id}", response_model=FactCheckResult)
async def factcheck_story(story_id: str):
    """
    Get fact-check status for a news story.
    NOTE: This is a MOCK implementation - in production, it would call the Dubawa API.
    """
    result = check_story_facts(story_id)
    return FactCheckResult(**result)


@router.post("/analyze", response_model=FactCheckResult)
async def factcheck_analyze(text: str = Query(..., description="Text to fact-check")):
    """
    Analyze a text claim for fact-checking.
    NOTE: This is a MOCK implementation using keyword matching.
    """
    result = analyze_claim(text)
    return FactCheckResult(**result)
