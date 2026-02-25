"""
Iteration 46 Backend API Tests
Tests for: Voice consistency fix, Audio player redesign, Additional podcasts

Features to test:
1. BACKEND: /api/settings/guest POST voice_model=idera then GET confirms voice_model=idera persists
2. BACKEND: /api/tts/generate with voice_id=idera returns audio_url successfully
3. BACKEND: /api/podcasts returns episodes from multiple feeds (should have 10+ episodes now with new feeds)

Run: cd /app/backend && python -m pytest tests/test_iteration46.py -v --tb=short
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://yarngpt-broadcast.preview.emergentagent.com')


class TestVoiceModelPersistence:
    """Test /api/settings voice_model persistence (voice consistency fix)"""

    def test_post_voice_model_idera_then_get_confirms(self):
        """Feature 1: POST voice_model=idera then GET confirms voice_model=idera persists"""
        # POST voice_model=idera
        post_response = requests.post(
            f"{BASE_URL}/api/settings/guest",
            json={"voice_model": "idera"}
        )
        assert post_response.status_code == 200, f"POST failed: {post_response.text}"
        print(f"POST response: {post_response.json()}")
        
        # GET to confirm persistence
        get_response = requests.get(f"{BASE_URL}/api/settings/guest")
        assert get_response.status_code == 200, f"GET failed: {get_response.text}"
        data = get_response.json()
        
        # Assert voice_model is idera
        assert 'voice_model' in data, f"Missing voice_model in response: {data}"
        assert data['voice_model'] == 'idera', f"Expected voice_model=idera, got: {data.get('voice_model')}"
        print(f"PASS: voice_model=idera persisted correctly. Full data: {data}")

    def test_post_voice_model_emma_then_get_confirms(self):
        """Verify voice_model can be changed to emma"""
        # First set to emma
        post_response = requests.post(
            f"{BASE_URL}/api/settings/guest",
            json={"voice_model": "emma"}
        )
        assert post_response.status_code == 200
        
        # GET to confirm
        get_response = requests.get(f"{BASE_URL}/api/settings/guest")
        assert get_response.status_code == 200
        data = get_response.json()
        assert data.get('voice_model') == 'emma', f"Expected emma, got: {data.get('voice_model')}"
        print(f"PASS: voice_model=emma set correctly")


class TestTTSGenerationVoices:
    """Test /api/tts/generate with different YarnGPT voices"""

    def test_tts_generate_with_idera_voice(self):
        """Feature 2: /api/tts/generate with voice_id=idera returns audio_url successfully"""
        response = requests.post(
            f"{BASE_URL}/api/tts/generate",
            json={
                "text": "Bawo ni. Welcome to Narvo.",
                "voice_id": "idera",
                "language": "yo"
            },
            timeout=30  # TTS can take time
        )
        assert response.status_code == 200, f"TTS failed: {response.text}"
        data = response.json()
        
        # Should have audio_url
        assert 'audio_url' in data, f"Missing audio_url in response: {data}"
        assert data['audio_url'].startswith('http'), f"audio_url should be a URL: {data['audio_url']}"
        print(f"PASS: /api/tts/generate with voice_id=idera returned audio_url: {data['audio_url'][:60]}...")

    def test_tts_generate_with_zainab_voice(self):
        """Test Hausa voice zainab"""
        response = requests.post(
            f"{BASE_URL}/api/tts/generate",
            json={
                "text": "Sannu. Welcome to the broadcast.",
                "voice_id": "zainab",
                "language": "ha"
            },
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        assert 'audio_url' in data
        print(f"PASS: TTS with zainab voice works")


class TestPodcastFeeds:
    """Test /api/podcasts returns episodes from multiple RSS feeds (new feeds added)"""

    def test_podcasts_returns_10_plus_episodes(self):
        """Feature 3: /api/podcasts returns episodes from multiple feeds (should have 10+ episodes)"""
        response = requests.get(f"{BASE_URL}/api/podcasts?limit=50")
        assert response.status_code == 200, f"Podcasts failed: {response.text}"
        podcasts = response.json()
        
        assert isinstance(podcasts, list), f"Expected list, got: {type(podcasts)}"
        
        # Should have 10+ episodes with expanded feeds
        assert len(podcasts) >= 10, f"Expected 10+ episodes, got: {len(podcasts)}"
        print(f"PASS: /api/podcasts returns {len(podcasts)} episodes")

    def test_podcasts_have_multiple_sources(self):
        """Verify podcasts come from multiple different sources (new feeds)"""
        response = requests.get(f"{BASE_URL}/api/podcasts?limit=50")
        assert response.status_code == 200
        podcasts = response.json()
        
        # Extract unique sources
        sources = set()
        for ep in podcasts:
            src = ep.get('source', '')
            if src:
                sources.add(src)
        
        # Should have at least 3 different sources
        assert len(sources) >= 3, f"Expected 3+ sources, got {len(sources)}: {sources}"
        print(f"PASS: Podcasts from {len(sources)} sources: {list(sources)[:5]}...")

    def test_podcast_episode_structure(self):
        """Each podcast episode has required fields"""
        response = requests.get(f"{BASE_URL}/api/podcasts?limit=10")
        assert response.status_code == 200
        podcasts = response.json()
        
        if len(podcasts) > 0:
            ep = podcasts[0]
            required_fields = ['id', 'title', 'source']
            for field in required_fields:
                assert field in ep, f"Missing field '{field}' in podcast: {ep}"
            print(f"PASS: Podcast episodes have required fields")


class TestVoicesEndpoint:
    """Test /api/voices returns YarnGPT voices"""

    def test_voices_contains_all_yarngpt_voices(self):
        """Feature 11: /api/voices returns all 5 YarnGPT voices (Idera, Emma, Zainab, Osagie, Wura)"""
        response = requests.get(f"{BASE_URL}/api/voices")
        assert response.status_code == 200
        voices = response.json()
        
        voice_ids = [v['id'].lower() for v in voices]
        voice_names = [v['name'].lower() for v in voices]
        
        expected_yarngpt = ['idera', 'emma', 'zainab', 'osagie', 'wura']
        for voice in expected_yarngpt:
            assert voice in voice_ids or voice in voice_names, f"Missing YarnGPT voice: {voice}"
        
        print(f"PASS: All 5 YarnGPT voices present: {expected_yarngpt}")


class TestNewsEndpoint:
    """Test /api/news for dashboard"""

    def test_news_returns_articles(self):
        """Feature 12: Dashboard loads with news feed"""
        response = requests.get(f"{BASE_URL}/api/news?limit=10")
        assert response.status_code == 200
        news = response.json()
        
        assert isinstance(news, list)
        assert len(news) >= 1, "Expected at least 1 news article"
        
        # Check structure of first article
        if news:
            article = news[0]
            assert 'id' in article or '_id' in article
            assert 'title' in article
        
        print(f"PASS: /api/news returns {len(news)} articles")

    def test_news_article_detail(self):
        """Can fetch individual news article by ID"""
        # First get list
        list_response = requests.get(f"{BASE_URL}/api/news?limit=5")
        assert list_response.status_code == 200
        news = list_response.json()
        
        if news:
            article_id = news[0].get('id') or news[0].get('_id')
            if article_id:
                detail_response = requests.get(f"{BASE_URL}/api/news/{article_id}")
                assert detail_response.status_code == 200
                detail = detail_response.json()
                assert 'title' in detail
                print(f"PASS: News detail endpoint works for article {article_id}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
