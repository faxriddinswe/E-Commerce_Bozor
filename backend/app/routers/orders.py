from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Order, OrderItem, Product, User
from ..schemas import OrderCreate, OrderOut
from ..security import current_user

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderOut, status_code=201)
def create_order(data: OrderCreate, db: Session = Depends(get_db), user: User = Depends(current_user)):
    order = Order(user_id=user.id, address=data.address.strip(), total=0)
    for item in data.items:
        product = db.get(Product, item.product_id)
        if not product:
            raise HTTPException(404, f"Mahsulot #{item.product_id} topilmadi")
        if product.stock < item.qty:
            raise HTTPException(400, f"«{product.name}» omborda yetarli emas (qoldi: {product.stock})")
        product.stock -= item.qty
        order.total += product.price * item.qty  # narx har doim bazadan olinadi
        order.items.append(OrderItem(product_id=product.id, name=product.name,
                                     price=product.price, qty=item.qty))
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.get("", response_model=list[OrderOut])
def my_orders(db: Session = Depends(get_db), user: User = Depends(current_user)):
    return db.scalars(select(Order).where(Order.user_id == user.id).order_by(Order.id.desc())).all()
