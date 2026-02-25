"""
Iteration 25 Backend Tests
Testing: Backend modular routes, offline API, discover API, admin API, voices API
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://narvo-news-engine.preview.emergentagent.com')


class TestHealthAndBasicEndpoints:
    """Health check and basic endpoint tests"""
    
    def test_health_endpoint(self):
        """Test /api/health returns online status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "online"
        assert data["service"] == "Narvo API"
        assert data["version"] == "2.0"
        print(f"Health check passed: {data}")


class TestModularRoutes:
    """Test backend modular routes from routes/ directory"""
    
    def test_podcasts_endpoint(self):
        """Test /api/podcasts returns podcast episodes"""
        response = requests.get(f"{BASE_URL}/api/podcasts")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        # Verify podcast structure
        podcast = data[0]
        assert "id" in podcast
        assert "episode" in podcast
        assert "title" in podcast
        assert "duration" in podcast
        assert "category" in podcast
        print(f"Podcasts endpoint returned {len(data)} episodes")
    
    def test_discover_trending_endpoint(self):
        """Test /api/discover/trending returns trending topics"""
        response = requests.get(f"{BASE_URL}/api/discover/trending")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        # Verify trending structure
        topic = data[0]
        assert "topic" in topic
        assert "count" in topic
        assert "trend" in topic
        print(f"Trending endpoint returned {len(data)} topics")
    
    def test_radio_countries_endpoint(self):
        """Test /api/radio/countries returns African countries"""
        response = requests.get(f"{BASE_URL}/api/radio/countries")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 10  # Should have at least 10 African countries
        # Verify country structure
        country = data[0]
        assert "code" in country
        assert "name" in country
        print(f"Radio countries endpoint returned {len(data)} countries")
    
    def test_offline_stats_endpoint(self):
        """Test /api/offline/stats returns storage statistics"""
        response = requests.get(f"{BASE_URL}/api/offline/stats")
        assert response.status_code == 200
        data = response.json()
        assert "article_count" in data
        assert "audio_note" in data
        print(f"Offline stats: {data}")
    
    def test_admin_metrics_endpoint(self):
        """Test /api/admin/metrics returns system metrics"""
        response = requests.get(f"{BASE_URL}/api/admin/metrics")
        assert response.status_code == 200
        data = response.json()
        assert "active_streams" in data
        assert "avg_bitrate" in data
        assert "error_rate" in data
        assert "uptime" in data
        print(f"Admin metrics: {data}")
    
    def test_voices_endpoint(self):
        """Test /api/voices returns available TTS voices"""
        response = requests.get(f"{BASE_URL}/api/voices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 5  # Should have at least 5 voices
        # Verify voice structure
        voice = data[0]
        assert "id" in voice
        assert "name" in voice
        assert "accent" in voice
        assert "description" in voice
        print(f"Voices endpoint returned {len(data)} voices")


class TestOfflineAPI:
    """Test offline article save/retrieve/delete functionality"""
    
    def test_save_article_offline(self):
        """Test POST /api/offline/save saves an article"""
        article_data = {
            "story_id": "test_article_iter25",
            "title": "Test Article for Iteration 25",
            "summary": "This is a test article summary",
            "narrative": "This is the narrative content",
            "source": "Test Source",
            "category": "Technology",
            "image_url": None
        }
        response = requests.post(
            f"{BASE_URL}/api/offline/save",
            json=article_data
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "saved"
        assert data["story_id"] == "test_article_iter25"
        print(f"Article saved: {data}")
    
    def test_get_offline_articles(self):
        """Test GET /api/offline/articles returns saved articles"""
        response = requests.get(f"{BASE_URL}/api/offline/articles")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Should contain the article we just saved
        story_ids = [a.get("story_id") for a in data]
        assert "test_article_iter25" in story_ids
        print(f"Retrieved {len(data)} offline articles")
    
    def test_delete_offline_article(self):
        """Test DELETE /api/offline/articles/{story_id} removes article"""
        response = requests.delete(f"{BASE_URL}/api/offline/articles/test_article_iter25")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "deleted"
        print(f"Article deleted: {data}")
    
    def test_verify_article_deleted(self):
        """Verify the article was actually deleted"""
        response = requests.get(f"{BASE_URL}/api/offline/articles")
        assert response.status_code == 200
        data = response.json()
        story_ids = [a.get("story_id") for a in data]
        assert "test_article_iter25" not in story_ids
        print("Verified article was deleted from offline storage")


class TestNewsAPI:
    """Test news feed endpoints"""
    
    def test_news_endpoint(self):
        """Test /api/news returns news items"""
        response = requests.get(f"{BASE_URL}/api/news?limit=10")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        # Verify news item structure
        news = data[0]
        assert "id" in news
        assert "title" in news
        assert "summary" in news
        assert "source" in news
        print(f"News endpoint returned {len(data)} items")
    
    def test_breaking_news_endpoint(self):
        """Test /api/news/breaking returns breaking news"""
        response = requests.get(f"{BASE_URL}/api/news/breaking")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Breaking news endpoint returned {len(data)} items")


class TestAdminRoutes:
    """Test admin modular routes"""
    
    def test_admin_alerts(self):
        """Test /api/admin/alerts returns system alerts"""
        response = requests.get(f"{BASE_URL}/api/admin/alerts")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            alert = data[0]
            assert "id" in alert
            assert "type" in alert
            assert "title" in alert
        print(f"Admin alerts returned {len(data)} alerts")
    
    def test_admin_streams(self):
        """Test /api/admin/streams returns stream status"""
        response = requests.get(f"{BASE_URL}/api/admin/streams")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            stream = data[0]
            assert "status" in stream
            assert "id" in stream
            assert "source" in stream
        print(f"Admin streams returned {len(data)} streams")
    
    def test_admin_voices(self):
        """Test /api/admin/voices returns voice metrics"""
        response = requests.get(f"{BASE_URL}/api/admin/voices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            voice = data[0]
            assert "name" in voice
            assert "id" in voice
            assert "language" in voice
            assert "latency" in voice
        print(f"Admin voices returned {len(data)} voice metrics")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
