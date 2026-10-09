from pydantic_settings import BaseSettings, SettingsConfigDict

_base_config = SettingsConfigDict(
    env_file ='./.env',
    env_ignore_empty=True,
    extra='ignore'
)

class DatabaseSettings(BaseSettings):
    DATABASE_USER: str
    DATABASE_PASSWORD: str
    DATABASE_DB: str
    DATABASE_SERVER: str
    DATABASE_PORT: int

    REDIS_PORT: str
    REDIS_HOST: str

    VAPID_PUBLIC_KEY: str
    VAPID_PRIVATE_KEY: str
    VAPID_CLAIM_EMAIL: str

    BASE_URL: str="http://localhost:8005"

    model_config = _base_config

    @property
    def DATABASE_URL(self):
        return f"postgresql+asyncpg://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}@{self.DATABASE_SERVER}:{self.DATABASE_PORT}/{self.DATABASE_DB}"


class SecuritySettings(BaseSettings):
    JWT_SECRET: str
    JWT_ALGORITHM: str

    model_config = _base_config

class NotificationSettings(BaseSettings):
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_FROM_NAME: str
    MAIL_SERVER: str
    MAIL_PORT: int
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    USE_CREDENTIALS: bool = True
    VALIDATE_CERTS: bool = True

    model_config = _base_config

db_settings = DatabaseSettings()
security_settings = SecuritySettings()
notification_settings = NotificationSettings()