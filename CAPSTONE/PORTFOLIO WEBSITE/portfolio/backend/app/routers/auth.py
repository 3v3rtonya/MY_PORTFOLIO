import logging
import re
import secrets
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.rate_limiter import limiter
from app.core.security import create_access_token, hash_password, verify_password
from app.database import get_db
from app.models.orm import AdminUser
from app.schemas.schemas import LoginRequest, TokenResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1", tags=["Auth"])

# ── Simple in-process brute-force guard ──────────────────────────────────────
_fail_counts: dict[str, int] = {}   # ip -> consecutive fail count

def _check_rate(ip: str) -> None:
    if _fail_counts.get(ip, 0) >= 5:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"error": "Too many failed attempts. Try again later."},
        )

def _record_fail(ip: str) -> None:
    _fail_counts[ip] = _fail_counts.get(ip, 0) + 1

def _clear_fail(ip: str) -> None:
    _fail_counts.pop(ip, None)

# ── One-time password reset tokens ───────────────────────────────────────────
_reset_tokens: dict[str, str] = {}   # token -> email


# ── Login ─────────────────────────────────────────────────────────────────────
@router.post("/auth/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(
    request: Request,
    body: LoginRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Login with email + password (min 6 chars, letters + numbers)."""
    ip = request.client.host if request.client else "unknown"
    _check_rate(ip)

    admin = db.query(AdminUser).filter(AdminUser.email == body.email).first()
    if admin is None or not verify_password(body.password, admin.hashed_password):
        _record_fail(ip)
        logger.warning("Failed login for email=%s ip=%s", body.email, ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "Invalid email or password"},
        )

    _clear_fail(ip)
    return TokenResponse(access_token=create_access_token(sub=admin.email))


# ── Forgot password ───────────────────────────────────────────────────────────
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/auth/forgot-password", status_code=200)
@limiter.limit("5/minute")
def forgot_password(request: Request, body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Generate a one-time reset token. Token is returned in the response (dev mode)."""
    admin = db.query(AdminUser).filter(AdminUser.email == body.email).first()
    if admin is None:
        # Always 200 to avoid user enumeration
        return {"message": "If that email is registered, a reset token has been generated.", "token": None}
    token = secrets.token_urlsafe(32)
    _reset_tokens[token] = admin.email
    logger.info("Password reset token generated for: %s", admin.email)
    return {
        "message": "Reset token generated.",
        "token": token,
    }


@router.post("/auth/reset-password", status_code=200)
@limiter.limit("5/minute")
def reset_password(request: Request, body: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using a valid one-time token."""
    if len(body.new_password) < 6:
        raise HTTPException(status_code=422, detail={"error": "Password must be at least 6 characters"})
    if not re.search(r"[A-Za-z]", body.new_password):
        raise HTTPException(status_code=422, detail={"error": "Password must contain at least one letter"})
    if not re.search(r"[0-9]", body.new_password):
        raise HTTPException(status_code=422, detail={"error": "Password must contain at least one number"})

    email = _reset_tokens.get(body.token)
    if not email:
        raise HTTPException(status_code=400, detail={"error": "Invalid or expired reset token"})

    admin = db.query(AdminUser).filter(AdminUser.email == email).first()
    if admin is None:
        raise HTTPException(status_code=404, detail={"error": "Admin not found"})

    admin.hashed_password = hash_password(body.new_password)
    db.commit()
    del _reset_tokens[body.token]
    logger.info("Password reset successfully for: %s", email)
    return {"message": "Password reset successfully. You can now log in with your new password."}
