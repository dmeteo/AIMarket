import uuid

import imagekitio
from fastapi import UploadFile

from app.schemas.media import UploadMediaResponse
from app.common.enums import MediaEntities
from app.core.config import settings


def get_imagekit() -> imagekitio.ImageKit:
    return imagekitio.ImageKit(private_key=settings.IMAGEKIT_PRIVATE_KEY)


def upload_media_service(files: list[UploadFile], entity: MediaEntities):
    imagekit = get_imagekit()
    keys = []
    full_urls = []

    for file in files:
        extension = file.filename.split(".")[-1]
        file_name = f"{str(uuid.uuid4())}.{extension}"

        result = imagekit.files.upload(
            file=file.file.read(),
            file_name=file_name,
            folder=f"/{entity.value}/",
            use_unique_file_name=False,
        )

        key = f"{entity.value}/{file_name}"
        keys.append(key)
        full_urls.append(result.url)


    return UploadMediaResponse(full_urls=full_urls, keys=keys)


# def upload_media_service(s3: S3Client, files: list[UploadFile], entity: MediaEntities):
#     keys = []
#     full_urls = []
#     for file in files:
#         extension = file.filename.split(".")[-1]
#         key = f"{str(uuid.uuid4())}.{extension}"
        
#         s3.upload_fileobj(Fileobj=file.file, Bucket=entity.value, Key=key, ExtraArgs={"ContentType": file.content_type})
        
#         keys.append(f"{entity.value}/{key}")
#         full_urls.append(build_url(f"{entity.value}/{key}"))
        
#     return UploadMediaResponse(full_urls=full_urls, keys=keys)