import { http, HttpResponse } from 'msw';
import orders from '../data/orders.json';
import products from '../data/products.json';
import type { OrderRequest } from '../../services/order.service';

// Runtime store for orders created via POST
const createdOrders: Array<Record<string, unknown>> = [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OrderJson = any;

function buildNewOrder(body: OrderRequest): OrderJson {
  const deliveryCostNum = body.delivery_type === 'CDEK' ? 290 : 199;
  const allIds: number[] = [...orders.orders.map((o) => o.id), ...createdOrders.map((o) => o.id as number)];
  const newId = Math.max(...allIds) + 1;
  const predictedDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  // Build items from cart (like a real backend would)
  let itemsTotal = 0;
  const orderItems: Array<{ product: Record<string, unknown>; quantity: number }> = [];

  try {
    const raw = localStorage.getItem('cart_items');
    if (raw) {
      const cartItems = JSON.parse(raw) as Array<{ id: number; quantity: number }>;
      for (const cartItem of cartItems) {
        const product = products.items.find((p) => p.id === cartItem.id);
        if (!product) continue;
        const itemTotal = parseFloat(product.final_price) * cartItem.quantity;
        itemsTotal += itemTotal;
        orderItems.push({
          product: {
            id: product.id,
            title: product.title,
            images: product.images,
            price: product.price,
            final_price: product.final_price,
            discount_percent: Number(product.discount_percent),
            rating: product.rating,
            quantity: product.quantity,
            categories: product.categories ?? [],
            is_new: false,
            is_bestseller: false,
          },
          quantity: cartItem.quantity,
        });
      }
    }
  } catch {
    // ignore parse errors
  }

  const finalPrice = (itemsTotal + deliveryCostNum).toFixed(2);

  return {
    id: newId,
    user_id: 1,
    items: orderItems,
    address: body.address.trim(),
    delivery_cost: String(deliveryCostNum),
    predicted_date: predictedDate,
    status: { code: 'IN_PROCESSING', label: 'В обработке' },
    items_total_price: itemsTotal.toFixed(2),
    final_price: finalPrice,
  };
}

function findOrderById(id: number): OrderJson {
  const fromStatic = orders.orders.find((o) => o.id === id);
  if (fromStatic) return fromStatic;
  const fromRuntime = createdOrders.find((o) => (o.id as number) === id);
  return fromRuntime ?? null;
}

export const orderHandlers = [
  // GET /api/v1/orders/ — get user orders
  http.get('/api/v1/orders/', () => {
    return HttpResponse.json({
      orders: [...createdOrders, ...orders.orders],
    });
  }),

  // GET /api/v1/orders/:order_id — get single order
  http.get('/api/v1/orders/:order_id', (req) => {
    const id = parseInt(req.params.order_id as string, 10);
    const order = findOrderById(id);
    if (!order) {
      return HttpResponse.json(
        { detail: 'Заказ не найден' },
        { status: 404 }
      );
    }
    return HttpResponse.json(order);
  }),

  // POST /api/v1/orders/ — create order
  http.post('/api/v1/orders/', async ({ request }) => {
    const body = await request.json() as OrderRequest;

    // Validation
    if (!body.address || body.address.trim().length < 10) {
      return HttpResponse.json(
        { detail: 'Адрес должен содержать минимум 10 символов' },
        { status: 422 }
      );
    }
    if (!body.delivery_type || !['CDEK', 'YANDEX'].includes(body.delivery_type)) {
      return HttpResponse.json(
        { detail: 'Укажите корректный тип доставки (CDEK или YANDEX)' },
        { status: 422 }
      );
    }

    const newOrder = buildNewOrder(body);
    createdOrders.unshift(newOrder);

    return HttpResponse.json({ order: newOrder }, { status: 201 });
  }),
];
