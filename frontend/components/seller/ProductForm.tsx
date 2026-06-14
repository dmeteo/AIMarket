'use client';

import { useState, useRef } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import { uploadFiles } from '../../services/upload.service';
import type { Category } from '../../services/category.service';
import type { Brand } from '../../services/brand.service';
import type { SellerShop } from '../../services/seller.service';

interface ProductFormProps {
  product?: {
    id: number;
    title: string;
    description?: string;
    images?: string[];
    price?: string;
    discount_percent?: string;
    quantity?: number;
    category_id?: number | null;
    is_active?: boolean;
    shop_ids?: number[];
  };
  shops: SellerShop[];
  categories: Category[];
  brands: Brand[];
  onSave: (data: {
    title: string;
    description: string;
    price: string;
    discount_percent: string;
    quantity: number;
    category_id: number | null;
    is_active: boolean;
    shop_ids: number[];
    price_overrides: Record<number, string>;
    images: string[];
  }) => Promise<void>;
  onCancel: () => void;
}

interface ImageItem {
  file?: File;
  preview: string;
  url?: string;
  key?: string;
  uploading: boolean;
}

export default function ProductForm({
  product,
  shops,
  categories,
  brands: _brands,
  onSave,
  onCancel,
}: ProductFormProps) {
  const [title, setTitle] = useState(product?.title || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price || '');
  const [discount, setDiscount] = useState(product?.discount_percent || '0');
  const [quantity, setQuantity] = useState(String(product?.quantity ?? 0));
  const [categoryId, setCategoryId] = useState<number | null>(product?.category_id ?? null);
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [selectedShops, setSelectedShops] = useState<number[]>(product?.shop_ids || []);
  const [priceOverrides, setPriceOverrides] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Images state
  const [images, setImages] = useState<ImageItem[]>(
    (product?.images || []).map((url) => ({
      preview: url,
      url,
      uploading: false,
    })),
  );

  const isEditing = !!product;

  const handleShopToggle = (shopId: number) => {
    setSelectedShops((prev) =>
      prev.includes(shopId) ? prev.filter((id) => id !== shopId) : [...prev, shopId],
    );
  };

  const handlePriceOverride = (shopId: number, value: string) => {
    setPriceOverrides((prev) => ({ ...prev, [shopId]: value }));
  };

  const handleImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const totalCount = images.length + fileArray.length;
    if (totalCount > 10) {
      setError('Максимум 10 изображений');
      return;
    }

    // Создаём локальные превью
    const newItems: ImageItem[] = fileArray.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: true,
    }));
    setImages((prev) => [...prev, ...newItems]);

    // Загружаем на сервер
    setUploading(true);
    setError('');
    try {
      const result = await uploadFiles(fileArray, 'products');
      // Обновляем items с URL и ключами
      setImages((prev) => {
        let urlIdx = 0;
        return prev.map((item) => {
          if (item.uploading && item.file) {
            const url = result.full_urls?.[urlIdx];
            const key = result.keys?.[urlIdx];
            urlIdx++;
            return { ...item, url, key, uploading: false, file: undefined };
          }
          return item;
        });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки изображений');
      // Удаляем неудачные items
      setImages((prev) => prev.filter((item) => !item.file));
    }
    setUploading(false);

    // Сброс input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const item = prev[index];
      if (item.preview && item.preview.startsWith('blob:')) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    if (!title.trim()) { setError('Введите название товара'); return; }
    if (!price || parseFloat(price) <= 0) { setError('Укажите корректную цену'); return; }
    if (selectedShops.length === 0) { setError('Выберите хотя бы один магазин'); return; }
    if (images.some((img) => img.uploading)) { setError('Дождитесь загрузки изображений'); return; }

    setSaving(true);
    setError('');
    try {
      // Отправляем keys в поле images
      const imageKeys = images
        .filter((img) => img.key)
        .map((img) => img.key!);

      await onSave({
        title: title.trim(),
        description: description.trim(),
        price,
        discount_percent: discount,
        quantity: parseInt(quantity, 10) || 0,
        category_id: categoryId,
        is_active: isActive,
        shop_ids: selectedShops,
        price_overrides: priceOverrides,
        images: imageKeys,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Название товара <span className="text-red-500">*</span>
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Наушники Bluetooth Pro"
          maxLength={100}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Описание товара..."
          rows={3}
          maxLength={300}
        />
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Изображения
          <span className="text-gray-400 font-normal ml-1">
            ({images.length}/10)
          </span>
        </label>
        <div className="flex flex-wrap gap-3">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0"
            >
              <Image
                src={img.preview}
                alt={`Image ${idx + 1}`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
              {img.uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                </div>
              )}
              {!img.uploading && (
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}

          {images.length < 10 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-green-400 hover:text-green-500 transition-colors flex-shrink-0 disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Upload className="h-5 w-5" />
              )}
              <span className="text-[10px]">Добавить</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          onChange={handleImagesChange}
          className="hidden"
        />
        <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WebP. Максимум 10 файлов по 5 МБ.</p>
      </div>

      {/* Price & Discount */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Цена (₽) <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="2690"
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Скидка (%)</label>
          <Input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            placeholder="0"
            min="0"
            max="100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Остаток</label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            min="0"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
        <select
          value={categoryId ?? ''}
          onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="">Без категории</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.title}</option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
        <div className="flex gap-3">
          <label className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${isActive ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-200 hover:border-gray-300'}`}>
            <input type="radio" checked={isActive} onChange={() => setIsActive(true)} className="sr-only" />
            <span className="text-sm font-medium">Активен</span>
          </label>
          <label className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${!isActive ? 'border-gray-400 bg-gray-50 text-gray-600' : 'border-gray-200 hover:border-gray-300'}`}>
            <input type="radio" checked={!isActive} onChange={() => setIsActive(false)} className="sr-only" />
            <span className="text-sm font-medium">Черновик</span>
          </label>
        </div>
      </div>

      {/* Shop selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Магазины <span className="text-red-500">*</span>
          <span className="text-gray-400 font-normal ml-1">({selectedShops.length} выбрано)</span>
        </label>
        {shops.length === 0 ? (
          <p className="text-sm text-gray-500">Сначала создайте магазин</p>
        ) : (
          <div className="space-y-4">
            {shops.map((shop) => (
              <div key={shop.id} className="space-y-3">
                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedShops.includes(shop.id) ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                    type="checkbox"
                    checked={selectedShops.includes(shop.id)}
                    onChange={() => handleShopToggle(shop.id)}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{shop.title}</p>
                    <p className="text-xs text-gray-500">{shop.products_count} товаров</p>
                  </div>
                </label>

                {/* Price override per shop */}
                {selectedShops.includes(shop.id) && price !== '' && (
                  <div className="ml-7 flex flex-wrap items-center gap-x-3 gap-y-2 pb-2">
                    <label className="text-xs text-gray-500 whitespace-nowrap">Цена в магазине (₽):</label>
                    <Input
                      type="number"
                      value={priceOverrides[shop.id] || ''}
                      onChange={(e) => handlePriceOverride(shop.id, e.target.value)}
                      placeholder={price}
                      className="w-28 h-8 text-xs"
                      min="0"
                      step="0.01"
                    />
                    <span className="text-xs text-gray-400 whitespace-nowrap">(пусто = общая цена)</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings button */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        Дополнительные настройки
      </button>

      <div className="flex gap-3 pt-2 border-t border-gray-200">
        <Button variant="secondary" className="flex-1" onClick={onCancel} disabled={saving}>
          Отмена
        </Button>
        <Button variant="primary" className="flex-1" onClick={handleSubmit} disabled={saving || shops.length === 0}>
          {saving ? 'Сохранение...' : isEditing ? 'Сохранить' : 'Создать товар'}
        </Button>
      </div>
    </div>
  );
}
