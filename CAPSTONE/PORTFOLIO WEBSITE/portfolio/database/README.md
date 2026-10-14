# Portfolio Database — Alembic Migrations

This directory contains all database migrations and seeding scripts for the portfolio system.

## Structure

```
database/
├── alembic/
│   ├── env.py           # Alembic environment config (reads DATABASE_URL from env)
│   └── versions/        # Migration files
├── alembic.ini          # Alembic configuration
└── create_admin.py      # Admin user seeding script
```

## Running Migrations

```bash
# From the portfolio/database/ directory:
# Apply all migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Check current migration state
alembic current

# Show migration history
alembic history
```

## Creating a New Migration

```bash
alembic revision --autogenerate -m "description of change"
```

## Seeding Admin User

```bash
python create_admin.py --username admin --password your-secure-password
```

## Environment

Requires `DATABASE_URL` environment variable to be set. Either export it or create a `.env` file in `portfolio/backend/` and run from there.
