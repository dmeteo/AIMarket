from sqlalchemy import select
from sqlalchemy.orm import Session


from app.models.user import ApplicationToSeller, User


def create_user(db: Session, user: User):
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
    

def get_user_by_email(db: Session, email: str) -> User | None:
    stmt = select(User).where(User.email == email)
    data = db.execute(stmt).scalar_one_or_none()
    return data


def get_user_by_id(db: Session, user_id: int) -> User | None:
    stmt = select(User).where(User.id == user_id)
    data = db.execute(stmt).scalar_one_or_none()
    return data


def create_application_to_be_seller(db, application):
    db.add(application)
    db.commit()
    db.refresh(application)

    return application.id


def get_applications_to_be_seller(db: Session, user_id):
    stmt = select(ApplicationToSeller).where(ApplicationToSeller.user_id==user_id)
    
    applications = db.scalars(stmt).all()
    
    return applications


def get_application_to_be_seller(db: Session, user_id, application_id) -> ApplicationToSeller:
    stmt = select(ApplicationToSeller).where(ApplicationToSeller.user_id==user_id).where(ApplicationToSeller.id==application_id)
    
    application = db.scalar(stmt)
    
    return application