from app.repositories.user import get_user_by_email
from app.core.security import verify_password
from app.models.user import User


def check_unique_email(db, email):
    user = get_user_by_email(db, email)
    if user:
        return False
    return True


def authenticate_user(db, email, password) -> User | None:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user