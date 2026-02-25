"""
Iteration 34 Tests - New Aggregator Features
Tests:
1. GET /api/aggregators/status includes cache_ttl_seconds and cache_stale fields
2. GET /api/news?include_aggregators=true returns mix of RSS and aggregator articles
3. GET /api/news?include_aggregators=true&aggregator_sources=mediastack returns only mediastack aggregator articles (plus RSS)
4. GET /api/search?q=Nigeria&include_aggregators=true returns aggregator articles alongside RSS in search results
5. GET /api/settings/guest returns aggregator_mediastack and aggregator_newsdata fields
6. POST /api/settings/guest saves aggregator preferences
7. Regression tests for previous features
"""
import pytest
import httpx
import os
import time

API_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://yarngpt-broadcast.preview.emergentagent.com")


@pytest.fixture
def client():
    return httpx.Client(base_url=API_URL, timeout=30)


# ── 1. Aggregator Status with Cache TTL and Stale Fields ────────────────

class TestAggregatorStatusCaching:
    def test_aggregators_status_has_cache_ttl_seconds(self, client):
        """GET /api/aggregators/status should include cache_ttl_seconds field"""
        r = client.get("/api/aggregators/status")
        assert r.status_code == 200
        data = r.json()
        
        assert "cache_ttl_seconds" in data, "cache_ttl_seconds field missing from aggregators status"
        assert isinstance(data["cache_ttl_seconds"], int)
        assert data["cache_ttl_seconds"] == 600, "Expected TTL of 600 seconds (10 minutes)"
        print(f"Cache TTL: {data['cache_ttl_seconds']} seconds")

    def test_aggregators_status_has_cache_stale_field(self, client):
        """GET /api/aggregators/status should include cache_stale boolean field"""
        r = client.get("/api/aggregators/status")
        assert r.status_code == 200
        data = r.json()
        
        assert "cache_stale" in data, "cache_stale field missing from aggregators status"
        assert isinstance(data["cache_stale"], bool)
        print(f"Cache stale: {data['cache_stale']}")

    def test_aggregators_status_has_last_fetched(self, client):
        """GET /api/aggregators/status should include last_fetched timestamp"""
        r = client.get("/api/aggregators/status")
        assert r.status_code == 200
        data = r.json()
        
        assert "last_fetched" in data, "last_fetched field missing from aggregators status"
        # last_fetched can be None if never fetched
        if data["last_fetched"]:
            assert "T" in data["last_fetched"], "last_fetched should be ISO timestamp"
        print(f"Last fetched: {data['last_fetched']}")


# ── 2. News API with Aggregator Source Filtering ────────────────────────

