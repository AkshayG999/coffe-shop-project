# FastAPI Backend

This replaces the legacy `api/*.php` endpoints with a FastAPI service that uses the existing SQLite database and `database/schema.sql`.

## Run locally

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

The Next.js frontend reads `NEXT_PUBLIC_PYTHON_API_URL` from `.env.local`, which is already set to `http://localhost:8000`.

## Main endpoints

- `GET /api/menu`
- `POST /api/menu`
- `PUT /api/menu/{id}`
- `DELETE /api/menu/{id}`
- `POST /api/auth/login`
- `POST /api/auth/signup`
- `POST /api/auth/logout`
- `POST /api/orders`
- `POST /api/contact`
- `GET /health`
