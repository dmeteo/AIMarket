from fastapi import APIRouter

from app.schemas.auth import LoginRequest, AuthResponse, RegisterRequest
from app.schemas.user import CurrentUserResponse


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse)
def register(payload: RegisterRequest) -> AuthResponse:
    pass

@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest) -> AuthResponse:
    pass

@router.get("/me", response_model=CurrentUserResponse)
def me() -> CurrentUserResponse:
    pass