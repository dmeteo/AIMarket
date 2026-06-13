from pydantic import BaseModel


class UploadMediaResponse(BaseModel):
    full_urls: list[str]
    keys: list[str]