from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.common.enums import Role
from app.models.orders import Order, OrderItem
from app.models.product import Product, ProductCategory
from app.models.category import Category
from app.models.shop import Shop
from app.models.user import ApplicationToSeller, Seller, User


ITEM_REVENUE = OrderItem.price_at_purchase * OrderItem.quantity


def _base_join(stmt):
    return (
        stmt.select_from(OrderItem)
        .join(Order, OrderItem.order_id == Order.id)
        .join(Product, OrderItem.product_id == Product.id)
    )


def _apply_filters(stmt, shop_ids, date_from, date_to, statuses=None):
    if shop_ids is not None:
        stmt = stmt.where(Product.shop_id.in_(shop_ids))
    if statuses is not None:
        stmt = stmt.where(Order.status.in_(statuses))

    return stmt.where(func.date(Order.created_at).between(date_from, date_to))


def get_summary(db: Session, shop_ids, date_from: date, date_to: date, statuses):
    stmt = _base_join(
        select(
            func.coalesce(func.sum(ITEM_REVENUE), 0).label("revenue"),
            func.count(func.distinct(Order.id)).label("orders"),
            func.coalesce(func.sum(OrderItem.quantity), 0).label("items"),
        )
    )
    stmt = _apply_filters(stmt, shop_ids, date_from, date_to, statuses)

    return db.execute(stmt).one()


def get_sales_by_day(db: Session, shop_ids, date_from: date, date_to: date, statuses):
    day = func.date(Order.created_at).label("date")

    stmt = _base_join(
        select(
            day,
            func.coalesce(func.sum(ITEM_REVENUE), 0).label("revenue"),
            func.count(func.distinct(Order.id)).label("orders"),
            func.coalesce(func.sum(OrderItem.quantity), 0).label("items"),
        )
    )
    stmt = _apply_filters(stmt, shop_ids, date_from, date_to, statuses).group_by(day).order_by(day)

    return db.execute(stmt).all()


def get_status_distribution(db: Session, shop_ids, date_from: date, date_to: date):
    stmt = _base_join(
        select(
            Order.status.label("code"),
            func.count(func.distinct(Order.id)).label("count"),
        )
    )
    stmt = _apply_filters(stmt, shop_ids, date_from, date_to).group_by(Order.status)

    return db.execute(stmt).all()


def get_top_products(db: Session, shop_ids, date_from: date, date_to: date, statuses, limit: int = 10):
    stmt = _base_join(
        select(
            Product.id.label("id"),
            Product.title.label("title"),
            func.coalesce(func.sum(OrderItem.quantity), 0).label("sales"),
            func.coalesce(func.sum(ITEM_REVENUE), 0).label("revenue"),
        )
    )
    stmt = (
        _apply_filters(stmt, shop_ids, date_from, date_to, statuses)
        .group_by(Product.id, Product.title)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(limit)
    )

    return db.execute(stmt).all()


def get_revenue_by_shop(db: Session, shop_ids, date_from: date, date_to: date, statuses):
    stmt = _base_join(
        select(
            Shop.id.label("shop_id"),
            Shop.title.label("shop_name"),
            func.coalesce(func.sum(ITEM_REVENUE), 0).label("revenue"),
            func.count(func.distinct(Order.id)).label("orders"),
        )
    ).join(Shop, Product.shop_id == Shop.id)
    stmt = (
        _apply_filters(stmt, shop_ids, date_from, date_to, statuses)
        .group_by(Shop.id, Shop.title)
        .order_by(func.sum(ITEM_REVENUE).desc())
    )

    return db.execute(stmt).all()


def get_distinct_customer_ids(db: Session, shop_ids, statuses, date_from: date | None = None, date_to: date | None = None):
    stmt = _base_join(select(func.distinct(Order.user_id)))
    if shop_ids is not None:
        stmt = stmt.where(Product.shop_id.in_(shop_ids))
    stmt = stmt.where(Order.status.in_(statuses))

    if date_from is not None:
        stmt = stmt.where(func.date(Order.created_at) >= date_from)
    if date_to is not None:
        stmt = stmt.where(func.date(Order.created_at) <= date_to)

    return set(db.scalars(stmt).all())


def get_platform_counts(db: Session):
    sellers = db.scalar(select(func.count()).select_from(Seller))
    buyers = db.scalar(select(func.count()).select_from(User).where(User.role == Role.BUYER.value))
    shops = db.scalar(select(func.count()).select_from(Shop))
    products = db.scalar(select(func.count()).select_from(Product))

    return sellers, buyers, shops, products


def get_products_count_by_shop(db: Session):
    stmt = select(Product.shop_id, func.count()).group_by(Product.shop_id)

    return dict(db.execute(stmt).all())


def get_top_sellers(db: Session, date_from: date, date_to: date, statuses, limit: int = 10):
    stmt = _base_join(
        select(
            Shop.owner_id.label("seller_id"),
            func.coalesce(func.sum(ITEM_REVENUE), 0).label("revenue"),
            func.count(func.distinct(Order.id)).label("orders"),
        )
    ).join(Shop, Product.shop_id == Shop.id)
    stmt = (
        _apply_filters(stmt, None, date_from, date_to, statuses)
        .group_by(Shop.owner_id)
        .order_by(func.sum(ITEM_REVENUE).desc())
        .limit(limit)
    )

    return db.execute(stmt).all()


def get_shop_revenue_by_owner(db: Session, owner_ids, date_from: date, date_to: date, statuses):
    stmt = _base_join(
        select(
            Shop.owner_id.label("owner_id"),
            Shop.title.label("shop_name"),
            func.coalesce(func.sum(ITEM_REVENUE), 0).label("revenue"),
        )
    ).join(Shop, Product.shop_id == Shop.id).where(Shop.owner_id.in_(owner_ids))
    stmt = (
        _apply_filters(stmt, None, date_from, date_to, statuses)
        .group_by(Shop.owner_id, Shop.title)
        .order_by(func.sum(ITEM_REVENUE).desc())
    )

    return db.execute(stmt).all()


def get_seller_display_names(db: Session, user_ids):
    stmt = (
        select(User.id, Seller.full_name, User.name)
        .select_from(User)
        .join(Seller, Seller.user_id == User.id, isouter=True)
        .where(User.id.in_(user_ids))
    )

    return db.execute(stmt).all()


def get_applications_counts(db: Session):
    stmt = select(ApplicationToSeller.verdict, func.count()).group_by(ApplicationToSeller.verdict)

    return dict(db.execute(stmt).all())


def get_sales_by_category(db: Session, date_from: date, date_to: date, statuses):
    stmt = (
        _base_join(
            select(
                Category.id.label("category_id"),
                Category.title.label("category_name"),
                func.coalesce(func.sum(ITEM_REVENUE), 0).label("revenue"),
                func.count(func.distinct(Order.id)).label("orders"),
            )
        )
        .join(ProductCategory, ProductCategory.product_id == Product.id)
        .join(Category, Category.id == ProductCategory.category_id)
    )
    stmt = (
        _apply_filters(stmt, None, date_from, date_to, statuses)
        .group_by(Category.id, Category.title)
        .order_by(func.sum(ITEM_REVENUE).desc())
    )

    return db.execute(stmt).all()
