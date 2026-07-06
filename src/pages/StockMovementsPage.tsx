import { useEffect, useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { NexusCard } from '@/components/ui/NexusCard';
import { NexusButton } from '@/components/ui/NexusButton';
import { NexusModal } from '@/components/ui/NexusModal';
import { StockMovementsTable } from '@/components/tables/StockMovementsTable';
import { MovementForm } from '@/components/forms/MovementForm';
import { LoadingState } from '@/components/feedback/LoadingState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useInventoryStore } from '@/store/inventory.store';
import { useAuth } from '@/hooks/useAuth';
import { productsService } from '@/api/products.service';
import { stockMovementsService } from '@/api/stockMovements.service';
import { toast } from 'sonner';

const StockMovementsPage = () => {
  const {
    movements,
    products,
    isLoading,
    movementTypeFilter,
    movementSearch,
    setMovements,
    setProducts,
    addMovement,
    setLoading,
    setMovementTypeFilter,
    setMovementSearch,
  } = useInventoryStore();
  const { isAdmin } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [movs, prods] = await Promise.all([
        stockMovementsService.getAll(),
        productsService.getAll(),
      ]);
      setMovements(movs);
      setProducts(prods);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return movements.filter((m) => {
      const matchType = !movementTypeFilter || m.movementType === movementTypeFilter;
      const matchSearch = !movementSearch || m.productName.toLowerCase().includes(movementSearch.toLowerCase());
      return matchType && matchSearch;
    });
  }, [movements, movementTypeFilter, movementSearch]);

  const handleCreateMovement = async (data: any) => {
    setFormLoading(true);
    try {
      const product = products.find((p) => p.id === data.productId);
      const created = await stockMovementsService.create({
        productId: data.productId,
        productName: product?.name || 'Desconhecido',
        movementType: data.movementType,
        quantity: data.quantity,
        userResponsible: data.userResponsible,
        observation: data.observation || '',
      });
      addMovement(created);
      setModalOpen(false);
      toast.success('Movimentação registrada!');
    } catch (err: any) {
      toast.error('Erro: ' + (err.response?.data?.detail || err.message || 'Tente novamente.'));
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <PageContainer
      title="Movimentações"
      subtitle="Registre e acompanhe entradas, saídas e ajustes de estoque."
      action={
        isAdmin ? (
          <NexusButton onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Nova Movimentação
          </NexusButton>
        ) : undefined
      }
    >
      <NexusCard>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input className="nexus-input pl-10" placeholder="Buscar por produto..." value={movementSearch} onChange={(e) => setMovementSearch(e.target.value)} />
          </div>
          <select className="nexus-input w-full sm:w-48" value={movementTypeFilter} onChange={(e) => setMovementTypeFilter(e.target.value)}>
            <option value="">Todos os tipos</option>
            <option value="IN">Entrada</option>
            <option value="OUT">Saída</option>
            <option value="ADJUSTMENT">Ajuste</option>
          </select>
        </div>
        {isLoading && <LoadingState />}
        {!isLoading && filtered.length === 0 && <EmptyState title="Nenhuma movimentação" message="Registre a primeira movimentação de estoque." />}
        {!isLoading && filtered.length > 0 && <StockMovementsTable movements={filtered} />}
      </NexusCard>

      <NexusModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nova Movimentação">
        <MovementForm products={products} onSubmit={handleCreateMovement} onCancel={() => setModalOpen(false)} isLoading={formLoading} />
      </NexusModal>
    </PageContainer>
  );
};

export default StockMovementsPage;
