"""
Admin user seeding/creation script.

Usage (from the portfolio/database/ directory, with backend venv active):

    python create_admin.py --email your@email.com --password YourPass1

Requirements:
  - Password: at least 6 characters, must contain letters AND numbers
  - EMAIL is used to log in (not username)
"""
import argparse
import os
import re
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
_BACKEND = os.path.normpath(os.path.join(_HERE, "..", "backend"))
sys.path.insert(0, _BACKEND)

# Set required env vars before importing app modules
os.environ.setdefault("DATABASE_URL", "postgresql://postgres:1234@localhost:5432/portfolio")
os.environ.setdefault("JWT_SECRET_KEY", "everton-portfolio-secret-key-2024-dekut-bbit")
os.environ.setdefault("ALLOWED_ORIGINS", "http://localhost:5173")
os.environ.setdefault("CV_FILE_PATH", "./static/Everton_Anyiro_CV.pdf")

import bcrypt
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.orm import AdminUser


def validate_password(password: str) -> str | None:
    if len(password) < 6:
        return "Password must be at least 6 characters"
    if not re.search(r"[A-Za-z]", password):
        return "Password must contain at least one letter"
    if not re.search(r"[0-9]", password):
        return "Password must contain at least one number"
    return None


def create_admin(email: str, password: str, username: str = "admin") -> None:
    db_url = os.environ["DATABASE_URL"].strip().replace("postgresql+asyncpg://", "postgresql://")
    engine = create_engine(db_url, echo=False)
    Session = sessionmaker(bind=engine)

    with Session() as db:
        existing = db.query(AdminUser).filter(AdminUser.email == email).first()
        if existing:
            print(f"ERROR: Admin with email '{email}' already exists.", file=sys.stderr)
            sys.exit(1)

        hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode()
        admin = AdminUser(username=username, email=email, hashed_password=hashed)
        db.add(admin)
        db.commit()
        print(f"Admin created successfully.")
        print(f"  Email   : {email}")
        print(f"  Username: {username}")
        print(f"  Login at: http://localhost:5173/admin-xk92")


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a portfolio admin user.")
    parser.add_argument("--email",    required=True,  help="Admin email address (used for login)")
    parser.add_argument("--password", required=True,  help="Admin password (min 6 chars, letters + numbers)")
    parser.add_argument("--username", default="admin", help="Admin username (default: admin)")
    args = parser.parse_args()

    err = validate_password(args.password)
    if err:
        print(f"ERROR: {err}", file=sys.stderr)
        sys.exit(1)

    create_admin(args.email, args.password, args.username)


if __name__ == "__main__":
    main()