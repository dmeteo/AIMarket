from app.repositories.user import get_user_by_email


def check_unique_email(db, email):
    user = get_user_by_email(db, email)
    if user:
        return False
    return True
