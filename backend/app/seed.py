from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .models import Product

PRODUCTS = [
    ("Simsiz quloqchin Pulse", "Faol shovqin pasaytirish, 30 soat batareya.", 649000, "Elektronika", "🎧", 25, 4.8),
    ("Smart soat Orbit 3", "Yurak urishi, uyqu va sport kuzatuvi.", 1290000, "Elektronika", "⌚", 12, 4.6),
    ("Portativ karnay Wave", "Suvga chidamli, 12 soat musiqa.", 389000, "Elektronika", "🔊", 40, 4.5),
    ("Mexanik klaviatura K75", "Hot-swap, RGB yoritgich, 75% format.", 520000, "Elektronika", "⌨️", 18, 4.7),
    ("Oq paxta ko'ylak", "Yumshoq paxta, erkin kesim.", 189000, "Kiyim", "👕", 60, 4.3),
    ("Jinsi shim Straight", "Klassik to'g'ri kesim, qalin mato.", 299000, "Kiyim", "👖", 35, 4.4),
    ("Yengil kurtka Wind", "Shamoldan himoya qiluvchi, yig'iladigan.", 459000, "Kiyim", "🧥", 20, 4.6),
    ("Yugurish krossovkasi Dash", "Yengil taglik, nafas oluvchi to'r.", 579000, "Kiyim", "👟", 28, 4.7),
    ("Keramik krujka to'plami", "4 ta qo'lda bo'yalgan krujka.", 149000, "Uy", "☕", 50, 4.5),
    ("Stol lampasi Lumen", "Yorqinlik sozlanadi, USB zaryadlash.", 215000, "Uy", "💡", 30, 4.4),
    ("Xona o'simligi Monstera", "Tuvakda, parvarish qilish oson.", 99000, "Uy", "🪴", 45, 4.9),
    ("Yoga gilami Flow", "Sirpanmaydigan, 6 mm qalinlik.", 175000, "Sport", "🧘", 33, 4.5),
    ("Suv shishasi Steel 750", "Issiq-sovuqni 12 soat saqlaydi.", 129000, "Sport", "🧴", 70, 4.6),
    ("Gantel to'plami 2x5 kg", "Neopren qoplama, uy mashqlari uchun.", 249000, "Sport", "🏋️", 22, 4.4),
]


def seed_products(db: Session) -> None:
    if db.scalar(select(func.count(Product.id))):
        return
    for name, desc, price, cat, emoji, stock, rating in PRODUCTS:
        db.add(Product(name=name, description=desc, price=price, category=cat,
                       emoji=emoji, stock=stock, rating=rating))
    db.commit()
