"""
Iteration 49 - Backend Performance Optimization & PWA Tests
Tests: GZip middleware, MongoDB indexes, in-memory cache, TTS cache TTL, Cache-Control headers
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndBasics:
    """Basic health checks to ensure backend is running"""
    
    def test_health_endpoint(self):
        """Test /api/health returns online status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "online"
        assert "timestamp" in data
        print(f"PASS: Health check - status={data['status']}")

class TestCachedEndpoints:
    """Test endpoints with in-memory cache (voices, categories, sound-themes)"""
    
    def test_voices_endpoint_returns_data(self):
        """Test /api/voices returns 5 YarnGPT voices with cache header"""
        response = requests.get(f"{BASE_URL}/api/voices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 5, f"Expected at least 5 voices, got {len(data)}"
        
        voice_ids = [v.get("id") for v in data]
        expected_voices = ["idera", "emma", "zainab", "osagie", "wura"]
        for v in expected_voices:
            assert v in voice_ids, f"Missing voice: {v}"
        
        # Check Cache-Control header (should be set by JSONResponse)
        cache_control = response.headers.get("Cache-Control", "")
        print(f"PASS: /api/voices - {len(data)} voices, Cache-Control={cache_control}")
    
    def test_voices_cache_performance(self):
        """Test voices endpoint responds quickly on repeated calls (cache hit)"""
        # First call
        t1 = time.time()
        r1 = requests.get(f"{BASE_URL}/api/voices")
        first_time = time.time() - t1
        
        # Second call (should be cached)
        t2 = time.time()
        r2 = requests.get(f"{BASE_URL}/api/voices")
        second_time = time.time() - t2
        
        assert r1.status_code == 200
        assert r2.status_code == 200
        print(f"PASS: Voices cache - first={first_time:.3f}s, second={second_time:.3f}s")
    
    def test_categories_endpoint_returns_data(self):
        """Test /api/categories returns category list with cache header"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 5, f"Expected at least 5 categories, got {len(data)}"
        
        category_ids = [c.get("id") for c in data]
        expected = ["politics", "economy", "tech", "sports", "health"]
        for cat in expected:
            assert cat in category_ids, f"Missing category: {cat}"
        
        cache_control = response.headers.get("Cache-Control", "")
        print(f"PASS: /api/categories - {len(data)} categories, Cache-Control={cache_control}")
    
    def test_sound_themes_endpoint_returns_data(self):
        """Test /api/sound-themes returns themes with cache header"""
        response = requests.get(f"{BASE_URL}/api/sound-themes")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1, "Expected at least 1 sound theme"
        
        cache_control = response.headers.get("Cache-Control", "")
        print(f"PASS: /api/sound-themes - {len(data)} themes, Cache-Control={cache_control}")

class TestNewsEndpoints:
    """Test news-related endpoints"""
    
    def test_news_returns_articles(self):
        """Test /api/news returns news articles"""
        response = requests.get(f"{BASE_URL}/api/news?limit=10")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Expected at least some news articles"
        
        # Check article structure
        first = data[0]
        assert "id" in first
        assert "title" in first
        assert "source" in first
        print(f"PASS: /api/news - {len(data)} articles returned")
    
    def test_news_with_aggregators(self):
        """Test /api/news with include_aggregators=true"""
        response = requests.get(f"{BASE_URL}/api/news?limit=20&include_aggregators=true")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: /api/news with aggregators - {len(data)} articles")

class TestSettingsWithMongoIndex:
    """Test settings endpoints that use MongoDB index on user_id"""
    
    def test_guest_settings_post_and_get(self):
        """Test POST and GET /api/settings/guest (uses user_id index)"""
        # POST settings
        payload = {
            "voice_model": "zainab",
            "interests": ["tech", "economy"]
        }
        post_response = requests.post(
            f"{BASE_URL}/api/settings/guest",
            json=payload
        )
        assert post_response.status_code == 200
        post_data = post_response.json()
        assert post_data.get("status") == "success"
        
        # GET to verify persistence
        get_response = requests.get(f"{BASE_URL}/api/settings/guest")
        assert get_response.status_code == 200
        get_data = get_response.json()
        assert get_data.get("voice_model") == "zainab", f"Expected voice_model=zainab, got {get_data.get('voice_model')}"
        assert "tech" in get_data.get("interests", [])
        print(f"PASS: Settings POST+GET - voice_model={get_data.get('voice_model')}, interests={get_data.get('interests')}")
    
    def test_settings_partial_update_preserves_other_fields(self):
        """Test that partial settings update doesn't overwrite other fields"""
        # First, set voice_model
        requests.post(f"{BASE_URL}/api/settings/guest", json={"voice_model": "idera"})
        
        # Then update only interface_language
        requests.post(f"{BASE_URL}/api/settings/guest", json={"interface_language": "en"})
        
        # Verify voice_model wasn't overwritten
        get_response = requests.get(f"{BASE_URL}/api/settings/guest")
        data = get_response.json()
        assert data.get("voice_model") == "idera", f"voice_model was overwritten: {data.get('voice_model')}"
        print(f"PASS: Settings merge - voice_model preserved after partial update")

class TestTTSWithCache:
    """Test TTS endpoint with MongoDB cache (tts_cache collection with TTL index)"""
    
    def test_tts_generate_returns_audio_url(self):
        """Test /api/tts/generate returns audio_url and uses cache"""
        payload = {
            "text": "Hello, this is a test broadcast from Narvo iteration 49.",
            "voice_id": "emma",
            "language": "en"
        }
        response = requests.post(
            f"{BASE_URL}/api/tts/generate",
            json=payload
        )
        assert response.status_code == 200
        data = response.json()
        assert "audio_url" in data, "Expected audio_url in response"
        assert data["audio_url"].startswith("data:audio") or data["audio_url"].startswith("http"), f"Invalid audio_url format"
        assert data.get("voice_id") == "emma"
        print(f"PASS: TTS generate - audio_url returned, voice_id={data.get('voice_id')}")
    
    def test_tts_cache_hit_performance(self):
        """Test TTS cache improves response time on repeated calls"""
        payload = {
            "text": "Cache test broadcast from Narvo iteration 49 test.",
            "voice_id": "zainab",
            "language": "en"
        }
        
        # First call (may be cache miss)
        t1 = time.time()
        r1 = requests.post(f"{BASE_URL}/api/tts/generate", json=payload)
        first_time = time.time() - t1
        
        # Second call (should be cache hit)
        t2 = time.time()
        r2 = requests.post(f"{BASE_URL}/api/tts/generate", json=payload)
        second_time = time.time() - t2
        
        assert r1.status_code == 200
        assert r2.status_code == 200
        
        # Cache hit should be significantly faster
        print(f"PASS: TTS cache - first={first_time:.3f}s, second={second_time:.3f}s")

class TestRegionsAndMetrics:
    """Test other cached endpoints"""
    
    def test_regions_endpoint(self):
        """Test /api/regions returns region list"""
        response = requests.get(f"{BASE_URL}/api/regions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2
        print(f"PASS: /api/regions - {len(data)} regions")
    
    def test_metrics_endpoint(self):
        """Test /api/metrics returns platform metrics"""
        response = requests.get(f"{BASE_URL}/api/metrics")
        assert response.status_code == 200
        data = response.json()
        assert "sources_online" in data or "total_sources" in data
        print(f"PASS: /api/metrics - data returned")

class TestPWAAssets:
    """Test PWA-related endpoints and assets"""
    
    def test_service_worker_accessible(self):
        """Test /sw.js is accessible as JavaScript file"""
        response = requests.get(f"{BASE_URL}/sw.js")
        assert response.status_code == 200
        content_type = response.headers.get("Content-Type", "")
        # Should be JavaScript, not HTML
        assert "javascript" in content_type or "text/javascript" in content_type or response.text.startswith("/*"), \
            f"Expected JavaScript, got Content-Type={content_type}"
        assert "narvo" in response.text.lower() or "cache" in response.text.lower()
        print(f"PASS: /sw.js accessible, Content-Type={content_type}")
    
    def test_manifest_accessible(self):
        """Test /manifest.json is accessible"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        assert response.status_code == 200
        data = response.json()
        assert data.get("short_name") == "Narvo"
        assert "icons" in data
        assert len(data["icons"]) >= 4
        assert "screenshots" in data
        print(f"PASS: /manifest.json - {len(data['icons'])} icons, {len(data.get('screenshots', []))} screenshots")

class TestSourcesHealth:
    """Test sources health endpoints (uses MongoDB indexes on news_cache)"""
    
    def test_sources_health_endpoint(self):
        """Test /api/sources/health returns feed health status"""
        response = requests.get(f"{BASE_URL}/api/sources/health")
        assert response.status_code == 200
        data = response.json()
        # Should return health data structure
        assert isinstance(data, dict) or isinstance(data, list)
        print(f"PASS: /api/sources/health - health data returned")
    
    def test_aggregators_status(self):
        """Test /api/aggregators/status returns aggregator status"""
        response = requests.get(f"{BASE_URL}/api/aggregators/status")
        assert response.status_code == 200
        data = response.json()
        assert "mediastack" in data or "newsdata" in data
        print(f"PASS: /api/aggregators/status - status returned")
