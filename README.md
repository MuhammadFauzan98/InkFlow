# PostPilot

PostPilot is a Flask-based storytelling platform where users can write, share, and explore stories. It supports local auth plus Google OAuth, dark mode, 3D animations, likes, comments, bookmarks, and admin controls.

## Features
- Write and publish stories with cover images and tags
- Browse featured, recent, and popular stories
- Like, comment, bookmark stories
- Google OAuth login (plus local auth)
- Dark mode toggle
- 3D animation layer for cards, buttons, and UI transitions
- Admin panel for managing users and blogs

## Tech Stack
- Backend: Flask, Flask-Login, Flask-SQLAlchemy
- Frontend: Jinja2 templates, custom CSS/JS (dark mode, animations)
- Auth: Email/password + Google OAuth (Authlib)
- DB: SQLite by default (configurable via `DATABASE_URL`)

## Setup
1) Clone and create venv
```powershell
cd C:\Users\Admin\Downloads
git clone https://github.com/MuhammadFauzan98/InkFlow.git
cd InkFlow
python -m venv .venv
& .venv\Scripts\Activate.ps1
```

2) Install dependencies
```powershell
pip install -r requirements.txt
```

3) Environment variables (.env)
Create a `.env` file (not committed). Example:
```
SECRET_KEY=change-me
DATABASE_URL=
SERVER_NAME=localhost:5000
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
# If you need to force a specific callback:
# GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
# For dev over HTTP:
# OAUTHLIB_INSECURE_TRANSPORT=1
```

4) Configure Google OAuth
- In Google Cloud Console, create OAuth Client (Web app).
- Authorized redirect URIs (add both):
  - http://localhost:5000/auth/google/callback
  - http://127.0.0.1:5000/auth/google/callback
- Authorized JavaScript origins (optional):
  - http://localhost:5000
  - http://127.0.0.1:5000
- Put the Client ID/Secret into `.env` (or use `/auth/google/config` UI in debug).

## Run
```powershell
& .venv\Scripts\Activate.ps1
python app.py
```
App runs on http://localhost:5000 by default.

## Useful Routes
- `/` – Home (featured)
- `/recent-stories` – Recent stories
- `/popular-stories` – Popular stories
- `/auth/login` – Login (Google + local)
- `/auth/register` – Register
- `/auth/google/config` – Paste Google keys (debug/local use)
- `/auth/google/debug` – Check OAuth registration status
- `/admin/panel` – Admin dashboard (for admins)

## Project Structure
```
app.py              # Entry
config.py           # Settings via env
requirements.txt
app/
  __init__.py       # App factory, OAuth setup
  auth.py           # Auth routes (local + Google)
  main.py           # Main site routes
  admin.py          # Admin routes
  api.py            # API endpoints (likes, etc.)
  models.py         # SQLAlchemy models
  utils.py          # Helpers (avatars, formatting)
  static/
    css/ (style.css, dark-mode.css, animations.css)
    js/  (main.js, dark-mode.js, 3d-effects.js)
    uploads/
  templates/
    base.html, index.html, auth/, blog/, admin/, user/
instance/
  google_oauth.json (optional; created via config UI, not tracked)
```

## Notes on Secrets
- `.env` is ignored by git; keep all secrets there.
- `.env.example` contains placeholders only.
- If you accidentally committed secrets, rotate them in Google Cloud and regenerate your SECRET_KEY.

## Testing
- Run the app and exercise login (local + Google), posting, likes/comments.
- For OAuth issues, check `/auth/google/debug` and console logs for `[OAuth]` messages.

## Deployment Tips
- Set `FLASK_ENV=production` (or remove debug) and provide a real SECRET_KEY.
- Use HTTPS in production and update Google OAuth redirect URIs accordingly.
- Set `SERVER_NAME` to your production host (e.g., `yourdomain.com`).

## License
MIT
