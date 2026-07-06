import { Product } from '@/types';
import { NexusBadge } from '@/components/ui/NexusBadge';
import { NexusButton } from '@/components/ui/NexusButton';
import { Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProductsTableProps {
  products: Product[];
  onDelete: (id: string) => void;
}

export const ProductsTable = ({ products, onDelete }: ProductsTableProps) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" role="table">
        <thead>
          <tr className="border-b border-border">
            <th className="nexus-table-header text-left py-3 px-4 w-12"></th>
            <th className="nexus-table-header text-left py-3 px-4">Produto</th>
            <th className="nexus-table-header text-left py-3 px-4 hidden sm:table-cell">SKU</th>
            <th className="nexus-table-header text-left py-3 px-4 hidden md:table-cell">Categoria</th>
            <th className="nexus-table-header text-right py-3 px-4">Qtd</th>
            <th className="nexus-table-header text-right py-3 px-4 hidden sm:table-cell">Preço</th>
            <th className="nexus-table-header text-left py-3 px-4">Status</th>
            <th className="nexus-table-header text-right py-3 px-4">Ações</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const isLowStock = product.quantity <= product.minimumStock;
            return (
              <tr key={product.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                <td className="py-2 px-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center overflow-hidden border border-border">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-[10px] text-muted-foreground font-bold">N/A</div>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <p className="font-medium text-foreground">{product.name}</p>
                  <p className="text-xs text-muted-foreground sm:hidden">{product.sku}</p>
                </td>
                <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell font-mono text-xs">{product.sku}</td>
                <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{product.category}</td>
                <td className="py-3 px-4 text-right font-semibold tabular-nums text-foreground">{product.quantity}</td>
                <td className="py-3 px-4 text-right text-muted-foreground hidden sm:table-cell tabular-nums">
                  R$ {product.price.toFixed(2)}
                </td>
                <td className="py-3 px-4">
                  {isLowStock ? (
                    <NexusBadge variant={product.quantity === 0 ? 'danger' : 'warning'}>
                      {product.quantity === 0 ? 'Sem estoque' : 'Estoque baixo'}
                    </NexusBadge>
                  ) : (
                    <NexusBadge variant="success">Normal</NexusBadge>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <NexusButton variant="ghost" size="sm" onClick={() => navigate(`/produtos/editar/${product.id}`)} aria-label="Editar">
                      <Pencil className="w-4 h-4" />
                    </NexusButton>
                    <NexusButton variant="ghost" size="sm" onClick={() => onDelete(product.id)} aria-label="Excluir">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </NexusButton>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
