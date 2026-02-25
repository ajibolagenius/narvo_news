# AGENTS.md

## Cursor Cloud specific instructions

### Project Overview

Narvo is an audio-first news broadcast platform for African markets. It consists of:
- **Backend**: FastAPI (Python) on port 8001 (`/workspace/backend/`)
- **Frontend**: React (CRA) on port 3000 (`/workspace/frontend/`)
- **Database**: MongoDB on port 27017

### Starting Services

1. **MongoDB**: `mongod --dbpath /data/db --logpath /tmp/mongod.log --bind_ip 127.0.0.1 --port 27017 --fork`
2. **Backend**: `cd /workspace/backend && python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload`
3. **Frontend**: Requires Node.js 18 via nvm. `export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 18 && cd /workspace/frontend && BROWSER=none npm start`

### Key Caveats

- **Node.js version**: CRA v5 (`react-scripts@5.0.1`) is incompatible with Node.js v22+. Must use Node.js 18 (via `nvm use 18`). The nvm shell init must be sourced before running frontend commands.
- **`emergentintegrations` package**: This is a proprietary/custom package not available on PyPI. Install backend deps with `grep -v emergentintegrations requirements.txt | pip install -r /dev/stdin`. AI/TTS/translation features degrade gracefully without it; all imports are lazy (inside try/except in function bodies).
- **Supabase**: Authentication requires valid `SUPABASE_URL` and `SUPABASE_ANON_KEY`. With placeholder values the app runs in guest mode. Set real values as environment secrets for auth testing.
- **Frontend npm install**: Use `npm install --legacy-peer-deps` to avoid peer dependency conflicts with `react-scripts@5.0.1`.
- **Environment files**: `.env` files for both backend (`/workspace/backend/.env`) and frontend (`/workspace/frontend/.env`) are gitignored and must be created. Backend needs `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `MONGO_URL`, `DB_NAME`. Frontend needs `REACT_APP_BACKEND_URL`, `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`.

### Running Tests

- **Backend tests**: `cd /workspace/backend && REACT_APP_BACKEND_URL=http://localhost:8001 python3 -m pytest tests/ -v` (backend server must be running)
- **Backend lint**: `cd /workspace/backend && python3 -m flake8 server.py routes/ services/ --max-line-length=200`
- **Frontend lint**: `cd /workspace/frontend && npx eslint src/ --ext .js,.jsx --quiet`

### Known Pre-existing Test Failures

Some tests fail due to missing `emergentintegrations` (TTS/translation endpoints) and outdated test assertions for renamed voice profiles. These are not regressions.
