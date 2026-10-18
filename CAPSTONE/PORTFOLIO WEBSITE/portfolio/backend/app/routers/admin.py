import json
import logging
import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, Response, UploadFile, File, status
from sqlalchemy.orm import Session

from app.core.auth_dep import get_current_admin
from app.core.rate_limiter import limiter
from app.core.security import hash_password, verify_password
from app.database import get_db
from app.models.orm import AdminUser
from app.schemas.schemas import (
    ContactMessageResponse, CVDownloadLogResponse,
    MessageReadUpdate, ProjectCreate, ProjectResponse,
    ChangePasswordRequest, SocialLinksUpdate, SocialLinksResponse,
    NotificationResponse, NotificationReadUpdate, SiteSettingResponse,
)
from app.services import contact_service, cv_service, project_service, settings_service
from app.services import storage_service as storage

logger = logging.getLogger(__name__)
router = APIRouter(
    prefix="/api/v1/admin",
    tags=["Admin"],
    dependencies=[Depends(get_current_admin)],
)

# Legacy local path — only used for cv_status check when no R2
_STATIC_DIR  = os.path.join(os.path.dirname(__file__), "..", "..", "static")


# ── Projects ──────────────────────────────────────────────────────────────────

@router.get("/projects", response_model=List[ProjectResponse])
@limiter.limit("60/minute")
def admin_list_projects(request: Request, db: Session = Depends(get_db)) -> List[ProjectResponse]:
    """List all projects (admin view)."""
    return project_service.list_projects(db)

