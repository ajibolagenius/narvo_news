"""
Iteration 19 Backend Tests
Testing: Search API, Trending API, Briefing History API, TTS Generation, Saved/Bookmarks API
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://yarngpt-broadcast.preview.emergentagent.com').rstrip('/')


class TestHealthAndBasicAPIs:
    """Basic health and API availability tests"""
    
    def test_health_endpoint(self):
        """Test /api/health returns 200"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "online"
        print(f"PASS: Health endpoint - status: {data.get('status')}")
    
    def test_news_endpoint(self):
        """Test /api/news returns news items"""
        response = requests.get(f"{BASE_URL}/api/news?limit=5", timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"PASS: News endpoint - returned {len(data)} items")
    
    def test_categories_endpoint(self):
        """Test /api/categories returns categories"""
        response = requests.get(f"{BASE_URL}/api/categories", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"PASS: Categories endpoint - returned {len(data)} categories")


class TestSearchAPI:
    """Search API tests - New feature"""
    
    def test_search_with_query(self):
        """Test /api/search?q=africa returns results"""
        response = requests.get(f"{BASE_URL}/api/search?q=africa", timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert "total" in data
        assert "query" in data
        assert data["query"] == "africa"
        print(f"PASS: Search API - query 'africa' returned {data['total']} results")
    
    def test_search_with_category_filter(self):
        """Test /api/search with category filter"""
        response = requests.get(f"{BASE_URL}/api/search?q=news&category=politics", timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert "filters" in data
        assert data["filters"]["category"] == "politics"
        print(f"PASS: Search with category filter - returned {data['total']} results")
    
    def test_search_empty_query(self):
        """Test /api/search with empty query returns error or empty"""
        response = requests.get(f"{BASE_URL}/api/search?q=", timeout=10)
        # Should either return 422 (validation error) or empty results
        assert response.status_code in [200, 422]
        if response.status_code == 200:
            data = response.json()
            assert data.get("total", 0) == 0 or "results" in data
        print(f"PASS: Search empty query handled - status {response.status_code}")
    
    def test_search_pagination(self):
        """Test /api/search pagination with skip and limit"""
        response = requests.get(f"{BASE_URL}/api/search?q=nigeria&limit=5&skip=0", timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert len(data["results"]) <= 5
        print(f"PASS: Search pagination - returned {len(data['results'])} results with limit=5")


class TestTrendingAPI:
    """Trending API tests - New feature"""
    
    def test_trending_endpoint(self):
        """Test /api/trending returns tags and topics"""
        response = requests.get(f"{BASE_URL}/api/trending", timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert "tags" in data
        assert "topics" in data
        assert isinstance(data["tags"], list)
        assert isinstance(data["topics"], list)
        print(f"PASS: Trending API - returned {len(data['tags'])} tags, {len(data['topics'])} topics")
    
    def test_trending_tags_format(self):
        """Test trending tags are in correct format (hashtags)"""
        response = requests.get(f"{BASE_URL}/api/trending", timeout=15)
        assert response.status_code == 200
        data = response.json()
        # Tags should be hashtags like #GENERAL, #TECH
        for tag in data.get("tags", []):
            assert tag.startswith("#"), f"Tag '{tag}' should start with #"
        print(f"PASS: Trending tags format - all tags start with #")


class TestBriefingAPI:
    """Morning Briefing API tests - New feature"""
    
    def test_briefing_history(self):
        """Test /api/briefing/history returns briefings list"""
        response = requests.get(f"{BASE_URL}/api/briefing/history?limit=14", timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert "briefings" in data
        assert "total" in data
        assert isinstance(data["briefings"], list)
        print(f"PASS: Briefing history - returned {len(data['briefings'])} briefings, total: {data['total']}")
    
    def test_briefing_latest(self):
        """Test /api/briefing/latest returns latest briefing or 404"""
        response = requests.get(f"{BASE_URL}/api/briefing/latest", timeout=15)
        # May return 404 if no briefing exists yet
        assert response.status_code in [200, 404]
        if response.status_code == 200:
            data = response.json()
            assert "title" in data or "id" in data
            print(f"PASS: Briefing latest - returned briefing: {data.get('title', 'N/A')}")
        else:
            print(f"PASS: Briefing latest - no briefing available (404)")
    
    def test_briefing_by_date_invalid(self):
        """Test /api/briefing/{date} with invalid date returns 404"""
        response = requests.get(f"{BASE_URL}/api/briefing/1900-01-01", timeout=10)
        assert response.status_code == 404
        print(f"PASS: Briefing by invalid date - returned 404")


class TestVoicesAPI:
    """Voices API tests"""
    
    def test_voices_endpoint(self):
        """Test /api/voices returns voice profiles"""
        response = requests.get(f"{BASE_URL}/api/voices", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Check voice structure
        voice = data[0]
        assert "id" in voice
        assert "name" in voice
        assert "accent" in voice
        print(f"PASS: Voices API - returned {len(data)} voices")


class TestBookmarksAPI:
    """Bookmarks/Saved API tests"""
    
    def test_get_bookmarks_guest(self):
        """Test /api/bookmarks?user_id=guest returns bookmarks"""
        response = requests.get(f"{BASE_URL}/api/bookmarks?user_id=guest", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Get bookmarks - returned {len(data)} bookmarks for guest")
    
    def test_add_bookmark(self):
        """Test POST /api/bookmarks adds a bookmark"""
        bookmark_data = {
            "user_id": "test_user_19",
            "story_id": "test_story_19",
            "title": "Test Story for Iteration 19",
            "summary": "Test summary",
            "source": "Test Source",
            "category": "General"
        }
        response = requests.post(f"{BASE_URL}/api/bookmarks", json=bookmark_data, timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        print(f"PASS: Add bookmark - status: {data.get('status')}")
    
    def test_delete_bookmark(self):
        """Test DELETE /api/bookmarks/{story_id} removes bookmark"""
        response = requests.delete(
            f"{BASE_URL}/api/bookmarks/test_story_19?user_id=test_user_19", 
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        print(f"PASS: Delete bookmark - status: {data.get('status')}")


class TestTTSAPI:
    """TTS Generation API tests"""
    
    def test_tts_generate(self):
        """Test /api/tts/generate creates audio"""
        tts_data = {
            "text": "This is a test of the Narvo text to speech system.",
            "voice_id": "nova"
        }
        response = requests.post(f"{BASE_URL}/api/tts/generate", json=tts_data, timeout=30)
        assert response.status_code == 200
        data = response.json()
        assert "audio_url" in data
        assert data["audio_url"].startswith("data:audio/mpeg;base64,")
        assert "voice_id" in data
        print(f"PASS: TTS generate - audio URL created, voice: {data.get('voice_id')}")


class TestOGImageAPI:
    """OG Image API tests"""
    
    def test_og_image_endpoint(self):
        """Test /api/og/{news_id} returns HTML with OG tags"""
        # First get a valid news ID
        news_response = requests.get(f"{BASE_URL}/api/news?limit=1", timeout=15)
        assert news_response.status_code == 200
        news_data = news_response.json()
        assert len(news_data) > 0
        
        news_id = news_data[0]["id"]
        
        # Test OG endpoint
        response = requests.get(f"{BASE_URL}/api/og/{news_id}", timeout=10)
        assert response.status_code == 200
        assert "text/html" in response.headers.get("content-type", "")
        
        # Check for OG meta tags in HTML
        html = response.text
        assert "og:title" in html
        assert "og:description" in html
        assert "twitter:card" in html
        print(f"PASS: OG image endpoint - returned HTML with OG tags for news_id: {news_id}")
    
    def test_og_image_invalid_id(self):
        """Test /api/og/{invalid_id} returns 404"""
        response = requests.get(f"{BASE_URL}/api/og/invalid_news_id_12345", timeout=10)
        assert response.status_code == 404
        print(f"PASS: OG image invalid ID - returned 404")


class TestFactCheckAPI:
    """Fact-check API tests (MOCKED)"""
    
    def test_factcheck_story(self):
        """Test /api/factcheck/{story_id} returns fact-check result"""
        # Get a valid news ID first
        news_response = requests.get(f"{BASE_URL}/api/news?limit=1", timeout=15)
        news_data = news_response.json()
        news_id = news_data[0]["id"]
        
        response = requests.get(f"{BASE_URL}/api/factcheck/{news_id}", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] in ["VERIFIED", "UNVERIFIED", "DISPUTED", "FALSE"]
        assert "confidence" in data
        print(f"PASS: Factcheck API (MOCKED) - status: {data['status']}, confidence: {data['confidence']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
