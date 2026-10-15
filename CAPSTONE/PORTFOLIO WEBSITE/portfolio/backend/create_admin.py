import os, sys
sys.path.insert(0, '/app')

from app.database import SessionLocal
from app.models.orm import Admin
from app.core.security import hash_password

email = "ever.anyirow@gmail.com"
password = "Admin@Portfolio2026"

db = SessionLocal()
existing = db.query(Admin).filter(Admin.email == email).first()
if existing:
    print(f"Admin already exists: {email}")
else:
    admin = Admin(email=email, hashed_password=hash_password(password))
    db.add(admin)
    db.commit()
    print(f"Admin created: {email}")
db.close()
