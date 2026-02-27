# MongoDB Atlas Setup Guide

Step-by-step guide to set up **MongoDB Atlas** for the Narvo backend (production or development). The backend uses MongoDB for bookmarks, user preferences, briefings, and offline articles.

---

## 1. Create an Atlas account

1. Go to **[mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)**.
2. Click **Try Free** and sign up (email or Google/GitHub).
3. Complete registration and log in.

---

## 2. Create a cluster

1. After login you’re in the **Atlas dashboard**. Click **Build a Database** (or **Create** → **Create a Cluster**).
2. Choose **M0 FREE** (shared, 512 MB). No credit card for free tier.
3. **Cloud Provider & Region:** Pick a region close to your app (e.g. **AWS** → **eu-west-1** or **us-east-1**). Free tier has limited region options.
4. **Cluster Name:** e.g. `Cluster0` (default) or `narvo-cluster`.
5. Click **Create Cluster**. Wait 1–3 minutes for the cluster to be ready.

---

## 3. Create a database user

The app will connect with a username and password (not your Atlas login).

1. In the cluster view, go to **Security** → **Database Access** (or use the quick **Create Database User** prompt if shown).
2. Click **Add New Database User**.
3. **Authentication Method:** Password.
4. **Username:** e.g. `narvo-app` (remember it).
5. **Password:** Click **Autogenerate Secure Password** and **copy it** (you won’t see it again), or set your own. If the password has special characters (e.g. `#`, `@`, `%`), you’ll need to URL-encode it in the connection string later.
6. **Database User Privileges:** **Atlas admin** (simplest) or **Read and write to any database** (custom role). For production, prefer a user with access only to the `narvo` database.
7. Click **Add User**.

---

## 4. Allow network access

Atlas only accepts connections from IP addresses you allow.

1. Go to **Security** → **Network Access**.
2. Click **Add IP Address**.
3. **Development:** Click **Allow Access from Anywhere**. This adds `0.0.0.0/0` (all IPs). Use only for dev/testing.
4. **Production:** Add your server’s IP(s) or a CIDR range. Avoid `0.0.0.0/0` in production.
5. Confirm with **Confirm**.

---

## 5. Get the connection string

**Which connection method?** In Atlas, when you click **Connect**, use **Drivers** (labeled “Connect your application”). Do **not** use Compass, Shell, or VS Code for the backend—those are for other tools. The Drivers flow gives you the URI that PyMongo uses.

1. In the Atlas UI, open your **cluster**.
2. Click **Connect**.
3. Choose **Drivers** (or **Connect your application**).
4. **Driver:** Python. **Version:** 3.12 or later (or your runtime).
5. Copy the connection string. It looks like:
   ```text
   mongodb+srv://narvo-app:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace **`<password>`** with the database user password from step 3. If the password contains special characters, URL-encode them (e.g. `#` → `%23`, `@` → `%40`).

Optional: add the database name in the URI so you don’t rely only on `DB_NAME`:

```text
mongodb+srv://narvo-app:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/narvo?retryWrites=true&w=majority
```

---

## 6. Configure the Narvo backend

1. Open **`backend/.env`** (create from `backend/.env.example` if needed).
2. Set MongoDB variables:

```bash
# MongoDB Atlas
MONGO_URL=mongodb+srv://narvo-app:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/narvo?retryWrites=true&w=majority
DB_NAME=narvo
```

- Replace `YOUR_PASSWORD` with the real password (URL-encoded if necessary).
- Replace `cluster0.xxxxx.mongodb.net` with your cluster host from the Atlas connection string.
- Replace `narvo-app` if you used a different username.

3. Save `.env`. Ensure **`.env` is in `.gitignore`** and never commit it.

---

## 7. Verify the connection

1. Start the backend from the project root:
   ```bash
   cd backend
   source .venv/bin/activate   # or: .venv\Scripts\activate on Windows
   python server.py
   ```
2. If Atlas is reachable and the user has access, the server starts and indexes are created. You may see a short message if index creation was skipped earlier (e.g. when MongoDB was down).
3. Trigger an endpoint that uses MongoDB (e.g. save a bookmark or open the dashboard). If those work, Atlas is set up correctly.

---

## 8. Optional: Restrict user to one database (production)

For production, create a database user that can only read/write the `narvo` database:

1. **Database Access** → **Add New Database User**.
2. Set username and password.
3. **Database User Privileges** → **Add Built-in Role** → choose **Read and write to any database** and restrict to database `narvo`, or create a custom role with `find`, `insert`, `update`, `delete`, etc. on the `narvo` database only.
4. Use this user’s credentials in `MONGO_URL` for the backend.

---

## Checklist

- [ ] Atlas account created.
- [ ] M0 (or higher) cluster created and running.
- [ ] Database user created; password saved (and URL-encoded in URI if needed).
- [ ] Network Access: IP(s) added (or “Allow from anywhere” for dev only).
- [ ] Connection string copied and `<password>` replaced.
- [ ] `backend/.env` has `MONGO_URL` and `DB_NAME=narvo`.
- [ ] `.env` is gitignored; no real credentials in repo.
- [ ] Backend starts and MongoDB-dependent routes work.

For env vars and collection/index reference, see **[MongoDB_Configuration.md](./MongoDB_Configuration.md)**.

---

## Troubleshooting: SSL handshake failed (TLSV1_ALERT_INTERNAL_ERROR)

If the backend logs **SSL handshake failed** or **tlsv1 alert internal error** when connecting to Atlas, it is often due to Python 3.14 (or a very new OpenSSL) and Atlas TLS negotiation.

**Options:**

1. **Dev-only workaround (recommended if you don’t have Python 3.11/3.12):** Append `&tlsAllowInvalidCertificates=true` to `MONGO_URL` in `backend/.env`. No reinstall or new venv needed.
2. **Use Python 3.11, 3.12, or 3.13** for the backend if installed (e.g. `python3.13 -m venv .venv` then activate and `pip install -r requirements.txt`). Atlas is known to work with these versions. Skip if you don’t have them or hit `resolution-too-deep` on install. Example:
   ```bash
   MONGO_URL=mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/narvo?retryWrites=true&w=majority&tlsAllowInvalidCertificates=true
   ```
   Do **not** use this in production; it disables certificate verification.
3. Ensure **Network Access** in Atlas allows your IP (or “Allow from anywhere” for dev).
4. Ensure the database user password in the URI is correct and URL-encoded if it contains `#`, `@`, `%`, etc.
