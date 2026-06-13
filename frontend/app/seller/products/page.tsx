'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Package, Plus, Search, Download, Upload, Edit, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import SellerLayout from '../../../components/seller/SellerLayout';
import ProductForm from '../../../components/seller/ProductForm';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../hooks/useAuth';
import { sellerService } from '../../../services/seller.service';
import { categoryService } from '../../../services/category.service';
import { brandService } from '../../../services/brand.service';
import { productService } from '../../../services/product.service';
import { parseCSV, generateCSV, downloadCSV } from '../../../lib/csv';
import type { SellerShop } from '../../../services/seller.service';
import type { Category } from '../../../services/category.service';
import type { Brand } from '../../../services/brand.service';
import type { Product } from '../../../hooks/useProducts';

const ALL_SHOPS_TAB = 'all';

export default function SellerProductsPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [shops, setShops] = useState<SellerShop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState<string>(ALL_SHOPS_TAB);

  // Search & filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // CSV
  const [showImport, setShowImport] = useState(false);
  const [importData, setImportData] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [importResult, setImportResult] = useState<{ success: number; errors: string[] } | null>(null);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [shopsData, catsData, brandsData] = await Promise.all([
        sellerService.getSellerShops(user.id),
        categoryService.getCategories(),
        brandService.getBrands(),
      ]);
      setShops(shopsData);
      setCategories(catsData);
      setBrands(brandsData);

      // Load all seller products from API
      const allProducts = await sellerService.getSellerProducts(user.id);
      setProducts((allProducts as Product[]).map((p) => ({
        ...p,
        is_active: p.is_active ?? true,
        categories: p.categories ?? [],
        shop_ids: p.shop_ids || [],
        images: p.images || ['/placeholder.svg'],
        description: p.description || '',
        discount_percent: p.discount_percent || '0',
        final_price: p.final_price || p.price,
        reviews_count: p.reviews_count || 0,
      })));
    } catch {
      // ignore
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) window.location.href = '/login';
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadData();
    }
  }, [isAuthenticated, user, loadData]);

  // Filter products based on active tab
  const filteredProducts = useMemo(() => {
    let result = products;

    // Filter by shop tab
    if (activeTab !== ALL_SHOPS_TAB) {
      const shopId = Number(activeTab);
      result = result.filter((p) => p.shop_ids?.includes(shopId));
    }

    // Search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q));
    }

    // Category filter
    if (categoryFilter) {
      result = result.filter((p) => p.categories?.[0]?.id === categoryFilter);
    }

    return result;
  }, [products, activeTab, searchTerm, categoryFilter]);

  const handleCreate = async (data: {
    title: string;
    description: string;
    price: string;
    discount_percent: string;
    quantity: number;
    category_id: number | null;
    is_active: boolean;
    shop_ids: number[];
    price_overrides: Record<number, string>;
  }) => {
    await productService.createProduct({
      shop_id: data.shop_ids?.[0] ?? 0,
      title: data.title,
      description: data.description,
      price: data.price,
      discount_percent: parseFloat(data.discount_percent),
      quantity: data.quantity,
      category_ids: data.category_id ? [data.category_id] : [],
      is_active: data.is_active,
    });

    // Apply price overrides if any
    const overrides: Record<number, string> = {};
    for (const [shopId, price] of Object.entries(data.price_overrides)) {
      if (price) overrides[Number(shopId)] = price;
    }

    setShowForm(false);
    loadData();
  };

  const handleDelete = async () => {
    if (deleteConfirm === null) return;
    try {
      await productService.deleteProduct(deleteConfirm);
      setDeleteConfirm(null);
      loadData();
    } catch {
      // ignore
    }
  };

  const handleExportCSV = () => {
    const headers = ['Название', 'Описание', 'Цена', 'Скидка %', 'Остаток', 'Категория', 'Статус'];
    const rows = filteredProducts.map((p) => [
      p.title,
      p.description || '',
      p.price,
      p.discount_percent || '0',
      String(p.quantity),
      p.categories?.[0]?.title || '',
      p.is_active ? 'active' : 'draft',
    ]);
    const csv = generateCSV(headers, rows);
    const date = new Date().toISOString().split('T')[0];
    downloadCSV(`products_export_${date}.csv`, csv);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      setImportData(parsed);
      setImportResult(null);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!importData) return;
    const errors: string[] = [];
    let success = 0;

    for (let i = 0; i < importData.rows.length; i++) {
      const row = importData.rows[i];
      const rowNum = i + 2;

      // Map columns by name
      const getCol = (name: string): string => {
        const idx = importData.headers.findIndex((h) => h.toLowerCase().includes(name.toLowerCase()));
        return idx >= 0 ? row[idx] || '' : '';
      };

      const title = getCol('название') || getCol('title');
      const description = getCol('описание') || getCol('description') || '';
      const price = getCol('цена') || getCol('price');
      const discount = getCol('скидка') || getCol('discount') || '0';
      const quantity = getCol('остаток') || getCol('quantity') || '0';
      const categoryName = getCol('категория') || getCol('category');
      const status = getCol('статус') || getCol('status') || 'active';

      if (!title) { errors.push(`Строка ${rowNum}: отсутствует название`); continue; }
      if (!price || parseFloat(price) <= 0) { errors.push(`Строка ${rowNum}: некорректная цена`); continue; }

      // Resolve category
      let categoryId: number | null = null;
      if (categoryName) {
        const cat = categories.find((c) => c.title.toLowerCase() === categoryName.toLowerCase());
        if (cat) categoryId = cat.id;
      }

      try {
        await productService.createProduct({
          shop_id: shops.length > 0 ? shops[0].id : 0,
          title,
          description,
          price,
          discount_percent: parseFloat(discount) || 0,
          quantity: parseInt(quantity, 10) || 0,
          category_ids: categoryId ? [categoryId] : [],
          is_active: status !== 'draft',
        });
        success++;
      } catch (err) {
        errors.push(`Строка ${rowNum}: ${err instanceof Error ? err.message : 'ошибка'}`);
      }
    }

    setImportResult({ success, errors });
    loadData();
  };

  if (isLoading || loading) {
    return (
      <SellerLayout title="Товары">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded-lg" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </SellerLayout>
    );
  }

  const tabs = [
    { id: ALL_SHOPS_TAB, label: 'Все товары', count: products.length },
    ...shops.map((s) => ({
      id: String(s.id),
      label: s.title,
      count: products.filter((p) => p.shop_ids?.includes(s.id)).length,
    })),
  ];

  return (
    <SellerLayout title="Товары">
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-green-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs ${activeTab === tab.id ? 'text-green-100' : 'text-gray-400'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <Input
              type="search"
              placeholder="Поиск товаров..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="h-4 w-4" />}
              className="w-full"
            />
          </div>

          <select
            value={categoryFilter ?? ''}
            onChange={(e) => setCategoryFilter(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Все категории</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.title}</option>
            ))}
          </select>

          <Button variant="secondary" onClick={handleExportCSV} disabled={filteredProducts.length === 0}>
            <Download className="h-4 w-4 mr-1.5" />
            Экспорт CSV
          </Button>

          <Button variant="secondary" onClick={() => { setShowImport(true); setImportData(null); setImportResult(null); }}>
            <Upload className="h-4 w-4 mr-1.5" />
            Импорт CSV
          </Button>

          <Button variant="primary" onClick={() => { setEditingProduct(undefined); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-1.5" />
            Добавить товар
          </Button>
        </div>

        {/* Products table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Товар</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Категория</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Цена</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Остаток</th>
                  {activeTab === ALL_SHOPS_TAB && (
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Магазины</th>
                  )}
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Статус</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {searchTerm || categoryFilter ? 'Ничего не найдено' : 'Нет товаров'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{product.title}</p>
                            <p className="text-xs text-gray-400">#{product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{product.categories?.[0]?.title || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{product.final_price || product.price} ₽</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{product.quantity}</td>
                      {activeTab === ALL_SHOPS_TAB && (
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {(product.shop_ids || []).map((shopId) => {
                              const shop = shops.find((s) => s.id === shopId);
                              return shop ? (
                                <span key={shopId} className="inline-flex px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                                  {shop.title}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          product.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {product.is_active !== false ? 'Активен' : 'Черновик'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditingProduct(product as Product); setShowForm(true); }}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(product.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create/Edit modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingProduct(undefined); }}
        title={editingProduct ? 'Редактировать товар' : 'Создать товар'}
      >
        <ProductForm
          product={editingProduct}
          shops={shops}
          categories={categories}
          brands={brands}
          onSave={handleCreate}
          onCancel={() => { setShowForm(false); setEditingProduct(undefined); }}
        />
      </Modal>

      {/* Delete modal */}
      <Modal isOpen={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} title="Удалить товар?">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Товар будет удалён из всех магазинов. Это действие нельзя отменить.</p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteConfirm(null)}>Отмена</Button>
            <Button variant="destructive" className="flex-1" onClick={handleDelete}>Удалить</Button>
          </div>
        </div>
      </Modal>

      {/* Import modal */}
      <Modal isOpen={showImport} onClose={() => { setShowImport(false); setImportData(null); setImportResult(null); }} title="Импорт товаров из CSV">
        <div className="space-y-4">
          {!importData ? (
            <>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">Загрузите CSV файл с товарами</p>
                <p className="text-xs text-gray-400 mb-4">Формат: Название, Описание, Цена, Скидка %, Остаток, Категория, Статус</p>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg cursor-pointer hover:bg-green-600 text-sm">
                  <Upload className="h-4 w-4" />
                  Выбрать файл
                  <input type="file" accept=".csv" onChange={handleImportFile} className="hidden" />
                </label>
              </div>
            </>
          ) : !importResult ? (
            <>
              <p className="text-sm text-gray-600">Найдено строк: {importData.rows.length}</p>
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50">
                      {importData.headers.map((h, i) => (
                        <th key={i} className="text-left px-2 py-1 font-medium text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {importData.rows.slice(0, 50).map((row, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        {row.map((cell, j) => (
                          <td key={j} className="px-2 py-1 text-gray-700">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {importData.rows.length > 50 && (
                <p className="text-xs text-gray-400">Показаны первые 50 строк из {importData.rows.length}</p>
              )}
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setImportData(null)}>Назад</Button>
                <Button variant="primary" className="flex-1" onClick={handleImport}>
                  Импортировать {importData.rows.length} товаров
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <p className="text-sm text-green-700">Импортировано: {importResult.success} товаров</p>
              </div>
              {importResult.errors.length > 0 && (
                <div className="max-h-40 overflow-y-auto">
                  {importResult.errors.map((err, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 text-xs text-red-600">
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />
                      {err}
                    </div>
                  ))}
                </div>
              )}
              <Button variant="secondary" className="w-full" onClick={() => { setShowImport(false); setImportData(null); setImportResult(null); }}>
                Закрыть
              </Button>
            </>
          )}
        </div>
      </Modal>
    </SellerLayout>
  );
}
