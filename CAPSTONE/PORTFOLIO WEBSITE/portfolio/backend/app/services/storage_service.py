"""
storage_service.py
──────────────────
Unified file storage abstraction.

• When R2_BUCKET_NAME + R2_ACCOUNT_ID + R2_ACCESS_KEY_ID + R2_SECRET_ACCESS_KEY
  are all present in the environment, files are stored in Cloudflare R2 and
  public URLs are returned as  https://<R2_PUBLIC_URL>/<key>.

• When any of those vars are missing (local dev), files fall back to the local
  `static/` directory and URLs are served as  /static/<key>.

Public API
──────────
  upload(key: str, data: bytes, content_type: str) -> str   # returns public URL
  delete(key: str) -> None
  public_url(key: str) -> str
"""

import io
import logging
import os

logger = logging.getLogger(__name__)

# ── Resolve configuration once at import time ─────────────────────────────────
_BUCKET        = os.getenv("R2_BUCKET_NAME", "")
_ACCOUNT_ID    = os.getenv("R2_ACCOUNT_ID", "")
_ACCESS_KEY    = os.getenv("R2_ACCESS_KEY_ID", "")
_SECRET_KEY    = os.getenv("R2_SECRET_ACCESS_KEY", "")
_PUBLIC_URL    = os.getenv("R2_PUBLIC_URL", "").rstrip("/")   # e.g. https://pub-xxx.r2.dev

_USE_R2 = all([_BUCKET, _ACCOUNT_ID, _ACCESS_KEY, _SECRET_KEY])

_s3 = None
if _USE_R2:
    try:
        import boto3
        from botocore.config import Config as BotocoreConfig
        _s3 = boto3.client(
            "s3",
            endpoint_url=f"https://{_ACCOUNT_ID}.r2.cloudflarestorage.com",
            aws_access_key_id=_ACCESS_KEY,
            aws_secret_access_key=_SECRET_KEY,
            config=BotocoreConfig(signature_version="s3v4"),
            region_name="auto",
        )
        logger.info("Storage: Cloudflare R2 bucket '%s'", _BUCKET)
    except ImportError:
        logger.warning("boto3 not installed — falling back to local storage")
        _USE_R2 = False

if not _USE_R2:
    logger.info("Storage: local filesystem (static/)")

# ── Local static dir ──────────────────────────────────────────────────────────
_STATIC_ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "static")


# ── Public API ────────────────────────────────────────────────────────────────

def upload(key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
    """
    Store `data` under `key` and return a public URL.

    key examples:
        "projects/project_3_a1b2c3d4.jpg"
        "igs/thumb_5_e5f6a7b8.png"
        "profile/back_0.webp"
        "Everton_Anyiro_CV.pdf"
    """
    if _USE_R2 and _s3:
        _s3.put_object(
            Bucket=_BUCKET,
            Key=key,
            Body=data,
            ContentType=content_type,
        )
        return public_url(key)
    else:
        # Local fallback
        dest = os.path.join(_STATIC_ROOT, key)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, "wb") as fh:
            fh.write(data)
        return f"/static/{key}"


def delete(key: str) -> None:
    """Remove a file by key. Silently ignores missing files."""
    if _USE_R2 and _s3:
        try:
            _s3.delete_object(Bucket=_BUCKET, Key=key)
        except Exception as exc:
            logger.warning("R2 delete failed for key '%s': %s", key, exc)
    else:
        local = os.path.join(_STATIC_ROOT, key)
        if os.path.isfile(local):
            os.remove(local)


def public_url(key: str) -> str:
    """Return the public URL for a stored key."""
    if _USE_R2 and _PUBLIC_URL:
        return f"{_PUBLIC_URL}/{key}"
    return f"/static/{key}"


def key_from_url(url: str) -> str:
    """
    Extract the storage key from a URL returned by `upload()`.

    /static/projects/foo.jpg  →  projects/foo.jpg
    https://pub.r2.dev/projects/foo.jpg  →  projects/foo.jpg
    """
    if url.startswith("/static/"):
        return url[len("/static/"):]
    if _PUBLIC_URL and url.startswith(_PUBLIC_URL):
        return url[len(_PUBLIC_URL):].lstrip("/")
    # Fallback: take everything after the last known prefix
    for prefix in ("/static/", "static/"):
        idx = url.find(prefix)
        if idx != -1:
            return url[idx + len(prefix):]
    return url.lstrip("/")
