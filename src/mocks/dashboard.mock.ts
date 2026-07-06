import { DashboardSummary, LowStockProduct, MovementChartItem } from '@/types';

export const mockDashboardSummary: DashboardSummary = {
  totalProducts: 8,
  totalItemsInStock: 105,
  lowStockProductsCount: 4,
  totalEntries: 124,
  totalExits: 89,
};

export const mockLowStockProducts: LowStockProduct[] = [
  { id: '6', name: 'SSD NVMe 1TB', sku: 'SSD-NVM-006', quantity: 0, minimumStock: 20 },
  { id: '2', name: 'Mouse Gamer Ultralight', sku: 'MOU-GAM-002', quantity: 3, minimumStock: 15 },
  { id: '4', name: 'Headset Bluetooth ANC', sku: 'HDS-BLT-004', quantity: 2, minimumStock: 10 },
  { id: '8', name: 'Hub USB-C 7 em 1', sku: 'HUB-USC-008', quantity: 5, minimumStock: 15 },
];

export const mockMovementChart: MovementChartItem[] = [
  { date: 'Seg', entries: 40, exits: 24 },
  { date: 'Ter', entries: 30, exits: 13 },
  { date: 'Qua', entries: 20, exits: 38 },
  { date: 'Qui', entries: 27, exits: 19 },
  { date: 'Sex', entries: 35, exits: 28 },
  { date: 'Sáb', entries: 12, exits: 8 },
  { date: 'Dom', entries: 5, exits: 3 },
];
