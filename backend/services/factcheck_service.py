# Fact-check Service - Mock Dubawa integration for fact-checking
import hashlib
from datetime import datetime, timezone
from typing import Dict

# Simulated fact-check database (keywords that trigger different verdicts)
FACT_CHECK_KEYWORDS = {
    "confirmed": ("VERIFIED", 95, "Official sources confirm this claim"),
    "official": ("VERIFIED", 90, "Statement verified through official channels"),
    "reports": ("UNVERIFIED", 60, "Claim requires additional verification"),
    "alleged": ("UNVERIFIED", 45, "Allegations not yet substantiated"),
    "breaking": ("UNVERIFIED", 55, "Breaking news - verification in progress"),
    "disputed": ("DISPUTED", 35, "Multiple sources contest this claim"),
    "false": ("FALSE", 15, "Claim contradicts verified facts"),
    "rumor": ("DISPUTED", 25, "Circulating as unverified rumor"),
    "viral": ("UNVERIFIED", 40, "Viral content pending fact-check"),
}


def check_story_facts(story_id: str) -> Dict:
    """
    Get fact-check status for a news story.
    NOTE: This is a MOCK implementation. In production, this would call the Dubawa API.
    """
    # Generate deterministic result based on story_id hash
    hash_val = int(hashlib.md5(story_id.encode()).hexdigest()[:8], 16)
    
    statuses = ["VERIFIED", "VERIFIED", "VERIFIED", "UNVERIFIED", "UNVERIFIED", "DISPUTED"]
    status = statuses[hash_val % len(statuses)]
    
    confidence_map = {
        "VERIFIED": 90 + (hash_val % 10),
        "UNVERIFIED": 50 + (hash_val % 30),
        "DISPUTED": 30 + (hash_val % 20)
    }
    
    explanations = {
        "VERIFIED": "Claim verified against trusted sources.",
        "UNVERIFIED": "Requires manual verification.",
        "DISPUTED": "Conflicting information detected."
    }
    
    return {
        "status": status,
        "confidence": confidence_map.get(status, 70),
        "source": "DUBAWA_AI_V2" if status == "VERIFIED" else "PENDING_REVIEW",
        "explanation": f"Automated fact-check completed. {explanations.get(status, '')}",
        "checked_at": datetime.now(timezone.utc).isoformat()
    }


def analyze_claim(text: str) -> Dict:
    """
    Analyze a text claim for fact-checking.
    NOTE: This is a MOCK implementation using keyword matching.
    """
    text_lower = text.lower()
    
    # Check for keywords that suggest verification status
    for keyword, (status, confidence, explanation) in FACT_CHECK_KEYWORDS.items():
        if keyword in text_lower:
            return {
                "status": status,
                "confidence": confidence,
                "source": "DUBAWA_KEYWORD_SCAN",
                "explanation": explanation,
                "checked_at": datetime.now(timezone.utc).isoformat()
            }
    
    # Default response for neutral text
    return {
        "status": "UNVERIFIED",
        "confidence": 50,
        "source": "DUBAWA_QUEUE",
        "explanation": "Claim queued for verification. No immediate flags detected.",
        "checked_at": datetime.now(timezone.utc).isoformat()
    }
