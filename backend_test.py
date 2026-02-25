#!/usr/bin/env python3
"""
Narvo Backend API Testing Suite
Tests all backend endpoints for functionality and integration
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, List, Any

class NarvoAPITester:
    def __init__(self, base_url="https://global-voices-news.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.session = requests.Session()
        self.session.timeout = 30

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}: PASSED {details}")
        else:
            self.failed_tests.append({"test": name, "details": details})
            print(f"❌ {name}: FAILED {details}")

    def test_health_endpoint(self) -> bool:
        """Test /api/health endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/health")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "online" and "service" in data:
                    self.log_test("Health Check", True, f"Status: {data.get('status')}")
                    return True
                else:
                    self.log_test("Health Check", False, f"Invalid response format: {data}")
                    return False
            else:
                self.log_test("Health Check", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Health Check", False, f"Exception: {str(e)}")
            return False

    def test_news_endpoint(self) -> bool:
        """Test /api/news endpoint"""
        try:
            # Test basic news fetch
            response = self.session.get(f"{self.base_url}/api/news?limit=5")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Check news item structure
                    news_item = data[0]
                    required_fields = ['id', 'title', 'summary', 'source', 'published', 'region', 'category']
                    
                    missing_fields = [field for field in required_fields if field not in news_item]
                    if not missing_fields:
                        self.log_test("News Fetch", True, f"Retrieved {len(data)} news items")
                        
                        # Test with filters
                        self.test_news_filters()
                        return True
                    else:
                        self.log_test("News Fetch", False, f"Missing fields: {missing_fields}")
                        return False
                else:
                    self.log_test("News Fetch", False, "Empty or invalid response")
                    return False
            else:
                self.log_test("News Fetch", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("News Fetch", False, f"Exception: {str(e)}")
            return False

    def test_news_filters(self):
        """Test news endpoint with filters"""
        try:
            # Test region filter
            response = self.session.get(f"{self.base_url}/api/news?region=Nigeria&limit=3")
            if response.status_code == 200:
                self.log_test("News Region Filter", True, "Nigeria filter works")
            else:
                self.log_test("News Region Filter", False, f"Status: {response.status_code}")
                
            # Test category filter
            response = self.session.get(f"{self.base_url}/api/news?category=Politics&limit=3")
            if response.status_code == 200:
                self.log_test("News Category Filter", True, "Politics filter works")
            else:
                self.log_test("News Category Filter", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("News Filters", False, f"Exception: {str(e)}")

    def test_news_detail_endpoint(self) -> bool:
        """Test /api/news/{id} endpoint"""
        try:
            # First get a news item ID
            response = self.session.get(f"{self.base_url}/api/news?limit=1")
            if response.status_code != 200:
                self.log_test("News Detail Setup", False, "Could not fetch news for detail test")
                return False
                
            news_list = response.json()
            if not news_list:
                self.log_test("News Detail Setup", False, "No news items available")
                return False
                
            news_id = news_list[0]['id']
            
            # Test news detail endpoint
            detail_response = self.session.get(f"{self.base_url}/api/news/{news_id}")
            
            if detail_response.status_code == 200:
                detail_data = detail_response.json()
                if detail_data.get('id') == news_id:
                    self.log_test("News Detail", True, f"Retrieved detail for ID: {news_id}")
                    return True
                else:
                    self.log_test("News Detail", False, "ID mismatch in response")
                    return False
            else:
                self.log_test("News Detail", False, f"Status code: {detail_response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("News Detail", False, f"Exception: {str(e)}")
            return False

    def test_metrics_endpoint(self) -> bool:
        """Test /api/metrics endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/metrics")
            
            if response.status_code == 200:
                data = response.json()
                expected_fields = ['listeners_today', 'sources_online', 'stories_processed', 'signal_strength']
                
                missing_fields = [field for field in expected_fields if field not in data]
                if not missing_fields:
                    self.log_test("Metrics", True, f"All metrics available")
                    return True
                else:
                    self.log_test("Metrics", False, f"Missing metrics: {missing_fields}")
                    return False
            else:
                self.log_test("Metrics", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Metrics", False, f"Exception: {str(e)}")
            return False

    def test_voices_endpoint(self) -> bool:
        """Test /api/voices endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/voices")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    voice = data[0]
                    required_fields = ['id', 'name', 'accent', 'description']
                    
                    missing_fields = [field for field in required_fields if field not in voice]
                    if not missing_fields:
                        self.log_test("Voices", True, f"Retrieved {len(data)} voice profiles")
                        return True
                    else:
                        self.log_test("Voices", False, f"Missing voice fields: {missing_fields}")
                        return False
                else:
                    self.log_test("Voices", False, "No voices available")
                    return False
            else:
                self.log_test("Voices", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Voices", False, f"Exception: {str(e)}")
            return False

    def test_tts_endpoint(self) -> bool:
        """Test /api/tts/generate endpoint with OpenAI TTS"""
        try:
            test_payload = {
                "text": "Welcome to Narvo. This is a test broadcast from Nigeria.",
                "voice_id": "nova",
                "stability": 0.5,
                "similarity_boost": 0.75
            }
            
            response = self.session.post(
                f"{self.base_url}/api/tts/generate",
                json=test_payload,
                timeout=60  # TTS can take longer
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'audio_url' in data and data['audio_url'].startswith('data:audio'):
                    self.log_test("TTS Generation", True, "Audio generated successfully")
                    return True
                else:
                    self.log_test("TTS Generation", False, "Invalid audio response format")
                    return False
            else:
                self.log_test("TTS Generation", False, f"Status code: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("TTS Generation", False, f"Exception: {str(e)}")
            return False

    def test_paraphrase_endpoint(self) -> bool:
        """Test /api/paraphrase endpoint"""
        try:
            test_payload = {
                "text": "Nigeria's economy shows signs of recovery as inflation rates stabilize.",
                "style": "broadcast"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/paraphrase",
                json=test_payload,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'narrative' in data and 'key_takeaways' in data:
                    self.log_test("AI Paraphrase", True, "Narrative generated successfully")
                    return True
                else:
                    self.log_test("AI Paraphrase", False, "Invalid paraphrase response format")
                    return False
            else:
                self.log_test("AI Paraphrase", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("AI Paraphrase", False, f"Exception: {str(e)}")
            return False

    def test_briefing_generate_endpoint(self) -> bool:
        """Test /api/briefing/generate endpoint"""
        try:
            # Test briefing generation with default voice
            response = self.session.get(
                f"{self.base_url}/api/briefing/generate?voice_id=nova&force_regenerate=true",
                timeout=120  # Briefing generation can take longer
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['id', 'title', 'generated_at', 'duration_estimate', 'stories', 'script', 'voice_id']
                
                missing_fields = [field for field in required_fields if field not in data]
                if not missing_fields:
                    # Check if stories array has content
                    if isinstance(data.get('stories'), list) and len(data['stories']) > 0:
                        # Check if script is generated
                        if data.get('script') and len(data['script']) > 100:
                            self.log_test("Briefing Generation", True, f"Generated briefing with {len(data['stories'])} stories")
                            return True
                        else:
                            self.log_test("Briefing Generation", False, "Script too short or missing")
                            return False
                    else:
                        self.log_test("Briefing Generation", False, "No stories in briefing")
                        return False
                else:
                    self.log_test("Briefing Generation", False, f"Missing fields: {missing_fields}")
                    return False
            else:
                self.log_test("Briefing Generation", False, f"Status code: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Briefing Generation", False, f"Exception: {str(e)}")
            return False

    def test_briefing_latest_endpoint(self) -> bool:
        """Test /api/briefing/latest endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/briefing/latest")
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and 'title' in data and 'stories' in data:
                    self.log_test("Latest Briefing", True, f"Retrieved cached briefing: {data.get('id')}")
                    return True
                else:
                    self.log_test("Latest Briefing", False, "Invalid briefing format")
                    return False
            elif response.status_code == 404:
                # This is acceptable if no briefing exists yet
                self.log_test("Latest Briefing", True, "No cached briefing (404 expected)")
                return True
            else:
                self.log_test("Latest Briefing", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Latest Briefing", False, f"Exception: {str(e)}")
            return False

    def test_briefing_audio_endpoint(self) -> bool:
        """Test /api/briefing/audio endpoint"""
        try:
            test_script = "Good morning, this is your Narvo briefing test. Today's top story from Nigeria."
            
            response = self.session.post(
                f"{self.base_url}/api/briefing/audio?script={test_script}&voice_id=nova",
                timeout=60
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'audio_url' in data and data['audio_url'].startswith('data:audio'):
                    self.log_test("Briefing Audio", True, "Custom briefing audio generated")
                    return True
                else:
                    self.log_test("Briefing Audio", False, "Invalid audio response format")
                    return False
            else:
                self.log_test("Briefing Audio", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Briefing Audio", False, f"Exception: {str(e)}")
            return False

    def test_supporting_endpoints(self):
        """Test supporting endpoints"""
        endpoints = [
            ("/api/regions", "Regions"),
            ("/api/categories", "Categories"), 
            ("/api/trending", "Trending")
        ]
        
        for endpoint, name in endpoints:
            try:
                response = self.session.get(f"{self.base_url}{endpoint}")
                if response.status_code == 200:
                    data = response.json()
                    self.log_test(f"{name} Endpoint", True, f"Data available")
                else:
                    self.log_test(f"{name} Endpoint", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test(f"{name} Endpoint", False, f"Exception: {str(e)}")

    def run_all_tests(self) -> Dict[str, Any]:
        """Run all backend tests"""
        print("🚀 Starting Narvo Backend API Tests...")
        print(f"📡 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Core functionality tests
        self.test_health_endpoint()
        self.test_news_endpoint()
        self.test_news_detail_endpoint()
        self.test_metrics_endpoint()
        self.test_voices_endpoint()
        
        # AI Integration tests
        self.test_tts_endpoint()
        self.test_paraphrase_endpoint()
        
        # Morning Briefing tests (NEW)
        print("\n🌅 Testing Morning Briefing Feature...")
        self.test_briefing_generate_endpoint()
        self.test_briefing_latest_endpoint()
        self.test_briefing_audio_endpoint()
        
        # Supporting endpoints
        self.test_supporting_endpoints()
        
        # Summary
        print("=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for failure in self.failed_tests:
                print(f"   • {failure['test']}: {failure['details']}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "failed_tests": len(self.failed_tests),
            "success_rate": success_rate,
            "failures": self.failed_tests
        }

def main():
    """Main test execution"""
    tester = NarvoAPITester()
    results = tester.run_all_tests()
    
    # Return appropriate exit code
    if results["success_rate"] >= 80:
        print(f"\n✅ Backend tests mostly successful ({results['success_rate']:.1f}%)")
        return 0
    else:
        print(f"\n❌ Backend tests need attention ({results['success_rate']:.1f}%)")
        return 1

if __name__ == "__main__":
    sys.exit(main())