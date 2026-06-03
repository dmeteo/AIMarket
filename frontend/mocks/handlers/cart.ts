import { http, HttpResponse } from 'msw';
import products from '../data/products.json';

interface CartItem {
  id: number;
  title: string;
  price: string;
  final_price: string;
  image: string;
  quantity: number;
}

interface CartState {
  id: number;
  user_id: number;
  items: CartItem[];
}

// In-memory cart (per user — simplified to single user for mock)
const cart: CartState = {
  id: 1,
  user_id: 1,
  items: [],
};

function findProduct(id: number) {
  return products.items.find((p) => p.id === id);
}

export const cartHandlers = [
  // GET /api/v1/cart/ — get current cart
  http.get('/api/v1/cart/', () => {
    return HttpResponse.json({
      id: cart.id,
      user_id: cart.user_id,
      items: cart.items,
      updated_at: new Date().toISOString(),
    });
  }),

  // POST /api/v1/cart/items — add item to cart
  http.post('/api/v1/cart/items', async ({ request }) => {
    const body = (await request.json()) as {
      product_id?: number;
      quantity?: number;
    };

    if (!body.product_id || !body.quantity) {
      return HttpResponse.json(
        { detail: 'product_id и quantity обязательны' },
        { status: 422 }
      );
    }

    const product = findProduct(body.product_id);
    if (!product) {
      return HttpResponse.json(
        { detail: 'Товар не найден' },
        { status: 404 }
      );
    }

    const existing = cart.items.find((i) => i.id === body.product_id);
    if (existing) {
      existing.quantity += body.quantity;
    } else {
      cart.items.push({
        id: product.id,
        title: product.title,
        price: product.price,
        final_price: product.final_price,
        image: product.images?.[0] || '/placeholder.svg',
        quantity: body.quantity,
      });
    }

    console.log('Mock Cart: added item', body.product_id, 'qty:', body.quantity);

    return HttpResponse.json({
      id: cart.id,
      user_id: cart.user_id,
      items: cart.items,
      updated_at: new Date().toISOString(),
    });
  }),

  // PATCH /api/v1/cart/items/:product_id — update quantity
  http.patch('/api/v1/cart/items/:product_id', async ({ request, params }) => {
    const productId = parseInt(params.product_id as string, 10);
    const body = (await request.json()) as { quantity?: number };

    if (!body.quantity || body.quantity < 1) {
      return HttpResponse.json(
        { detail: 'quantity должен быть >= 1' },
        { status: 422 }
      );
    }

    const item = cart.items.find((i) => i.id === productId);
    if (!item) {
      return HttpResponse.json(
        { detail: 'Товар не найден в корзине' },
        { status: 404 }
      );
    }

    item.quantity = body.quantity;

    return HttpResponse.json({
      id: cart.id,
      user_id: cart.user_id,
      items: cart.items,
      updated_at: new Date().toISOString(),
    });
  }),

  // DELETE /api/v1/cart/items/:product_id — remove item
  http.delete('/api/v1/cart/items/:product_id', ({ params }) => {
    const productId = parseInt(params.product_id as string, 10);

    cart.items = cart.items.filter((i) => i.id !== productId);

    return HttpResponse.json({
      id: cart.id,
      user_id: cart.user_id,
      items: cart.items,
      updated_at: new Date().toISOString(),
    });
  }),
];
