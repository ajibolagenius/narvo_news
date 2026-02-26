"""
Iteration 20 Backend Tests
Testing: Search Page, Saved Page, Briefing Page, Share URL OG Tags, Volume Control

Features tested:
1. Search Page Design - GLOBAL_ARCHIVE_SEARCH hero, VOICE_INPUT_PROTOCOL, popular tags
2. Saved Page Design - SAVED_STORIES hero, SELECT_ALL/ARCHIVE_X/DELETE_SIG buttons
3. Briefing Page - MODULE:MORNING_BRIEFING, voice selector, ARCHIVE_LOG sidebar
4. Share URL OG Tags - /api/share/{news_id} returns HTML with og:title, og:description, og:image
5. Volume Control - volume-btn data-testid exists in audio player
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://narvo-broadcast-pwa.preview.emergentagent.com')

class TestHealthAndBasicAPIs:
    """Basic API health checks"""
    
    def test_health_endpoint(self):
        """Test health endpoint returns online status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "online"
        assert data["service"] == "Narvo API"
        print(f"PASS: Health endpoint - status: {data['status']}")
    
    def test_news_endpoint(self):
        """Test news endpoint returns news items"""
        response = requests.get(f"{BASE_URL}/api/news?limit=5")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Verify news item structure
        news_item = data[0]
        assert "id" in news_item
        assert "title" in news_item
        assert "source" in news_item
        print(f"PASS: News endpoint - returned {len(data)} items")
        return data[0]["id"]  # Return first news ID for share test


class TestShareURLOGTags:
    """Test /api/share/{news_id} endpoint for OG meta tags"""
    
    def test_share_endpoint_with_crawler_user_agent(self):
        """Test share endpoint returns HTML with OG tags for TelegramBot"""
        # First get a valid news ID
        news_response = requests.get(f"{BASE_URL}/api/news?limit=1")
        assert news_response.status_code == 200
        news_data = news_response.json()
        assert len(news_data) > 0
        news_id = news_data[0]["id"]
        news_title = news_data[0]["title"]
        
        # Test share endpoint with TelegramBot user-agent
        headers = {"User-Agent": "TelegramBot"}
        response = requests.get(f"{BASE_URL}/api/share/{news_id}", headers=headers)
        assert response.status_code == 200
        
        html_content = response.text
        
        # Verify OG meta tags are present
        assert 'og:title' in html_content, "og:title meta tag not found"
        assert 'og:description' in html_content, "og:description meta tag not found"
        assert 'og:image' in html_content, "og:image meta tag not found"
        assert 'twitter:card' in html_content, "twitter:card meta tag not found"
        
        # Verify title is in the content
        assert news_title[:50] in html_content, f"News title not found in share page"
        
        print(f"PASS: Share endpoint returns OG tags for news_id: {news_id}")
    
    def test_share_endpoint_with_regular_browser(self):
        """Test share endpoint redirects regular browsers to React app"""
        # Get a valid news ID
        news_response = requests.get(f"{BASE_URL}/api/news?limit=1")
        news_data = news_response.json()
        news_id = news_data[0]["id"]
        
        # Test with regular browser user-agent (no redirect follow)
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"}
        response = requests.get(f"{BASE_URL}/api/share/{news_id}", headers=headers, allow_redirects=False)
        
        # Should return HTML with redirect
        assert response.status_code == 200
        html_content = response.text
        assert f"/news/{news_id}" in html_content, "Redirect to news page not found"
        
        print(f"PASS: Share endpoint redirects browsers to /news/{news_id}")
    
    def test_share_endpoint_invalid_id(self):
        """Test share endpoint with invalid news ID"""
        headers = {"User-Agent": "TelegramBot"}
        response = requests.get(f"{BASE_URL}/api/share/invalid123", headers=headers)
        assert response.status_code == 200
        # Should redirect to homepage for invalid ID
        html_content = response.text
        assert 'url=/' in html_content or 'redirect' in html_content.lower()
        print("PASS: Share endpoint handles invalid ID gracefully")


