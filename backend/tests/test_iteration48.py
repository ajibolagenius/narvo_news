"""
Iteration 48 Backend Tests
Tests voice consistency, settings merge behavior, and TTS generation

Features tested:
1. POST /api/settings/guest with voice_model=idera persists
2. Settings merge: interface_language change should NOT overwrite voice_model
3. TTS generation with voice_id=idera returns audio_url
4. /api/voices endpoint returns 5 YarnGPT voices
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestVoiceConsistency:
    """Tests for voice settings persistence and merge behavior"""
    
    def test_01_set_voice_model_idera(self):
        """Set voice_model=idera for guest user"""
        response = requests.post(
            f"{BASE_URL}/api/settings/guest",
            json={"voice_model": "idera"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "success"
        print(f"POST /api/settings/guest with voice_model=idera: SUCCESS")
    
    def test_02_verify_voice_model_persisted(self):
        """GET settings should return voice_model=idera"""
        response = requests.get(f"{BASE_URL}/api/settings/guest")
        assert response.status_code == 200
        data = response.json()
        assert data.get("voice_model") == "idera", f"Expected voice_model=idera, got {data.get('voice_model')}"
        print(f"GET /api/settings/guest confirms voice_model=idera: SUCCESS")
    
    def test_03_interface_language_should_not_overwrite_voice(self):
        """POST interface_language=en should NOT overwrite voice_model"""
        # First, ensure voice_model is set to something specific (zainab)
        response1 = requests.post(
            f"{BASE_URL}/api/settings/guest",
            json={"voice_model": "zainab"}
        )
        assert response1.status_code == 200
        
        # Now POST only interface_language (simulating Settings page save)
        response2 = requests.post(
            f"{BASE_URL}/api/settings/guest",
            json={"interface_language": "en"}
        )
        assert response2.status_code == 200
        
        # GET should still have voice_model=zainab (merge, not overwrite)
        response3 = requests.get(f"{BASE_URL}/api/settings/guest")
        assert response3.status_code == 200
        data = response3.json()
        
        # Verify voice_model was NOT reset to default
        assert data.get("voice_model") == "zainab", \
            f"voice_model should still be 'zainab' after interface_language update, got: {data.get('voice_model')}"
        print(f"Settings merge test passed: voice_model remains 'zainab' after interface_language update")

class TestTTSGeneration:
    """Tests for TTS generation with various voices"""
    
    def test_tts_generate_idera(self):
        """TTS with voice_id=idera should return audio_url"""
        response = requests.post(
            f"{BASE_URL}/api/tts/generate",
            json={
                "text": "Welcome to Narvo, the audio-first news platform.",
                "voice_id": "idera",
                "language": "en"
            }
        )
        assert response.status_code == 200, f"TTS failed with status {response.status_code}: {response.text}"
        data = response.json()
        assert "audio_url" in data, "Response missing audio_url"
        assert data["audio_url"], "audio_url should not be empty"
        assert data.get("voice_id") == "idera"
        print(f"TTS generation with voice_id=idera: SUCCESS, audio_url returned")
    
    def test_tts_generate_emma(self):
        """TTS with voice_id=emma should return audio_url"""
        response = requests.post(
            f"{BASE_URL}/api/tts/generate",
            json={
                "text": "Breaking news from Lagos.",
                "voice_id": "emma",
                "language": "en"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "audio_url" in data
        assert data["audio_url"]
        print(f"TTS generation with voice_id=emma: SUCCESS")

class TestVoicesEndpoint:
    """Tests for /api/voices endpoint"""
    
    def test_voices_returns_yarngpt_voices(self):
        """GET /api/voices should return 5 YarnGPT voices"""
        response = requests.get(f"{BASE_URL}/api/voices")
        assert response.status_code == 200
        voices = response.json()
        
        # Should have at least 5 voices
        assert len(voices) >= 5, f"Expected at least 5 voices, got {len(voices)}"
        
        # Check for specific YarnGPT voice names
        voice_ids = [v.get("id") for v in voices]
        voice_names = [v.get("name") for v in voices]
        
        expected_voices = ["idera", "emma", "zainab", "osagie", "wura"]
        found_voices = []
        for expected in expected_voices:
            if expected in voice_ids or expected.title() in voice_names:
                found_voices.append(expected)
        
        assert len(found_voices) >= 5, \
            f"Expected YarnGPT voices {expected_voices}, found {found_voices} in {voice_ids}"
        
        print(f"GET /api/voices returns {len(voices)} voices: {voice_ids}")
        print(f"YarnGPT voices found: {found_voices}")
    
    def test_voice_has_required_fields(self):
        """Each voice should have id, name, accent, language"""
        response = requests.get(f"{BASE_URL}/api/voices")
        assert response.status_code == 200
        voices = response.json()
        
        for voice in voices:
            assert "id" in voice, f"Voice missing 'id': {voice}"
            assert "name" in voice, f"Voice missing 'name': {voice}"
            assert "accent" in voice, f"Voice missing 'accent': {voice}"
            assert "language" in voice, f"Voice missing 'language': {voice}"
        
        print(f"All {len(voices)} voices have required fields")

class TestNewsEndpoints:
    """Tests for news feed and article endpoints"""
    
    def test_news_feed_returns_articles(self):
        """GET /api/news should return articles"""
        response = requests.get(f"{BASE_URL}/api/news?limit=10")
        assert response.status_code == 200
        articles = response.json()
        assert len(articles) > 0, "News feed should return at least 1 article"
        
        # Check first article has required fields
        first = articles[0]
        assert "id" in first
        assert "title" in first
        assert "source" in first
        
        print(f"GET /api/news returns {len(articles)} articles")
        return articles[0].get("id")  # Return first article ID for detail test
    
    def test_news_detail_with_narrative(self):
        """GET /api/news/{id} should return article with narrative"""
        # First get an article ID
        response = requests.get(f"{BASE_URL}/api/news?limit=1")
        assert response.status_code == 200
        articles = response.json()
        if not articles:
            pytest.skip("No articles available")
        
        article_id = articles[0].get("id")
        
        # Get detail
        detail_response = requests.get(f"{BASE_URL}/api/news/{article_id}")
        assert detail_response.status_code == 200
        detail = detail_response.json()
        
        assert detail.get("title")
        assert detail.get("narrative") or detail.get("summary")
        
        print(f"GET /api/news/{article_id}: article with narrative/summary returned")

class TestHealthAndMetrics:
    """Basic health and metrics tests"""
    
    def test_health_endpoint(self):
        """GET /api/health should return online status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "online"
        print("Health check: ONLINE")
    
    def test_metrics_endpoint(self):
        """GET /api/metrics should return platform metrics"""
        response = requests.get(f"{BASE_URL}/api/metrics")
        assert response.status_code == 200
        data = response.json()
        assert "sources_online" in data or "total_sources" in data
        print(f"Metrics: {data.get('total_sources', data.get('sources_online', 0))} sources online")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
