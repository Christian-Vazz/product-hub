import api from './axios';
import { StockMovement, MovementInput } from '@/types';

export const stockMovementsService = {
  async getAll(): Promise<StockMovement[]> {
    const { data } = await api.get('/stock-movements', { params: { size: 100 } });
    // Backend returns paginated response: { items: [...], total, page, size, pages }
    const items = Array.isArray(data) ? data : (data?.items || []);
    return items.map((m: any) => {
      const typeMap: Record<string, string> = {
        'ENTRY': 'IN',
        'EXIT': 'OUT',
        'ADJUSTMENT': 'ADJUSTMENT',
        'IN': 'IN',
        'OUT': 'OUT'
      };
      const type = (m.movement_type ?? m.movementType ?? '').toUpperCase();
      return {
        id: String(m.id),
        productId: String(m.product_id ?? m.productId),
        productName: m.product_name ?? m.productName ?? '',
        movementType: (typeMap[type] || type) as any,
        quantity: m.quantity ?? 0,
        userResponsible: m.user_responsible ?? m.userResponsible ?? '',
        observation: m.observation || '',
        createdAt: m.created_at || m.createdAt || '',
      };
    });
  },

  async create(data: MovementInput & { productName: string }): Promise<StockMovement> {
    const { data: m } = await api.post('/stock-movements', {
      product_id: Number(data.productId),
      movement_type: data.movementType,
      quantity: data.quantity,
      user_responsible: data.userResponsible,
      observation: data.observation || '',
    });
    
    const typeMap: Record<string, string> = {
      'ENTRY': 'IN',
      'EXIT': 'OUT',
      'ADJUSTMENT': 'ADJUSTMENT'
    };
    const type = (m.movement_type ?? m.movementType ?? '').toUpperCase();

    return {
      id: String(m.id),
      productId: String(m.product_id ?? m.productId),
      productName: m.product_name ?? m.productName ?? '',
      movementType: (typeMap[type] || type) as any,
      quantity: m.quantity ?? 0,
      userResponsible: m.user_responsible ?? m.userResponsible ?? '',
      observation: m.observation || '',
      createdAt: m.created_at || m.createdAt || '',
    };
  },
};
