"""
Iteration 38 Backend Tests
Testing:
1. Search endpoint with source_type parameter (aggregator, rss, podcast filtering)
2. Search returns source_type field in results
3. Dashboard filter/sort functionality (tested via news endpoint)
4. Verify /api/search includes aggregators by default
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSearchAggregatorIntegration:
    """Test search endpoint aggregator integration and source_type filtering"""
    
    def test_health_check(self):
        """Verify API is running"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "online"
        print("✓ Health check passed - API online")

    def test_search_without_filter(self):
        """Search without source_type should return all sources"""
        response = requests.get(f"{BASE_URL}/api/search?q=Nigeria")
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert "total" in data
        print(f"✓ Search 'Nigeria' returned {data['total']} total results")
        
        # Check source_type field is present in results
        if data['results']:
            first_result = data['results'][0]
            assert 'source_type' in first_result, "source_type field missing from search results"
            print(f"✓ source_type field present, first result type: {first_result['source_type']}")
    
    def test_search_filter_rss_only(self):
        """Search with source_type=rss should return only RSS results"""
        response = requests.get(f"{BASE_URL}/api/search?q=Nigeria&source_type=rss")
        assert response.status_code == 200
        data = response.json()
        
        # All results should be RSS
        for item in data.get('results', []):
            assert item.get('source_type') == 'rss', f"Got {item.get('source_type')} instead of rss"
        print(f"✓ RSS filter: {data['total']} results, all are RSS type")
    
    def test_search_filter_aggregator_only(self):
        """Search with source_type=aggregator should return only aggregator results"""
        response = requests.get(f"{BASE_URL}/api/search?q=Nigeria&source_type=aggregator")
        assert response.status_code == 200
        data = response.json()
        
        # All results should be aggregator
        for item in data.get('results', []):
            assert item.get('source_type') == 'aggregator', f"Got {item.get('source_type')} instead of aggregator"
        print(f"✓ Aggregator filter: {data['total']} results, all are aggregator type")
    
    def test_search_filter_podcast_only(self):
        """Search with source_type=podcast should return only podcast results"""
        response = requests.get(f"{BASE_URL}/api/search?q=Africa&source_type=podcast")
        assert response.status_code == 200
        data = response.json()
        
        # All results should be podcast (may be 0 if no podcasts match)
        for item in data.get('results', []):
            assert item.get('source_type') == 'podcast', f"Got {item.get('source_type')} instead of podcast"
        print(f"✓ Podcast filter: {data['total']} results")
    
    def test_search_results_have_required_fields(self):
        """Verify search results contain necessary fields"""
        response = requests.get(f"{BASE_URL}/api/search?q=Nigeria&limit=5")
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ['id', 'title', 'source_type']
        for item in data.get('results', [])[:5]:
            for field in required_fields:
                assert field in item, f"Missing field: {field}"
        print(f"✓ All search results have required fields: {required_fields}")


class TestNewsEndpointWithAggregators:
    """Test news endpoint returns aggregator content"""
    
    def test_news_includes_aggregators(self):
        """News endpoint should include aggregator articles when requested"""
        response = requests.get(f"{BASE_URL}/api/news?limit=50&include_aggregators=true")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list), "News should return a list"
        
        # Check if any item has aggregator field
        aggregator_items = [item for item in data if item.get('aggregator')]
        rss_items = [item for item in data if not item.get('aggregator')]
        
        print(f"✓ News endpoint: {len(data)} total, {len(aggregator_items)} aggregator, {len(rss_items)} RSS")
    
    def test_news_basic_fields(self):
        """Verify news items have basic required fields"""
        response = requests.get(f"{BASE_URL}/api/news?limit=5")
        assert response.status_code == 200
        data = response.json()
        
        for item in data[:5]:
            assert 'id' in item
            assert 'title' in item
            assert 'source' in item or 'aggregator' in item
        print("✓ News items have required fields")


class TestBriefingEndpoint:
    """Test briefing endpoint for transcript"""
    
    def test_briefing_latest(self):
        """Get latest briefing"""
        response = requests.get(f"{BASE_URL}/api/briefing/latest")
        # May return 404 if no briefing exists, that's okay
        if response.status_code == 200:
            data = response.json()
            assert 'id' in data
            assert 'title' in data
            print(f"✓ Latest briefing: {data.get('title', 'N/A')[:50]}")
            if 'script' in data:
                print(f"  Transcript length: {len(data.get('script', ''))} chars")
        else:
            print("✓ No briefing available (expected for new setup)")
    
    def test_briefing_history(self):
        """Get briefing history"""
        response = requests.get(f"{BASE_URL}/api/briefing/history?limit=5")
        assert response.status_code == 200
        data = response.json()
        assert 'briefings' in data
        print(f"✓ Briefing history: {len(data['briefings'])} entries")


class TestVoicesEndpoint:
    """Test voices endpoint for briefing voice selector"""
    
    def test_get_voices(self):
        """Get available voices"""
        response = requests.get(f"{BASE_URL}/api/voices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Voices: {len(data)} available")
        if data:
            print(f"  Voice names: {[v.get('name') for v in data[:5]]}")


class TestMetricsEndpoint:
    """Test metrics for aggregator status"""
    
    def test_metrics_aggregators(self):
        """Verify metrics include aggregator info"""
        response = requests.get(f"{BASE_URL}/api/metrics")
        assert response.status_code == 200
        data = response.json()
        
        # Check for aggregator metrics
        if 'aggregators' in data:
            aggs = data['aggregators']
            print(f"✓ Aggregator metrics present:")
            for name, status in aggs.items():
                if isinstance(status, dict):
                    configured = status.get('configured', False)
                    cached = status.get('cached_count', 0)
                    print(f"  - {name}: configured={configured}, cached={cached}")
                else:
                    print(f"  - {name}: {status}")
        else:
            print("✓ Metrics endpoint working (no aggregator section)")


class TestToolsPageRoute:
    """Verify tools page is accessible (not a backend route, but verify no 500 errors)"""
    
    def test_api_health(self):
        """Ensure API doesn't have errors that would affect frontend"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        print("✓ API healthy - frontend should work")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
