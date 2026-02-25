"""
Test file for Iteration 44 - Testing:
1. /api/voices returns YarnGPT voices (idera, emma, zainab, osagie, wura) NOT old OpenAI voices
2. /api/sound-themes returns 5 themes
3. /api/notifications/* endpoints
4. /api/settings/{user_id} stores and retrieves interests/sound_theme
5. /api/briefing/latest no server crash
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

@pytest.fixture(scope="module")
def test_user_id():
    """Generate unique user ID for tests"""
    return f"test-iter44-{uuid.uuid4().hex[:8]}"


class TestVoicesEndpoint:
    """Test /api/voices returns YarnGPT voices, not old OpenAI voices"""

    def test_voices_returns_yarngpt_voices(self):
        """Verify YarnGPT voices are returned"""
        response = requests.get(f"{BASE_URL}/api/voices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        voices = response.json()
        assert isinstance(voices, list), "Response should be a list"
        assert len(voices) >= 5, f"Expected at least 5 voices, got {len(voices)}"
        
        voice_ids = [v.get("id") for v in voices]
        yarngpt_voice_ids = ["idera", "emma", "zainab", "osagie", "wura"]
        
        for vid in yarngpt_voice_ids:
            assert vid in voice_ids, f"YarnGPT voice '{vid}' not found in response"
        
        # Verify OLD OpenAI voices are NOT returned
        old_openai_voices = ["onyx", "echo", "nova", "shimmer", "alloy"]
        for old_voice in old_openai_voices:
            assert old_voice not in voice_ids, f"Old OpenAI voice '{old_voice}' should NOT be in response"
        
        print(f"PASS: /api/voices returns YarnGPT voices: {voice_ids}")

    def test_voices_have_correct_languages(self):
        """Verify voice language metadata"""
        response = requests.get(f"{BASE_URL}/api/voices")
        assert response.status_code == 200
        
        voices = response.json()
        expected_mappings = {
            "idera": {"language": "yo", "accent": "Yoruba"},
            "emma": {"language": "en", "accent": "English"},
            "zainab": {"language": "ha", "accent": "Hausa"},
            "osagie": {"language": "ig", "accent": "Igbo"},
            "wura": {"language": "pcm", "accent": "Pidgin"},
        }
        
        for voice in voices:
            vid = voice.get("id")
            if vid in expected_mappings:
                assert voice.get("language") == expected_mappings[vid]["language"], \
                    f"Voice {vid} has wrong language: {voice.get('language')}"
                assert voice.get("accent") == expected_mappings[vid]["accent"], \
                    f"Voice {vid} has wrong accent: {voice.get('accent')}"
        
        print("PASS: Voices have correct language mappings")


class TestSoundThemesEndpoint:
    """Test /api/sound-themes returns themes"""

    def test_sound_themes_returns_5_themes(self):
        """Verify 5 sound themes are returned"""
        response = requests.get(f"{BASE_URL}/api/sound-themes")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        themes = response.json()
        assert isinstance(themes, list), "Response should be a list"
        assert len(themes) >= 5, f"Expected at least 5 themes, got {len(themes)}"
        
        theme_ids = [t.get("id") for t in themes]
        print(f"PASS: /api/sound-themes returns {len(themes)} themes: {theme_ids}")


class TestNotificationEndpoints:
    """Test push notification endpoints"""

    def test_subscribe_endpoint(self):
        """Test /api/notifications/subscribe"""
        payload = {
            "endpoint": f"https://test-push-endpoint.com/{uuid.uuid4().hex}",
            "keys": {"p256dh": "test_key", "auth": "test_auth"}
        }
        response = requests.post(f"{BASE_URL}/api/notifications/subscribe", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("status") == "subscribed", f"Expected status 'subscribed', got {data}"
        print("PASS: /api/notifications/subscribe works")

    def test_subscribe_requires_endpoint(self):
        """Subscribe should fail without endpoint"""
        response = requests.post(f"{BASE_URL}/api/notifications/subscribe", json={})
        assert response.status_code == 400, f"Expected 400 for missing endpoint, got {response.status_code}"
        print("PASS: /api/notifications/subscribe validates endpoint")

    def test_unsubscribe_endpoint(self):
        """Test /api/notifications/unsubscribe"""
        payload = {"endpoint": "https://test-push-endpoint.com/to-unsubscribe"}
        response = requests.post(f"{BASE_URL}/api/notifications/unsubscribe", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("status") == "unsubscribed", f"Expected status 'unsubscribed', got {data}"
        print("PASS: /api/notifications/unsubscribe works")

    def test_digest_endpoint(self):
        """Test /api/notifications/digest"""
        response = requests.get(f"{BASE_URL}/api/notifications/digest")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "title" in data, "Digest should have 'title'"
        assert "top_stories" in data, "Digest should have 'top_stories'"
        assert data.get("title") == "NARVO DAILY DIGEST", f"Title mismatch: {data.get('title')}"
        print(f"PASS: /api/notifications/digest works - {len(data.get('top_stories', []))} stories")


class TestSettingsEndpoint:
    """Test /api/settings/{user_id} with interests and sound_theme"""

    def test_settings_stores_interests(self, test_user_id):
        """Test that interests array is stored and retrieved"""
        test_interests = ["politics", "tech", "sports"]
        settings_payload = {
            "interests": test_interests,
            "sound_theme": "narvo_classic"
        }
        
        # Update settings
        response = requests.put(
            f"{BASE_URL}/api/settings/{test_user_id}",
            json=settings_payload
        )
        assert response.status_code == 200, f"PUT settings failed: {response.status_code}"
        
        # Retrieve settings
        response = requests.get(f"{BASE_URL}/api/settings/{test_user_id}")
        assert response.status_code == 200, f"GET settings failed: {response.status_code}"
        
        data = response.json()
        assert "interests" in data, f"Response missing 'interests': {data.keys()}"
        assert data["interests"] == test_interests, f"Interests mismatch: {data['interests']}"
        print(f"PASS: interests array stored and retrieved: {data['interests']}")

    def test_settings_stores_sound_theme(self, test_user_id):
        """Test that sound_theme string is stored and retrieved"""
        settings_payload = {
            "sound_theme": "afrobeat",
            "interests": ["health", "economy"]
        }
        
        # Update settings
        response = requests.put(
            f"{BASE_URL}/api/settings/{test_user_id}",
            json=settings_payload
        )
        assert response.status_code == 200
        
        # Retrieve settings
        response = requests.get(f"{BASE_URL}/api/settings/{test_user_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("sound_theme") == "afrobeat", f"sound_theme mismatch: {data.get('sound_theme')}"
        print(f"PASS: sound_theme stored and retrieved: {data['sound_theme']}")


class TestBriefingEndpoint:
    """Test briefing endpoints (no server crash)"""

    def test_briefing_latest_no_crash(self):
        """Test /api/briefing/latest doesn't crash server"""
        response = requests.get(f"{BASE_URL}/api/briefing/latest")
        # Either 200 (has briefing) or 404 (no briefing yet) is acceptable
        assert response.status_code in [200, 404], \
            f"Expected 200 or 404, got {response.status_code}: {response.text[:200]}"
        print(f"PASS: /api/briefing/latest returns {response.status_code} (no crash)")


class TestNewsEndpoint:
    """Test news feed endpoints"""

    def test_news_feed_returns_data(self):
        """Test /api/news returns news items"""
        response = requests.get(f"{BASE_URL}/api/news?limit=5")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "News should be a list"
        print(f"PASS: /api/news returns {len(data)} items")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
