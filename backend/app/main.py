from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import FRONTEND_DIR
from .database import Base, SessionLocal, engine
from .routers import auth, orders, products
from .seed import seed_products


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        seed_products(db)
    yield


app = FastAPI(title="Bozor API", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

for r in (auth.router, products.router, orders.router):
    app.include_router(r, prefix="/api")

# Frontend (oxirida ulanadi, shunda /api yo'llari bilan to'qnashmaydi)
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
