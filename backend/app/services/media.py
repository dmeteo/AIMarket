import uuid
import asyncio

import imagekitio
from fastapi import HTTPException, UploadFile, status

from app.schemas.media import UploadMediaResponse
from app.common.enums import MediaEntities
from app.core.config import settings



MAX_FILE_COUNT = 10
MAX_FILE_SIZE = 5*1024*1024
MAX_FILES_SIZE = MAX_FILE_SIZE * MAX_FILE_COUNT
ALLOWED_EXTENSIONS = {"image/jpeg", "image/png", "image/webp"}


def get_imagekit() -> imagekitio.ImageKit:
    return imagekitio.ImageKit(private_key=settings.IMAGEKIT_PRIVATE_KEY)


async def upload_to_imagekit(imagekit: imagekitio.ImageKit, file: UploadFile, file_name, entity):
    file_bytes = await file.read()
    
    result = await asyncio.to_thread(
                imagekit.files.upload,
                file=file_bytes,
                file_name=file_name,
                folder=f"/{entity.value}/",
                use_unique_file_name=False,
            )
    return result.url


async def upload_media_service(files: list[UploadFile], entity: MediaEntities):
    if len(files) > MAX_FILE_COUNT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum {MAX_FILE_COUNT} files"
        )
        
    if sum(file.size for file in files) > MAX_FILES_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum {MAX_FILES_SIZE} MB"
        )
        
    imagekit = get_imagekit()
    keys = []
    
    tasks = []
    for file in files:
        if file.content_type not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unavailiable format"
            )
        
        if file.filename is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Empty filename"
            )
                
        extension = file.filename.split(".")[-1]
        file_name = f"{str(uuid.uuid4())}.{extension}"
        key = f"{entity.value}/{file_name}"
        keys.append(key)
          
        tasks.append(upload_to_imagekit(imagekit, file, file_name, entity))
    
    
    urls = await asyncio.gather(*tasks)

    return UploadMediaResponse(full_urls=list(urls), keys=keys)


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