# PRD.md (Product Requirements Document)

**Project Name:** Narvo

**Tagline:** News That Speaks To You

**Status:** MVP Development

## 1.1 Executive Summary

Narvo is a voice-first news aggregator and summarizer designed for the African market. It solves information overload and literacy barriers by transforming text-based news into short, AI-generated audio summaries delivered in localized accents (Pidgin, Yoruba, Hausa, Igbo).

## 1.2 Target Audience

* **Primary:** Young mobile users in Nigeria (18-45).
* **Secondary:** Low-bandwidth users and the African diaspora.

## 1.3 Core Features (MVP)

* **Localized TTS:** Audio summaries in Pidgin, Yoruba, Hausa, Igbo, and English.
* **AI Summarization:** Condensing news into 1-minute "vibes" using GPT-4/Cohere.
* **Bento Grid Feed:** A visual interest-based organization of news cards.
* **Offline Mode:** Ability to download audio/text for consumption without data.
* **Interest Picker:** Onboarding flow to select topics like "Gist," "Politics," or "Sports".

## 1.4 Functional Requirements

* **Scraping Engine:** Must aggregate from RSS, YouTube, and Radio.
* **Audio Player:** Persistent bottom-bar player with speed controls.
* **PWA Functionality:** Must be installable with service workers for caching.
