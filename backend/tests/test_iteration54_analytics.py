"""
Iteration 54 Backend Tests - Enhanced Analytics API
Tests: weekly_trend, period_comparison, hourly_distribution fields
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAnalyticsEndpoint:
    """Analytics endpoint tests with new fields: weekly_trend, period_comparison, hourly_distribution"""
    
    def test_analytics_guest_returns_200(self):
        """GET /api/analytics/guest returns 200"""
        response = requests.get(f"{BASE_URL}/api/analytics/guest")
        assert response.status_code == 200
        print("PASS: /api/analytics/guest returns 200")
    
    def test_analytics_has_weekly_trend(self):
        """Analytics response contains weekly_trend array"""
        response = requests.get(f"{BASE_URL}/api/analytics/guest")
        data = response.json()
        assert "weekly_trend" in data, "Missing weekly_trend field"
        assert isinstance(data["weekly_trend"], list), "weekly_trend should be a list"
        print(f"PASS: weekly_trend present with {len(data['weekly_trend'])} weeks")
    
    def test_weekly_trend_has_4_weeks(self):
        """weekly_trend has 4 weeks: W-3, W-2, W-1, This week"""
        response = requests.get(f"{BASE_URL}/api/analytics/guest")
        data = response.json()
        weekly_trend = data.get("weekly_trend", [])
        assert len(weekly_trend) == 4, f"Expected 4 weeks, got {len(weekly_trend)}"
        
        # Check week labels
        weeks = [w["week"] for w in weekly_trend]
        expected_weeks = ["W-3", "W-2", "W-1", "This week"]
        assert weeks == expected_weeks, f"Expected {expected_weeks}, got {weeks}"
        
        # Each week should have a count
        for week in weekly_trend:
            assert "count" in week, f"Week {week.get('week')} missing count"
            assert isinstance(week["count"], int), f"Week count should be int"
        print(f"PASS: weekly_trend has 4 weeks: {weeks}")
    
    def test_analytics_has_period_comparison(self):
        """Analytics response contains period_comparison object"""
        response = requests.get(f"{BASE_URL}/api/analytics/guest")
        data = response.json()
        assert "period_comparison" in data, "Missing period_comparison field"
        print("PASS: period_comparison field present")
    
    def test_period_comparison_has_required_fields(self):
        """period_comparison has this_week, last_week, change_pct, trend"""
        response = requests.get(f"{BASE_URL}/api/analytics/guest")
        data = response.json()
        period_comp = data.get("period_comparison")
        
        assert period_comp is not None, "period_comparison is None"
        assert "this_week" in period_comp, "Missing this_week"
        assert "last_week" in period_comp, "Missing last_week"
        assert "change_pct" in period_comp, "Missing change_pct"
        assert "trend" in period_comp, "Missing trend"
        
        # Validate trend values
        assert period_comp["trend"] in ["up", "down", "flat"], f"Invalid trend: {period_comp['trend']}"
        
        print(f"PASS: period_comparison has all fields - this_week:{period_comp['this_week']}, last_week:{period_comp['last_week']}, change_pct:{period_comp['change_pct']}%, trend:{period_comp['trend']}")
    
    def test_analytics_has_hourly_distribution(self):
        """Analytics response contains hourly_distribution object with 24 keys"""
        response = requests.get(f"{BASE_URL}/api/analytics/guest")
        data = response.json()
        assert "hourly_distribution" in data, "Missing hourly_distribution field"
        
        hourly = data.get("hourly_distribution", {})
        assert isinstance(hourly, dict), "hourly_distribution should be a dict"
        assert len(hourly) == 24, f"Expected 24 hours, got {len(hourly)}"
        
        # Verify all 24 hours are present (00-23)
        expected_hours = [str(h).zfill(2) for h in range(24)]
        actual_hours = sorted(hourly.keys())
        assert actual_hours == expected_hours, f"Missing hours. Expected {expected_hours[:3]}..., got {actual_hours[:3]}..."
        
        print(f"PASS: hourly_distribution has 24 keys (00-23)")
    
    def test_analytics_has_core_fields(self):
        """Analytics response contains core fields: total_listens, categories, daily_activity, streak"""
        response = requests.get(f"{BASE_URL}/api/analytics/guest")
        data = response.json()
        
        core_fields = ["total_listens", "total_duration_minutes", "categories", "sources", "daily_activity", "streak", "top_categories"]
        for field in core_fields:
            assert field in data, f"Missing core field: {field}"
        
        print(f"PASS: All core fields present: {core_fields}")


class TestHealthEndpoint:
    """Basic health check"""
    
    def test_health_returns_200(self):
        """GET /api/health returns 200"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "online"
        print("PASS: /api/health returns online")


class TestNewsEndpoint:
    """News endpoint basic test"""
    
    def test_news_returns_200(self):
        """GET /api/news returns 200"""
        response = requests.get(f"{BASE_URL}/api/news?limit=5")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "News response should be a list"
        print(f"PASS: /api/news returns {len(data)} items")
