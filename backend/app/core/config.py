from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    
    SECRET_KEY: str = "6ea4e32d05b33f3f222c5b295eb6c69468f85aafbf70673feb0d1d418c1835c"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "user"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_DB: str = "db"
    DATABASE_URL: str = ""
    
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