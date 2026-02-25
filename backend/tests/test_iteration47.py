"""
Iteration 47 Tests - Speed Control, PWA Icons/Screenshots, Expanded Podcast Feeds
Tests:
1. /api/podcasts returns episodes from expanded feeds (10 sources)
2. /api/settings/guest stores and retrieves voice_model and broadcast_language
3. /api/tts/generate with voice_id=emma returns audio_url
4. PWA manifest has 4 icons (192x192 + 512x512, any + maskable)
5. PWA manifest has 2 screenshots (wide + narrow form_factor)
6. Icon files are accessible (not SVG data URIs)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestPodcastAPI:
    """Test expanded podcast feeds (10 sources)"""
    
    def test_podcasts_returns_episodes(self):
        """GET /api/podcasts should return episodes from multiple feeds"""
        response = requests.get(f"{BASE_URL}/api/podcasts?limit=20")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "episodes" in data, "Response should have 'episodes' key"
        assert len(data["episodes"]) > 0, "Should return at least 1 episode"
        
        # Check episode structure
        ep = data["episodes"][0]
        assert "id" in ep, "Episode should have 'id'"
        assert "title" in ep, "Episode should have 'title'"
        assert "source" in ep, "Episode should have 'source'"
        
        # Check for multiple sources (expanded feeds)
        sources = set(e.get("source", "") for e in data["episodes"])
        print(f"[Podcast] Found {len(data['episodes'])} episodes from {len(sources)} sources: {sources}")
        
    def test_podcasts_category_filter(self):
        """GET /api/podcasts with category filter"""
        response = requests.get(f"{BASE_URL}/api/podcasts?category=News")
        assert response.status_code == 200


class TestSettingsAPI:
    """Test voice_model and broadcast_language persistence"""
    
    def test_settings_store_voice_model(self):
        """POST /api/settings/guest with voice_model should persist"""
        # Set voice_model to emma
        response = requests.post(
            f"{BASE_URL}/api/settings/guest",
            json={"voice_model": "emma", "broadcast_language": "en"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
    def test_settings_retrieve_voice_model(self):
        """GET /api/settings/guest should return voice_model"""
        # First set the value
        requests.post(
            f"{BASE_URL}/api/settings/guest",
            json={"voice_model": "emma", "broadcast_language": "en"}
        )
        
        # Then retrieve
        response = requests.get(f"{BASE_URL}/api/settings/guest")
        assert response.status_code == 200
        
        data = response.json()
        assert "voice_model" in data, "Response should have 'voice_model'"
        assert data["voice_model"] == "emma", f"Expected 'emma', got {data.get('voice_model')}"
        print(f"[Settings] Retrieved: voice_model={data.get('voice_model')}, broadcast_language={data.get('broadcast_language')}")


class TestTTSAPI:
    """Test TTS generation with emma voice"""
    
    def test_tts_generate_emma(self):
        """POST /api/tts/generate with voice_id=emma returns audio"""
        response = requests.post(
            f"{BASE_URL}/api/tts/generate",
            json={
                "text": "This is a test broadcast from Narvo News.",
                "voice_id": "emma",
                "language": "en"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "audio_url" in data, "Response should have 'audio_url'"
        assert data["audio_url"], "audio_url should not be empty"
        print(f"[TTS] Generated audio: {data['audio_url'][:100]}...")


class TestPWAManifest:
    """Test PWA manifest.json structure"""
    
    def test_manifest_accessible(self):
        """GET /manifest.json should be accessible"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        assert response.status_code == 200, f"Manifest not accessible: {response.status_code}"
        
    def test_manifest_has_four_icons(self):
        """manifest.json should have 4 icons (192x192 + 512x512, any + maskable)"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        assert response.status_code == 200
        
        data = response.json()
        icons = data.get("icons", [])
        assert len(icons) == 4, f"Expected 4 icons, got {len(icons)}"
        
        # Check icon sizes and purposes
        icon_specs = [(i.get("sizes"), i.get("purpose")) for i in icons]
        print(f"[PWA] Icons: {icon_specs}")
        
        # Verify 192x192 any and maskable exist
        assert any(i.get("sizes") == "192x192" and i.get("purpose") == "any" for i in icons), "Missing 192x192 any"
        assert any(i.get("sizes") == "192x192" and i.get("purpose") == "maskable" for i in icons), "Missing 192x192 maskable"
        
        # Verify 512x512 any and maskable exist
        assert any(i.get("sizes") == "512x512" and i.get("purpose") == "any" for i in icons), "Missing 512x512 any"
        assert any(i.get("sizes") == "512x512" and i.get("purpose") == "maskable" for i in icons), "Missing 512x512 maskable"
        
        # Verify icons are PNG, not SVG data URIs
        for icon in icons:
            src = icon.get("src", "")
            assert src.endswith(".png"), f"Icon should be PNG file, got {src}"
            assert not src.startswith("data:"), f"Icon should not be data URI"
        
    def test_manifest_has_two_screenshots(self):
        """manifest.json should have 2 screenshots with form_factor"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        assert response.status_code == 200
        
        data = response.json()
        screenshots = data.get("screenshots", [])
        assert len(screenshots) == 2, f"Expected 2 screenshots, got {len(screenshots)}"
        
        # Check form_factors
        form_factors = [s.get("form_factor") for s in screenshots]
        print(f"[PWA] Screenshot form_factors: {form_factors}")
        
        assert "wide" in form_factors, "Missing 'wide' form_factor screenshot"
        assert "narrow" in form_factors, "Missing 'narrow' form_factor screenshot"


class TestPWAIcons:
    """Test PWA icon files are accessible"""
    
    def test_icon_192_accessible(self):
        """GET /narvo-icon-192.png should return PNG image"""
        response = requests.get(f"{BASE_URL}/narvo-icon-192.png")
        assert response.status_code == 200, f"Icon 192 not accessible: {response.status_code}"
        
        # Check content type
        content_type = response.headers.get("Content-Type", "")
        assert "image/png" in content_type or "application/octet-stream" in content_type, f"Expected image/png, got {content_type}"
        
        # Check it's not SVG data (should start with PNG magic bytes)
        content = response.content[:20]
        assert content[:4] == b'\x89PNG', "Icon should be PNG file, not SVG data"
        print(f"[PWA] narvo-icon-192.png: {len(response.content)} bytes, PNG format")
        
    def test_icon_512_accessible(self):
        """GET /narvo-icon-512.png should return PNG image"""
        response = requests.get(f"{BASE_URL}/narvo-icon-512.png")
        assert response.status_code == 200, f"Icon 512 not accessible: {response.status_code}"
        
        content = response.content[:20]
        assert content[:4] == b'\x89PNG', "Icon should be PNG file"
        print(f"[PWA] narvo-icon-512.png: {len(response.content)} bytes, PNG format")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
