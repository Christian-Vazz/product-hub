import api from './axios';
import { DashboardSummary, LowStockProduct, MovementChartItem } from '@/types';

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    try {
      const { data } = await api.get('/dashboard/summary');
      return {
        totalProducts: data.total_products ?? data.totalProducts ?? 0,
        totalItemsInStock: data.total_items_in_stock ?? data.totalItemsInStock ?? 0,
        lowStockProductsCount: data.total_low_stock_products ?? data.low_stock_products_count ?? data.lowStockProductsCount ?? 0,
        totalEntries: data.total_entries ?? data.totalEntries ?? 0,
        totalExits: data.total_exits ?? data.totalExits ?? 0,
      };
    } catch {
      // Fallback: compute from products and movements
      try {
        const [productsRes, movementsRes] = await Promise.all([
          api.get('/products', { params: { size: 100 } }),
          api.get('/stock-movements', { params: { size: 100 } }),
        ]);

        const prods = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data?.items || []);
        const movs = Array.isArray(movementsRes.data) ? movementsRes.data : (movementsRes.data?.items || []);

        const totalItems = prods.reduce((s: number, p: any) => s + (p.quantity ?? 0), 0);
        const lowStock = prods.filter((p: any) => p.quantity <= (p.minimum_stock ?? p.minimumStock ?? 0));
        const entries = movs
          .filter((m: any) => ['IN', 'ENTRY'].includes(m.movement_type || m.movementType))
          .reduce((s: number, m: any) => s + (m.quantity ?? 0), 0);
        const exits = movs
          .filter((m: any) => ['OUT', 'EXIT'].includes(m.movement_type || m.movementType))
          .reduce((s: number, m: any) => s + (m.quantity ?? 0), 0);

        return {
          totalProducts: prods.length,
          totalItemsInStock: totalItems,
          lowStockProductsCount: lowStock.length,
          totalEntries: entries,
          totalExits: exits,
        };
      } catch {
        return {
          totalProducts: 0,
          totalItemsInStock: 0,
          lowStockProductsCount: 0,
          totalEntries: 0,
          totalExits: 0,
        };
      }
    }
  },

  async getLowStockProducts(): Promise<LowStockProduct[]> {
    try {
      // Correct endpoint: /dashboard/low-stock
      const { data } = await api.get('/dashboard/low-stock');
      const items = data?.items || data || [];
      return (Array.isArray(items) ? items : []).map((p: any) => ({
        id: String(p.id),
        name: p.name,
        sku: p.sku || '',
        quantity: p.quantity ?? 0,
        minimumStock: p.minimum_stock ?? p.minimumStock ?? 0,
      }));
    } catch {
      // Fallback: filter from all products
      try {
        const { data } = await api.get('/products', { params: { size: 100 } });
        const prods = Array.isArray(data) ? data : (data?.items || []);
        return prods
          .filter((p: any) => p.quantity <= (p.minimum_stock ?? p.minimumStock ?? 0))
          .map((p: any) => ({
            id: String(p.id),
            name: p.name,
            sku: p.sku || '',
            quantity: p.quantity ?? 0,
            minimumStock: p.minimum_stock ?? p.minimumStock ?? 0,
          }));
      } catch {
        return [];
      }
    }
  },

  async getMovementChart(): Promise<MovementChartItem[]> {
    try {
      // Correct endpoint: /dashboard/movements
      const { data } = await api.get('/dashboard/movements');
      const movements = data?.movements || data || [];
      if (Array.isArray(movements) && movements.length > 0) {
        return movements.map((m: any) => ({
          date: m.date,
          entries: m.entries ?? 0,
          exits: m.exits ?? 0,
        }));
      }
      throw new Error('No data');
    } catch {
      // Fallback: compute from movements
      try {
        const { data } = await api.get('/stock-movements', { params: { size: 100 } });
        const movs = Array.isArray(data) ? data : (data?.items || []);
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const chartData = days.map((d) => ({ date: d, entries: 0, exits: 0 }));
        movs.forEach((m: any) => {
          const day = new Date(m.created_at || m.createdAt).getDay();
          const type = m.movement_type || m.movementType;
          if (['IN', 'ENTRY'].includes(type)) chartData[day].entries += m.quantity ?? 0;
          if (['OUT', 'EXIT'].includes(type)) chartData[day].exits += m.quantity ?? 0;
        });
        return chartData;
      } catch {
        return [];
      }
    }
  },
};
