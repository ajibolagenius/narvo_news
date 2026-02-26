"""
Recommendation Service for Narvo
Combines collaborative filtering (listening history analysis) with
AI-powered topic expansion via Gemini to produce personalized news recommendations.
"""

import os
import json
import hashlib
from datetime import datetime, timezone, timedelta
from collections import Counter
from pymongo import MongoClient

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

mongo_client = MongoClient(os.environ.get("MONGO_URL"))
db = mongo_client[os.environ.get("DB_NAME", "narvo")]


def build_user_profile(user_id: str) -> dict:
    """Analyze listening history to build a preference profile."""
    history = list(db["listening_history"].find(
        {"user_id": user_id},
        {"_id": 0, "category": 1, "source": 1, "title": 1, "played_at": 1}
    ).sort("played_at", -1).limit(100))

    if not history:
        return {"categories": {}, "sources": {}, "keywords": [], "history_count": 0}

    # Weight recent listens more heavily
    now = datetime.now(timezone.utc)
    category_weights = Counter()
    source_weights = Counter()
    titles = []

    for item in history:
        played = item.get("played_at", "")
        try:
            played_dt = datetime.fromisoformat(played.replace("Z", "+00:00"))
            age_days = max(1, (now - played_dt).days)
        except Exception:
            age_days = 7
        # Decay factor: recent items get higher weight
        weight = 1.0 / (1.0 + age_days * 0.1)

        cat = (item.get("category") or "general").lower()
        src = item.get("source", "")
        category_weights[cat] += weight
        if src:
            source_weights[src] += weight
        if item.get("title"):
            titles.append(item["title"])

    # Normalize category weights
    total_cat = sum(category_weights.values()) or 1
    categories = {k: round(v / total_cat, 3) for k, v in category_weights.most_common(8)}

    total_src = sum(source_weights.values()) or 1
    sources = {k: round(v / total_src, 3) for k, v in source_weights.most_common(5)}

    # Extract frequent keywords from titles
    stop_words = {"the", "a", "an", "in", "on", "at", "to", "for", "of", "is", "and", "with", "by", "as", "from", "has", "its", "was", "are", "be"}
    word_counts = Counter()
    for title in titles:
        words = [w.lower().strip(".,!?\"'()[]") for w in title.split() if len(w) > 3]
        for w in words:
            if w not in stop_words:
                word_counts[w] += 1

    keywords = [w for w, _ in word_counts.most_common(15)]

    # Also load user interests from settings
    user_settings = db["user_preferences"].find_one({"user_id": user_id}, {"_id": 0})
    interests = []
    if user_settings and "settings" in user_settings:
        interests = user_settings["settings"].get("interests", [])

    return {
        "categories": categories,
        "sources": sources,
        "keywords": keywords,
        "interests": interests,
        "history_count": len(history),
    }


async def get_ai_topic_expansion(profile: dict) -> list:
    """Use Gemini to expand user interests into related topics for discovery."""
    if not EMERGENT_LLM_KEY or profile["history_count"] < 3:
        return []

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage

        top_categories = list(profile["categories"].keys())[:5]
        top_keywords = profile["keywords"][:10]
        interests = profile.get("interests", [])

        prompt = f"""Based on a user's news listening profile, suggest 5 additional related news topics they might enjoy.

User's top categories: {', '.join(top_categories)}
Frequent keywords in listened articles: {', '.join(top_keywords)}
Declared interests: {', '.join(interests) if interests else 'none'}

Return ONLY a JSON array of 5 topic strings, each 1-3 words. Example: ["Climate Policy", "Startup Funding", "Trade Agreements", "Digital Currency", "Healthcare Reform"]
No explanations, just the JSON array."""

        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"reco-{datetime.now().timestamp()}",
            system_message="You are a news recommendation AI. Return only valid JSON arrays."
        ).with_model("gemini", "gemini-2.0-flash")

        response = await chat.send_message(UserMessage(text=prompt))
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("```")[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
        cleaned = cleaned.strip()
        return json.loads(cleaned)
    except Exception as e:
        print(f"[Recommendation] AI expansion error: {e}")
        return []


def score_article(article: dict, profile: dict, expanded_topics: list) -> float:
    """Score a news article based on user profile match."""
    score = 0.0

    # Category match (strongest signal)
    cat = (article.get("category") or "general").lower()
    cat_weight = profile["categories"].get(cat, 0)
    score += cat_weight * 40

    # Source preference
    src = article.get("source", "")
    src_weight = profile["sources"].get(src, 0)
    score += src_weight * 20

    # Keyword match in title
    title_lower = (article.get("title") or "").lower()
    keyword_hits = sum(1 for kw in profile["keywords"] if kw in title_lower)
    score += min(keyword_hits * 5, 20)

    # Interest category match
    interests = profile.get("interests", [])
    if cat in interests:
        score += 15

    # AI-expanded topic match
    summary_lower = (article.get("summary") or "").lower()
    for topic in expanded_topics:
        topic_words = topic.lower().split()
        if any(w in title_lower or w in summary_lower for w in topic_words):
            score += 8
            break

    # Recency bonus
    try:
        pub = article.get("published", "")
        if pub:
            pub_dt = datetime.fromisoformat(pub.replace("Z", "+00:00"))
            age_hours = (datetime.now(timezone.utc) - pub_dt).total_seconds() / 3600
            if age_hours < 6:
                score += 10
            elif age_hours < 24:
                score += 5
    except Exception:
        pass

    return round(score, 2)


async def get_recommendations(user_id: str, available_news: list, limit: int = 10) -> dict:
    """Get personalized recommendations for a user."""
    profile = build_user_profile(user_id)

    # If no listening history, return trending/latest as fallback
    if profile["history_count"] == 0:
        return {
            "recommendations": available_news[:limit],
            "profile_summary": None,
            "strategy": "trending_fallback",
        }

    # Get AI-expanded topics
    expanded_topics = await get_ai_topic_expansion(profile)

    # Get IDs of recently listened articles to avoid re-recommending
    recent_history = list(db["listening_history"].find(
        {"user_id": user_id},
        {"_id": 0, "track_id": 1}
    ).sort("played_at", -1).limit(30))
    listened_ids = {h.get("track_id") for h in recent_history}

    # Score all articles
    scored = []
    for article in available_news:
        if article.get("id") in listened_ids:
            continue
        s = score_article(article, profile, expanded_topics)
        scored.append((s, article))

    # Sort by score descending
    scored.sort(key=lambda x: x[0], reverse=True)

    recommendations = []
    for s, article in scored[:limit]:
        rec = {**article, "recommendation_score": s}
        recommendations.append(rec)

    # Build a human-readable profile summary
    top_cats = list(profile["categories"].keys())[:3]
    profile_summary = {
        "top_categories": top_cats,
        "top_sources": list(profile["sources"].keys())[:3],
        "expanded_topics": expanded_topics[:5],
        "history_count": profile["history_count"],
    }

    return {
        "recommendations": recommendations,
        "profile_summary": profile_summary,
        "strategy": "hybrid_collaborative_ai",
    }
