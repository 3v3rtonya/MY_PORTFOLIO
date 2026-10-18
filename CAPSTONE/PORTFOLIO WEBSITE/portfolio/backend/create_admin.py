import os, sys
sys.path.insert(0, '/app')

from app.database import SessionLocal
from app.models.orm import AdminUser
from app.core.security import hash_password, verify_password

email = "ever.anyirow@gmail.com"
username = "everton"
password = "Admin@Portfolio2026"

db = SessionLocal()

# List all existing admins
admins = db.query(AdminUser).all()
print(f"Total admins in DB: {len(admins)}")
for a in admins:
    print(f"  ID={a.id} email={a.email} username={a.username}")

existing = db.query(AdminUser).filter(AdminUser.email == email).first()
if existing:
    print(f"\nAdmin found: {existing.email}")
    ok = verify_password(password, existing.hashed_password)
    print(f"Password check: {ok}")
    if not ok:
        existing.hashed_password = hash_password(password)
        db.commit()
        print("Password reset done.")
    else:
        print("Password is already correct — login should work.")
else:
    print(f"\nNo admin found — creating...")
    admin = AdminUser(username=username, email=email, hashed_password=hash_password(password))
    db.add(admin)
    db.commit()
    print(f"Admin created: {email}")

db.close()
