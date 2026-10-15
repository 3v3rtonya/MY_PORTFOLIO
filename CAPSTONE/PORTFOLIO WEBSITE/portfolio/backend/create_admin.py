import os, sys
sys.path.insert(0, '/app')

from app.database import SessionLocal
from app.models.orm import AdminUser
from app.core.security import hash_password

email = "ever.anyirow@gmail.com"
username = "everton"
password = "Admin@Portfolio2026"

db = SessionLocal()
existing = db.query(AdminUser).filter(AdminUser.email == email).first()
if existing:
    print(f"Admin already exists: {email}")
else:
    admin = AdminUser(username=username, email=email, hashed_password=hash_password(password))
    db.add(admin)
    db.commit()
    print(f"Admin created: {email}")
db.close()
