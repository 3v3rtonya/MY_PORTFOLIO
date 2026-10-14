from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from app.core.security import decode_token
from app.database import get_db
from app.models.orm import AdminUser

_bearer = HTTPBearer(auto_error=True)


def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    db: Session = Depends(get_db),
) -> str:
    """Validate Bearer JWT and return admin email. Raises 401 for any invalid token."""
    token = credentials.credentials
    payload = decode_token(token)           # raises 401 on any JWT error
    email: str | None = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # Confirm admin still exists in DB
    admin = db.query(AdminUser).filter(AdminUser.email == email).first()
    if admin is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin account not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return email