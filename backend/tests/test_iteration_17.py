"""
Iteration 17 Backend Tests
Testing:
- Breaking news API endpoint
- News endpoint with categories  
- Category-specific features
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://narvo-broadcast-pwa.preview.emergentagent.com')

class TestBreakingNewsAPI:
    """Tests for GET /api/news/breaking endpoint"""
    
    def test_breaking_news_returns_200(self):
        """Breaking news endpoint should return 200"""
        response = requests.get(f"{BASE_URL}/api/news/breaking", timeout=30)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: Breaking news endpoint returns 200")
    
    def test_breaking_news_returns_list(self):
        """Breaking news should return a list"""
        response = requests.get(f"{BASE_URL}/api/news/breaking", timeout=30)
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"PASS: Breaking news returns list with {len(data)} stories")
    
    def test_breaking_news_has_at_least_one_story(self):
        """Breaking news should return at least 1 story (most recent if no natural breaking)"""
        response = requests.get(f"{BASE_URL}/api/news/breaking", timeout=30)
        data = response.json()
        assert len(data) >= 1, f"Expected at least 1 story, got {len(data)}"
        print(f"PASS: Breaking news returns {len(data)} stories")
    
    def test_breaking_news_story_structure(self):
        """Breaking news stories should have required fields"""
        response = requests.get(f"{BASE_URL}/api/news/breaking", timeout=30)
        data = response.json()
        if len(data) > 0:
            story = data[0]
            required_fields = ['id', 'title', 'summary', 'source']
            for field in required_fields:
                assert field in story, f"Missing field: {field}"
            print(f"PASS: Breaking news story has all required fields: {required_fields}")
            print(f"  Sample story: {story.get('title', '')[:60]}...")
        else:
            pytest.skip("No breaking stories to verify structure")


class TestNewsAPI:
    """Tests for GET /api/news endpoint"""
    
    def test_news_returns_200(self):
        """News endpoint should return 200"""
        response = requests.get(f"{BASE_URL}/api/news?limit=5", timeout=30)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: News endpoint returns 200")
    
    def test_news_returns_list_with_items(self):
        """News endpoint should return a list with items"""
        response = requests.get(f"{BASE_URL}/api/news?limit=5", timeout=30)
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        assert len(data) > 0, "Expected at least some news items"
        print(f"PASS: News returns {len(data)} items")
    
    def test_news_has_category_field(self):
        """News items should have category field for category images"""
        response = requests.get(f"{BASE_URL}/api/news?limit=10", timeout=30)
        data = response.json()
        for item in data:
            # Category should exist (can be General by default)
            assert 'category' in item, f"Missing category field in item: {item.get('id')}"
        categories = set(item.get('category', 'Unknown') for item in data)
        print(f"PASS: All news items have category field. Categories found: {categories}")
    
    def test_news_has_tags_field(self):
        """News items should have tags field"""
        response = requests.get(f"{BASE_URL}/api/news?limit=5", timeout=30)
        data = response.json()
        for item in data:
            assert 'tags' in item, f"Missing tags field in item: {item.get('id')}"
            assert isinstance(item['tags'], list), f"Tags should be list, got {type(item['tags'])}"
        print(f"PASS: All news items have tags field (list)")


class TestRouteOrdering:
    """Test that /api/news/breaking is accessible before /api/news/{id}"""
    
    def test_breaking_before_news_id(self):
        """Ensure /api/news/breaking works (route ordering correct)"""
        # This verifies that "breaking" is not interpreted as a news_id
        response = requests.get(f"{BASE_URL}/api/news/breaking", timeout=30)
        # Should NOT return 404 for news_id "breaking"
        assert response.status_code == 200, f"Route ordering issue: /api/news/breaking got {response.status_code}"
        data = response.json()
        # Should be a list, not a single news item error
        assert isinstance(data, list), "Breaking endpoint should return list, not single item"
        print("PASS: Route ordering correct - /api/news/breaking returns list before /{news_id}")


class TestHealthAndMetrics:
    """Basic health and metrics tests"""
    
    def test_health_check(self):
        """Health endpoint should return online status"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert data.get('status') == 'online'
        print("PASS: Health check returns online")
    
    def test_metrics_endpoint(self):
        """Metrics endpoint should return data for dashboard"""
        response = requests.get(f"{BASE_URL}/api/metrics", timeout=10)
        assert response.status_code == 200
        data = response.json()
        # Should have metrics for category images/dashboard
        assert 'stories_processed' in data or 'signal_strength' in data
        print(f"PASS: Metrics endpoint returns data: {list(data.keys())}")


class TestCategoriesAPI:
    """Test categories API used for category images"""
    
    def test_categories_endpoint(self):
        """Categories endpoint should return category list"""
        response = requests.get(f"{BASE_URL}/api/categories", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Check for expected categories that map to images
        category_ids = [c.get('id') for c in data]
        expected = ['politics', 'tech', 'sports', 'health']
        found = [c for c in expected if c in category_ids]
        print(f"PASS: Categories endpoint returns {len(data)} categories. Found expected: {found}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