@router.post("/projects", response_model=ProjectResponse, status_code=201)
@limiter.limit("30/minute")
def admin_create_project(request: Request, body: ProjectCreate, db: Session = Depends(get_db)) -> ProjectResponse:
    """Create a new project."""
    try:
        return project_service.create_project(db, body)
    except Exception as exc:
        logger.error("Create project failed: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail={"error": "Database error"})

@router.put("/projects/{project_id}", response_model=ProjectResponse)
@limiter.limit("30/minute")
def admin_update_project(request: Request, project_id: int, body: ProjectCreate, db: Session = Depends(get_db)) -> ProjectResponse:
    """Update an existing project by ID."""
    try:
        updated = project_service.update_project(db, project_id, body)
    except Exception as exc:
        logger.error("Update project failed: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail={"error": "Database error"})
    if updated is None:
        raise HTTPException(status_code=404, detail={"error": "Project not found"})
    return updated

@router.delete("/projects/{project_id}", status_code=204)
@limiter.limit("30/minute")
def admin_delete_project(request: Request, project_id: int, db: Session = Depends(get_db)):
    """Delete a project by ID."""
    try:
        deleted = project_service.delete_project(db, project_id)
    except Exception as exc:
        logger.error("Delete project failed: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail={"error": "Database error"})
    if not deleted:
        raise HTTPException(status_code=404, detail={"error": "Project not found"})
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ── Project Image Upload ──────────────────────────────────────────────────────

@router.post("/projects/{project_id}/image", response_model=ProjectResponse)
@limiter.limit("30/minute")
def upload_project_image(
    request: Request,
    project_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> ProjectResponse:
    """Upload an image for a project. Replaces any existing image."""
    allowed = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=422, detail={"error": "Only JPEG, PNG, WebP or GIF images are accepted"})
    content = file.file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail={"error": "File too large (max 10 MB)"})

    project = project_service.get_project(db, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail={"error": "Project not found"})

    # Delete old image
    if project.image_url:
        storage.delete(storage.key_from_url(project.image_url))

    ext = (file.filename or "image.jpg").rsplit(".", 1)[-1].lower()
    key = f"projects/project_{project_id}_{uuid.uuid4().hex[:8]}.{ext}"
    url = storage.upload(key, content, file.content_type or "image/jpeg")

    project.image_url = url
    db.commit()
    db.refresh(project)
    return project


@router.delete("/projects/{project_id}/image", response_model=ProjectResponse)
@limiter.limit("30/minute")
def delete_project_image(request: Request, project_id: int, db: Session = Depends(get_db)) -> ProjectResponse:
    """Remove the image for a project."""
    project = project_service.get_project(db, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail={"error": "Project not found"})
    if project.image_url:
        storage.delete(storage.key_from_url(project.image_url))
    project.image_url = None
    db.commit()
    db.refresh(project)
    return project


# ── Messages ──────────────────────────────────────────────────────────────────

@router.get("/messages", response_model=List[ContactMessageResponse])
@limiter.limit("60/minute")
def admin_list_messages(request: Request, db: Session = Depends(get_db)) -> List[ContactMessageResponse]:
    """List all contact messages."""
    return contact_service.list_messages(db)

@router.patch("/messages/{message_id}", response_model=ContactMessageResponse)
@limiter.limit("30/minute")
def admin_patch_message(request: Request, message_id: int, body: MessageReadUpdate, db: Session = Depends(get_db)) -> ContactMessageResponse:
    """Mark a message as read or unread."""
    updated = contact_service.mark_read(db, message_id, body.is_read)
    if updated is None:
        raise HTTPException(status_code=404, detail={"error": "Message not found"})
    return updated


# ── CV Logs ───────────────────────────────────────────────────────────────────

@router.get("/cv-logs", response_model=List[CVDownloadLogResponse])
@limiter.limit("60/minute")
def admin_list_cv_logs(request: Request, db: Session = Depends(get_db)) -> List[CVDownloadLogResponse]:
    """List all CV download log entries."""
    return cv_service.list_logs(db)

@router.delete("/cv-logs", status_code=200)
@limiter.limit("30/minute")
def admin_clear_cv_logs(request: Request, db: Session = Depends(get_db)):
    """Clear all CV download log entries."""
    from app.models.orm import CVDownloadLog
    db.query(CVDownloadLog).delete()
    db.commit()
    return {"message": "All CV download logs cleared"}


# ── Password Change ───────────────────────────────────────────────────────────

@router.post("/change-password", status_code=200)
@limiter.limit("10/minute")
def change_password(
    request: Request,
    body: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin),
):
    """Change the admin account password."""
    admin = db.query(AdminUser).filter(AdminUser.email == current_admin).first()
    if admin is None or not verify_password(body.current_password, admin.hashed_password):
        raise HTTPException(status_code=401, detail={"error": "Current password is incorrect"})
    if len(body.new_password) < 8:
        raise HTTPException(status_code=422, detail={"error": "New password must be at least 8 characters"})
    admin.hashed_password = hash_password(body.new_password)
    db.commit()
    settings_service.create_notification(
        db, type_="password_change",
        title="Admin password changed",
        body=f"Password updated by {current_admin}"
    )
    return {"message": "Password changed successfully"}


# ── CV Upload / Delete ────────────────────────────────────────────────────────

@router.post("/cv/upload", status_code=200)
@limiter.limit("10/minute")
def upload_cv(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload a new CV PDF (max 25 MB). Replaces any existing CV."""
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=422, detail={"error": "Only PDF files are accepted"})
    content = file.file.read()
    if len(content) > 25 * 1024 * 1024:
        raise HTTPException(status_code=413, detail={"error": "File too large (max 25 MB)"})

    key = "Everton_Anyiro_CV.pdf"
    url = storage.upload(key, content, "application/pdf")
    settings_service.set_setting(db, "cv_path", url)
    settings_service.create_notification(db, type_="cv_upload", title="CV Updated", body="A new CV PDF has been uploaded")
    return {"message": "CV uploaded successfully", "url": url}

@router.delete("/cv", status_code=200)
@limiter.limit("10/minute")
def delete_cv(request: Request, db: Session = Depends(get_db)):
    """Remove the uploaded CV file."""
    storage.delete("Everton_Anyiro_CV.pdf")
    settings_service.set_setting(db, "cv_path", "")
    settings_service.create_notification(db, type_="cv_upload", title="CV Removed", body="The CV PDF has been deleted")
    return {"message": "CV removed"}


@router.post("/cv/url", status_code=200)
@limiter.limit("10/minute")
def set_cv_url(request: Request, body: dict, db: Session = Depends(get_db)):
    """Set CV from an external URL (e.g. Google Drive direct download link)."""
    url = (body.get("url") or "").strip()
    if not url:
        raise HTTPException(status_code=422, detail={"error": "URL is required"})
    if not url.startswith("http"):
        raise HTTPException(status_code=422, detail={"error": "Must be a valid http(s) URL"})
    settings_service.set_setting(db, "cv_path", url)
    settings_service.create_notification(db, type_="cv_upload", title="CV URL Updated", body=f"CV URL set to: {url}")
    return {"message": "CV URL saved", "cv_path": url}

@router.get("/cv/status")
@limiter.limit("60/minute")
def cv_status(request: Request, db: Session = Depends(get_db)):
    """Check whether a CV file is currently available."""
    cv_path = settings_service.get_setting(db, "cv_path")
    exists = bool(cv_path and cv_path.strip())
    # Also check local fallback
    if not exists:
        local = os.path.join(_STATIC_DIR, "Everton_Anyiro_CV.pdf")
        exists = os.path.isfile(local)
    return {"exists": exists}


# ── Profile Photo Upload ──────────────────────────────────────────────────────

@router.post("/photo/upload", status_code=200)
@limiter.limit("20/minute")
def upload_photo(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload a profile photo (max 10 MB). Replaces any existing photo."""
    allowed = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=422, detail={"error": "Only JPEG, PNG, WebP or GIF images accepted"})
    content = file.file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail={"error": "File too large (max 10 MB)"})

    ext = (file.filename or "profile.jpg").rsplit(".", 1)[-1].lower()
    key = f"profile/profile.{ext}"
    url = storage.upload(key, content, file.content_type or "image/jpeg")
    settings_service.set_setting(db, "photo_url", url)
    return {"message": "Photo uploaded", "photo_url": url}

