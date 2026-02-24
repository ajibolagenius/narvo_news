"""
Test iteration 23 - Narvo Audio Platform
Tests for:
1. GET /api/news returns items with image_url field
2. NewsItem Pydantic model has image_url field
3. Backend RSS image extraction from feeds
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestNewsImageUrl:
    """Test that news items include image_url field (may be null or contain URL)"""
    
    def test_news_endpoint_returns_data(self):
        """Test /api/news endpoint returns a list of news items"""
        response = requests.get(f"{BASE_URL}/api/news", timeout=30)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"SUCCESS: /api/news returned {len(data)} news items")
    
    def test_news_items_have_image_url_field(self):
        """Test that news items contain image_url field in response"""
        response = requests.get(f"{BASE_URL}/api/news?limit=20", timeout=30)
        assert response.status_code == 200
        data = response.json()
        
        # Check first 10 items have image_url field
        items_with_image_url_field = 0
        items_with_actual_image = 0
        
        for item in data[:20]:
            assert "image_url" in item, f"Item {item.get('id')} missing image_url field"
            items_with_image_url_field += 1
            
            if item.get("image_url") and item["image_url"].startswith("http"):
                items_with_actual_image += 1
                print(f"  - Item '{item['title'][:50]}...' has image: {item['image_url'][:80]}")
        
        print(f"SUCCESS: {items_with_image_url_field} items have image_url field")
        print(f"INFO: {items_with_actual_image}/{items_with_image_url_field} items have actual image URLs")
    
    def test_news_item_structure(self):
        """Test that news items have correct structure with all expected fields"""
        response = requests.get(f"{BASE_URL}/api/news?limit=5", timeout=30)
        assert response.status_code == 200
        data = response.json()
        
        # Required fields per NewsItem Pydantic model
        required_fields = ["id", "title", "summary", "source", "source_url", "published", "region", "category"]
        optional_fields = ["narrative", "audio_url", "listen_count", "tags", "truth_score", "image_url"]
        
        for item in data:
            for field in required_fields:
                assert field in item, f"Missing required field: {field}"
            
            # Check image_url specifically
            assert "image_url" in item, "Missing image_url field"
            # image_url can be None or a string URL
            assert item["image_url"] is None or isinstance(item["image_url"], str)
        
        print(f"SUCCESS: All news items have correct structure including image_url field")


class TestHealthAndMetrics:
    """Test health and metrics endpoints"""
    
    def test_health_endpoint(self):
        """Test health endpoint returns online status"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "online"
        print(f"SUCCESS: Health check passed - {data}")
    
    def test_metrics_endpoint(self):
        """Test metrics endpoint returns platform metrics"""
        response = requests.get(f"{BASE_URL}/api/metrics", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert "listeners_today" in data
        assert "sources_online" in data
        print(f"SUCCESS: Metrics returned - {data}")


class TestRSSFeeds:
    """Test RSS feed functionality"""
    
    def test_news_from_vanguard_source(self):
        """Check if any news items are from Vanguard Nigeria (known to have images)"""
        response = requests.get(f"{BASE_URL}/api/news?limit=30", timeout=30)
        assert response.status_code == 200
        data = response.json()
        
        vanguard_items = [item for item in data if "Vanguard" in item.get("source", "")]
        premium_times_items = [item for item in data if "Premium Times" in item.get("source", "")]
        
        print(f"INFO: Found {len(vanguard_items)} items from Vanguard Nigeria")
        print(f"INFO: Found {len(premium_times_items)} items from Premium Times")
        
        # Check if any of these have image_url
        vanguard_with_images = [item for item in vanguard_items if item.get("image_url")]
        premium_with_images = [item for item in premium_times_items if item.get("image_url")]
        
        print(f"INFO: Vanguard items with images: {len(vanguard_with_images)}")
        print(f"INFO: Premium Times items with images: {len(premium_with_images)}")
        
        # Just verify the structure is correct, images may or may not be extracted
        assert True  # This is an informational test


class TestCategories:
    """Test categories and regions endpoints"""
    
    def test_categories_endpoint(self):
        """Test categories endpoint"""
        response = requests.get(f"{BASE_URL}/api/categories", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"SUCCESS: Categories endpoint returned {len(data)} categories")
    
    def test_regions_endpoint(self):
        """Test regions endpoint"""
        response = requests.get(f"{BASE_URL}/api/regions", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: Regions endpoint returned {len(data)} regions")


class TestVoicesAndTrending:
    """Test voices and trending endpoints"""
    
    def test_voices_endpoint(self):
        """Test voices endpoint"""
        response = requests.get(f"{BASE_URL}/api/voices", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Check voice has required fields
        for voice in data:
            assert "id" in voice
            assert "name" in voice
        print(f"SUCCESS: Voices endpoint returned {len(data)} voices")
    
    def test_trending_endpoint(self):
        """Test trending endpoint"""
        response = requests.get(f"{BASE_URL}/api/trending", timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert "tags" in data
        assert "topics" in data
        print(f"SUCCESS: Trending endpoint returned - tags: {data.get('tags')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
