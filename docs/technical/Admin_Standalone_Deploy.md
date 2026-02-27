# Admin as Standalone App

The Administration UI is built from the same codebase as the user app but is deployed as a **standalone app** (separate URL, no user dashboard or landing page).

## Build

- **User app** (default): `npm run build` — landing, dashboard, all user routes. No admin routes or sidebar entry.
- **Admin app**: `npm run build:admin` — only auth and admin console routes. Root `/` redirects to `/admin/operations`.

## Deploy

1. **User app**: Deploy the default build to your main domain (e.g. `app.narvo.com`).
2. **Admin app**: Run `npm run build:admin` in `frontend/`, then deploy the resulting `build/` to your admin subdomain (e.g. `admin.narvo.com`).

Set the same `REACT_APP_BACKEND_URL` (and Supabase env vars) for both builds. For the admin build, `REACT_APP_APP_MODE=admin` is set by the script.

## Environment

- `REACT_APP_APP_MODE=admin` — Enables standalone admin app (only admin routes; no landing/dashboard).
- Omit or set to anything else for the user app.

On Windows, run the admin build as:
```bat
set REACT_APP_APP_MODE=admin && npm run build
```
or use `cross-env` if you add it to the project.
