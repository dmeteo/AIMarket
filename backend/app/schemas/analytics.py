from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class AnalyticsPeriod(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    date_from: date = Field(alias="from")
    date_to: date = Field(alias="to")


class AnalyticsSummary(BaseModel):
    total_revenue: Decimal
    total_orders: int
    avg_order_value: Decimal
    total_items_sold: int
    delivery_cost_total: Decimal


class SalesByDay(BaseModel):
    date: date
    revenue: Decimal
    orders: int
    items: int


class StatusDistribution(BaseModel):
    code: str
    label: str
    count: int


class TopProduct(BaseModel):
    id: int
    title: str
    sales: int
    revenue: Decimal


class RevenueByShop(BaseModel):
    shop_id: int
    shop_name: str
    revenue: Decimal
    orders: int


class CustomersAnalytics(BaseModel):
    new: int
    returning: int
    total: int


class AnalyticsResponse(BaseModel):
    period: AnalyticsPeriod
    summary: AnalyticsSummary
    sales_by_day: list[SalesByDay]
    status_distribution: list[StatusDistribution]
    top_products: list[TopProduct]
    revenue_by_shop: list[RevenueByShop]
    customers: CustomersAnalytics


# --- Платформенная аналитика (админ) ---

class AdminSummary(BaseModel):
    total_revenue: Decimal
    total_orders: int
    avg_order_value: Decimal
    total_items_sold: int
    total_sellers: int
    total_buyers: int
    total_shops: int
    total_products: int


class RevenueByShopAdmin(BaseModel):
    shop_id: int
    shop_name: str
    revenue: Decimal
    orders: int
    products_count: int


class TopSeller(BaseModel):
    seller_id: int
    seller_name: str
    shop_name: str
    revenue: Decimal
    orders: int


class ApplicationsAnalytics(BaseModel):
    pending: int
    approved: int
    rejected: int
    total: int


class SalesByCategory(BaseModel):
    category_id: int
    category_name: str
    revenue: Decimal
    orders: int
    percentage: float


class AdminAnalyticsResponse(BaseModel):
    period: AnalyticsPeriod
    summary: AdminSummary
    sales_by_day: list[SalesByDay]
    status_distribution: list[StatusDistribution]
    revenue_by_shop: list[RevenueByShopAdmin]
    top_sellers: list[TopSeller]
    top_products: list[TopProduct]
    customers: CustomersAnalytics
    applications: ApplicationsAnalytics
    sales_by_category: list[SalesByCategory]
