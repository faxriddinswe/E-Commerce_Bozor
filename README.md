# Bozor — Fullstack E-commerce

```
ecommerce/
├── backend/                 # Python · FastAPI · SQLite
│   ├── requirements.txt
│   └── app/
│       ├── main.py          # ilova kirish nuqtasi, CORS, frontendni serve qiladi
│       ├── config.py        # sozlamalar
│       ├── database.py      # SQLAlchemy engine/session
│       ├── models.py        # DB jadvallari
│       ├── schemas.py       # Pydantic sxemalar (validatsiya)
│       ├── security.py      # parol hash, JWT, current_user
│       ├── seed.py          # boshlang'ich mahsulotlar
│       └── routers/         # auth.py · products.py · orders.py
└── frontend/                # HTML · CSS · JavaScript (ES modules)
    ├── index.html
    ├── css/style.css
    └── js/ api.js · cart.js · main.js
```

## Ishga tushirish
```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
- Sayt: http://127.0.0.1:8000
- API hujjatlari (Swagger): http://127.0.0.1:8000/docs
- Baza (`backend/shop.db`) birinchi ishga tushishda avtomatik yaratiladi.

## API
| Method | URL | Tavsif |
|---|---|---|
| POST | /api/auth/register | Ro'yxatdan o'tish |
| POST | /api/auth/login | Kirish (JWT qaytaradi) |
| GET | /api/auth/me | Joriy foydalanuvchi |
| GET | /api/products?q=&category=&sort= | Mahsulotlar (sort: new, price_asc, price_desc, rating) |
| GET | /api/products/categories | Kategoriyalar |
| GET | /api/products/{id} | Bitta mahsulot |
| POST | /api/orders | Buyurtma berish (token kerak) |
| GET | /api/orders | Mening buyurtmalarim |
