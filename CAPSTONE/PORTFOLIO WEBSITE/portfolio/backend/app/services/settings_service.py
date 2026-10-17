from sqlalchemy.orm import Session
from app.models.orm import SiteSetting, Notification
from app.schemas.schemas import SocialLinksResponse
from datetime import datetime, timezone

def _now():
    return datetime.now(timezone.utc)

def get_setting(db: Session, key: str) -> str | None:
    row = db.query(SiteSetting).filter(SiteSetting.key == key).first()
    return row.value if row else None

def set_setting(db: Session, key: str, value: str | None) -> SiteSetting:
    row = db.query(SiteSetting).filter(SiteSetting.key == key).first()
    if row:
        row.value = value
        row.updated_at = _now()
    else:
        row = SiteSetting(key=key, value=value, updated_at=_now())
        db.add(row)
    db.commit()
    db.refresh(row)
    return row

def get_all_settings(db: Session) -> dict:
    rows = db.query(SiteSetting).all()
    return {r.key: r.value for r in rows}

def get_social_links(db: Session) -> SocialLinksResponse:
    import json as _json
    d = get_all_settings(db)
    raw_back = d.get("profile_back_images")
    profile_back_images = _json.loads(raw_back) if raw_back else []
    return SocialLinksResponse(
        github          = d.get("github"),
        linkedin        = d.get("linkedin"),
        facebook        = d.get("facebook"),
        x               = d.get("x"),
        instagram       = d.get("instagram"),
        whatsapp        = d.get("whatsapp"),
        email           = d.get("email"),
        phone           = d.get("phone"),
        photo_url       = d.get("photo_url"),
        cv_path         = d.get("cv_path"),
        igs_folder_url  = d.get("igs_folder_url"),
        profile_back_images = profile_back_images if profile_back_images else None,
    )

def update_social_links(db: Session, data: dict) -> SocialLinksResponse:
    for key, value in data.items():
        if value is not None:  # save empty strings too (allows clearing a field)
            set_setting(db, key, value if value != "" else None)
    return get_social_links(db)

# ── Notifications ─────────────────────────────────────────────────────────────

def create_notification(db: Session, type_: str, title: str, body: str | None = None):
    n = Notification(type=type_, title=title, body=body, created_at=_now())
    db.add(n)
    db.commit()

def list_notifications(db: Session):
    return db.query(Notification).order_by(Notification.created_at.desc()).all()

def unread_count(db: Session) -> int:
    return db.query(Notification).filter(Notification.is_read == False).count()

def mark_notification_read(db: Session, notif_id: int) -> Notification | None:
    n = db.query(Notification).filter(Notification.id == notif_id).first()
    if n is None:
        return None
    n.is_read = True
    db.commit()
    db.refresh(n)
    return n

def mark_all_read(db: Session):
    db.query(Notification).filter(Notification.is_read == False).update({"is_read": True})
    db.commit()
