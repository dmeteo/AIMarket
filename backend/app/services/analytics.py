from datetime import date, timedelta
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.common.enums import OrderStatus, VerdictApplicationToBeSeller
from app.common.labels import ORDER_STATUS_LABELS
from app.models.user import User
from app.repositories.shops import get_shops_by_user_id
from app.repositories.analytics import (
    get_applications_counts,
    get_distinct_customer_ids,
    get_platform_counts,
    get_products_count_by_shop,
    get_revenue_by_shop,
    get_sales_by_category,
    get_sales_by_day,
    get_seller_display_names,
    get_shop_revenue_by_owner,
    get_status_distribution,
    get_summary,
    get_top_products,
    get_top_sellers,
)
from app.schemas.analytics import (
    AdminAnalyticsResponse,
    AdminSummary,
    AnalyticsPeriod,
    AnalyticsResponse,
    AnalyticsSummary,
    ApplicationsAnalytics,
    CustomersAnalytics,
    RevenueByShop,
    RevenueByShopAdmin,
    SalesByCategory,
    SalesByDay,
    StatusDistribution,
    TopProduct,
    TopSeller,
)


NON_REVENUE_STATUSES = {OrderStatus.AWAITING_PAYMENT, OrderStatus.CANCELED}

PAID_STATUSES = [status.value for status in OrderStatus if status not in NON_REVENUE_STATUSES]

PERIOD_DAYS = {"week": 7, "month": 30, "quarter": 90, "year": 365}


def _resolve_period(period: str | None, date_from: date | None, date_to: date | None) -> tuple[date, date]:
    if date_from and date_to:
        return date_from, date_to

    days = PERIOD_DAYS.get(period, PERIOD_DAYS["month"])
    today = date.today()

    return today - timedelta(days=days), today


def _resolve_shop_ids(db: Session, user: User, shop_ids: str | None) -> list[int]:
    owned = [shop.id for shop in get_shops_by_user_id(db, user.id)]

    if not shop_ids:
        return owned

    requested = [int(part) for part in shop_ids.split(",") if part.strip()]

    not_owned = set(requested) - set(owned)
    if not_owned:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Shops not owned by user: {sorted(not_owned)}",
        )

    return requested


def _build_customers(db: Session, shop_ids, date_from: date, date_to: date) -> CustomersAnalytics:
    in_period = get_distinct_customer_ids(db, shop_ids, PAID_STATUSES, date_from=date_from, date_to=date_to)
    before_period = get_distinct_customer_ids(db, shop_ids, PAID_STATUSES, date_to=date_from - timedelta(days=1))

    returning = in_period & before_period
    new = in_period - before_period

    return CustomersAnalytics(new=len(new), returning=len(returning), total=len(in_period))


def get_shop_analytics_service(
    db: Session,
    user: User,
    period: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    shop_ids: str | None = None,
) -> AnalyticsResponse:
    date_from, date_to = _resolve_period(period, date_from, date_to)
    shop_ids = _resolve_shop_ids(db, user, shop_ids)

    summary_row = get_summary(db, shop_ids, date_from, date_to, PAID_STATUSES)
    total_revenue = Decimal(summary_row.revenue)
    total_orders = summary_row.orders
    avg_order_value = (
        (total_revenue / total_orders).quantize(Decimal("0.01")) if total_orders else Decimal("0.00")
    )

    summary = AnalyticsSummary(
        total_revenue=total_revenue,
        total_orders=total_orders,
        avg_order_value=avg_order_value,
        total_items_sold=summary_row.items,
        delivery_cost_total=Decimal("0.00"),
    )

    sales_by_day = [
        SalesByDay(date=row.date, revenue=row.revenue, orders=row.orders, items=row.items)
        for row in get_sales_by_day(db, shop_ids, date_from, date_to, PAID_STATUSES)
    ]

    status_distribution = [
        StatusDistribution(code=row.code, label=ORDER_STATUS_LABELS.get(OrderStatus(row.code), row.code), count=row.count)
        for row in get_status_distribution(db, shop_ids, date_from, date_to)
    ]

    top_products = [
        TopProduct(id=row.id, title=row.title, sales=row.sales, revenue=row.revenue)
        for row in get_top_products(db, shop_ids, date_from, date_to, PAID_STATUSES)
    ]

    revenue_by_shop = [
        RevenueByShop(shop_id=row.shop_id, shop_name=row.shop_name, revenue=row.revenue, orders=row.orders)
        for row in get_revenue_by_shop(db, shop_ids, date_from, date_to, PAID_STATUSES)
    ]

    customers = _build_customers(db, shop_ids, date_from, date_to)

    return AnalyticsResponse(
        period=AnalyticsPeriod(date_from=date_from, date_to=date_to),
        summary=summary,
        sales_by_day=sales_by_day,
        status_distribution=status_distribution,
        top_products=top_products,
        revenue_by_shop=revenue_by_shop,
        customers=customers,
    )