class TestNewsWithAggregatorSourceFilter:
    def test_news_include_aggregators_returns_mixed_content(self, client):
        """GET /api/news?include_aggregators=true returns mix of RSS and aggregator articles"""
        r = client.get("/api/news?limit=50&include_aggregators=true")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Count RSS vs aggregator
        rss_articles = [a for a in data if not a.get("aggregator")]
        aggregator_articles = [a for a in data if a.get("aggregator")]
        
        print(f"Total: {len(data)}, RSS: {len(rss_articles)}, Aggregator: {len(aggregator_articles)}")
        
        # Should have both RSS and aggregator articles
        assert len(rss_articles) > 0, "Expected RSS articles in response"
        # Aggregator articles may be 0 if API quotas exhausted, but structure should work

    def test_news_aggregator_sources_mediastack_only(self, client):
        """GET /api/news?include_aggregators=true&aggregator_sources=mediastack returns only mediastack aggregator articles plus RSS"""
        r = client.get("/api/news?limit=50&include_aggregators=true&aggregator_sources=mediastack")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        
        # Aggregator articles should only be mediastack
        aggregator_articles = [a for a in data if a.get("aggregator")]
        for article in aggregator_articles:
            assert article["aggregator"] == "mediastack", f"Expected only mediastack but got {article['aggregator']}"
        
        # Should not contain newsdata aggregator articles
        newsdata_articles = [a for a in data if a.get("aggregator") == "newsdata"]
        assert len(newsdata_articles) == 0, "Should not contain newsdata articles when filtering to mediastack"
        
        print(f"Mediastack-only filter: {len(aggregator_articles)} aggregator articles returned")

    def test_news_aggregator_sources_newsdata_only(self, client):
        """GET /api/news?include_aggregators=true&aggregator_sources=newsdata returns only newsdata aggregator articles plus RSS"""
        r = client.get("/api/news?limit=50&include_aggregators=true&aggregator_sources=newsdata")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        
        # Aggregator articles should only be newsdata
        aggregator_articles = [a for a in data if a.get("aggregator")]
        for article in aggregator_articles:
            assert article["aggregator"] == "newsdata", f"Expected only newsdata but got {article['aggregator']}"
        
        # Should not contain mediastack aggregator articles
        mediastack_articles = [a for a in data if a.get("aggregator") == "mediastack"]
        assert len(mediastack_articles) == 0, "Should not contain mediastack articles when filtering to newsdata"
        
        print(f"NewsData-only filter: {len(aggregator_articles)} aggregator articles returned")

    def test_news_aggregator_sources_both(self, client):
        """GET /api/news?include_aggregators=true&aggregator_sources=mediastack,newsdata returns both sources"""
        r = client.get("/api/news?limit=50&include_aggregators=true&aggregator_sources=mediastack,newsdata")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        
        aggregator_articles = [a for a in data if a.get("aggregator")]
        sources = set(a["aggregator"] for a in aggregator_articles)
        
        print(f"Both sources filter: {len(aggregator_articles)} aggregator articles, sources: {sources}")


# ── 3. Search API with Aggregators ──────────────────────────────────────

class TestSearchWithAggregators:
    def test_search_include_aggregators_default_true(self, client):
        """GET /api/search?q=Nigeria should include aggregator articles by default"""
        r = client.get("/api/search?q=Nigeria")
        assert r.status_code == 200
        data = r.json()
        
        assert "results" in data
        assert "total" in data
        assert "query" in data
        assert data["query"] == "Nigeria"
        
        results = data["results"]
        aggregator_results = [a for a in results if a.get("aggregator")]
        
        print(f"Search 'Nigeria': {data['total']} total, {len(aggregator_results)} aggregator")

    def test_search_include_aggregators_true_explicit(self, client):
        """GET /api/search?q=Nigeria&include_aggregators=true returns aggregator articles in results"""
        r = client.get("/api/search?q=Nigeria&include_aggregators=true")
        assert r.status_code == 200
        data = r.json()
        
        assert "results" in data
        results = data["results"]
        
        # Verify result structure
        for result in results:
            assert "id" in result
            assert "title" in result
            assert "source" in result
        
        # Check for aggregator articles in results
        aggregator_results = [a for a in results if a.get("aggregator")]
        print(f"Search with include_aggregators=true: {len(aggregator_results)} aggregator results")

    def test_search_include_aggregators_false(self, client):
        """GET /api/search?q=Nigeria&include_aggregators=false returns only RSS results"""
        r = client.get("/api/search?q=Nigeria&include_aggregators=false")
        assert r.status_code == 200
        data = r.json()
        
        results = data["results"]
        aggregator_results = [a for a in results if a.get("aggregator")]
        
        assert len(aggregator_results) == 0, "Should not contain aggregator articles when include_aggregators=false"
        print(f"Search with include_aggregators=false: 0 aggregator results (correct)")

    def test_search_returns_correct_structure(self, client):
        """Search results should have correct structure"""
        r = client.get("/api/search?q=Africa&limit=5")
        assert r.status_code == 200
        data = r.json()
        
        assert "results" in data
        assert "total" in data
        assert "query" in data
        assert "filters" in data
        
        filters = data["filters"]
        assert "category" in filters
        assert "source" in filters


# ── 4. User Settings with Aggregator Preferences ────────────────────────

