import api from './axios';
import { Product, ProductInput } from '@/types';

export const productsService = {
  async getAll(): Promise<Product[]> {
    const { data } = await api.get('/products', { params: { size: 100 } });
    // Backend returns paginated response: { items: [...], total, page, size, pages }
    const items = Array.isArray(data) ? data : (data?.items || []);
    return items.map((p: any) => ({
      id: String(p.id),
      name: p.name,
      description: p.description || '',
      category: p.category || '',
      sku: p.sku || '',
      quantity: p.quantity ?? 0,
      minimumStock: p.minimum_stock ?? p.minimumStock ?? 0,
      price: Number(p.price ?? 0),
      createdAt: p.created_at || p.createdAt || '',
      updatedAt: p.updated_at || p.updatedAt || '',
      imageUrl: p.image_url || p.imageUrl || '',
    }));
  },

  async getById(id: string): Promise<Product | undefined> {
    try {
      const { data: p } = await api.get(`/products/${id}`);
      if (!p) return undefined;
      return {
        id: String(p.id),
        name: p.name,
        description: p.description || '',
        category: p.category || '',
        sku: p.sku || '',
        quantity: p.quantity ?? 0,
        minimumStock: p.minimum_stock ?? p.minimumStock ?? 0,
        price: Number(p.price ?? 0),
        createdAt: p.created_at || p.createdAt || '',
        updatedAt: p.updated_at || p.updatedAt || '',
        imageUrl: p.image_url || p.imageUrl || '',
      };
    } catch {
      return undefined;
    }
  },

  async create(data: ProductInput): Promise<Product> {
    const { data: p } = await api.post('/products', {
      name: data.name,
      description: data.description,
      category: data.category,
      sku: data.sku,
      quantity: data.quantity,
      minimum_stock: data.minimumStock,
      price: data.price,
      image_url: data.imageUrl,
    });
    return {
      id: String(p.id),
      name: p.name,
      description: p.description || '',
      category: p.category || '',
      sku: p.sku || '',
      quantity: p.quantity ?? 0,
      minimumStock: p.minimum_stock ?? p.minimumStock ?? 0,
      price: Number(p.price ?? 0),
      createdAt: p.created_at || p.createdAt || '',
      updatedAt: p.updated_at || p.updatedAt || '',
      imageUrl: p.image_url || p.imageUrl || '',
    };
  },

  async update(id: string, data: Partial<ProductInput>): Promise<Product> {
    const payload: any = { ...data };
    if (data.minimumStock !== undefined) {
      payload.minimum_stock = data.minimumStock;
      delete payload.minimumStock;
    }
    if (data.imageUrl !== undefined) {
      payload.image_url = data.imageUrl;
      delete payload.imageUrl;
    }
    const { data: p } = await api.put(`/products/${id}`, payload);
    return {
      id: String(p.id),
      name: p.name,
      description: p.description || '',
      category: p.category || '',
      sku: p.sku || '',
      quantity: p.quantity ?? 0,
      minimumStock: p.minimum_stock ?? p.minimumStock ?? 0,
      price: Number(p.price ?? 0),
      createdAt: p.created_at || p.createdAt || '',
      updatedAt: p.updated_at || p.updatedAt || '',
      imageUrl: p.image_url || p.imageUrl || '',
    };
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },
};
