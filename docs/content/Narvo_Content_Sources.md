# Narvo Content Sources

A detailed breakdown of content sources for the Narvo platform, categorized by their role in the narrative-building engine.

*Implementation note: Fact-check integration currently uses Google Fact Check API; TTS uses Emergent/OpenAI path. Dubawa and ElevenLabs are referenced as partners or future integrations.*

## 1. Primary Media Sources (Direct Scraping)
These sources provide the raw visual and textual content for Narvo's broadcasts.

### Websites & Newspapers
| Source | Link | Scraping Method/Tech Stack |
| :--- | :--- | :--- |
| **Local (Nigeria)** | | |
| BBC Hausa | [bbchausa.com](https://www.bbc.com/hausa) | RSS Parser, Playwright |
| Channels TV | [channelstv.com](https://www.channelstv.com) | RSS Parser, Playwright |
| Daily Trust | [dailytrust.com](https://dailytrust.com) | RSS Parser, Playwright |
| Vanguard | [vanguardngr.com](https://www.vanguardngr.com) | RSS Parser, Playwright |
| Guardian Nigeria | [guardian.ng](https://guardian.ng) | RSS Parser, Playwright |
| Punch Nigeria | [punchng.com](https://punchng.com) | RSS Parser, Playwright |
| Premium Times | [premiumtimesng.com](https://premiumtimesng.com) | RSS Parser, Playwright |
| Sahara Reporters | [saharareporters.com](https://saharareporters.com) | RSS Parser, Playwright |
| Nairametrics | [nairametrics.com](https://nairametrics.com) | RSS Parser, Playwright |
| ThisDay Newspapers | [thisdaylive.com](https://www.thisdaylive.com) | RSS Parser, Playwright |
| Nigerian Tribune | [tribuneonlineng.com](https://tribuneonlineng.com) | RSS Parser, Playwright |
| Leadership Newspaper | [leadership.ng](https://leadership.ng) | RSS Parser, Playwright |
| Business Day Nigeria | [businessday.ng](https://businessday.ng) | RSS Parser, Playwright |
| Naija News | [naijanews.com](https://naijanews.com) | RSS Parser, Playwright |
| Pulse Nigeria | [pulse.ng](https://pulse.ng) | RSS Parser, Playwright |
| Techpoint Africa | [techpoint.africa](https://techpoint.africa) | RSS Parser, Playwright |
| Ripples Nigeria | [ripplesnigeria.com](https://ripplesnigeria.com) | RSS Parser, Playwright |
| **International** | | |
| BBC International | [bbc.com](https://www.bbc.com) | RSS Parser, Playwright |
| CNN | [cnn.com](https://edition.cnn.com) | RSS Parser, Playwright |
| Al Jazeera | [aljazeera.com](https://www.aljazeera.com) | RSS Parser, Playwright |
| Reuters | [reuters.com](https://www.reuters.com) | RSS Parser, Playwright |
| ESPN | [espn.com](https://www.espn.com) | RSS Parser, Playwright |
| Sky Sports | [skysports.com](https://www.skysports.com) | RSS Parser, Playwright |
| Goal.com | [goal.com](https://www.goal.com) | RSS Parser, Playwright |

### Broadcast & Video (TV/Radio)
| Source | Type | Link | Processing Stack |
| :--- | :--- | :--- | :--- |
| **TV Stations** | | | |
| Channels TV | Local | [channelstv.com](https://www.channelstv.com) | YouTube API, Whisper (STT), ffmpeg |
| TVC News | Local | [tvcnews.tv](https://www.tvcnews.tv) | YouTube API, Whisper (STT), ffmpeg |
| Arise News | Local | [arise.tv](https://www.arise.tv) | YouTube API, Whisper (STT), ffmpeg |
| NTA | Local | [nta.ng](https://www.nta.ng) | YouTube API, Whisper (STT), ffmpeg |
| AIT | Local | [ait.live](https://www.ait.live) | YouTube API, Whisper (STT), ffmpeg |
| Silverbird TV | Local | [silverbirdtv.com](https://silverbirdtv.com) | YouTube API, Whisper (STT), ffmpeg |
| Galaxy Television | Local | [galaxytvonline.com](https://www.galaxytvonline.com) | YouTube API, Whisper (STT), ffmpeg |
| CNN | Intl | [edition.cnn.com](https://edition.cnn.com) | YouTube API, Whisper (STT), ffmpeg |
| BBC News | Intl | [bbc.com/news](https://www.bbc.com/news) | YouTube API, Whisper (STT), ffmpeg |
| Sky News | Intl | [news.sky.com](https://news.sky.com) | YouTube API, Whisper (STT), ffmpeg |
| **Radio Stations** | | | |
| Radio Nigeria | Local | [radionigeria.gov.ng](https://radionigeria.gov.ng) | Live Stream, Whisper (STT), ffmpeg |
| Cool FM | Local | [coolfm.ng](https://www.coolfm.ng) | Live Stream, Whisper (STT), ffmpeg |
| Wazobia FM | Local | [wazobiafm.com](https://www.wazobiafm.com) | Live Stream, Whisper (STT), ffmpeg |
| Nigeria Info FM | Local | [nigeriainfo.fm](https://www.nigeriainfo.fm) | Live Stream, Whisper (STT), ffmpeg |
| Beat FM | Local | [thebeat99.com](https://thebeat99.com) | Live Stream, Whisper (STT), ffmpeg |
| Raypower FM | Local | [raypower.fm](https://raypower.fm) | Live Stream, Whisper (STT), ffmpeg |
| Inspiration FM | Local | [ifm923.com](https://ifm923.com) | Live Stream, Whisper (STT), ffmpeg |
| Brila FM | Local | [brila.net](https://brila.net) | Live Stream, Whisper (STT), ffmpeg |
| Soundcity Radio | Local | [soundcity.tv](https://soundcity.tv) | Live Stream, Whisper (STT), ffmpeg |
| Lagos Talks 91.3 FM | Local | [lagostalks.com](https://www.lagostalks.com) | Live Stream, Whisper (STT), ffmpeg |
| BBC World Service | Intl | [bbc.co.uk](https://www.bbc.co.uk/worldserviceradio) | Live Stream, Whisper (STT), ffmpeg |
| NPR | Intl | [npr.org](https://www.npr.org) | Live Stream, Whisper (STT), ffmpeg |
| Voice of America | Intl | [voanews.com](https://www.voanews.com) | Live Stream, Whisper (STT), ffmpeg |
| Radio Garden | Global | [radio.garden](https://radio.garden) | Unofficial API, Whisper (STT), ffmpeg |

## 2. Institutional & Social Data Sources
Used for high-authority verification and real-time sentiment/trends.

| Source | Link | Scraping Method/Tech Stack |
| :--- | :--- | :--- |
| **Government** | | |
| Nigerian Govt Portals | [nigeria.gov.ng](https://www.nigeria.gov.ng) | Playwright, RSS Parser |
| Central Bank of Nigeria | [cbn.gov.ng](https://www.cbn.gov.ng) | Playwright, RSS Parser |
| Nigerian Bureau of Statistics | [nigerianstat.gov.ng](https://www.nigerianstat.gov.ng) | Playwright, RSS Parser |
| **Social Media** | | |
| Twitter (Verified) | [twitter.com](https://twitter.com) | Twitter API |
| LinkedIn | [linkedin.com](https://www.linkedin.com) | LinkedIn API, Playwright |

## 3. Programmatic News Aggregators
API-driven services for rapid narrative building across thousands of sources.

| API | Website | Core Features |
| :--- | :--- | :--- |
| **Mediastack** | [mediastack.com](https://mediastack.com) | REST API, Nigeria country filtering |
| **NewsData.io** | [newsdata.io](https://newsdata.io) | Global and local news monitoring |
| **ScrapingBee** | [scrapingbee.com](https://www.scrapingbee.com) | Dynamic scraping with JS rendering |
| **Apify** | [apify.com](https://apify.com) | Specialized African News Aggregators |

## 4. Verification & Fact-Checking APIs
Automated "Truth" sources to cross-reference claims before broadcasting.

| Provider | Link | Capability |
| :--- | :--- | :--- |
| **Google Fact Check** | [Google API](https://developers.google.com/fact-check/tools/api) | ClaimSearch API, ClaimReview Schema |
| **ClaimBuster** | [ClaimBuster](https://claimbuster.cs.uta.edu/api/) | AI-powered claim-worthiness detection |
| **MyAIFactChecker** | [MyAIFactChecker](https://myaifactchecker.org) | Africa-focused AI verification |
| **Dubawa** | [Dubawa](https://dubawa.org) | Local authority fact-checking data |

## 5. Architectural Standards
Standardized protocols for AI tool orchestration and data exchange.

| Standard | Description | Relevance to Narvo |
| :--- | :--- | :--- |
| **Model Context Protocol (MCP)** | Open standard for connecting AI tools to data sources. | Foundational standard for AI-driven news gathering. |
