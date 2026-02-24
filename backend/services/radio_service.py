# Radio Service - Radio station integration via Radio Browser API
import httpx
from typing import List, Dict, Optional

RADIO_BROWSER_API = "https://de1.api.radio-browser.info"

# African countries with radio stations
AFRICAN_COUNTRIES = [
    {"code": "NG", "name": "Nigeria", "flag": "🇳🇬"},
    {"code": "GH", "name": "Ghana", "flag": "🇬🇭"},
    {"code": "KE", "name": "Kenya", "flag": "🇰🇪"},
    {"code": "ZA", "name": "South Africa", "flag": "🇿🇦"},
    {"code": "EG", "name": "Egypt", "flag": "🇪🇬"},
    {"code": "MA", "name": "Morocco", "flag": "🇲🇦"},
    {"code": "TZ", "name": "Tanzania", "flag": "🇹🇿"},
    {"code": "UG", "name": "Uganda", "flag": "🇺🇬"},
    {"code": "ET", "name": "Ethiopia", "flag": "🇪🇹"},
    {"code": "SN", "name": "Senegal", "flag": "🇸🇳"},
    {"code": "CM", "name": "Cameroon", "flag": "🇨🇲"},
    {"code": "CI", "name": "Côte d'Ivoire", "flag": "🇨🇮"},
]

# Fallback stations when API is unavailable
FALLBACK_STATIONS = [
    {
        "id": "fallback-1", "name": "Cool FM Lagos",
        "url": "https://stream.coolfm.ng/live", "url_resolved": "https://stream.coolfm.ng/live",
        "country": "Nigeria", "countrycode": "NG",
        "language": "English", "tags": "pop,music",
        "votes": 1000, "bitrate": 128, "codec": "MP3", "favicon": ""
    },
    {
        "id": "fallback-2", "name": "Wazobia FM",
        "url": "https://stream.wazobiafm.com/live", "url_resolved": "https://stream.wazobiafm.com/live",
        "country": "Nigeria", "countrycode": "NG",
        "language": "Pidgin", "tags": "talk,entertainment",
        "votes": 800, "bitrate": 128, "codec": "MP3", "favicon": ""
    },
    {
        "id": "fallback-3", "name": "Metro FM South Africa",
        "url": "https://stream.metrofm.co.za/live", "url_resolved": "https://stream.metrofm.co.za/live",
        "country": "South Africa", "countrycode": "ZA",
        "language": "English", "tags": "urban,hits",
        "votes": 600, "bitrate": 128, "codec": "MP3", "favicon": ""
    },
]


def get_countries() -> List[Dict]:
    """Get list of African countries with radio stations"""
    return AFRICAN_COUNTRIES


async def get_stations(
    country: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 20
) -> List[Dict]:
    """Get radio stations from Radio Browser API"""
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            params = {
                "limit": limit,
                "hidebroken": "true",
                "order": "votes",
                "reverse": "true"
            }
            
            if search:
                url = f"{RADIO_BROWSER_API}/json/stations/byname/{search}"
            elif country:
                url = f"{RADIO_BROWSER_API}/json/stations/bycountrycodeexact/{country}"
            else:
                url = f"{RADIO_BROWSER_API}/json/stations/search"
                params["countrycodeList"] = "NG,GH,KE,ZA,EG,MA,TZ,UG,ET,SN,CI,CM,AO,ZW"
            
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            stations = []
            for item in data[:limit]:
                stations.append({
                    "id": item.get("stationuuid", ""),
                    "name": item.get("name", "Unknown Station"),
                    "url": item.get("url", ""),
                    "url_resolved": item.get("url_resolved", item.get("url", "")),
                    "country": item.get("country", ""),
                    "countrycode": item.get("countrycode", ""),
                    "state": item.get("state", ""),
                    "language": item.get("language", ""),
                    "tags": item.get("tags", ""),
                    "votes": item.get("votes", 0),
                    "codec": item.get("codec", ""),
                    "bitrate": item.get("bitrate", 0),
                    "favicon": item.get("favicon", "")
                })
            
            return stations
    except httpx.TimeoutException:
        print("Radio API timeout - using fallback stations")
        return _filter_fallback_stations(country, limit)
    except Exception as e:
        print(f"Radio API error: {e}")
        return _filter_fallback_stations(country, limit)


def _filter_fallback_stations(country: Optional[str], limit: int) -> List[Dict]:
    """Filter fallback stations by country"""
    if country:
        filtered = [s for s in FALLBACK_STATIONS if s["countrycode"] == country]
        return filtered[:limit] if filtered else FALLBACK_STATIONS[:limit]
    return FALLBACK_STATIONS[:limit]
