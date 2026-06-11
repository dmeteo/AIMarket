import api from '../lib/api';

export interface Category {
  id: number;
  title: string;
  icon?: string;
  parent_id?: number | null;
  subcategories?: Category[];
}

export interface Breadcrumb {
  id: number;
  title: string;
}

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>('/api/v1/categories/');
    return response.data;
  },

  // Flatten category tree into a flat list with depth info
  flattenCategories(categories: Category[], depth = 0): Array<Category & { depth: number }> {
    const result: Array<Category & { depth: number }> = [];
    for (const cat of categories) {
      result.push({ ...cat, depth });
      if (cat.subcategories) {
        result.push(...this.flattenCategories(cat.subcategories, depth + 1));
      }
    }
    return result;
  },

  // Find a category by ID (searches recursively)
  findCategoryById(categories: Category[], id: number): Category | null {
    for (const cat of categories) {
      if (cat.id === id) return cat;
      if (cat.subcategories) {
        const found = this.findCategoryById(cat.subcategories, id);
        if (found) return found;
      }
    }
    return null;
  },

  // Get breadcrumb path: [parent, child, grandchild]
  getBreadcrumbs(categories: Category[], id: number): Breadcrumb[] {
    const path: Breadcrumb[] = [];

    function findPath(cats: Category[], targetId: number): boolean {
      for (const cat of cats) {
        if (cat.id === targetId) {
          path.push({ id: cat.id, title: cat.title });
          return true;
        }
        if (cat.subcategories) {
          if (findPath(cat.subcategories, targetId)) {
            path.unshift({ id: cat.id, title: cat.title });
            return true;
          }
        }
      }
      return false;
    }

    findPath(categories, id);
    return path;
  },

  // Get all descendant category IDs (for filtering products)
  getDescendantIds(category: Category): number[] {
    const ids: number[] = [category.id];
    if (category.subcategories) {
      for (const sub of category.subcategories) {
        ids.push(...this.getDescendantIds(sub));
      }
    }
    return ids;
  },
};
