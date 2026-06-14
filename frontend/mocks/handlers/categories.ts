import { http, HttpResponse } from 'msw'
import categoriesData from '../data/categories.json'

type CategoryRaw = {
  id: number
  title: string
  icon?: string
  parent_id?: number
  subcategories?: CategoryRaw[]
}

const data = categoriesData as { categories: CategoryRaw[] }

let nextId = 1000

function findAllCategories(cats: CategoryRaw[]): CategoryRaw[] {
  const result: CategoryRaw[] = []
  for (const cat of cats) {
    result.push(cat)
    if (cat.subcategories) {
      result.push(...findAllCategories(cat.subcategories))
    }
  }
  return result
}

function findCategoryById(cats: CategoryRaw[], id: number): CategoryRaw | null {
  for (const cat of cats) {
    if (cat.id === id) return cat
    if (cat.subcategories) {
      const found = findCategoryById(cat.subcategories, id)
      if (found) return found
    }
  }
  return null
}

function removeCategoryById(cats: CategoryRaw[], id: number): boolean {
  const idx = cats.findIndex((c) => c.id === id)
  if (idx !== -1) {
    cats.splice(idx, 1)
    return true
  }
  for (const cat of cats) {
    if (cat.subcategories && removeCategoryById(cat.subcategories, id)) return true
  }
  return false
}

function hasChildren(cats: CategoryRaw[], id: number): boolean {
  const cat = findCategoryById(cats, id)
  return !!(cat?.subcategories && cat.subcategories.length > 0)
}

function getDescendantIds(id: number): number[] {
  const cat = findCategoryById(data.categories, id)
  if (!cat || !cat.subcategories) return []
  const ids: number[] = []
  const queue = [...cat.subcategories]
  while (queue.length > 0) {
    const item = queue.shift()!
    ids.push(item.id)
    if (item.subcategories) queue.push(...item.subcategories)
  }
  return ids
}

export const categoryHandlers = [
  // GET /api/v1/categories/
  http.get('/api/v1/categories/', () => {
    return HttpResponse.json({ categories: data.categories })
  }),

  // GET /api/v1/categories/:id
  http.get('/api/v1/categories/:id', ({ params }) => {
    const id = parseInt(params.id as string, 10)
    const cat = findCategoryById(data.categories, id)
    if (!cat) {
      return HttpResponse.json({ detail: 'Категория не найдена' }, { status: 404 })
    }
    return HttpResponse.json({ category: cat })
  }),

  // POST /api/v1/categories/ — создание
  http.post('/api/v1/categories/', async ({ request }) => {
    const body = (await request.json()) as { title?: string; parent_id?: number }
    const title = body?.title?.trim()
    if (!title) {
      return HttpResponse.json({ detail: 'Название обязательно' }, { status: 422 })
    }

    const newId = nextId++
    const parent_id = body.parent_id || null

    if (parent_id) {
      const parent = findCategoryById(data.categories, parent_id)
      if (!parent) {
        return HttpResponse.json({ detail: 'Родительская категория не найдена' }, { status: 404 })
      }
      if (!parent.subcategories) parent.subcategories = []
      parent.subcategories.push({ id: newId, title, parent_id })
    } else {
      data.categories.push({ id: newId, title, icon: 'Folder' })
    }

    return HttpResponse.json({ category: { id: newId, title, parent_id } }, { status: 201 })
  }),

  // PATCH /api/v1/categories/:id — обновление
  http.patch('/api/v1/categories/:id', async ({ request, params }) => {
    const id = parseInt(params.id as string, 10)
    const cat = findCategoryById(data.categories, id)
    if (!cat) {
      return HttpResponse.json({ detail: 'Категория не найдена' }, { status: 404 })
    }

    const body = (await request.json()) as { title?: string; parent_id?: number | null }

    if (body.title !== undefined) {
      cat.title = body.title
    }

    // Смена родителя — простая реализация: удаляем из старого места и добавляем в новое
    if (body.parent_id !== undefined && body.parent_id !== cat.parent_id) {
      const newParentId = body.parent_id
      // Нельзя переместить в себя или в потомка
      if (newParentId === id) {
        return HttpResponse.json({ detail: 'Нельзя сделать категорию родителем самой себя' }, { status: 422 })
      }
      if (newParentId !== null && getDescendantIds(id).includes(newParentId)) {
        return HttpResponse.json({ detail: 'Нельзя переместить категорию в своего потомка' }, { status: 422 })
      }

      // Удаляем из текущего места
      removeCategoryById(data.categories, id)

      if (newParentId === null) {
        // Становится корневой
        Object.assign(cat, { ...getPlainCat(cat), parent_id: undefined })
        data.categories.push(cat)
      } else {
        const newParent = findCategoryById(data.categories, newParentId)
        if (!newParent) {
          return HttpResponse.json({ detail: 'Новая родительская категория не найдена' }, { status: 404 })
        }
        if (!newParent.subcategories) newParent.subcategories = []
        Object.assign(cat, { ...cat, parent_id: newParentId })
        newParent.subcategories.push(cat)
      }
    }

    return HttpResponse.json({ category: { id: cat.id, title: cat.title, parent_id: cat.parent_id ?? null } })
  }),

  // DELETE /api/v1/categories/:id — удаление
  http.delete('/api/v1/categories/:id', ({ params }) => {
    const id = parseInt(params.id as string, 10)
    const cat = findCategoryById(data.categories, id)
    if (!cat) {
      return HttpResponse.json({ detail: 'Категория не найдена' }, { status: 404 })
    }
    if (hasChildren(data.categories, id)) {
      return HttpResponse.json(
        { detail: 'Нельзя удалить категорию с подкатегориями. Сначала удалите или переместите вложенные категории.' },
        { status: 422 },
      )
    }
    removeCategoryById(data.categories, id)
    return HttpResponse.json({ category_id: id })
  }),
]

// Вспомогательная — отбрасываем subcategories для plain-копии
function getPlainCat(cat: CategoryRaw): CategoryRaw {
  const { subcategories: _, ...rest } = cat
  return rest
}
