from yookassa import Configuration

from app.core.database import SessionLocal
from app.models.user import User
from app.core.config import settings
from app.common.enums import Role
from app.repositories.user import get_user_by_email
from app.core.security import get_password_hash

def create_admin():
    db = SessionLocal()
    try:
        user = get_user_by_email(db, settings.ADMIN_EMAIL)
        if user:
            return
        db.add(User(
            email=settings.ADMIN_EMAIL, 
            password_hash=get_password_hash(settings.ADMIN_PASSWORD), 
            name="admin",
            role=Role.ADMIN.value)
            )
        db.commit()
    finally:
        db.close()
        

def init_yookassa():
    Configuration.configure(settings.YOOKASSA_SHOP_ID, settings.YOOKASSA_SECRET_KEY)
    