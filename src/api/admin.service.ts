import api from './axios';

export const adminService = {
  async getStats() {
    try {
      const { data } = await api.get('/admin/stats');
      return {
        users: data.users ?? 0,
        products: data.products ?? 0,
        orders: data.orders ?? 0,
        revenue: data.revenue ?? 0,
        lowStock: data.low_stock ?? data.lowStock ?? 0,
      };
    } catch {
      // Fallback: compute from individual endpoints
      try {
        const { data } = await api.get('/products', { params: { size: 100 } });
        const prods = Array.isArray(data) ? data : (data?.items || []);
        const lowStock = prods.filter((p: any) => p.quantity <= (p.minimum_stock ?? p.minimumStock ?? 0)).length;
        return {
          users: 0,
          products: prods.length,
          orders: 0,
          revenue: 0,
          lowStock,
        };
      } catch {
        return { users: 0, products: 0, orders: 0, revenue: 0, lowStock: 0 };
      }
    }
  },

  async getRecentOrders() {
    try {
      const { data } = await api.get('/orders', { params: { limit: 10 } });
      return data || [];
    } catch {
      return [];
    }
  },

  async getRecentLogs() {
    try {
      const { data } = await api.get('/activity-logs', { params: { limit: 15 } });
      return data || [];
    } catch {
      return [];
    }
  },
};
