from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.auth import LoginRequest, AuthResponse, RegisterRequest
from app.schemas.user import CurrentUserResponse
from app.core.database import get_db


router = APIRouter(prefix="/auth", tags=["auth"])


# @router.post("/token", response_model=TokenResponse)
# def login_for_access_token(
#     form_data: LoginRequest,
#     db: Annotated[Session, Depends(get_db)],
# ) -> TokenResponse:
#     user = authenticate_user(db, form_data.email, form_data.password)
#     if not user: 
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Incorrect username or password",
#             headers={"WWW-Authenticate": "Bearer"},
#         )
#     access_token = create_access_token(data={"sub": user.email}, expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
#     return TokenResponse(access_token=access_token, token_type="bearer")


@router.post("/register", response_model=AuthResponse)
def register(payload: RegisterRequest, db: Annotated[Session, Depends(get_db)]) -> AuthResponse:
    pass
    
    
@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Annotated[Session, Depends(get_db)]) -> AuthResponse:
    pass