@router.delete("/photo", status_code=200)
@limiter.limit("20/minute")
def delete_photo(request: Request, db: Session = Depends(get_db)):
    """Remove the uploaded profile photo."""
    for ext in ["jpg", "jpeg", "png", "webp", "gif"]:
        storage.delete(f"profile/profile.{ext}")
    settings_service.set_setting(db, "photo_url", "")
    return {"message": "Photo removed"}


@router.post("/photo/url", status_code=200)
@limiter.limit("20/minute")
def set_photo_url(request: Request, body: dict, db: Session = Depends(get_db)):
    """Set profile photo from an external URL (e.g. Imgur, Google Drive)."""
    url = (body.get("url") or "").strip()
    if not url:
        raise HTTPException(status_code=422, detail={"error": "URL is required"})
    if not url.startswith("http"):
        raise HTTPException(status_code=422, detail={"error": "Must be a valid http(s) URL"})
    settings_service.set_setting(db, "photo_url", url)
    return {"message": "Photo URL saved", "photo_url": url}


# ── Profile Back Images ───────────────────────────────────────────────────────

@router.get("/profile-back-images")
@limiter.limit("60/minute")
def get_profile_back_images(request: Request, db: Session = Depends(get_db)):
    """Return the list of profile flip-card back images (up to 3)."""
    raw = settings_service.get_setting(db, "profile_back_images")
    images = json.loads(raw) if raw else []
    return {"images": images}


