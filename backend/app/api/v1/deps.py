from typing import Annotated
import ipaddress

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jwt import InvalidTokenError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.schemas.auth import TokenData
from app.repositories.user import get_user_by_email
from app.models.user import User
from app.common.enums import Role


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(
    db: Annotated[Session, Depends(get_db)],
    token: Annotated[str, Depends(oauth2_scheme)]
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except InvalidTokenError:
        raise credentials_exception
    
    user = get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user


def require_seller_or_admin(
    current_user: Annotated[User, Depends(get_current_user)],          
):
    if current_user.role == Role.SELLER.value or current_user.role == Role.ADMIN.value:
        return current_user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access denied"
    )


def require_seller(
    current_user: Annotated[User, Depends(get_current_user)],          
):
    if current_user.role == Role.SELLER.value:
        return current_user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access denied"
    )
    

def require_admin(
    current_user: Annotated[User, Depends(get_current_user)],          
):
    if current_user.role == Role.ADMIN.value:
        return current_user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access denied"
    )


def require_moderator_or_higher(
    current_user: Annotated[User, Depends(get_current_user)],          
):
    if current_user.role == Role.ADMIN.value or current_user.role == Role.MODERATOR.value:
        return current_user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access denied"
    )
    
    
def verify_yookassa_ip(request: Request):
    ip = ipaddress.ip_address(request.client.host)
    for network in settings.YOOKASSA_IPS:
        if ip in ipaddress.ip_network(network):
            return request.client.host
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access denied"
    )