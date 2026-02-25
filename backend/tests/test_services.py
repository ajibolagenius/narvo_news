"""Backend integration tests for Narvo core services."""
import pytest
import httpx
import os

API_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001")


@pytest.fixture
def client():
    return httpx.Client(base_url=API_URL, timeout=30)


# ── News / Content Sources ────────────────────────────────────────────

class TestContentSources:
    def test_content_sources_returns_total(self, client):
        r = client.get("/api/content-sources")
        assert r.status_code == 200
        data = r.json()
        assert "total_sources" in data
        assert data["total_sources"] >= 30  # We have 39 feeds now

    def test_content_sources_has_regions(self, client):
        r = client.get("/api/content-sources")
        data = r.json()
        assert data["local_sources"] > 0
        assert data["international_sources"] > 0
        assert data.get("continental_sources", 0) > 0

    def test_content_sources_has_categories(self, client):
        r = client.get("/api/content-sources")
        data = r.json()
        assert "categories" in data
        assert "General" in data["categories"]

    def test_content_sources_lists_sources(self, client):
        r = client.get("/api/content-sources")
        data = r.json()
        assert "sources" in data
        assert len(data["sources"]) > 0
        source = data["sources"][0]
        assert "name" in source
        assert "category" in source
        assert "region" in source

    def test_content_sources_no_dubawa(self, client):
        r = client.get("/api/content-sources")
        data = r.json()
        api_names = [v["name"] for v in data.get("verification_apis", [])]
        assert "Dubawa" not in api_names


class TestNewsEndpoint:
    def test_news_endpoint_returns_list(self, client):
        r = client.get("/api/news?limit=5")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)

    def test_news_search(self, client):
        r = client.get("/api/news/search?q=Nigeria&limit=5")
        assert r.status_code == 200


# ── Settings CRUD ─────────────────────────────────────────────────────

class TestSettings:
    USER_ID = "test_user_pytest"

    def test_save_settings(self, client):
        r = client.post(
            f"/api/settings/{self.USER_ID}",
            json={"broadcast_language": "yo"},
        )
        assert r.status_code == 200
        assert r.json()["status"] == "success"

    def test_fetch_settings_reflects_save(self, client):
        # Save first
        client.post(
            f"/api/settings/{self.USER_ID}",
            json={"broadcast_language": "ha"},
        )
        # Fetch
        r = client.get(f"/api/settings/{self.USER_ID}")
        assert r.status_code == 200
        data = r.json()
        assert data["broadcast_language"] == "ha"

    def test_settings_merge_does_not_overwrite(self, client):
        # Save broadcast_language
        client.post(
            f"/api/settings/{self.USER_ID}",
            json={"broadcast_language": "ig", "alert_volume": 90},
        )
        # Save only alert_volume
        client.post(
            f"/api/settings/{self.USER_ID}",
            json={"alert_volume": 50},
        )
        # broadcast_language should still be ig
        r = client.get(f"/api/settings/{self.USER_ID}")
        data = r.json()
        assert data["broadcast_language"] == "ig"
        assert data["alert_volume"] == 50

    def test_default_settings_for_unknown_user(self, client):
        r = client.get("/api/settings/nonexistent_user_12345")
        assert r.status_code == 200
        data = r.json()
        assert data["broadcast_language"] == "en"


# ── Translation Endpoints ─────────────────────────────────────────────

class TestTranslation:
    def test_languages_list(self, client):
        r = client.get("/api/translate/languages")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        codes = [l["code"] for l in data]
        assert "en" in codes
        assert "pcm" in codes

    def test_quick_translate(self, client):
        r = client.get("/api/translate/quick?text=Hello&lang=pcm")
        assert r.status_code == 200


# ── Fact-Check Endpoints ──────────────────────────────────────────────

class TestFactCheck:
    def test_factcheck_search(self, client):
        r = client.get("/api/factcheck/search?query=climate+change")
        assert r.status_code == 200

    def test_factcheck_verify(self, client):
        r = client.get("/api/factcheck/verify?claim=The+earth+is+flat")
        assert r.status_code == 200
        data = r.json()
        assert "verdict" in data or "error" in data


# ── Metrics Endpoint ──────────────────────────────────────────────────

class TestMetrics:
    def test_metrics_includes_sources(self, client):
        r = client.get("/api/metrics")
        assert r.status_code == 200
        data = r.json()
        assert "total_sources" in data
        assert data["total_sources"] >= 30


# ── Health Check ──────────────────────────────────────────────────────

class TestHealth:
    def test_root_health(self, client):
        r = client.get("/api/health")
        assert r.status_code == 200
