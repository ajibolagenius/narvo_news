"""
Iteration 45 Backend API Tests
Tests for: YarnGPT voices, TTS generation, Settings persistence, Sound themes
Run: cd /app/backend && python -m pytest tests/test_iteration45.py -v --tb=short
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://yarngpt-broadcast.preview.emergentagent.com')


class TestYarnGPTVoices:
    """Test /api/voices returns YarnGPT voices (NOT OpenAI)"""

    def test_voices_endpoint_returns_yarngpt_voices(self):
        """Feature 8: /api/voices returns YarnGPT voices (idera, emma, zainab, osagie, wura)"""
        response = requests.get(f"{BASE_URL}/api/voices")
        assert response.status_code == 200
        voices = response.json()
        assert isinstance(voices, list)
        assert len(voices) >= 5
        voice_ids = [v['id'] for v in voices]
        # Must have YarnGPT voices
        expected_yarngpt = ['idera', 'emma', 'zainab', 'osagie', 'wura']
        for vid in expected_yarngpt:
            assert vid in voice_ids, f"Missing YarnGPT voice: {vid}"
        # Must NOT have old OpenAI IDs
        old_openai_ids = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']
        for oid in old_openai_ids:
            assert oid not in voice_ids, f"Should not have OpenAI voice: {oid}"
        print(f"PASS: /api/voices returns {len(voices)} YarnGPT voices")

    def test_voice_has_required_fields(self):
        """Each voice must have id, name, language fields"""
        response = requests.get(f"{BASE_URL}/api/voices")
        voices = response.json()
        for v in voices:
            assert 'id' in v
            assert 'name' in v
            assert 'language' in v


class TestTTSGeneration:
    """Test /api/tts/generate endpoint"""

    def test_tts_generate_with_emma_voice(self):
        """Feature 9: /api/tts/generate with voice_id=emma returns audio_url"""
        response = requests.post(
            f"{BASE_URL}/api/tts/generate",
            json={"text": "Hello from Emma.", "voice_id": "emma"}
        )
        assert response.status_code == 200
        data = response.json()
        # Should have audio_url or audio_data
        assert 'audio_url' in data or 'audio_data' in data or 'url' in data
        print(f"PASS: /api/tts/generate with emma returned audio data")

    def test_tts_generate_with_idera_voice(self):
        """Test Yoruba voice idera"""
        response = requests.post(
            f"{BASE_URL}/api/tts/generate",
            json={"text": "Bawo ni.", "voice_id": "idera"}
        )
        assert response.status_code == 200
        data = response.json()
        assert 'audio_url' in data or 'audio_data' in data or 'url' in data


class TestSettingsPersistence:
    """Test /api/settings/{user_id} endpoints for interest persistence"""

    def test_guest_settings_post_then_get_interests(self):
        """Feature 10: POST interests then GET confirms they persist"""
        test_interests = ['tech', 'economy', 'sports']
        # POST interests
        post_response = requests.post(
            f"{BASE_URL}/api/settings/guest",
            json={"interests": test_interests}
        )
        assert post_response.status_code == 200
        # GET to confirm persistence
        get_response = requests.get(f"{BASE_URL}/api/settings/guest")
        assert get_response.status_code == 200
        data = get_response.json()
        assert 'interests' in data
        for interest in test_interests:
            assert interest in data['interests'], f"Missing interest: {interest}"
        print(f"PASS: Settings interests persisted correctly")

    def test_settings_sound_theme_persistence(self):
        """Sound theme selection persists"""
        # POST sound theme
        post_response = requests.post(
            f"{BASE_URL}/api/settings/guest",
            json={"sound_theme": "afrobeats"}
        )
        assert post_response.status_code == 200
        # GET to confirm
        get_response = requests.get(f"{BASE_URL}/api/settings/guest")
        assert get_response.status_code == 200
        data = get_response.json()
        assert data.get('sound_theme') == 'afrobeats'
        print(f"PASS: sound_theme persisted correctly")


class TestSoundThemes:
    """Test /api/sound-themes endpoint"""

    def test_sound_themes_list(self):
        """Sound themes endpoint returns list with intro notes"""
        response = requests.get(f"{BASE_URL}/api/sound-themes")
        assert response.status_code == 200
        themes = response.json()
        assert isinstance(themes, list)
        assert len(themes) >= 3
        theme_ids = [t['id'] for t in themes]
        assert 'narvo_classic' in theme_ids
        print(f"PASS: /api/sound-themes returns {len(themes)} themes")

    def test_single_theme_has_intro_notes(self):
        """Individual theme has intro notes for preview"""
        response = requests.get(f"{BASE_URL}/api/sound-themes/narvo_classic")
        assert response.status_code == 200
        theme = response.json()
        assert 'intro' in theme
        assert 'notes' in theme['intro']
        assert len(theme['intro']['notes']) > 0
        print(f"PASS: Theme narvo_classic has intro notes for preview")


class TestNotifications:
    """Test notification subscribe/unsubscribe endpoints"""

    def test_subscribe_endpoint(self):
        response = requests.post(
            f"{BASE_URL}/api/notifications/subscribe",
            json={"endpoint": "browser-push-placeholder", "type": "daily_digest"}
        )
        assert response.status_code == 200
        print("PASS: /api/notifications/subscribe works")

    def test_unsubscribe_endpoint(self):
        response = requests.post(
            f"{BASE_URL}/api/notifications/unsubscribe",
            json={"endpoint": "browser-push-placeholder"}
        )
        assert response.status_code == 200
        print("PASS: /api/notifications/unsubscribe works")

    def test_digest_endpoint(self):
        """Daily digest returns top stories"""
        response = requests.get(f"{BASE_URL}/api/notifications/digest")
        assert response.status_code == 200
        data = response.json()
        assert 'top_stories' in data or 'title' in data
        print("PASS: /api/notifications/digest works")


class TestNewsEndpoint:
    """Test /api/news endpoint for dashboard feed"""

    def test_news_endpoint_returns_articles(self):
        """Feature 12: Dashboard news feed loads articles"""
        response = requests.get(f"{BASE_URL}/api/news?limit=10")
        assert response.status_code == 200
        news = response.json()
        assert isinstance(news, list)
        if len(news) > 0:
            # Check first article structure
            article = news[0]
            assert 'id' in article or '_id' in article
            assert 'title' in article
        print(f"PASS: /api/news returns {len(news)} articles")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
