import { LowStockProduct } from '@/types';
import { NexusCard } from '@/components/ui/NexusCard';
import { AlertTriangle } from 'lucide-react';

interface LowStockAlertListProps {
  products: LowStockProduct[];
}

export const LowStockAlertList = ({ products }: LowStockAlertListProps) => (
  <NexusCard title="Alertas de Estoque">
    <div className="space-y-3">
      {products.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">Nenhum alerta no momento.</p>
      )}
      {products.map((product) => (
        <div
          key={product.id}
          className="flex items-center justify-between p-3 rounded-lg bg-warning/5 border border-warning/20"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">{product.name}</p>
              <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-foreground">{product.quantity}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">/ {product.minimumStock}</p>
          </div>
        </div>
      ))}
    </div>
  </NexusCard>
);
