import logging
import os

from fastapi import FastAPI, HTTPException, Request
from fastapi.exception_handlers import http_exception_handler
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.core.config import get_settings
from app.core.rate_limiter import limiter
from app.routers import admin as admin_router
from app.routers import auth as auth_router
from app.routers import contact as contact_router
from app.routers import cv as cv_router
from app.routers import health as health_router
from app.routers import projects as projects_router
from app.routers import settings as settings_router

logger = logging.getLogger(__name__)
settings = get_settings()

app = FastAPI(
    title="Everton Anyiro Portfolio API",
    description="Backend API for Everton Anyiro personal portfolio website",
    version="1.0.0",
)

# ── Rate limiter (register BEFORE generic handlers) ───────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

# ── Static files ──────────────────────────────────────────────────────────────
_static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
os.makedirs(_static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=_static_dir), name="static")

# ── Exception handlers ────────────────────────────────────────────────────────
# Let FastAPI handle HTTPException normally (401, 404, 422, etc.)
# Only catch truly unhandled exceptions as 500
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    if isinstance(exc, HTTPException):
        # Pass through to FastAPI default handler — never convert to 500
        return await http_exception_handler(request, exc)
    logger.error("Unhandled exception on %s: %s", request.url, exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "An unexpected error occurred"},
    )

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(health_router.router)
app.include_router(auth_router.router)
app.include_router(projects_router.router)
app.include_router(contact_router.router)
app.include_router(cv_router.router)
app.include_router(admin_router.router)
app.include_router(settings_router.router)


@app.get("/")
def root():
    return {"message": "Everton Anyiro Portfolio API is running", "version": "1.0.0"}