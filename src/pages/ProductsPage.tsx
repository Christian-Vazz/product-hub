import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { NexusCard } from '@/components/ui/NexusCard';
import { NexusButton } from '@/components/ui/NexusButton';
import { ProductsTable } from '@/components/tables/ProductsTable';
import { LoadingState } from '@/components/feedback/LoadingState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useInventoryStore } from '@/store/inventory.store';
import { productsService } from '@/api/products.service';
import { toast } from 'sonner';

const ProductsPage = () => {
  const navigate = useNavigate();
  const {
    products,
    isLoading,
    error,
    productSearch,
    productCategoryFilter,
    setProducts,
    setLoading,
    setError,
    deleteProduct,
    setProductSearch,
    setProductCategoryFilter,
  } = useInventoryStore();

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productsService.getAll();
      setProducts(data);
    } catch {
      setError('Falha ao carregar produtos.');
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const categories = useMemo(() => [...new Set(products.map((p) => p.category))], [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase());
      const matchCategory = !productCategoryFilter || p.category === productCategoryFilter;
      return matchSearch && matchCategory;
    });
  }, [products, productSearch, productCategoryFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      await productsService.delete(id);
      deleteProduct(id);
      toast.success('Produto excluído com sucesso.');
    } catch {
      toast.error('Erro ao excluir produto.');
    }
  };

  return (
    <PageContainer
      title="Produtos"
      subtitle={`${products.length} produtos cadastrados`}
      action={
        <NexusButton onClick={() => navigate('/produtos/novo')}>
          <Plus className="w-4 h-4" />
          Novo Produto
        </NexusButton>
      }
    >
      <NexusCard>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input className="nexus-input pl-10" placeholder="Buscar por nome ou SKU..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
          </div>
          <select className="nexus-input w-full sm:w-48" value={productCategoryFilter} onChange={(e) => setProductCategoryFilter(e.target.value)}>
            <option value="">Todas as categorias</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {isLoading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={loadProducts} />}
        {!isLoading && !error && filtered.length === 0 && <EmptyState title="Nenhum produto encontrado" message="Tente ajustar os filtros ou cadastre um novo produto." />}
        {!isLoading && !error && filtered.length > 0 && <ProductsTable products={filtered} onDelete={handleDelete} />}
      </NexusCard>
    </PageContainer>
  );
};

export default ProductsPage;