def _build_status_distribution(db: Session, shop_ids, date_from: date, date_to: date) -> list[StatusDistribution]:
    return [
        StatusDistribution(code=row.code, label=ORDER_STATUS_LABELS.get(OrderStatus(row.code), row.code), count=row.count)
        for row in get_status_distribution(db, shop_ids, date_from, date_to)
    ]


def _build_applications(db: Session) -> ApplicationsAnalytics:
    counts = get_applications_counts(db)

    pending = counts.get(VerdictApplicationToBeSeller.PENDING.value, 0)
    approved = counts.get(VerdictApplicationToBeSeller.APPROVE.value, 0)
    rejected = counts.get(VerdictApplicationToBeSeller.REJECT.value, 0)

    return ApplicationsAnalytics(
        pending=pending,
        approved=approved,
        rejected=rejected,
        total=sum(counts.values()),
    )


def _build_top_sellers(db: Session, date_from: date, date_to: date) -> list[TopSeller]:
    rows = get_top_sellers(db, date_from, date_to, PAID_STATUSES)
    if not rows:
        return []

    seller_ids = [row.seller_id for row in rows]

    names = {r.id: (r.full_name or r.name) for r in get_seller_display_names(db, seller_ids)}

    best_shop = {}
    for r in get_shop_revenue_by_owner(db, seller_ids, date_from, date_to, PAID_STATUSES):
        best_shop.setdefault(r.owner_id, r.shop_name)

    return [
        TopSeller(
            seller_id=row.seller_id,
            seller_name=names.get(row.seller_id, ""),
            shop_name=best_shop.get(row.seller_id, ""),
            revenue=row.revenue,
            orders=row.orders,
        )
        for row in rows
    ]


def _build_sales_by_category(db: Session, date_from: date, date_to: date, total_revenue: Decimal) -> list[SalesByCategory]:
    rows = get_sales_by_category(db, date_from, date_to, PAID_STATUSES)

    return [
        SalesByCategory(
            category_id=row.category_id,
            category_name=row.category_name,
            revenue=row.revenue,
            orders=row.orders,
            percentage=round(float(row.revenue) / float(total_revenue) * 100, 1) if total_revenue else 0.0,
        )
        for row in rows
    ]


def get_platform_analytics_service(
    db: Session,
    period: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
) -> AdminAnalyticsResponse:
    date_from, date_to = _resolve_period(period, date_from, date_to)

    summary_row = get_summary(db, None, date_from, date_to, PAID_STATUSES)
    total_revenue = Decimal(summary_row.revenue)
    total_orders = summary_row.orders
    avg_order_value = (
        (total_revenue / total_orders).quantize(Decimal("0.01")) if total_orders else Decimal("0.00")
    )

    total_sellers, total_buyers, total_shops, total_products = get_platform_counts(db)

    summary = AdminSummary(
        total_revenue=total_revenue,
        total_orders=total_orders,
        avg_order_value=avg_order_value,
        total_items_sold=summary_row.items,
        total_sellers=total_sellers,
        total_buyers=total_buyers,
        total_shops=total_shops,
        total_products=total_products,
    )

    sales_by_day = [
        SalesByDay(date=row.date, revenue=row.revenue, orders=row.orders, items=row.items)
        for row in get_sales_by_day(db, None, date_from, date_to, PAID_STATUSES)
    ]

    products_count = get_products_count_by_shop(db)
    revenue_by_shop = [
        RevenueByShopAdmin(
            shop_id=row.shop_id,
            shop_name=row.shop_name,
            revenue=row.revenue,
            orders=row.orders,
            products_count=products_count.get(row.shop_id, 0),
        )
        for row in get_revenue_by_shop(db, None, date_from, date_to, PAID_STATUSES)
    ]

    top_products = [
        TopProduct(id=row.id, title=row.title, sales=row.sales, revenue=row.revenue)
        for row in get_top_products(db, None, date_from, date_to, PAID_STATUSES)
    ]

    return AdminAnalyticsResponse(
        period=AnalyticsPeriod(date_from=date_from, date_to=date_to),
        summary=summary,
        sales_by_day=sales_by_day,
        status_distribution=_build_status_distribution(db, None, date_from, date_to),
        revenue_by_shop=revenue_by_shop,
        top_sellers=_build_top_sellers(db, date_from, date_to),
        top_products=top_products,
        customers=_build_customers(db, None, date_from, date_to),
        applications=_build_applications(db),
        sales_by_category=_build_sales_by_category(db, date_from, date_to, total_revenue),
    )
