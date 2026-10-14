# Portfolio Backend — FastAPI

FastAPI backend for Everton Anyiro's personal portfolio website.

## Setup

```bash
# 1. Create and activate virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy and configure environment variables
cp .env.example .env
# Edit .env with your PostgreSQL credentials and JWT secret

# 4. Run database migrations (from project root)
cd ../database
alembic upgrade head

# 5. Seed admin user
python create_admin.py --username admin --password your-secure-password

# 6. Start development server
cd ../backend
uvicorn app.main:app --reload --port 8000
```

## Project Structure

```
backend/
├── app/
│   ├── main.py          # FastAPI app factory + middleware
│   ├── database.py      # Async DB session + Base
│   ├── routers/         # Route handlers
│   ├── models/          # SQLAlchemy ORM models
│   ├── schemas/         # Pydantic request/response schemas
│   ├── services/        # Business logic
│   └── core/            # Config, security, auth helpers
├── static/              # CV PDF served from here
├── tests/               # Unit, property, integration tests
└── requirements.txt
```

## API Documentation

When the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
