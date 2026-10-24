from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_URL = f"sqlite:///{BASE_DIR / 'shop.db'}"
FRONTEND_DIR = BASE_DIR.parent / "frontend"

SECRET_KEY = "o'zgartiring-production-uchun-maxfiy-kalit"
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 60 * 24
