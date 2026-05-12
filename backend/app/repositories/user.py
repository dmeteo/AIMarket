from sqlalchemy import select
from sqlalchemy.orm import Session


from app.models.user import User


def create_user(db: Session, user: User):
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
    

def get_user_by_email(db: Session, email: str) -> User | None:
    stmt = select(User).where(User.email == email)
    data = db.execute(stmt).scalar_one_or_none()
    return data