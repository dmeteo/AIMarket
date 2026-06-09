import { http, HttpResponse } from 'msw';
import productsData from '../data/products.json';
import shopProductsData from '../data/shop-products.json';
import categoriesData from '../data/categories.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ProductItem = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ShopProductLink = any;

function findProductIndex(id: number): number {
  return (productsData as { items: ProductItem[] }).items.findIndex((p) => p.id === id);
}

function findCategory(id: number) {
  return (categoriesData as { categories: Array<{ id: number; title: string }> }).categories.find((c) => c.id === id);
}

let nextProductId = Math.max(...(productsData as { items: ProductItem[] }).items.map((p) => p.id), 0) + 1;

export const productHandlers = [
  // POST /api/v1/products/ — create product
  http.post('/api/v1/products/', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;

    const title = body.title as string | undefined;
    if (!title) {
      return HttpResponse.json({ detail: 'Название обязательно' }, { status: 422 });
    }

    const price = body.price as string | number | undefined;
    if (!price || parseFloat(String(price)) <= 0) {
      return HttpResponse.json({ detail: 'Укажите корректную цену' }, { status: 422 });
    }

    const newId = nextProductId++;
    const now = new Date().toISOString();

    const newProduct: ProductItem = {
      id: newId,
      shop_id: 0,
      title,
      description: (body.description as string) || '',
      images: (body.images as string[]) || ['/placeholder.svg'],
      price: String(price),
      discount_percent: String(body.discount_percent ?? 0),
      final_price: String(body.final_price ?? price),
      rating: null,
      reviews_count: 0,
      quantity: Number(body.quantity ?? 0),
      category_id: (body.category_id as number) || null,
      category: null,
      is_active: (body.is_active as boolean) ?? true,
      shop_ids: [],
      created_at: now,
      updated_at: now,
    };

    // Resolve category name
    if (newProduct.category_id) {
      const cat = findCategory(newProduct.category_id);
      if (cat) newProduct.category = cat.title;
    }

    (productsData as { items: ProductItem[] }).items.unshift(newProduct);

    // Auto-assign to shops if shop_ids provided
    const shopIds = (body.shop_ids as number[]) || [];
    if (shopIds.length > 0) {
      newProduct.shop_ids = shopIds;
      for (const shopId of shopIds) {
        (shopProductsData as { shop_products: ShopProductLink[] }).shop_products.push({
          shop_id: shopId,
          product_id: newId,
          price_override: null,
          stock: newProduct.quantity,
        });
      }
    }

    console.log('[MSW] POST /api/v1/products/ — created product:', newId, title);
    return HttpResponse.json(newProduct, { status: 201 });
  }),

  // PATCH /api/v1/products/:product_id — update product
  http.patch('/api/v1/products/:product_id', async ({ request, params }) => {
    const id = parseInt(params.product_id as string, 10);
    const index = findProductIndex(id);
    if (index === -1) {
      return HttpResponse.json({ detail: 'Товар не найден' }, { status: 404 });
    }

    const body = await request.json() as Record<string, unknown>;
    const now = new Date().toISOString();
    const product = (productsData as { items: ProductItem[] }).items[index];

    const updated = {
      ...product,
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.images !== undefined && { images: body.images }),
      ...(body.price !== undefined && { price: String(body.price) }),
      ...(body.discount_percent !== undefined && { discount_percent: String(body.discount_percent) }),
      ...(body.final_price !== undefined && { final_price: String(body.final_price) }),
      ...(body.quantity !== undefined && { quantity: Number(body.quantity) }),
      ...(body.category_id !== undefined && { category_id: body.category_id }),
      ...(body.is_active !== undefined && { is_active: body.is_active }),
      updated_at: now,
    };

    // Resolve category name
    if (updated.category_id) {
      const cat = findCategory(updated.category_id);
      updated.category = cat ? cat.title : null;
    }

    (productsData as { items: ProductItem[] }).items[index] = updated;
    console.log('[MSW] PATCH /api/v1/products/:product_id — updated product:', id);
    return HttpResponse.json(updated);
  }),

  // DELETE /api/v1/products/:product_id — delete product
  http.delete('/api/v1/products/:product_id', ({ params }) => {
    const id = parseInt(params.product_id as string, 10);
    const index = findProductIndex(id);
    if (index === -1) {
      return HttpResponse.json({ detail: 'Товар не найден' }, { status: 404 });
    }

    (productsData as { items: ProductItem[] }).items.splice(index, 1);
    // Remove shop-product links
    (shopProductsData as { shop_products: ShopProductLink[] }).shop_products =
      (shopProductsData as { shop_products: ShopProductLink[] }).shop_products.filter(
        (sp) => sp.product_id !== id,
      );

    console.log('[MSW] DELETE /api/v1/products/:product_id — deleted product:', id);
    return HttpResponse.json({ id });
  }),

  // POST /api/v1/products/:product_id/assign — assign product to shops
  http.post('/api/v1/products/:product_id/assign', async ({ request, params }) => {
    const productId = parseInt(params.product_id as string, 10);
    const productIndex = findProductIndex(productId);
    if (productIndex === -1) {
      return HttpResponse.json({ detail: 'Товар не найден' }, { status: 404 });
    }

    const body = await request.json() as { shop_ids?: number[]; price_overrides?: Record<string, string> };
    const shopIds = body.shop_ids || [];
    const priceOverrides = body.price_overrides || {};

    const product = (productsData as { items: ProductItem[] }).items[productIndex];
    product.shop_ids = shopIds;
    product.updated_at = new Date().toISOString();

    // Remove old links for this product
    (shopProductsData as { shop_products: ShopProductLink[] }).shop_products =
      (shopProductsData as { shop_products: ShopProductLink[] }).shop_products.filter(
        (sp) => sp.product_id !== productId,
      );

    // Add new links
    for (const shopId of shopIds) {
      (shopProductsData as { shop_products: ShopProductLink[] }).shop_products.push({
        shop_id: shopId,
        product_id: productId,
        price_override: priceOverrides[String(shopId)] || null,
        stock: product.quantity,
      });
    }

    console.log('[MSW] POST /api/v1/products/:product_id/assign — assigned to shops:', shopIds);
    return HttpResponse.json(product);
  }),

  // DELETE /api/v1/shops/:shop_id/products/:product_id — remove product from shop
  http.delete('/api/v1/shops/:shop_id/products/:product_id', ({ params }) => {
    const shopId = parseInt(params.shop_id as string, 10);
    const productId = parseInt(params.product_id as string, 10);

    // Remove shop-product link
    (shopProductsData as { shop_products: ShopProductLink[] }).shop_products =
      (shopProductsData as { shop_products: ShopProductLink[] }).shop_products.filter(
        (sp) => !(sp.shop_id === shopId && sp.product_id === productId),
      );

    // Update product shop_ids
    const productIndex = findProductIndex(productId);
    if (productIndex !== -1) {
      const product = (productsData as { items: ProductItem[] }).items[productIndex];
      product.shop_ids = product.shop_ids.filter((id: number) => id !== shopId);
      product.updated_at = new Date().toISOString();
    }

    console.log('[MSW] DELETE /api/v1/shops/:shop_id/products/:product_id');
    return HttpResponse.json({ shop_id: shopId, product_id: productId });
  }),
];
