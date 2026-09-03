from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PayGuard AI"
    DATABASE_URL: str = "sqlite:///./payguard.db"
    
    # Supabase Configuration
    SUPABASE_URL: str = ""
    SUPABASE_PUBLISHABLE_KEY: str = ""
    SUPABASE_ISSUER: str = ""
    SUPABASE_JWKS_URL: str = ""
    
    # Legacy authentication (for development/migration)
    PAYGUARD_SECRET_KEY: str = "v2_secret_key_dev_only"
    
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""
    RAZORPAY_CHECKOUT_METHODS: str = ""
    
    GEMINI_API_KEY: str = ""
    AI_PROVIDER: str = "mock"

    EMAIL_PROVIDER: str = "mock"
    EMAIL_FROM: str = "receipts@payguard.local"
    EMAIL_API_KEY: str = ""
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""

    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_CHAT_ID: str = ""

    SMS_PROVIDER: str = "mock"
    SMS_API_KEY: str = ""
    SMS_SENDER_ID: str = "PAYGRD"

    WHATSAPP_PROVIDER: str = "mock"
    WHATSAPP_ACCESS_TOKEN: str = ""
    WHATSAPP_PHONE_NUMBER_ID: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
