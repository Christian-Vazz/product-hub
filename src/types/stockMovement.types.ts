export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  movementType: MovementType;
  quantity: number;
  userResponsible: string;
  observation: string;
  createdAt: string;
}

export type MovementInput = Omit<StockMovement, 'id' | 'createdAt' | 'productName'>;
