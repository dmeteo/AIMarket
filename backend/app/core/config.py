from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    
    SECRET_KEY: str = ""
    ALGORITHM: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "user"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_DB: str = "db"
    DATABASE_URL: str = ""
    
    S3_ACCESS_KEY_ID: str = ""
    S3_SECRET_ACCESS_KEY: str = ""
    S3_URL: str = ""
    S3_PORT: str = ""
    S3_BUCKETS: list[str] = [""]
    S3_PUBLIC_URL: str = ""
    
    ADMIN_EMAIL: str = ""
    ADMIN_PASSWORD: str = ""
    
    YOOKASSA_SHOP_ID: str = ""
    YOOKASSA_SECRET_KEY: str = ""
    YOOKASSA_IPS: list[str] = ["185.71.76.0/27","185.71.77.0/27","77.75.153.0/25","77.75.156.11","77.75.156.35","77.75.154.128/25","2a02:5180::/32"]
    
    @property
    def DB_URL(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql+psycopg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    
    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=(".env", "../.env", "../../.env"),
        extra="allow"
    )


settings = Settings()