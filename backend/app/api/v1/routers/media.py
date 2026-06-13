from typing import Annotated


from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.params import Query
from mypy_boto3_s3 import S3Client 

from app.core.storage import get_s3_storage
from app.schemas.media import UploadMediaResponse
from app.common.enums import MediaEntities
from app.services.media import upload_media_service


router = APIRouter(prefix="/media", tags=["media"])


@router.post("/upload", response_model=UploadMediaResponse)
def upload_media(
    s3: Annotated[S3Client, Depends(get_s3_storage)],
    files: list[UploadFile] = File(...),
    entity: MediaEntities = Query(),
) -> UploadMediaResponse:
    urls = upload_media_service(s3, files, entity)
        
    return urls
        
    