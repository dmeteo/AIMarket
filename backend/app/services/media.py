import uuid

from fastapi import UploadFile
from mypy_boto3_s3 import S3Client

from app.schemas.media import UploadMediaResponse
from app.common.enums import MediaEntities
from app.common.utils import build_url


def upload_media_service(s3: S3Client, files: list[UploadFile], entity: MediaEntities):
    keys = []
    full_urls = []
    for file in files:
        extension = file.filename.split(".")[-1]
        key = f"{str(uuid.uuid4())}.{extension}"
        
        s3.upload_fileobj(Fileobj=file.file, Bucket=entity.value, Key=key, ExtraArgs={"ContentType": file.content_type})
        
        keys.append(f"{entity.value}/{key}")
        full_urls.append(build_url(f"{entity.value}/{key}"))
        
    return UploadMediaResponse(full_urls=full_urls, keys=keys)