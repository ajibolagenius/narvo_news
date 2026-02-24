"""
Iteration 24 Backend Tests
Testing: Discover page (podcasts, trending, radio), Offline page (save/retrieve/delete articles)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://narvo-audio-news-1.preview.emergentagent.com')


class TestHealthAndBasics:
    """Basic health and connectivity tests"""
    
    def test_health_endpoint(self):
        """Test API health check"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "online"
        assert data["service"] == "Narvo API"
        assert data["version"] == "2.0"


class TestDiscoverPodcasts:
    """Tests for /api/podcasts endpoint"""
    
    def test_get_podcasts_latest(self):
        """Test fetching podcasts sorted by latest"""
        response = requests.get(f"{BASE_URL}/api/podcasts?sort=latest&limit=8")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 8
        
        # Verify podcast structure
        if len(data) > 0:
            podcast = data[0]
            assert "id" in podcast
            assert "episode" in podcast
            assert "title" in podcast
            assert "duration" in podcast
            assert "description" in podcast
            assert "category" in podcast
    
    def test_get_podcasts_popular(self):
        """Test fetching podcasts sorted by popular"""
        response = requests.get(f"{BASE_URL}/api/podcasts?sort=popular&limit=5")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 5
    
    def test_podcasts_have_required_fields(self):
        """Verify all podcasts have required fields"""
        response = requests.get(f"{BASE_URL}/api/podcasts?limit=10")
        assert response.status_code == 200
        data = response.json()
        
        for podcast in data:
            assert podcast.get("id"), "Podcast missing id"
            assert podcast.get("episode"), "Podcast missing episode"
            assert podcast.get("title"), "Podcast missing title"
            assert podcast.get("duration"), "Podcast missing duration"
            assert podcast.get("description"), "Podcast missing description"


class TestDiscoverTrending:
    """Tests for /api/discover/trending endpoint"""
    
    def test_get_trending_topics(self):
        """Test fetching trending topics"""
        response = requests.get(f"{BASE_URL}/api/discover/trending")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # Verify trending topic structure
        if len(data) > 0:
            topic = data[0]
            assert "topic" in topic
            assert "count" in topic
            assert "trend" in topic
            assert topic["trend"] in ["up", "stable", "down"]


class TestRadioStations:
    """Tests for radio station endpoints"""
    
    def test_get_radio_countries(self):
        """Test fetching radio countries list"""
        response = requests.get(f"{BASE_URL}/api/radio/countries")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 10  # Should have at least 10 African countries
        
        # Verify country structure
        country = data[0]
        assert "code" in country
        assert "name" in country
        assert "flag" in country
        
        # Verify Nigeria is in the list
        country_codes = [c["code"] for c in data]
        assert "NG" in country_codes
    
    def test_get_radio_stations_by_country(self):
        """Test fetching radio stations for Nigeria"""
        response = requests.get(f"{BASE_URL}/api/radio/stations?country=NG&limit=5")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # Verify station structure
        if len(data) > 0:
            station = data[0]
            assert "id" in station
            assert "name" in station
            assert "url" in station
            assert "country" in station
            assert "countrycode" in station


class TestOfflineArticles:
    """Tests for offline article save/retrieve/delete endpoints"""
    
    @pytest.fixture(autouse=True)
    def cleanup_test_articles(self):
        """Cleanup test articles before and after tests"""
        # Cleanup before
        requests.delete(f"{BASE_URL}/api/offline/articles/TEST_offline_001")
        requests.delete(f"{BASE_URL}/api/offline/articles/TEST_offline_002")
        yield
        # Cleanup after
        requests.delete(f"{BASE_URL}/api/offline/articles/TEST_offline_001")
        requests.delete(f"{BASE_URL}/api/offline/articles/TEST_offline_002")
    
    def test_save_offline_article(self):
        """Test saving an article for offline"""
        payload = {
            "story_id": "TEST_offline_001",
            "title": "Test Offline Article",
            "summary": "This is a test summary for offline saving",
            "narrative": "This is the full narrative text",
            "source": "Test Source",
            "category": "Tech",
            "image_url": "https://example.com/image.jpg"
        }
        response = requests.post(f"{BASE_URL}/api/offline/save", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "saved"
        assert data["story_id"] == "TEST_offline_001"
    
    def test_get_offline_articles(self):
        """Test retrieving saved offline articles"""
        # First save an article
        payload = {
            "story_id": "TEST_offline_002",
            "title": "Test Article for Retrieval",
            "summary": "Summary text",
            "narrative": "Narrative text",
            "source": "Test Source",
            "category": "Politics"
        }
        requests.post(f"{BASE_URL}/api/offline/save", json=payload)
        
        # Then retrieve
        response = requests.get(f"{BASE_URL}/api/offline/articles")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # Find our test article
        test_article = next((a for a in data if a["story_id"] == "TEST_offline_002"), None)
        assert test_article is not None
        assert test_article["title"] == "Test Article for Retrieval"
        assert test_article["category"] == "Politics"
        assert "saved_at" in test_article
    
    def test_delete_offline_article(self):
        """Test deleting an offline article"""
        # First save
        payload = {
            "story_id": "TEST_offline_001",
            "title": "Article to Delete",
            "summary": "Will be deleted",
            "source": "Test",
            "category": "General"
        }
        requests.post(f"{BASE_URL}/api/offline/save", json=payload)
        
        # Then delete
        response = requests.delete(f"{BASE_URL}/api/offline/articles/TEST_offline_001")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "deleted"
        assert data["story_id"] == "TEST_offline_001"
        
        # Verify deletion
        articles = requests.get(f"{BASE_URL}/api/offline/articles").json()
        test_article = next((a for a in articles if a["story_id"] == "TEST_offline_001"), None)
        assert test_article is None
    
    def test_get_offline_stats(self):
        """Test getting offline storage statistics"""
        response = requests.get(f"{BASE_URL}/api/offline/stats")
        assert response.status_code == 200
        data = response.json()
        assert "article_count" in data
        assert isinstance(data["article_count"], int)


class TestNewsEndpoints:
    """Tests for news endpoints used by Dashboard"""
    
    def test_get_news(self):
        """Test fetching news items"""
        response = requests.get(f"{BASE_URL}/api/news?limit=5")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        if len(data) > 0:
            news = data[0]
            assert "id" in news
            assert "title" in news
            assert "summary" in news
            assert "source" in news
            assert "category" in news


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