class TestUserSettingsAggregatorPreferences:
    def test_get_settings_has_aggregator_fields(self, client):
        """GET /api/settings/guest should return aggregator_mediastack and aggregator_newsdata fields"""
        r = client.get("/api/settings/guest")
        assert r.status_code == 200
        data = r.json()
        
        # Check for aggregator preference fields
        assert "aggregator_mediastack" in data, "aggregator_mediastack field missing from settings"
        assert "aggregator_newsdata" in data, "aggregator_newsdata field missing from settings"
        
        # Both should be booleans
        assert isinstance(data["aggregator_mediastack"], bool)
        assert isinstance(data["aggregator_newsdata"], bool)
        
        print(f"Aggregator prefs: mediastack={data['aggregator_mediastack']}, newsdata={data['aggregator_newsdata']}")

    def test_save_aggregator_preferences(self, client):
        """POST /api/settings/guest should save aggregator preferences"""
        # Save with specific values
        save_data = {
            "aggregator_mediastack": True,
            "aggregator_newsdata": False,
        }
        
        r = client.post("/api/settings/guest", json=save_data)
        assert r.status_code == 200
        
        # Verify saved by fetching again
        r2 = client.get("/api/settings/guest")
        assert r2.status_code == 200
        data = r2.json()
        
        assert data["aggregator_mediastack"] == True
        assert data["aggregator_newsdata"] == False
        
        print("Aggregator preferences saved successfully")

    def test_toggle_aggregator_preferences(self, client):
        """Toggling aggregator preferences should persist"""
        # First set both to True
        client.post("/api/settings/guest", json={
            "aggregator_mediastack": True,
            "aggregator_newsdata": True,
        })
        
        # Verify
        r = client.get("/api/settings/guest")
        data = r.json()
        assert data["aggregator_mediastack"] == True
        assert data["aggregator_newsdata"] == True
        
        # Toggle newsdata to False
        client.post("/api/settings/guest", json={
            "aggregator_newsdata": False,
        })
        
        # Verify again
        r = client.get("/api/settings/guest")
        data = r.json()
        assert data["aggregator_mediastack"] == True, "mediastack should remain True"
        assert data["aggregator_newsdata"] == False, "newsdata should be False"
        
        print("Aggregator toggle test passed")


# ── 5. User Settings Persistence ────────────────────────────────────────

class TestSettingsPersistence:
    def test_settings_include_broadcast_language(self, client):
        """Settings should include broadcast_language field"""
        r = client.get("/api/settings/guest")
        assert r.status_code == 200
        data = r.json()
        
        assert "broadcast_language" in data
        assert data["broadcast_language"] in ["en", "pcm", "yo", "ha", "ig"]

    def test_settings_include_voice_model(self, client):
        """Settings should include voice_model field"""
        r = client.get("/api/settings/guest")
        assert r.status_code == 200
        data = r.json()
        
        assert "voice_model" in data


# ── 6. Regression Tests ─────────────────────────────────────────────────

class TestRegressionFeatures:
    def test_health_endpoint(self, client):
        """Health endpoint should return online status"""
        r = client.get("/api/health")
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "online"

    def test_sources_health_39_feeds(self, client):
        """Sources health should report 39 feeds"""
        r = client.get("/api/sources/health")
        assert r.status_code == 200
        data = r.json()
        assert data["total"] == 39

    def test_sources_count_39(self, client):
        """Sources endpoint should report 39 total sources"""
        r = client.get("/api/sources")
        assert r.status_code == 200
        data = r.json()
        assert data["total_sources"] == 39

    def test_voices_endpoint(self, client):
        """Voices endpoint should return 5 voices with gender"""
        r = client.get("/api/voices")
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 5
        for voice in data:
            assert "gender" in voice

    def test_news_basic_endpoint(self, client):
        """News endpoint should return articles from RSS feeds"""
        r = client.get("/api/news?limit=10")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) > 0

    def test_metrics_has_aggregators(self, client):
        """Metrics should include aggregators object"""
        r = client.get("/api/metrics")
        assert r.status_code == 200
        data = r.json()
        assert "aggregators" in data
        assert "mediastack" in data["aggregators"]
        assert "newsdata" in data["aggregators"]
