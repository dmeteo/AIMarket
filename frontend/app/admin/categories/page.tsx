'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  FolderTree,
  X,
} from 'lucide-react'
import AdminLayout from '../../../components/admin/AdminLayout'
import { adminNavItems } from '../../../components/admin/admin-nav'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import { useAuth } from '../../../hooks/useAuth'
import { categoryService } from '../../../services/category.service'
import type { Category } from '../../../services/category.service'

interface FlatCategory extends Category {
  depth: number
  childCount: number
}

interface CategoryFormData {
  title: string
  parent_id: number | null
}

export default function AdminCategoriesPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

  // Form modal
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({ title: '', parent_id: null })
  const [formSaving, setFormSaving] = useState(false)
  const [formError, setFormError] = useState('')

  // Delete modal
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Auth check
  useEffect(() => {
    if (isLoading) return
    const token = localStorage.getItem('auth_token')
    const userStr = localStorage.getItem('auth_user')
    let isAdmin = false
    if (token && userStr) {
      try { isAdmin = JSON.parse(userStr).role === 'ADMIN' } catch { /* ignore */ }
    }
    if (!isAdmin) window.location.href = '/login'
  }, [isAuthenticated, user, router, isLoading])

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories()
      setCategories(data)
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => {
    loadCategories()
  }, [])

  // Flatten tree for display
  const flatCategories = useMemo(() => {
    const result: FlatCategory[] = []

    function walk(cats: Category[], depth: number) {
      for (const cat of cats) {
        const childCount = cat.subcategories?.length ?? 0
        result.push({ ...cat, depth, childCount })
        if (cat.subcategories && expandedIds.has(cat.id)) {
          walk(cat.subcategories, depth + 1)
        }
      }
    }

    walk(categories, 0)
    return result
  }, [categories, expandedIds])

  // Search filter
  const filteredCategories = useMemo(() => {
    if (!search.trim()) return flatCategories
    const q = search.toLowerCase()
    return flatCategories.filter((c) => c.title.toLowerCase().includes(q))
  }, [flatCategories, search])

  // Build flat list of all categories for parent selector (excluding self + descendants)
  const allFlat = useMemo(() => categoryService.flattenCategories(categories), [categories])

  const getDescendantIds = (id: number): number[] => {
    const cat = allFlat.find((c) => c.id === id)
    if (!cat) return []
    const ids: number[] = []
    for (const item of allFlat) {
      if (item.parent_id === id) ids.push(item.id)
    }
    return ids
  }

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const openCreate = () => {
    setEditingId(null)
    setFormData({ title: '', parent_id: null })
    setFormError('')
    setShowForm(true)
  }

  const openEdit = (cat: FlatCategory) => {
    setEditingId(cat.id)
    setFormData({ title: cat.title, parent_id: cat.parent_id ?? null })
    setFormError('')
    setShowForm(true)
  }

  const handleFormSubmit = async () => {
    if (!formData.title.trim()) {
      setFormError('Введите название категории')
      return
    }
    setFormSaving(true)
    setFormError('')
    try {
      if (editingId !== null) {
        await categoryService.updateCategory(editingId, {
          title: formData.title.trim(),
          parent_id: formData.parent_id,
        })
      } else {
        await categoryService.createCategory({
          title: formData.title.trim(),
          parent_id: formData.parent_id,
        })
      }
      setShowForm(false)
      // Auto-expand parent if created as subcategory
      if (formData.parent_id) setExpandedIds((prev) => new Set(prev).add(formData.parent_id!))
      await loadCategories()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Ошибка сохранения')
    }
    setFormSaving(false)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleteLoading(true)
    setDeleteError('')
    try {
      await categoryService.deleteCategory(deleteId)
      setDeleteId(null)
      await loadCategories()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Ошибка удаления')
    }
    setDeleteLoading(false)
  }

  const parentName = (parentId: number | null | undefined) => {
    if (!parentId) return '—'
    const parent = allFlat.find((c) => c.id === parentId)
    return parent?.title ?? `ID: ${parentId}`
  }

  if (isLoading || loading) return null

  return (
    <AdminLayout navItems={adminNavItems} title="Категории">
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Поиск категорий..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <Button variant="primary" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            Создать категорию
          </Button>
        </div>

        {/* Category tree */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <FolderTree className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {search ? 'Ничего не найдено' : 'Нет категорий'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {filteredCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                style={{ paddingLeft: `${16 + cat.depth * 24}px` }}
              >
                {/* Expand/collapse toggle */}
                <button
                  onClick={() => toggleExpand(cat.id)}
                  className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  disabled={cat.childCount === 0}
                >
                  {cat.childCount > 0 ? (
                    expandedIds.has(cat.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-gray-300" />
                  )}
                </button>

                {/* Title + info */}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-900">{cat.title}</span>
                  {cat.childCount > 0 && (
                    <span className="ml-2 text-xs text-gray-400">
                      {cat.childCount} {cat.childCount === 1 ? 'подкатегория' : cat.childCount < 5 ? 'подкатегории' : 'подкатегорий'}
                    </span>
                  )}
                </div>

                {/* Parent badge */}
                {cat.depth > 0 && (
                  <span className="hidden sm:inline-flex text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                    {parentName(cat.parent_id)}
                  </span>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                    title="Редактировать"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => { setDeleteId(cat.id); setDeleteError('') }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Удалить"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingId !== null ? 'Редактировать категорию' : 'Создать категорию'}
      >
        <div className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              {formError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Например: Смартфоны"
              maxLength={20}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Родительская категория
            </label>
            <select
              value={formData.parent_id ?? ''}
              onChange={(e) => setFormData((prev) => ({
                ...prev,
                parent_id: e.target.value ? Number(e.target.value) : null,
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Корневая категория</option>
              {allFlat
                .filter((c) => c.id !== editingId && !getDescendantIds(editingId ?? -1).includes(c.id))
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {'— '.repeat(c.depth)}
                    {c.title}
                  </option>
                ))
              }
            </select>
            <p className="text-xs text-gray-400 mt-1">Оставьте пустым для создания корневой категории</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowForm(false)} disabled={formSaving}>
              Отмена
            </Button>
            <Button variant="primary" className="flex-1" onClick={handleFormSubmit} disabled={formSaving}>
              {formSaving ? 'Сохранение...' : editingId !== null ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete modal */}
      <Modal
        isOpen={deleteId !== null}
        onClose={() => { setDeleteId(null); setDeleteError('') }}
        title="Удалить категорию?"
      >
        <div className="space-y-4">
          {deleteError ? (
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">{deleteError}</p>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p>
                  Удалить категорию{' '}
                  <strong>«{allFlat.find((c) => c.id === deleteId)?.title ?? ''}»</strong>?
                </p>
                <p className="mt-1 text-amber-600">Это действие нельзя отменить.</p>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => { setDeleteId(null); setDeleteError('') }} disabled={deleteLoading}>
              Отмена
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? 'Удаление...' : 'Удалить'}
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}
