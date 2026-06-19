from fastapi import APIRouter, File, UploadFile
from fastapi.params import Query

from app.schemas.media import UploadMediaResponse
from app.common.enums import MediaEntities
from app.services.media import upload_media_service


router = APIRouter(prefix="/media", tags=["media"])


@router.post("/upload", response_model=UploadMediaResponse)
def upload_media(
    files: list[UploadFile] = File(...),
    entity: MediaEntities = Query(),
) -> UploadMediaResponse:
    return upload_media_service(files, entity)
