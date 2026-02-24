"""
Iteration 18 Backend Tests - Testing 7 New Features:
1. Audio Player Bar - No breaking news scroll (frontend only)
2. Breaking News Banner - /api/news/breaking endpoint
3. Landing Page Metrics - /api/metrics endpoint
4. Dashboard Sidebar - (frontend only)
5. Load More Button - (frontend only)
6. Playlist/Queue - (frontend only)
7. OG Image Endpoint - /api/og/{news_id}
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndBasics:
    """Basic health check tests"""
    
    def test_health_endpoint(self):
        """Test /api/health returns online status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "online"
        assert data["service"] == "Narvo API"
        assert "timestamp" in data

class TestBreakingNewsAPI:
    """Feature 2: Breaking News Banner - Backend API Tests"""
    
    def test_breaking_news_endpoint_returns_200(self):
        """Test /api/news/breaking returns 200"""
        response = requests.get(f"{BASE_URL}/api/news/breaking")
        assert response.status_code == 200
    
    def test_breaking_news_returns_list(self):
        """Test /api/news/breaking returns a list"""
        response = requests.get(f"{BASE_URL}/api/news/breaking")
        data = response.json()
        assert isinstance(data, list)
    
    def test_breaking_news_has_stories(self):
        """Test /api/news/breaking returns at least 1 story"""
        response = requests.get(f"{BASE_URL}/api/news/breaking")
        data = response.json()
        assert len(data) >= 1, "Breaking news should return at least 1 story"
    
    def test_breaking_news_story_structure(self):
        """Test breaking news stories have required fields"""
        response = requests.get(f"{BASE_URL}/api/news/breaking")
        data = response.json()
        if len(data) > 0:
            story = data[0]
            assert "id" in story, "Story should have id"
            assert "title" in story, "Story should have title"
            assert "summary" in story, "Story should have summary"
            assert "source" in story, "Story should have source"
    
    def test_breaking_news_max_3_stories(self):
        """Test /api/news/breaking returns max 3 stories"""
        response = requests.get(f"{BASE_URL}/api/news/breaking")
        data = response.json()
        assert len(data) <= 3, "Breaking news should return max 3 stories"

class TestMetricsAPI:
    """Feature 3: Landing Page Metrics - Backend API Tests"""
    
    def test_metrics_endpoint_returns_200(self):
        """Test /api/metrics returns 200"""
        response = requests.get(f"{BASE_URL}/api/metrics")
        assert response.status_code == 200
    
    def test_metrics_has_required_fields(self):
        """Test /api/metrics returns required fields"""
        response = requests.get(f"{BASE_URL}/api/metrics")
        data = response.json()
        # Check for expected fields
        assert "listeners_today" in data or "total_listeners" in data, "Should have listeners metric"
        assert "sources_online" in data or "total_sources" in data, "Should have sources metric"
        assert "stories_processed" in data or "total_stories" in data, "Should have stories metric"
    
    def test_metrics_values_are_valid(self):
        """Test /api/metrics returns valid values"""
        response = requests.get(f"{BASE_URL}/api/metrics")
        data = response.json()
        # Verify values are not empty
        for key, value in data.items():
            assert value is not None, f"{key} should not be None"

class TestOGImageEndpoint:
    """Feature 7: OG Image Endpoint - Backend API Tests"""
    
    def test_og_endpoint_returns_html(self):
        """Test /api/og/{news_id} returns HTML"""
        # First get a valid news_id
        news_response = requests.get(f"{BASE_URL}/api/news?limit=1")
        news_data = news_response.json()
        if len(news_data) > 0:
            news_id = news_data[0]["id"]
            response = requests.get(f"{BASE_URL}/api/og/{news_id}")
            assert response.status_code == 200
            assert "text/html" in response.headers.get("content-type", "")
    
    def test_og_endpoint_has_og_title(self):
        """Test /api/og/{news_id} has og:title meta tag"""
        news_response = requests.get(f"{BASE_URL}/api/news?limit=1")
        news_data = news_response.json()
        if len(news_data) > 0:
            news_id = news_data[0]["id"]
            response = requests.get(f"{BASE_URL}/api/og/{news_id}")
            html = response.text
            assert 'og:title' in html, "HTML should contain og:title meta tag"
    
    def test_og_endpoint_has_og_description(self):
        """Test /api/og/{news_id} has og:description meta tag"""
        news_response = requests.get(f"{BASE_URL}/api/news?limit=1")
        news_data = news_response.json()
        if len(news_data) > 0:
            news_id = news_data[0]["id"]
            response = requests.get(f"{BASE_URL}/api/og/{news_id}")
            html = response.text
            assert 'og:description' in html, "HTML should contain og:description meta tag"
    
    def test_og_endpoint_has_twitter_card(self):
        """Test /api/og/{news_id} has twitter:card meta tag"""
        news_response = requests.get(f"{BASE_URL}/api/news?limit=1")
        news_data = news_response.json()
        if len(news_data) > 0:
            news_id = news_data[0]["id"]
            response = requests.get(f"{BASE_URL}/api/og/{news_id}")
            html = response.text
            assert 'twitter:card' in html, "HTML should contain twitter:card meta tag"
    
    def test_og_endpoint_invalid_id_returns_404(self):
        """Test /api/og/{invalid_id} returns 404"""
        response = requests.get(f"{BASE_URL}/api/og/invalid_nonexistent_id_12345")
        assert response.status_code == 404

class TestNewsAPI:
    """General News API Tests"""
    
    def test_news_endpoint_returns_200(self):
        """Test /api/news returns 200"""
        response = requests.get(f"{BASE_URL}/api/news")
        assert response.status_code == 200
    
    def test_news_returns_list(self):
        """Test /api/news returns a list"""
        response = requests.get(f"{BASE_URL}/api/news")
        data = response.json()
        assert isinstance(data, list)
    
    def test_news_limit_parameter(self):
        """Test /api/news respects limit parameter"""
        response = requests.get(f"{BASE_URL}/api/news?limit=5")
        data = response.json()
        assert len(data) <= 5
    
    def test_news_item_structure(self):
        """Test news items have required fields"""
        response = requests.get(f"{BASE_URL}/api/news?limit=1")
        data = response.json()
        if len(data) > 0:
            item = data[0]
            assert "id" in item
            assert "title" in item
            assert "summary" in item
            assert "source" in item
            assert "category" in item

class TestNewsDetailAPI:
    """News Detail API Tests"""
    
    def test_news_detail_returns_200(self):
        """Test /api/news/{id} returns 200 for valid id"""
        # First get a valid news_id
        news_response = requests.get(f"{BASE_URL}/api/news?limit=1")
        news_data = news_response.json()
        if len(news_data) > 0:
            news_id = news_data[0]["id"]
            response = requests.get(f"{BASE_URL}/api/news/{news_id}")
            assert response.status_code == 200
    
    def test_news_detail_invalid_id_returns_404(self):
        """Test /api/news/{invalid_id} returns 404"""
        response = requests.get(f"{BASE_URL}/api/news/invalid_nonexistent_id_12345")
        assert response.status_code == 404