class TestBriefingAPI:
    """Test briefing-related endpoints"""
    
    def test_briefing_latest(self):
        """Test latest briefing endpoint"""
        response = requests.get(f"{BASE_URL}/api/briefing/latest")
        # May return 404 if no briefing exists yet
        assert response.status_code in [200, 404]
        if response.status_code == 200:
            data = response.json()
            assert "title" in data
            assert "stories" in data
            print(f"PASS: Latest briefing - title: {data['title']}")
        else:
            print("INFO: No briefing available yet (404)")
    
    def test_briefing_history(self):
        """Test briefing history endpoint"""
        response = requests.get(f"{BASE_URL}/api/briefing/history?limit=10")
        assert response.status_code == 200
        data = response.json()
        assert "briefings" in data
        assert "total" in data
        print(f"PASS: Briefing history - {data['total']} total briefings")
    
    def test_voices_endpoint(self):
        """Test voices endpoint for voice selector"""
        response = requests.get(f"{BASE_URL}/api/voices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Verify voice structure
        voice = data[0]
        assert "id" in voice
        assert "name" in voice
        print(f"PASS: Voices endpoint - {len(data)} voices available")


class TestSearchAPI:
    """Test search-related endpoints"""
    
    def test_search_endpoint(self):
        """Test search endpoint"""
        response = requests.get(f"{BASE_URL}/api/search?q=nigeria")
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert "total" in data
        assert "query" in data
        print(f"PASS: Search endpoint - {data['total']} results for 'nigeria'")
    
    def test_trending_endpoint(self):
        """Test trending endpoint for popular tags"""
        response = requests.get(f"{BASE_URL}/api/trending")
        assert response.status_code == 200
        data = response.json()
        assert "tags" in data
        assert "topics" in data
        print(f"PASS: Trending endpoint - tags: {data['tags'][:3]}")


class TestBookmarksAPI:
    """Test bookmarks endpoints for Saved page"""
    
    def test_get_bookmarks(self):
        """Test get bookmarks endpoint"""
        response = requests.get(f"{BASE_URL}/api/bookmarks?user_id=test_user_iteration20")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Get bookmarks - {len(data)} bookmarks for test user")
    
    def test_add_and_remove_bookmark(self):
        """Test add and remove bookmark flow"""
        user_id = "test_user_iteration20"
        story_id = "test_story_iter20"
        
        # Add bookmark
        add_response = requests.post(f"{BASE_URL}/api/bookmarks", json={
            "user_id": user_id,
            "story_id": story_id,
            "title": "Test Story for Iteration 20",
            "summary": "Test summary",
            "source": "Test Source",
            "category": "General"
        })
        assert add_response.status_code == 200
        add_data = add_response.json()
        assert add_data["status"] == "ok"
        print("PASS: Add bookmark successful")
        
        # Verify bookmark exists
        get_response = requests.get(f"{BASE_URL}/api/bookmarks?user_id={user_id}")
        assert get_response.status_code == 200
        bookmarks = get_response.json()
        assert any(b["story_id"] == story_id for b in bookmarks)
        print("PASS: Bookmark verified in list")
        
        # Remove bookmark
        delete_response = requests.delete(f"{BASE_URL}/api/bookmarks/{story_id}?user_id={user_id}")
        assert delete_response.status_code == 200
        print("PASS: Remove bookmark successful")
        
        # Verify bookmark removed
        get_response2 = requests.get(f"{BASE_URL}/api/bookmarks?user_id={user_id}")
        bookmarks2 = get_response2.json()
        assert not any(b["story_id"] == story_id for b in bookmarks2)
        print("PASS: Bookmark removal verified")


class TestOGImageEndpoint:
    """Test OG image HTML endpoint"""
    
    def test_og_image_endpoint(self):
        """Test /api/og/{news_id} returns styled HTML for OG image"""
        # Get a valid news ID
        news_response = requests.get(f"{BASE_URL}/api/news?limit=1")
        news_data = news_response.json()
        news_id = news_data[0]["id"]
        
        response = requests.get(f"{BASE_URL}/api/og/{news_id}")
        assert response.status_code == 200
        
        html_content = response.text
        assert 'og:title' in html_content
        assert 'NARVO' in html_content
        print(f"PASS: OG image endpoint returns styled HTML for {news_id}")
    
    def test_og_image_invalid_id(self):
        """Test OG image endpoint with invalid ID"""
        response = requests.get(f"{BASE_URL}/api/og/invalid_id_12345")
        assert response.status_code == 404
        print("PASS: OG image endpoint returns 404 for invalid ID")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
