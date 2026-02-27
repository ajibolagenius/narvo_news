# MongoDB → Supabase Migration

One-time migration of app data from MongoDB to Supabase (Postgres). After this, the backend uses only Supabase for bookmarks, preferences, briefings, offline articles, listening history, push subscriptions, and TTS cache.

## 1. Run the schema in Supabase

In the **Supabase Dashboard** → **SQL Editor**, run the contents of `backend/supabase_schema.sql`. That creates tables and RLS policies. Backend uses the **service role** key so it can read/write without going through RLS.

## 2. Environment

- **Backend** `.env`: ensure `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are set. Remove `MONGO_URL` and `DB_NAME` after migration.
- Get **Service Role Key** from Supabase → Project Settings → API (use only on server, never in frontend).

## 3. Data migration (optional)

If you have existing MongoDB data to keep, export it from Mongo and insert it into Supabase (e.g., with a one-off script) before switching the app. Otherwise, start with empty tables.

## 4. What was migrated


| Mongo collection   | Supabase table       |
| ------------------ | -------------------- |
| bookmarks          | `bookmarks`          |
| user_preferences   | `user_preferences`   |
| briefings          | `briefings`          |
| offline_articles   | `offline_articles`   |
| listening_history  | `listening_history`  |
| push_subscriptions | `push_subscriptions` |
| tts_cache          | `tts_cache`          |


`news_cache` is no longer used; daily digest and metrics use in-memory/aggregator data instead.
