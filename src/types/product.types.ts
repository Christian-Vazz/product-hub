export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  sku: string;
  quantity: number;
  minimumStock: number;
  price: number;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}

export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
