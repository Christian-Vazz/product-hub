export interface DashboardSummary {
  totalProducts: number;
  totalItemsInStock: number;
  lowStockProductsCount: number;
  totalEntries: number;
  totalExits: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  minimumStock: number;
}

export interface MovementChartItem {
  date: string;
  entries: number;
  exits: number;
}
