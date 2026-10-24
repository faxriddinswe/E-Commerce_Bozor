from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=60)
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str = Field(min_length=6, max_length=100)


class UserLogin(BaseModel):
    email: str
    password: str


class UserOut(ORM):
    id: int
    name: str
    email: str


class TokenOut(BaseModel):
    access_token: str
    user: UserOut


class ProductOut(ORM):
    id: int
    name: str
    description: str
    price: int
    category: str
    emoji: str
    stock: int
    rating: float


class OrderItemIn(BaseModel):
    product_id: int
    qty: int = Field(ge=1, le=20)


class OrderCreate(BaseModel):
    address: str = Field(min_length=5, max_length=200)
    items: list[OrderItemIn] = Field(min_length=1)


class OrderItemOut(ORM):
    product_id: int
    name: str
    price: int
    qty: int


class OrderOut(ORM):
    id: int
    total: int
    status: str
    address: str
    created_at: datetime
    items: list[OrderItemOut]
