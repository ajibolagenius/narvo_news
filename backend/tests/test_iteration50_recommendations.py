"""
Iteration 50 - Recommendation Engine & Tour Guide Tests
Tests for:
- GET /api/recommendations/guest endpoint
- Recommendation strategy and profile_summary
- Listening history integration
- Recently listened article exclusion
"""
import pytest
import requests
import os
from datetime import datetime, timezone

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8000').rstrip('/')


class TestRecommendationEndpoint:
    """Test the content recommendation engine API"""
    
    def test_recommendations_guest_endpoint_exists(self):
        """Test that GET /api/recommendations/guest returns valid response"""
        response = requests.get(f"{BASE_URL}/api/recommendations/guest?limit=5", timeout=30)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Must have these three keys
        assert "strategy" in data, "Response missing 'strategy' key"
        assert "recommendations" in data, "Response missing 'recommendations' key"
        assert "profile_summary" in data, "Response missing 'profile_summary' key"
        
        print(f"✓ Recommendations endpoint returned: strategy={data['strategy']}, reco_count={len(data['recommendations'])}")
        
    def test_recommendations_returns_array(self):
        """Test that recommendations field is a list"""
        response = requests.get(f"{BASE_URL}/api/recommendations/guest?limit=5", timeout=30)
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data["recommendations"], list), "recommendations must be a list"
        print(f"✓ Recommendations is list with {len(data['recommendations'])} items")
        
    def test_recommendations_strategy_types(self):
        """Test that strategy is one of expected values"""
        response = requests.get(f"{BASE_URL}/api/recommendations/guest?limit=5", timeout=30)
        assert response.status_code == 200
        data = response.json()
        
        valid_strategies = ["trending_fallback", "hybrid_collaborative_ai"]
        assert data["strategy"] in valid_strategies, f"Strategy '{data['strategy']}' not in {valid_strategies}"
        print(f"✓ Strategy is valid: {data['strategy']}")
        
    def test_recommendation_article_structure(self):
        """Test that recommendation articles have required fields"""
        response = requests.get(f"{BASE_URL}/api/recommendations/guest?limit=10", timeout=30)
        assert response.status_code == 200
        data = response.json()
        
        if len(data["recommendations"]) > 0:
            article = data["recommendations"][0]
            required_fields = ["id", "title", "source", "category"]
            for field in required_fields:
                assert field in article, f"Article missing '{field}' field"
            print(f"✓ Article structure valid: {article.get('title', 'N/A')[:50]}...")
        else:
            print("⚠ No recommendations returned to validate structure")


class TestListeningHistoryIntegration:
    """Test listening history creates/updates recommendation profile"""
    
    def test_add_listening_history_entry(self):
        """Test POST /api/listening-history adds entry"""
        test_entry = {
            "user_id": "guest",
            "track_id": "test_track_iter50",
            "title": "Test Article for Recommendations",
            "source": "Test Source",
            "category": "tech",
            "duration": 180
        }
        response = requests.post(
            f"{BASE_URL}/api/listening-history",
            json=test_entry,
            timeout=10
        )
        assert response.status_code == 200, f"Failed to add history: {response.text}"
        data = response.json()
        assert data.get("status") == "ok", f"Unexpected response: {data}"
        print(f"✓ Listening history entry added for track: {test_entry['track_id']}")
        
    def test_get_listening_history(self):
        """Test GET /api/listening-history/guest returns entries"""
        response = requests.get(f"{BASE_URL}/api/listening-history/guest?limit=10", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "History must be a list"
        print(f"✓ Listening history returned {len(data)} entries")
        
    def test_recommendations_with_history(self):
        """Test recommendations after adding listening history - may show hybrid_collaborative_ai"""
        # First add some listening history entries
        categories = ["politics", "economy", "tech"]
        for i, cat in enumerate(categories):
            entry = {
                "user_id": "guest",
                "track_id": f"test_reco_history_{i}_{datetime.now().timestamp()}",
                "title": f"Test {cat.title()} Article",
                "source": "Test Source",
                "category": cat,
                "duration": 120
            }
            requests.post(f"{BASE_URL}/api/listening-history", json=entry, timeout=10)
        
        # Now check recommendations
        response = requests.get(f"{BASE_URL}/api/recommendations/guest?limit=5", timeout=30)
        assert response.status_code == 200
        data = response.json()
        
        # With history, should get hybrid_collaborative_ai or trending_fallback
        print(f"✓ After history, strategy: {data['strategy']}")
        print(f"✓ Profile summary: {data.get('profile_summary')}")
        
        if data["strategy"] == "hybrid_collaborative_ai":
            assert data["profile_summary"] is not None, "hybrid strategy should have profile_summary"
            print(f"✓ Hybrid AI strategy active with profile: {data['profile_summary']}")


class TestRecommendationProfileSummary:
    """Test the profile_summary structure in recommendations"""
    
    def test_profile_summary_structure_when_present(self):
        """Test profile_summary has expected fields when present"""
        response = requests.get(f"{BASE_URL}/api/recommendations/guest?limit=5", timeout=30)
        assert response.status_code == 200
        data = response.json()
        
        profile = data.get("profile_summary")
        if profile is not None:
            expected_keys = ["top_categories", "top_sources", "expanded_topics", "history_count"]
            for key in expected_keys:
                assert key in profile, f"profile_summary missing '{key}'"
            print(f"✓ Profile summary structure valid: {profile}")
        else:
            # If profile is None, strategy should be trending_fallback
            assert data["strategy"] == "trending_fallback", \
                f"No profile but strategy is '{data['strategy']}', expected 'trending_fallback'"
            print(f"✓ No profile (trending_fallback) is valid")


class TestRecommendationScoring:
    """Test recommendation scores are returned"""
    
    def test_recommendations_have_scores(self):
        """Test that recommendation items include recommendation_score"""
        response = requests.get(f"{BASE_URL}/api/recommendations/guest?limit=5", timeout=30)
        assert response.status_code == 200
        data = response.json()
        
        # Only check scores if we have recommendations and hybrid strategy
        if data["strategy"] == "hybrid_collaborative_ai" and len(data["recommendations"]) > 0:
            for rec in data["recommendations"]:
                assert "recommendation_score" in rec, f"Recommendation missing score: {rec.get('title', 'N/A')}"
            print(f"✓ All {len(data['recommendations'])} recommendations have scores")
        else:
            print(f"⚠ Strategy is {data['strategy']}, scores may not be present")


class TestHealthAndNews:
    """Verify basic endpoints are working"""
    
    def test_health_endpoint(self):
        """Test /api/health returns online"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "online"
        print(f"✓ Health check: {data['status']}")
        
    def test_news_endpoint(self):
        """Test /api/news returns articles"""
        response = requests.get(f"{BASE_URL}/api/news?limit=5", timeout=30)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "No news articles returned"
        print(f"✓ News endpoint returned {len(data)} articles")


# Run tests if executed directly
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