@router.post("/profile-back-image", status_code=201)
@limiter.limit("20/minute")
def upload_profile_back_image(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload a back image for the profile flip card (max 3 images, each max 10 MB)."""
    allowed = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=422, detail={"error": "Only image files accepted"})
    content = file.file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail={"error": "File too large (max 10 MB)"})

    raw = settings_service.get_setting(db, "profile_back_images")
    current = json.loads(raw) if raw else []
    if len(current) >= 3:
        raise HTTPException(status_code=400, detail={"error": "Maximum of 3 back images already uploaded"})

    ext = (file.filename or "img.jpg").rsplit(".", 1)[-1].lower()
    key = f"profile/back_{uuid.uuid4().hex[:8]}.{ext}"
    url = storage.upload(key, content, file.content_type or "image/jpeg")
    current.append(url)
    settings_service.set_setting(db, "profile_back_images", json.dumps(current))
    return {"images": current, "url": url}


@router.delete("/profile-back-image/{index}", status_code=200)
@limiter.limit("20/minute")
def delete_profile_back_image(request: Request, index: int, db: Session = Depends(get_db)):
    """Delete a profile flip-card back image by its list index."""
    raw = settings_service.get_setting(db, "profile_back_images")
    current = json.loads(raw) if raw else []
    if index < 0 or index >= len(current):
        raise HTTPException(status_code=404, detail={"error": "Image index out of range"})
    url = current.pop(index)
    storage.delete(storage.key_from_url(url))
    settings_service.set_setting(db, "profile_back_images", json.dumps(current))
    return {"images": current}


@router.post("/profile-back-image/url", status_code=201)
@limiter.limit("20/minute")
def add_profile_back_image_url(request: Request, body: dict, db: Session = Depends(get_db)):
    """Add a profile flip-card back image from an external URL (e.g. Google Drive)."""
    url = (body.get("url") or "").strip()
    if not url:
        raise HTTPException(status_code=422, detail={"error": "URL is required"})
    if not url.startswith("http"):
        raise HTTPException(status_code=422, detail={"error": "Must be a valid http(s) URL"})
    raw = settings_service.get_setting(db, "profile_back_images")
    current = json.loads(raw) if raw else []
    if len(current) >= 3:
        raise HTTPException(status_code=400, detail={"error": "Maximum of 3 back images already set"})
    current.append(url)
    settings_service.set_setting(db, "profile_back_images", json.dumps(current))
    return {"images": current, "url": url}


# ── Social Links ──────────────────────────────────────────────────────────────

@router.get("/social-links", response_model=SocialLinksResponse)
@limiter.limit("60/minute")
def get_social_links(request: Request, db: Session = Depends(get_db)) -> SocialLinksResponse:
    """Return the current social links and profile settings."""
    return settings_service.get_social_links(db)

@router.put("/social-links", response_model=SocialLinksResponse)
@limiter.limit("30/minute")
def update_social_links(request: Request, body: SocialLinksUpdate, db: Session = Depends(get_db)) -> SocialLinksResponse:
    """Update social links and profile settings."""
    return settings_service.update_social_links(db, body.model_dump(exclude_none=True))


# ── Notifications ─────────────────────────────────────────────────────────────

@router.get("/notifications", response_model=List[NotificationResponse])
@limiter.limit("60/minute")
def list_notifications(request: Request, db: Session = Depends(get_db)) -> List[NotificationResponse]:
    """List all notifications for the admin."""
    return settings_service.list_notifications(db)

@router.get("/notifications/unread-count")
@limiter.limit("60/minute")
def unread_count(request: Request, db: Session = Depends(get_db)):
    """Return the count of unread notifications."""
    return {"count": settings_service.unread_count(db)}

@router.patch("/notifications/{notif_id}", response_model=NotificationResponse)
@limiter.limit("30/minute")
def mark_notification_read(request: Request, notif_id: int, body: NotificationReadUpdate, db: Session = Depends(get_db)) -> NotificationResponse:
    """Mark a notification as read."""
    n = settings_service.mark_notification_read(db, notif_id)
    if n is None:
        raise HTTPException(status_code=404, detail={"error": "Notification not found"})
    return n

@router.post("/notifications/mark-all-read", status_code=200)
@limiter.limit("30/minute")
def mark_all_notifications_read(request: Request, db: Session = Depends(get_db)):
    """Mark all notifications as read."""
    settings_service.mark_all_read(db)
    return {"message": "All notifications marked as read"}


# ── Site Media ────────────────────────────────────────────────────────────────
from app.models.orm import SiteMedia
from app.schemas.schemas import SiteMediaCreate, SiteMediaResponse, SiteMediaUpdate


@router.get("/media/{category}", response_model=List[SiteMediaResponse])
@limiter.limit("60/minute")
def admin_list_media(request: Request, category: str, db: Session = Depends(get_db)) -> List[SiteMediaResponse]:
    """List all site media items for a given category."""
    return (
        db.query(SiteMedia)
        .filter(SiteMedia.category == category)
        .order_by(SiteMedia.order_index)
        .all()
    )


@router.post("/media", response_model=SiteMediaResponse, status_code=201)
@limiter.limit("30/minute")
def admin_create_media(request: Request, body: SiteMediaCreate, db: Session = Depends(get_db)) -> SiteMediaResponse:
    """Create a new site media item."""
    item = SiteMedia(**body.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/media/{media_id}", response_model=SiteMediaResponse)
@limiter.limit("30/minute")
def admin_update_media(request: Request, media_id: int, body: SiteMediaUpdate, db: Session = Depends(get_db)) -> SiteMediaResponse:
    """Update fields on an existing site media item."""
    item = db.query(SiteMedia).filter(SiteMedia.id == media_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail={"error": "Media item not found"})
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/media/{media_id}", status_code=200)
@limiter.limit("30/minute")
def admin_delete_media(request: Request, media_id: int, db: Session = Depends(get_db)):
    """Delete a site media item and its associated files."""
    item = db.query(SiteMedia).filter(SiteMedia.id == media_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail={"error": "Media item not found"})
    for url in [item.thumbnail] + (item.back_images or []):
        if url:
            storage.delete(storage.key_from_url(url))
    db.delete(item)
    db.commit()
    return {"message": "Media item deleted"}


# ── IGS Thumbnail Upload ──────────────────────────────────────────────────────

@router.post("/media/{media_id}/thumbnail", response_model=SiteMediaResponse)
@limiter.limit("30/minute")
def upload_media_thumbnail(request: Request, media_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)) -> SiteMediaResponse:
    """Upload a thumbnail image for a media item (max 10 MB)."""
    allowed = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=422, detail={"error": "Only image files are accepted"})
    content = file.file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail={"error": "File too large (max 10 MB)"})

    item = db.query(SiteMedia).filter(SiteMedia.id == media_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail={"error": "Media item not found"})

    if item.thumbnail:
        storage.delete(storage.key_from_url(item.thumbnail))

    ext = (file.filename or "img.jpg").rsplit(".", 1)[-1].lower()
    key = f"igs/thumb_{media_id}_{uuid.uuid4().hex[:8]}.{ext}"
    url = storage.upload(key, content, file.content_type or "image/jpeg")
    item.thumbnail = url
    db.commit()
    db.refresh(item)
    return item


@router.delete("/media/{media_id}/thumbnail", response_model=SiteMediaResponse)
@limiter.limit("30/minute")
def delete_media_thumbnail(request: Request, media_id: int, db: Session = Depends(get_db)) -> SiteMediaResponse:
    """Remove the thumbnail image for a media item."""
    item = db.query(SiteMedia).filter(SiteMedia.id == media_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail={"error": "Media item not found"})
    if item.thumbnail:
        storage.delete(storage.key_from_url(item.thumbnail))
    item.thumbnail = None
    db.commit()
    db.refresh(item)
    return item


# ── IGS Back-Image Upload (up to 3 per item) ─────────────────────────────────

@router.post("/media/{media_id}/back-image", response_model=SiteMediaResponse)
@limiter.limit("30/minute")
def upload_media_back_image(request: Request, media_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)) -> SiteMediaResponse:
    """Upload a back image for a media item flip card (max 3, each max 10 MB)."""
    allowed = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=422, detail={"error": "Only image files are accepted"})
    content = file.file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail={"error": "File too large (max 10 MB)"})

    item = db.query(SiteMedia).filter(SiteMedia.id == media_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail={"error": "Media item not found"})
    current = list(item.back_images or [])
    if len(current) >= 3:
        raise HTTPException(status_code=400, detail={"error": "Maximum of 3 back images already uploaded"})

    ext = (file.filename or "img.jpg").rsplit(".", 1)[-1].lower()
    key = f"igs/back_{media_id}_{uuid.uuid4().hex[:8]}.{ext}"
    url = storage.upload(key, content, file.content_type or "image/jpeg")
    current.append(url)
    item.back_images = current
    db.commit()
    db.refresh(item)
    return item


@router.delete("/media/{media_id}/back-image/{img_index}", response_model=SiteMediaResponse)
@limiter.limit("30/minute")
def delete_media_back_image(request: Request, media_id: int, img_index: int, db: Session = Depends(get_db)) -> SiteMediaResponse:
    """Delete a back image from a media item by index."""
    item = db.query(SiteMedia).filter(SiteMedia.id == media_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail={"error": "Media item not found"})
    current = list(item.back_images or [])
    if img_index < 0 or img_index >= len(current):
        raise HTTPException(status_code=404, detail={"error": "Image index out of range"})
    url = current.pop(img_index)
    storage.delete(storage.key_from_url(url))
    item.back_images = current if current else None
    db.commit()
    db.refresh(item)
    return item
