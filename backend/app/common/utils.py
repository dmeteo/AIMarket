from app.core.config import settings


def build_url(key: str) -> str:
    return f"{settings.S3_PUBLIC_URL}/{key}"