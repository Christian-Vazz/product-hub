import { create } from 'zustand';
import { Product, StockMovement, DashboardSummary, LowStockProduct, MovementChartItem } from '@/types';

interface InventoryState {
  // Data
  products: Product[];
  movements: StockMovement[];
  dashboardSummary: DashboardSummary | null;
  lowStockProducts: LowStockProduct[];
  movementChart: MovementChartItem[];

  // UI State
  isLoading: boolean;
  error: string | null;

  // Filters
  productSearch: string;
  productCategoryFilter: string;
  movementTypeFilter: string;
  movementSearch: string;

  // Actions
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Product) => void;
  deleteProduct: (id: string) => void;
  setMovements: (movements: StockMovement[]) => void;
  addMovement: (movement: StockMovement) => void;
  setDashboardSummary: (summary: DashboardSummary) => void;
  setLowStockProducts: (products: LowStockProduct[]) => void;
  setMovementChart: (data: MovementChartItem[]) => void;
  setLoading: (status: boolean) => void;
  setError: (error: string | null) => void;
  setProductSearch: (search: string) => void;
  setProductCategoryFilter: (category: string) => void;
  setMovementTypeFilter: (type: string) => void;
  setMovementSearch: (search: string) => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  products: [],
  movements: [],
  dashboardSummary: null,
  lowStockProducts: [],
  movementChart: [],
  isLoading: false,
  error: null,
  productSearch: '',
  productCategoryFilter: '',
  movementTypeFilter: '',
  movementSearch: '',

  setProducts: (products) => set({ products, isLoading: false }),
  addProduct: (product) => set((s) => ({ products: [product, ...s.products] })),
  updateProduct: (id, product) => set((s) => ({
    products: s.products.map((p) => (p.id === id ? product : p)),
  })),
  deleteProduct: (id) => set((s) => ({
    products: s.products.filter((p) => p.id !== id),
  })),
  setMovements: (movements) => set({ movements, isLoading: false }),
  addMovement: (movement) => set((s) => ({ movements: [movement, ...s.movements] })),
  setDashboardSummary: (dashboardSummary) => set({ dashboardSummary }),
  setLowStockProducts: (lowStockProducts) => set({ lowStockProducts }),
  setMovementChart: (movementChart) => set({ movementChart }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setProductSearch: (productSearch) => set({ productSearch }),
  setProductCategoryFilter: (productCategoryFilter) => set({ productCategoryFilter }),
  setMovementTypeFilter: (movementTypeFilter) => set({ movementTypeFilter }),
  setMovementSearch: (movementSearch) => set({ movementSearch }),
}));
