from app.core.config import settings


def build_url(key: str) -> str | None:
    if key:
        return f"{settings.S3_PUBLIC_URL}/{key}"
    return None