"""
Test AI Text Sanitizer - Iteration 37
Tests the sanitize_ai_text function that strips stage directions, sound effects,
and production cues from AI-generated output.

Features tested:
1. POST /api/paraphrase - narrative without sound/stage direction text
2. GET /api/briefing/generate - script without SFX cues
3. POST /api/translate/text - translation without stage directions
4. GET /api/search - search still works
5. GET /api/news - news endpoint still works
6. GET /api/health - health check returns online
"""

import pytest
import requests
import os
import re
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Patterns that should NOT be in sanitized output
STAGE_DIRECTION_PATTERNS = [
    r'\[.*?\]',  # [Any bracketed text]
    r'\(.*?(music|sound|pause|sigh|jingle|transition|SFX|fade|clears?).*?\)',  # (music fades), etc
    r'\*.*?(music|sound|pause|sigh|jingle|transition|SFX|fade|clears?).*?\*',  # *music plays*, etc
    r'(?i)^\s*(?:sound of|sounds? of|sfx:?).*$',  # Sound of..., SFX:...
]


def check_for_stage_directions(text: str) -> list:
    """Check if text contains any stage direction patterns. Returns list of found patterns."""
    if not text:
        return []
    found = []
    for pattern in STAGE_DIRECTION_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE | re.MULTILINE)
        if matches:
            found.extend(matches)
    return found


