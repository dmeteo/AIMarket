import { http, HttpResponse } from 'msw';
import ordersData from '../data/orders.json';
import productsData from '../data/products.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OrderItem = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ProductItem = any;

function getDateRange(period: string): { from: string; to: string } {
  const now = new Date('2026-06-12');
  const to = now.toISOString().split('T')[0];
  const from = new Date(now);

  switch (period) {
    case 'day':
      from.setDate(from.getDate() - 1);
      break;
    case 'week':
      from.setDate(from.getDate() - 7);
      break;
    case 'month':
      from.setMonth(from.getMonth() - 1);
      break;
    case 'year':
      from.setFullYear(from.getFullYear() - 1);
      break;
    default:
      from.setMonth(from.getMonth() - 1);
  }

  return { from: from.toISOString().split('T')[0], to };
}

export const analyticsHandlers = [
  // GET /api/v1/seller/{seller_id}/analytics
  http.get('/api/v1/seller/:seller_id/analytics', ({ request, params }) => {
    const _sellerId = parseInt(params.seller_id as string, 10);
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'month';
    const shopIdsParam = url.searchParams.get('shop_ids');
    const shopIds = shopIdsParam ? shopIdsParam.split(',').map(Number) : [];

    const { from, to } = getDateRange(period);

    // Get seller's shops
    const sellerShopIds = [1, 2, 3]; // Simplified: seller 100 owns shops 1-3
    const targetShopIds = shopIds.length > 0 ? shopIds.filter((id) => sellerShopIds.includes(id)) : sellerShopIds;

    // Filter orders by date range and shop_ids
    const filteredOrders = (ordersData as { orders: OrderItem[] }).orders.filter((o) => {
      const orderDate = o.created_at.split('T')[0];
      if (orderDate < from || orderDate > to) return false;

      // Check if order has products from target shops
      const hasTargetShopProduct = o.items.some((item: { product: { id: number } }) => {
        const product = (productsData as { items: ProductItem[] }).items.find((p) => p.id === item.product?.id);
        return product && targetShopIds.includes(product.shop_id);
      });

      return hasTargetShopProduct;
    });

    // Sales by day
    const salesByDay: Record<string, { revenue: number; orders: number }> = {};
    filteredOrders.forEach((o) => {
      const day = o.created_at.split('T')[0];
      if (!salesByDay[day]) salesByDay[day] = { revenue: 0, orders: 0 };
      salesByDay[day].revenue += parseFloat(o.final_price);
      salesByDay[day].orders += 1;
    });

    const sales_by_day = Object.entries(salesByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ date, revenue: data.revenue, orders: data.orders }));

    // Status distribution
    const statusCounts: Record<string, number> = {};
    filteredOrders.forEach((o) => {
      statusCounts[o.status.code] = (statusCounts[o.status.code] || 0) + 1;
    });

    const statusLabels: Record<string, string> = {
      IN_PROCESSING: 'В обработке',
      CONFIRMED: 'Подтверждён',
      DELIVERY: 'В доставке',
      RECEIVED: 'Получен',
    };

    const status_distribution = Object.entries(statusCounts).map(([code, count]) => ({
      code,
      label: statusLabels[code] || code,
      count,
    }));

    // Top products
    const productSales: Record<number, { sales: number; revenue: number; title: string }> = {};
    filteredOrders.forEach((o) => {
      o.items.forEach((item: { product: { id: number; title: string }; quantity: number }) => {
        const pid = item.product?.id;
        if (!pid) return;
        const productInfo = (productsData as { items: ProductItem[] }).items.find((p) => p.id === pid);
        const price = productInfo ? parseFloat(productInfo.final_price) : 0;
        if (!productSales[pid]) productSales[pid] = { sales: 0, revenue: 0, title: item.product.title };
        productSales[pid].sales += item.quantity;
        productSales[pid].revenue += price * item.quantity;
      });
    });

    const top_products = Object.entries(productSales)
      .sort(([, a], [, b]) => b.sales - a.sales)
      .slice(0, 10)
      .map(([id, data]) => ({ id: Number(id), title: data.title, sales: data.sales, revenue: data.revenue }));

    // Revenue by shop
    const revenueByShop: Record<number, number> = {};
    filteredOrders.forEach((o) => {
      o.items.forEach((item: { product: { id: number }; quantity: number }) => {
        const product = (productsData as { items: ProductItem[] }).items.find((p) => p.id === item.product?.id);
        if (product && targetShopIds.includes(product.shop_id)) {
          const price = parseFloat(product?.final_price ?? '0');
          revenueByShop[product.shop_id] = (revenueByShop[product.shop_id] || 0) + price * item.quantity;
        }
      });
    });

    const shopNames: Record<number, string> = { 1: 'TechPro', 2: 'AudioHub', 3: 'GadgetZone' };
    const revenue_by_shop = Object.entries(revenueByShop).map(([shopId, revenue]) => ({
      shop_id: Number(shopId),
      shop_name: shopNames[Number(shopId)] || `Магазин ${shopId}`,
      revenue,
    }));

    // Summary
    const total_revenue = filteredOrders.reduce((sum, o) => sum + parseFloat(o.final_price), 0);
    const total_orders = filteredOrders.length;
    const avg_order_value = total_orders > 0 ? total_revenue / total_orders : 0;

    return HttpResponse.json({
      period: { from, to },
      summary: {
        total_revenue,
        total_orders,
        avg_order_value,
      },
      sales_by_day,
      status_distribution,
      top_products,
      revenue_by_shop,
      customers: {
        new: Math.floor(total_orders * 0.6),
        returning: Math.floor(total_orders * 0.4),
        total: total_orders,
      },
    });
  }),
];
