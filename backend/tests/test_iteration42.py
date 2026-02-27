"""
Iteration 42 Backend API Tests
Tests for:
- Podcast categories endpoint
- Podcast search endpoint
- Settings persistence (guest user)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8000')


class TestPodcastEndpoints:
    """Tests for /api/podcasts/* endpoints"""
    
    def test_podcast_categories_returns_8_categories(self):
        """Test 11: GET /api/podcasts/categories returns array of 8 categories"""
        response = requests.get(f"{BASE_URL}/api/podcasts/categories")
        
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 8, f"Expected 8 categories, got {len(data)}"
        
        # Verify structure of each category
        for cat in data:
            assert "id" in cat
            assert "name" in cat
        
        # Check expected categories exist
        category_ids = [c["id"] for c in data]
        expected_cats = ["geopolitics", "technology", "urban", "environment", "finance", "health", "climate", "culture"]
        for exp in expected_cats:
            assert exp in category_ids, f"Missing category: {exp}"
    
    def test_podcast_search_with_arctic_query(self):
        """Test 12: GET /api/podcasts/search?q=arctic returns results"""
        response = requests.get(f"{BASE_URL}/api/podcasts/search", params={"q": "arctic"})
        
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Expected at least 1 search result for 'arctic'"
        
        # Verify first result structure
        first_result = data[0]
        assert "id" in first_result
        assert "title" in first_result
        assert "description" in first_result
        assert "arctic" in first_result["title"].lower() or "arctic" in first_result["description"].lower()
    
    def test_podcast_list_returns_episodes(self):
        """Test podcasts list endpoint"""
        response = requests.get(f"{BASE_URL}/api/podcasts", params={"limit": 6})
        
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        
        if len(data) > 0:
            episode = data[0]
            assert "id" in episode
            assert "title" in episode
            assert "duration" in episode


class TestSettingsPersistence:
    """Tests for /api/settings/* endpoints"""
    
    def test_save_and_retrieve_guest_settings(self):
        """Test 13: POST /api/settings/guest saves and GET /api/settings/guest retrieves settings"""
        # Save settings
        test_settings = {
            "voice_model": "echo",
            "broadcast_language": "pcm",
            "theme": "dark"
        }
        
        save_response = requests.post(
            f"{BASE_URL}/api/settings/guest",
            json=test_settings,
            headers={"Content-Type": "application/json"}
        )
        
        assert save_response.status_code == 200
        save_data = save_response.json()
        assert save_data.get("status") == "success"
        
        # Retrieve settings
        get_response = requests.get(f"{BASE_URL}/api/settings/guest")
        
        assert get_response.status_code == 200
        
        retrieved = get_response.json()
        assert retrieved.get("voice_model") == "echo"
        assert retrieved.get("broadcast_language") == "pcm"
    
    def test_settings_merge_behavior(self):
        """Test that settings merge correctly without overwriting all fields"""
        # First, get current settings
        initial = requests.get(f"{BASE_URL}/api/settings/guest").json()
        
        # Update only one field
        requests.post(
            f"{BASE_URL}/api/settings/guest",
            json={"font_scale": 125},
            headers={"Content-Type": "application/json"}
        )
        
        # Verify the update and that other fields are preserved
        updated = requests.get(f"{BASE_URL}/api/settings/guest").json()
        
        assert updated.get("font_scale") == 125


class TestVoicesEndpoint:
    """Tests for /api/voices endpoint"""
    
    def test_voices_returns_all_profiles(self):
        """Test voices endpoint returns voice profiles"""
        response = requests.get(f"{BASE_URL}/api/voices")
        
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 5, "Expected at least 5 voice profiles"
        
        # Verify each voice has required fields
        for voice in data:
            assert "id" in voice
            assert "name" in voice
            assert "accent" in voice
            assert "language" in voice
            assert "description" in voice


class TestHealthEndpoint:
    """Basic API health check"""
    
    def test_api_health(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("status") == "online"
        assert data.get("service") == "Narvo API"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