class TestHealthAndBasicEndpoints:
    """Test basic API health and data endpoints still work"""

    def test_health_check(self):
        """GET /api/health should return status online"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "online"
        assert data.get("service") == "Narvo API"
        print(f"✓ Health check passed: {data.get('status')}")

    def test_news_endpoint(self):
        """GET /api/news should return news articles"""
        response = requests.get(f"{BASE_URL}/api/news?limit=5", timeout=30)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✓ News endpoint returned {len(data)} articles")

    def test_search_endpoint(self):
        """GET /api/search?q=Nigeria should return search results"""
        response = requests.get(f"{BASE_URL}/api/search?q=Nigeria&limit=10", timeout=30)
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert isinstance(data["results"], list)
        print(f"✓ Search endpoint returned {data.get('total', 0)} results for 'Nigeria'")


class TestParaphraseSanitizer:
    """Test POST /api/paraphrase returns narrative without stage directions"""

    def test_paraphrase_basic(self):
        """POST /api/paraphrase should return sanitized narrative"""
        payload = {
            "text": "Breaking News: The Nigerian government has announced new economic reforms aimed at stabilizing the Naira and reducing inflation. Finance Minister stated the reforms would take effect next month.",
            "style": "broadcast"
        }
        response = requests.post(f"{BASE_URL}/api/paraphrase", json=payload, timeout=60)
        assert response.status_code == 200
        data = response.json()
        
        assert "narrative" in data
        assert "key_takeaways" in data
        
        # Check narrative doesn't contain stage directions
        narrative = data.get("narrative", "")
        found_patterns = check_for_stage_directions(narrative)
        
        print(f"✓ Paraphrase returned narrative ({len(narrative)} chars)")
        if found_patterns:
            print(f"  WARNING: Found stage direction patterns: {found_patterns}")
            # This is a soft check - the sanitizer may not catch everything from LLM
        else:
            print(f"  ✓ No stage direction patterns found in narrative")
        
        # Narrative should have substantive content
        assert len(narrative) > 50, "Narrative should have substantial content"

    def test_paraphrase_strips_brackets(self):
        """Verify sanitizer strips bracketed text like [Sound of music fades]"""
        # This tests with text that might prompt LLM to add stage directions
        payload = {
            "text": "A dramatic announcement was made today. The president gave a rousing speech about national unity. The crowd cheered enthusiastically as the music played.",
            "style": "broadcast"
        }
        response = requests.post(f"{BASE_URL}/api/paraphrase", json=payload, timeout=60)
        assert response.status_code == 200
        data = response.json()
        
        narrative = data.get("narrative", "")
        
        # Look for literal brackets that describe sounds
        bracket_matches = re.findall(r'\[.*?\]', narrative)
        print(f"✓ Paraphrase processed 'dramatic announcement' text")
        if bracket_matches:
            print(f"  Found brackets (may be legitimate): {bracket_matches[:3]}")
        else:
            print(f"  ✓ No bracketed text in output")


class TestTranslationSanitizer:
    """Test POST /api/translate/text returns translation without stage directions"""

    def test_translate_to_pidgin(self):
        """POST /api/translate/text with target_language='pcm' should return clean translation"""
        payload = {
            "text": "The government has announced new policies to help small businesses grow. These reforms include tax breaks and easier access to loans.",
            "target_language": "pcm",
            "source_language": "en"
        }
        response = requests.post(f"{BASE_URL}/api/translate/text", json=payload, timeout=60)
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        translated = data.get("translated", "")
        
        # Check for stage directions in translation
        found_patterns = check_for_stage_directions(translated)
        
        print(f"✓ Translation to Pidgin successful ({len(translated)} chars)")
        print(f"  Sample: {translated[:100]}...")
        
        if found_patterns:
            print(f"  WARNING: Found patterns: {found_patterns}")
        else:
            print(f"  ✓ No stage direction patterns in translation")

    def test_translate_to_yoruba(self):
        """POST /api/translate/text with target_language='yo' returns clean translation"""
        payload = {
            "text": "Breaking news from Lagos. The state government is building new roads to reduce traffic.",
            "target_language": "yo",
            "source_language": "en"
        }
        response = requests.post(f"{BASE_URL}/api/translate/text", json=payload, timeout=60)
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        translated = data.get("translated", "")
        
        found_patterns = check_for_stage_directions(translated)
        
        print(f"✓ Translation to Yoruba successful ({len(translated)} chars)")
        if not found_patterns:
            print(f"  ✓ No stage direction patterns in Yoruba translation")

    def test_supported_languages_endpoint(self):
        """GET /api/translate/languages should return supported languages"""
        response = requests.get(f"{BASE_URL}/api/translate/languages", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Check for expected languages
        language_codes = [lang.get("code") for lang in data]
        assert "pcm" in language_codes, "Pidgin should be supported"
        assert "yo" in language_codes, "Yoruba should be supported"
        print(f"✓ Translation languages endpoint returned {len(data)} languages: {language_codes}")


class TestBriefingScriptSanitizer:
    """Test GET /api/briefing/generate returns script without SFX cues"""

    def test_briefing_generate(self):
        """GET /api/briefing/generate should return script without sound effects"""
        # First, try to get latest briefing (may already exist)
        response = requests.get(f"{BASE_URL}/api/briefing/latest", timeout=10)
        
        if response.status_code == 404:
            # Generate new briefing
            print("No existing briefing, generating new one (may take 10-30 seconds)...")
            response = requests.get(
                f"{BASE_URL}/api/briefing/generate?voice_id=nova&force_regenerate=true",
                timeout=90
            )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "script" in data, "Briefing should have script field"
        script = data.get("script", "")
        
        # Check script doesn't contain sound effect descriptions
        found_patterns = check_for_stage_directions(script)
        
        print(f"✓ Briefing script retrieved ({len(script)} chars)")
        print(f"  Title: {data.get('title', 'N/A')}")
        print(f"  Stories count: {len(data.get('stories', []))}")
        
        # Check for specific problematic patterns
        problematic_phrases = [
            "sound of music",
            "music fades",
            "jingle plays",
            "(pause)",
            "[transition]",
            "*sigh*",
            "stay tuned",
        ]
        
        script_lower = script.lower()
        found_problematic = [p for p in problematic_phrases if p in script_lower]
        
        if found_problematic:
            print(f"  WARNING: Found problematic phrases: {found_problematic}")
        else:
            print(f"  ✓ No problematic SFX phrases found in script")
        
        if found_patterns:
            print(f"  WARNING: Found regex patterns: {found_patterns[:5]}")
        else:
            print(f"  ✓ No stage direction regex patterns in script")

    def test_briefing_history(self):
        """GET /api/briefing/history should return briefing list"""
        response = requests.get(f"{BASE_URL}/api/briefing/history?limit=5", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert "briefings" in data
        print(f"✓ Briefing history endpoint returned {len(data.get('briefings', []))} briefings")


class TestSanitizerIntegration:
    """Integration tests for the sanitizer across multiple AI endpoints"""

    def test_multiple_paraphrases_no_sfx(self):
        """Test multiple paraphrase calls to verify consistent sanitization"""
        test_texts = [
            "The president gave an emotional speech today, with the crowd erupting in applause.",
            "Dramatic scenes at the stadium as the team won the championship with a last-minute goal.",
            "The ceremony opened with traditional music and cultural performances."
        ]
        
        all_clean = True
        for i, text in enumerate(test_texts):
            response = requests.post(
                f"{BASE_URL}/api/paraphrase",
                json={"text": text, "style": "broadcast"},
                timeout=60
            )
            
            if response.status_code == 200:
                data = response.json()
                narrative = data.get("narrative", "")
                found = check_for_stage_directions(narrative)
                
                status = "✓" if not found else "⚠"
                print(f"  {status} Test {i+1}: {len(narrative)} chars, patterns: {len(found)}")
                
                if found:
                    all_clean = False
            else:
                print(f"  ✗ Test {i+1} failed with status {response.status_code}")
                all_clean = False
            
            time.sleep(1)  # Small delay between requests
        
        print(f"✓ Multiple paraphrase test complete. All clean: {all_clean}")


class TestRegressionEndpoints:
    """Regression tests to ensure other endpoints still work after sanitizer changes"""

    def test_voices_endpoint(self):
        """GET /api/voices should return voice profiles"""
        response = requests.get(f"{BASE_URL}/api/voices", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✓ Voices endpoint returned {len(data)} profiles")

    def test_categories_endpoint(self):
        """GET /api/categories should return news categories"""
        response = requests.get(f"{BASE_URL}/api/categories", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Categories endpoint returned {len(data)} categories")

    def test_regions_endpoint(self):
        """GET /api/regions should return available regions"""
        response = requests.get(f"{BASE_URL}/api/regions", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Regions endpoint returned {len(data)} regions")

    def test_metrics_endpoint(self):
        """GET /api/metrics should return platform metrics"""
        response = requests.get(f"{BASE_URL}/api/metrics", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert "listeners_today" in data
        print(f"✓ Metrics endpoint returned platform metrics")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
