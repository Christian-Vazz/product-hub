import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PageContainer } from '@/components/layout/PageContainer';
import { NexusCard } from '@/components/ui/NexusCard';
import { NexusButton } from '@/components/ui/NexusButton';
import { NexusBadge } from '@/components/ui/NexusBadge';
import { NexusModal } from '@/components/ui/NexusModal';
import { LoadingState } from '@/components/feedback/LoadingState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { PackagePlus, AlertTriangle } from 'lucide-react';
import { productsService } from '@/api/products.service';
import { stockMovementsService } from '@/api/stockMovements.service';
import api from '@/api/axios';
import { toast } from 'sonner';

interface ProductRow {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minimumStock: number;
}

const RestockPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null);
  const [restockQty, setRestockQty] = useState('');
  const [observation, setObservation] = useState('');
  const [saving, setSaving] = useState(false);

  const loadProducts = async () => {
    try {
      const data = await productsService.getAll();
      setProducts(
        data.map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          category: p.category,
          quantity: p.quantity,
          minimumStock: p.minimumStock,
        })).sort((a, b) => a.quantity - b.quantity)
      );
    } catch {
      setProducts([]);
    }
    setLoading(false);
  };

  useEffect(() => { loadProducts(); }, []);

  const handleRestock = async () => {
    if (!selectedProduct || !restockQty || Number(restockQty) <= 0) {
      toast.error('Informe uma quantidade válida.');
      return;
    }

    setSaving(true);
    try {
      const qty = Number(restockQty);

      // Log stock movement (this automatically updates the product quantity in the backend)
      await stockMovementsService.create({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        movementType: 'IN',
        quantity: qty,
        userResponsible: user?.email || 'Admin',
        observation: observation || `Reestoque de ${qty} unidades`,
      });

      // Activity log (best effort)
      try {
        await api.post('/activity-logs', {
          user_id: user?.id,
          action: 'RESTOCK',
          details: `Reestoque: ${selectedProduct.name} +${qty} unidades`,
        });
      } catch {
        // optional, ignore
      }

      toast.success(`${selectedProduct.name} reestocado com +${qty} unidades!`);
      setModalOpen(false);
      setRestockQty('');
      setObservation('');
      setSelectedProduct(null);
      loadProducts();
    } catch {
      toast.error('Erro ao reabastecer.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <PageContainer title="Reabastecer Estoque" subtitle="Adicione unidades aos produtos com estoque baixo.">
      {products.length === 0 ? (
        <EmptyState title="Nenhum produto" message="Cadastre produtos primeiro." />
      ) : (
        <NexusCard>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="nexus-table-header text-left py-3 px-4">Produto</th>
                  <th className="nexus-table-header text-left py-3 px-4 hidden sm:table-cell">SKU</th>
                  <th className="nexus-table-header text-right py-3 px-4">Estoque</th>
                  <th className="nexus-table-header text-right py-3 px-4 hidden sm:table-cell">Mínimo</th>
                  <th className="nexus-table-header text-left py-3 px-4">Status</th>
                  <th className="nexus-table-header text-right py-3 px-4">Ação</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const isLow = p.quantity <= p.minimumStock;
                  return (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">{p.name}</td>
                      <td className="py-3 px-4 text-muted-foreground font-mono text-xs hidden sm:table-cell">{p.sku}</td>
                      <td className="py-3 px-4 text-right font-semibold tabular-nums">{p.quantity}</td>
                      <td className="py-3 px-4 text-right text-muted-foreground hidden sm:table-cell">{p.minimumStock}</td>
                      <td className="py-3 px-4">
                        {isLow ? (
                          <NexusBadge variant={p.quantity === 0 ? 'danger' : 'warning'}>
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {p.quantity === 0 ? 'Sem estoque' : 'Baixo'}
                          </NexusBadge>
                        ) : (
                          <NexusBadge variant="success">Normal</NexusBadge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <NexusButton
                          size="sm"
                          variant="success"
                          onClick={() => {
                            setSelectedProduct(p);
                            setModalOpen(true);
                          }}
                        >
                          <PackagePlus className="w-4 h-4" />
                          Reabastecer
                        </NexusButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </NexusCard>
      )}

      <NexusModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Reabastecer: ${selectedProduct?.name || ''}`}>
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-secondary/50 text-sm">
            <p className="text-muted-foreground">Estoque atual: <span className="font-bold text-foreground">{selectedProduct?.quantity}</span></p>
            <p className="text-muted-foreground">Estoque mínimo: <span className="font-bold text-foreground">{selectedProduct?.minimumStock}</span></p>
          </div>
          <div className="space-y-1.5">
            <label className="nexus-label">Quantidade a adicionar</label>
            <input
              type="number"
              className="nexus-input"
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
              placeholder="Ex: 50"
              min="1"
            />
          </div>
          <div className="space-y-1.5">
            <label className="nexus-label">Observação (opcional)</label>
            <textarea
              className="nexus-input resize-none"
              rows={2}
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Motivo do reestoque..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <NexusButton variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</NexusButton>
            <NexusButton variant="success" onClick={handleRestock} disabled={saving}>
              {saving ? 'Salvando...' : 'Confirmar Reestoque'}
            </NexusButton>
          </div>
        </div>
      </NexusModal>
    </PageContainer>
  );
};

export default RestockPage;
