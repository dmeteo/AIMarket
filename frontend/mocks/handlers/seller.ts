import { http, HttpResponse } from 'msw';
import applications from '../data/seller-applications.json';
import shopsData from '../data/seller-shops.json';
import shopProductsData from '../data/shop-products.json';
import productsData from '../data/products.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AppStore = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ShopItem = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ProductItem = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ShopProductLink = any;

function findAppIndex(id: number): number {
  return (applications as AppStore).applications.findIndex((a: { id: number }) => a.id === id);
}

function findShopIndex(id: number): number {
  return (shopsData as { shops: ShopItem[] }).shops.findIndex((s: { id: number }) => s.id === id);
}

let nextShopId = Math.max(...(shopsData as { shops: ShopItem[] }).shops.map((s) => s.id), 0) + 1;

export const sellerHandlers = [
  // ── Applications ──

  // Get all applications (admin)
  http.get('/api/v1/admin/applications_to_seller', () => {
    const apps = (applications as AppStore).applications.map((a: Record<string, unknown>) => {
      const { status, rejectionReason, ...rest } = a as Record<string, unknown> & { status: string; rejectionReason: string | null }
      return { ...rest, verdict: status, rejection_reason: rejectionReason }
    })
    return HttpResponse.json({ applications: apps })
  }),

  // Get single application
  http.get('/api/v1/admin/applications_to_seller/:id', ({ params }) => {
    const id = parseInt(params.id as string, 10);
    const app = (applications as AppStore).applications.find((a: { id: number }) => a.id === id);
    if (!app) {
      return HttpResponse.json({ detail: 'Заявка не найдена' }, { status: 404 });
    }
    const { status: _s, rejectionReason: _r, sellerData: _sd, legalData: _ld, ...rest } = app as Record<string, unknown>;
    return HttpResponse.json(rest);
  }),

  // Get my application (user) — filter by userId query param
  http.get('/api/v1/seller-applications', ({ request }) => {
    const url = new URL(request.url);
    const userId = parseInt(url.searchParams.get('userId') || '0', 10);
    const userApps = (applications as AppStore).applications.filter(
      (a: { userId: number }) => a.userId === userId,
    );
    return HttpResponse.json(userApps);
  }),

  // Create application — POST /api/v1/users/seller_application
  http.post('/api/v1/users/seller_application', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;

    let userId = 1;
    const cookieHeader = request.headers.get('cookie') || '';
    const userCookieMatch = cookieHeader.match(/auth_user=([^;]+)/);
    if (userCookieMatch) {
      try {
        const userData = JSON.parse(decodeURIComponent(userCookieMatch[1]));
        userId = userData.id || 1;
      } catch { /* ignore */ }
    }

    const newId = Math.max(...(applications as AppStore).applications.map((a: { id: number }) => a.id), 0) + 1;
    const now = new Date().toISOString();

    const newApp = {
      id: newId,
      userId,
      verdict: 'PENDING',
      full_name: body.full_name || '',
      email: body.email || '',
      phone: body.phone || '',
      description: body.description || '',
      person_type: body.person_type || 'INDIVIDUAL_EMPLOYER',
      inn: body.inn || '',
      ogrn: body.ogrn || '',
      address: body.address || '',
      bic: body.bic || '',
      checking_account: body.checking_account || '',
      rejection_reason: null,
      createdAt: now,
      updatedAt: now,
    };

    (applications as AppStore).applications.unshift(newApp);
    return HttpResponse.json(newApp, { status: 201 });
  }),

  // PATCH /api/v1/admin/applications_to_seller/:application_id — approve or reject
  http.patch('/api/v1/admin/applications_to_seller/:id', async ({ request, params }) => {
    const id = parseInt(params.id as string, 10);
    const index = findAppIndex(id);
    if (index === -1) {
      return HttpResponse.json({ detail: 'Заявка не найдена' }, { status: 404 });
    }

    const body = await request.json() as { verdict?: string; description?: string };
    const now = new Date().toISOString();

    const app = (applications as AppStore).applications[index];
    const verdict = body.verdict || 'APPROVE';
    (applications as AppStore).applications[index] = {
      ...app,
      verdict,
      rejection_reason: verdict === 'REJECT' ? (body.description || null) : null,
      updatedAt: now,
    };

    return HttpResponse.json({ application_id: id });
  }),

  // ── Shops CRUD ──

  // GET /api/v1/seller/:seller_id/shops — list all shops for seller
  http.get('/api/v1/seller/:seller_id/shops', ({ params }) => {
    const sellerId = parseInt(params.seller_id as string, 10);
    const shops = (shopsData as { shops: ShopItem[] }).shops.filter(
      (s: { seller_id: number }) => s.seller_id === sellerId,
    );
    return HttpResponse.json(shops);
  }),

  // GET /api/v1/shops/:shop_id — single shop
  http.get('/api/v1/shops/:shop_id', ({ params }) => {
    const id = parseInt(params.shop_id as string, 10);
    const shop = (shopsData as { shops: ShopItem[] }).shops.find((s: { id: number }) => s.id === id);
    if (!shop) {
      return HttpResponse.json({ detail: 'Магазин не найден' }, { status: 404 });
    }
    return HttpResponse.json(shop);
  }),

  // POST /api/v1/shops/ — create shop
  http.post('/api/v1/shops/', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;

    const title = body.title as string | undefined;
    if (!title) {
      return HttpResponse.json({ detail: 'Название магазина обязательно' }, { status: 422 });
    }

    // Get seller_id from cookie
    let sellerId = 100;
    const cookieHeader = request.headers.get('cookie') || '';
    const userCookieMatch = cookieHeader.match(/auth_user=([^;]+)/);
    if (userCookieMatch) {
      try {
        const userData = JSON.parse(decodeURIComponent(userCookieMatch[1]));
        sellerId = userData.id || 100;
      } catch { /* ignore */ }
    }

    // Check shop limit (10 per seller)
    const existingShops = (shopsData as { shops: ShopItem[] }).shops.filter(
      (s: { seller_id: number }) => s.seller_id === sellerId,
    );
    if (existingShops.length >= 10) {
      return HttpResponse.json({ detail: 'Максимум 10 магазинов на продавца' }, { status: 400 });
    }

    const newId = nextShopId++;
    const now = new Date().toISOString();

    const newShop: ShopItem = {
      id: newId,
      seller_id: sellerId,
      title,
      description: (body.description as string) || '',
      logo_url: (body.logo_url as string) || null,
      products_count: 0,
      orders_count: 0,
      revenue: 0,
      is_active: true,
      created_at: now,
    };

    (shopsData as { shops: ShopItem[] }).shops.push(newShop);
    console.log('[MSW] POST /api/v1/shops/ — created shop:', newId, title);
    return HttpResponse.json(newShop, { status: 201 });
  }),

  // PATCH /api/v1/shops/:shop_id — update shop
  http.patch('/api/v1/shops/:shop_id', async ({ request, params }) => {
    const id = parseInt(params.shop_id as string, 10);
    const index = findShopIndex(id);
    if (index === -1) {
      return HttpResponse.json({ detail: 'Магазин не найден' }, { status: 404 });
    }

    const body = await request.json() as Record<string, unknown>;
    const shop = (shopsData as { shops: ShopItem[] }).shops[index];

    const updated = {
      ...shop,
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.logo_url !== undefined && { logo_url: body.logo_url }),
      ...(body.is_active !== undefined && { is_active: body.is_active }),
    };

    (shopsData as { shops: ShopItem[] }).shops[index] = updated;
    console.log('[MSW] PATCH /api/v1/shops/:shop_id — updated shop:', id);
    return HttpResponse.json(updated);
  }),

  // DELETE /api/v1/shops/:shop_id — delete shop
  http.delete('/api/v1/shops/:shop_id', ({ params }) => {
    const id = parseInt(params.shop_id as string, 10);
    const index = findShopIndex(id);
    if (index === -1) {
      return HttpResponse.json({ detail: 'Магазин не найден' }, { status: 404 });
    }

    (shopsData as { shops: ShopItem[] }).shops.splice(index, 1);
    // Remove shop-product links
    (shopProductsData as { shop_products: ShopProductLink[] }).shop_products =
      (shopProductsData as { shop_products: ShopProductLink[] }).shop_products.filter(
        (sp) => sp.shop_id !== id,
      );
    // Update product shop_ids
    for (const product of (productsData as { items: ProductItem[] }).items) {
      if (product.shop_ids) {
        product.shop_ids = product.shop_ids.filter((sid: number) => sid !== id);
      }
    }

    console.log('[MSW] DELETE /api/v1/shops/:shop_id — deleted shop:', id);
    return HttpResponse.json({ id });
  }),

  // ── Seller orders ──

  // Get seller orders
  http.get('/api/v1/seller/:seller_id/orders', () => {
    const allOrders = [
      {
        id: 2001,
        items: [
          { product: { id: 101, title: 'Смартфон Galaxy Pro Max' }, quantity: 1 },
          { product: { id: 104, title: 'Умные часы Watch Pro' }, quantity: 2 },
        ],
        total_price: '117770',
        status: { code: 'DELIVERY', label: 'В доставке' },
        createdAt: '2026-06-05T10:00:00Z',
      },
      {
        id: 2002,
        items: [
          { product: { id: 102, title: 'Ноутбук UltraBook 15"' }, quantity: 1 },
        ],
        total_price: '67850',
        status: { code: 'CONFIRMED', label: 'Подтверждён' },
        createdAt: '2026-06-08T14:20:00Z',
      },
      {
        id: 2003,
        items: [
          { product: { id: 105, title: 'Беспроводные наушники AirPods Pro' }, quantity: 1 },
          { product: { id: 103, title: 'Планшет Tab Pro 11"' }, quantity: 1 },
        ],
        total_price: '68470',
        status: { code: 'IN_PROCESSING', label: 'В обработке' },
        createdAt: '2026-06-09T09:15:00Z',
      },
    ];
    return HttpResponse.json(allOrders);
  }),

  // Get seller products (across all shops)
  http.get('/api/v1/seller/:seller_id/products', ({ params }) => {
    const sellerId = parseInt(params.seller_id as string, 10);
    // Find all shop_ids for this seller
    const sellerShopIds = (shopsData as { shops: ShopItem[] }).shops
      .filter((s: { seller_id: number }) => s.seller_id === sellerId)
      .map((s: { id: number }) => s.id);
    // Find all products linked to those shops
    const linkedProductIds = (shopProductsData as { shop_products: ShopProductLink[] }).shop_products
      .filter((sp) => sellerShopIds.includes(sp.shop_id))
      .map((sp) => sp.product_id);
    const products = (productsData as { items: ProductItem[] }).items.filter((p) =>
      linkedProductIds.includes(p.id),
    );
    return HttpResponse.json(products);
  }),
];
