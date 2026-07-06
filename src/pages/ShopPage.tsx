import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PageContainer } from '@/components/layout/PageContainer';
import { NexusCard } from '@/components/ui/NexusCard';
import { NexusButton } from '@/components/ui/NexusButton';
import { NexusBadge } from '@/components/ui/NexusBadge';
import { NexusModal } from '@/components/ui/NexusModal';
import { LoadingState } from '@/components/feedback/LoadingState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ShoppingCart, Plus } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { productsService } from '@/api/products.service';
import { toast } from 'sonner';

interface ShopProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  minimumStock: number;
  imageUrl?: string;
}

const ShopPage = () => {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const { addItem } = useCartStore();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await productsService.getAll();
        setProducts(data);
      } catch {
        setProducts([]);
      }
      setLoading(false);
    };
    load();
  }, []);

  const categories = [...new Set(products.map((p) => p.category))];

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !categoryFilter || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const handleAdd = (product: ShopProduct) => {
    if (product.quantity <= 0) {
      toast.error('Produto sem estoque.');
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      maxQuantity: product.quantity,
    });
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  if (loading) return <LoadingState />;

  return (
    <PageContainer title="Loja" subtitle="Explore nossos produtos disponíveis.">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          className="nexus-input flex-1"
          placeholder="Buscar produto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="nexus-input w-full sm:w-48" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">Todas as categorias</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Nenhum produto encontrado" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <div key={product.id} className="nexus-card flex flex-col">
              <div className="aspect-square bg-secondary flex items-center justify-center overflow-hidden border-b border-border/50">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                ) : (
                  <ShoppingCart className="w-10 h-10 text-muted-foreground/30" />
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <NexusBadge variant="default" className="self-start mb-2">{product.category}</NexusBadge>
                <h3 className="font-semibold text-foreground text-sm mb-1">{product.name}</h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-lg font-bold text-primary tabular-nums">R$ {Number(product.price).toFixed(2)}</span>
                  {product.quantity > 0 ? (
                    <NexusButton size="sm" onClick={() => handleAdd(product)}>
                      <Plus className="w-3 h-3" /> Adicionar
                    </NexusButton>
                  ) : (
                    <NexusBadge variant="danger">Sem estoque</NexusBadge>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{product.quantity} em estoque</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default ShopPage;
