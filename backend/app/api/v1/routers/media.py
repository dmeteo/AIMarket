from typing import Annotated

from fastapi import APIRouter, File, UploadFile, Depends
from fastapi.params import Query

from app.schemas.media import UploadMediaResponse
from app.common.enums import MediaEntities
from app.services.media import upload_media_service
from app.models.user import User
from app.api.v1.deps import get_current_user


router = APIRouter(prefix="/media", tags=["media"])


@router.post("/upload", response_model=UploadMediaResponse, description="[Buyer User]")
async def upload_media(
    current_user: Annotated[User, Depends(get_current_user)],
    files: list[UploadFile] = File(...),
    entity: MediaEntities = Query(),
) -> UploadMediaResponse:
    return await upload_media_service(files, entity)
