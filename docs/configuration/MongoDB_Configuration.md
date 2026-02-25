# MongoDB Configuration

Narvo uses **MongoDB** for persistent storage (bookmarks, user preferences, briefings, offline articles). This document describes required env vars, database and collections, indexes, and how to run MongoDB locally or use Atlas.

---

## 1. Environment Variables

Set these in the **backend** environment (e.g. `.env` in `backend/` or your deployment config):

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| **`MONGO_URL`** | Yes | — | Full MongoDB connection string. |
| **`DB_NAME`** | No | `narvo` | Database name. |

### Example values

**Local MongoDB (default port):**
```bash
MONGO_URL=mongodb://localhost:27017
DB_NAME=narvo
```

**Local with auth:**
```bash
MONGO_URL=mongodb://username:password@localhost:27017
DB_NAME=narvo
```

**MongoDB Atlas (cloud):**
```bash
MONGO_URL=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
DB_NAME=narvo
```

Replace `<user>`, `<password>`, and `<cluster>` with your Atlas credentials and cluster host. Do not commit real credentials; use `.env` (gitignored) or secrets in your host.

---

## 2. Database and Collections

- **Database:** `DB_NAME` (default `narvo`).
- **Collections used by the app:**

| Collection | Purpose | Used in |
|------------|---------|--------|
| **`bookmarks`** | User bookmarks/saved stories (per user). | `server.py`, `user_service.py` |
| **`user_preferences`** | User preferences (voice, region, interests, etc.). | `server.py`, `user_service.py` |
| **`briefings`** | Generated morning briefings (by date). | `server.py`, `briefing_service.py` |
| **`offline_articles`** | Articles saved for offline reading. | `offline_service.py` |

Indexes are created at app startup (see below). No manual creation is required if the backend has run at least once.

---

## 3. Indexes (Created by the Backend)

The backend creates these indexes on startup (in `server.py` and in the services that own each collection). Duplicate index creation exists in both `server.py` and `user_service.py`; a single place is preferred (see Improvement Recommendations).

| Collection | Index | Type | Purpose |
|------------|--------|------|---------|
| **bookmarks** | `(user_id, story_id)` | Unique | One bookmark per user per story. |
| **user_preferences** | `user_id` | Unique | One preferences document per user. |
| **briefings** | `date` | Unique | One briefing per date. |
| **offline_articles** | `story_id` | Unique | One stored article per story (e.g. per user/session depending on usage). |

---

## 4. Running MongoDB Locally

**Install MongoDB (macOS with Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

Default connection: `mongodb://localhost:27017`. Then set in `backend/.env`:
```bash
MONGO_URL=mongodb://localhost:27017
DB_NAME=narvo
```

**Docker (one-off):**
```bash
docker run -d -p 27017:27017 --name narvo-mongo mongo:latest
```
Use `MONGO_URL=mongodb://localhost:27017` as above.

---

## 5. MongoDB Atlas (Cloud)

1. Create an account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a cluster (e.g. M0 free tier).
3. Under **Database Access**, create a user (username + password).
4. Under **Network Access**, add your IP (or `0.0.0.0/0` for development only; restrict in production).
5. **Connect** → **Drivers** → copy the connection string. It looks like:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority`
6. Put it in `MONGO_URL`; URL-encode the password if it contains special characters.
7. Set `DB_NAME=narvo` (or another name; Atlas will create the DB on first write).

---

## 6. Checklist

- [ ] `MONGO_URL` set in backend environment (e.g. `backend/.env`).
- [ ] `DB_NAME` set or left as default `narvo`.
- [ ] MongoDB running locally or Atlas cluster reachable.
- [ ] Backend started at least once so indexes are created (or create them manually if needed).
- [ ] No real credentials in version control; use `.env` and `.gitignore`.

For a full list of backend env vars (Supabase, Emergent, etc.), see **`backend/.env.example`** (if present) or the PRD.
