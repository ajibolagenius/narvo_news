# Narrative Service - AI-powered narrative generation for news content
import json
from typing import Dict, List

from services.llm_gemini import generate_gemini


async def generate_narrative(text: str) -> Dict:
    """Generate broadcast narrative using Gemini (standalone)."""
    system = """You are a professional broadcast journalist for Narvo, an African news platform.
Your task is to transform news summaries into engaging broadcast narratives.

Style Guidelines:
- Write in a clear, authoritative broadcast tone
- Keep narratives concise but informative (2-3 paragraphs max)
- Include context that helps listeners understand the significance
- Extract 2-3 key takeaways as bullet points
- Maintain journalistic objectivity

Respond in JSON format:
{
  "narrative": "The broadcast narrative text...",
  "key_takeaways": ["Point 1", "Point 2", "Point 3"]
}"""
    user = f"Transform this news into a broadcast narrative:\n\n{text}"
    try:
        response = await generate_gemini(system, user)
        if not response:
            return {"narrative": text, "key_takeaways": ["Story details available in full article"]}
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("```")[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
        cleaned = cleaned.strip()
        result = json.loads(cleaned)
        return result
    except Exception as e:
        print(f"Error generating narrative: {e}")
        return {
            "narrative": text,
            "key_takeaways": ["Story details available in full article"]
        }


def extract_category(title: str, summary: str) -> str:
    """Simple category extraction based on keywords"""
    text = (title + " " + summary).lower()

    category_keywords = {
        "Politics": ["election", "government", "president", "minister", "policy", "parliament", "senate"],
        "Economy": ["economy", "market", "stock", "naira", "inflation", "trade", "gdp", "fiscal"],
        "Tech": ["tech", "digital", "app", "startup", "innovation", "software", "ai", "internet"],
        "Sports": ["sport", "football", "match", "player", "league", "afcon", "olympics"],
        "Health": ["health", "hospital", "disease", "medical", "doctor", "vaccine", "pandemic"],
        "Environment": ["climate", "environment", "weather", "flood", "drought", "pollution"],
    }

    for category, keywords in category_keywords.items():
        if any(word in text for word in keywords):
            return category

    return "General"


def extract_tags(title: str, category: str) -> List[str]:
    """Extract hashtags from content"""
    tags = [f"#{category.upper()}"]

    title_lower = title.lower()
    if "nigeria" in title_lower:
        tags.append("#NIGERIA")
    if "africa" in title_lower:
        tags.append("#AFRICA")
    if "breaking" in title_lower:
        tags.append("#BREAKING")

    return tags[:3]
