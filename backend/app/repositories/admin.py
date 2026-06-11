from sqlalchemy import select

from app.common.enums import VerdictApplicationToBeSeller
from app.models.user import ApplicationToSeller


def get_applications_to_seller(db):
    stmt = select(ApplicationToSeller).where(ApplicationToSeller.verdict == VerdictApplicationToBeSeller.PENDING.value)

    applications = db.scalars(stmt)

    return applications