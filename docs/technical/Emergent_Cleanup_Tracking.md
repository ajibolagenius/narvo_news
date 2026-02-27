# Emergent Platform Cleanup – Tracking

This project was initialized on the [Emergent AI platform](https://emergent.sh/). This document tracks the work to make the repo **standalone**: remove or replace Emergent-specific pieces and delete redundant files.

**Last updated:** 2026-02-27

---

## 1. Remove (Emergent-only)


| Status | Location                                    | What                                                    | Notes                                     |
| ------ | ------------------------------------------- | ------------------------------------------------------- | ----------------------------------------- |
| [x]    | `.emergent/`                                | Folder: `emergent.yml`, `summary.txt`                   | Platform metadata; not needed at runtime. |
| [x]    | `frontend/src/pages/ToolsPage.js` (line 58) | Tool: "Emergent Platform" → `https://emergentagent.com` | Replaced with Vercel.                     |


---

## 2. Replace (Standalone implementation)

### 2.1 Dependencies


| Status | File                       | Current                       | Replace with                                       |
| ------ | -------------------------- | ----------------------------- | -------------------------------------------------- |
| [x]    | `backend/requirements.txt` | `emergentintegrations==0.1.0` | Removed. Using `google-generativeai` and `openai`. |


### 2.2 Environment variables


| Status | Current            | Replace with                                                                      |
| ------ | ------------------ | --------------------------------------------------------------------------------- |
| [x]    | `EMERGENT_LLM_KEY` | `GEMINI_API_KEY` and `OPENAI_API_KEY` in `backend/.env.example` and all services. |


**Files updated:** `backend/server.py`, `backend/services/narrative_service.py`, `backend/services/tts_service.py`, `backend/services/translation_service.py`, `backend/services/briefing_service.py`, `backend/services/recommendation_service.py`, `backend/services/yarngpt_service.py`, `backend/.env.example`. New: `backend/services/llm_gemini.py` (shared Gemini client).

### 2.3 Code: Replace `emergentintegrations` usage


| Status | File                                         | Usage to replace                                                                                               |
| ------ | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [x]    | `backend/server.py`                          | Uses `services.narrative_service.generate_narrative` and `services.briefing_service.generate_briefing_script`. |
| [x]    | `backend/services/narrative_service.py`      | Uses `llm_gemini.generate_gemini`.                                                                             |
| [x]    | `backend/services/tts_service.py`            | Uses `OPENAI_API_KEY` and `openai.AsyncOpenAI` for TTS.                                                        |
| [x]    | `backend/services/translation_service.py`    | Uses `llm_gemini.generate_gemini`.                                                                             |
| [x]    | `backend/services/briefing_service.py`       | Uses `llm_gemini.generate_gemini`.                                                                             |
| [x]    | `backend/services/recommendation_service.py` | Uses `llm_gemini.generate_gemini`, `GEMINI_API_KEY`.                                                           |
| [x]    | `backend/services/yarngpt_service.py`        | Uses `OPENAI_API_KEY` and `openai.AsyncOpenAI` for fallback TTS.                                               |


---

## 3. Keep but update (references only)

### 3.1 Default / example backend URL


| Status | File(s)                                       | Action                                                  |
| ------ | --------------------------------------------- | ------------------------------------------------------- |
| [x]    | `backend_test.py` (root)                      | Deleted (redundant with `backend/tests/`).              |
| [x]    | `backend/tests/test_*.py` (14 files)          | Default `BASE_URL`/`API_URL` → `http://localhost:8000`. |
| [x]    | `frontend/src/email-templates/SETUP_GUIDE.md` | Site URL / Redirect URLs → placeholder text.            |
| [x]    | `docs/configuration/MongoDB_Configuration.md` | Env list wording updated.                               |


### 3.2 Documentation wording


| Status | File                                                  | Change                                |
| ------ | ----------------------------------------------------- | ------------------------------------- |
| [x]    | `docs/content/Narvo_Content_Strategy.md`              | “Emergent/OpenAI” → “OpenAI/YarnGPT”. |
| [x]    | `docs/content/Narvo_Content_Sources.md`               | Same.                                 |
| [x]    | `docs/technical/Narvo_Improvement_Recommendations.md` | Env example updated.                  |
| [x]    | `docs/technical/Narvo_Technical_Documentation.md`     | “Emergent LLM” → “Gemini” / “OpenAI”. |
| [x]    | `docs/business/Narvo_Pitch_Deck.md`                   | Same.                                 |
| [x]    | `docs/business/Narvo_News_as_a_Service.md`            | Same.                                 |
| [x]    | `docs/business/Narvo_Subscription_Tiers.md`           | Same.                                 |
| [x]    | `docs/business/Narvo_Monetisation.md`                 | Same.                                 |
| [x]    | `docs/business/Narvo_Project_Documentation.md`        | Same.                                 |
| [x]    | `docs/Narvo_Overview.md`                              | Same.                                 |
| [x]    | `backend/.env.example`                                | `GEMINI_API_KEY`, `OPENAI_API_KEY`.   |


---

## 4. Redundant files (safe to delete)


| Status | Item                           | Reason                                                                                          |
| ------ | ------------------------------ | ----------------------------------------------------------------------------------------------- |
| [x]    | `**.emergent/`**               | Removed.                                                                                        |
| [x]    | `**backend_test.py**` (root)   | Deleted; use `backend/tests/`.                                                                  |
| [ ]    | `**test_reports/**` (optional) | Iteration JSON and pytest XML. Add `test_reports/` to `.gitignore` if you don’t want to commit. |


---

## 5. Done log (optional)


| Date       | Section / Item        | Done                                                                                                                                                                                                                 |
| ---------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-02-27 | Full Emergent cleanup | Replaced emergentintegrations with Gemini (google-generativeai) and OpenAI TTS (openai SDK). Removed .emergent, backend_test.py. Updated env to GEMINI_API_KEY + OPENAI_API_KEY. All docs and test defaults updated. |


---

## Quick reference: files that mention Emergent/emergentintegrations

- **Config / env:** `backend/.env.example` (now uses GEMINI_API_KEY, OPENAI_API_KEY)
- **Backend:** `backend/server.py`, `backend/services/llm_gemini.py`, `backend/services/narrative_service.py`, `backend/services/tts_service.py`, `backend/services/translation_service.py`, `backend/services/briefing_service.py`, `backend/services/recommendation_service.py`, `backend/services/yarngpt_service.py`
- **Backend tests:** `backend/tests/test_*.py` (default URL `http://localhost:8000`)
- **Frontend:** `frontend/src/pages/ToolsPage.js` (Vercel), `frontend/src/email-templates/SETUP_GUIDE.md`
- **Docs:** Updated to Gemini/OpenAI wording.

