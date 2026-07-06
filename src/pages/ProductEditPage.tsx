import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { NexusCard } from '@/components/ui/NexusCard';
import { ProductForm } from '@/components/forms/ProductForm';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useInventoryStore } from '@/store/inventory.store';
import { productsService } from '@/api/products.service';
import { Product, ProductInput } from '@/types';
import { toast } from 'sonner';

const ProductEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { updateProduct } = useInventoryStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await productsService.getById(id!);
      if (data) {
        setProduct(data);
      } else {
        toast.error('Produto não encontrado.');
        navigate('/produtos');
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleSubmit = async (data: ProductInput) => {
    setSaving(true);
    try {
      const updated = await productsService.update(id!, data);
      updateProduct(id!, updated);
      toast.success('Produto atualizado com sucesso!');
      navigate('/produtos');
    } catch (err: any) {
      toast.error('Erro ao atualizar: ' + (err.response?.data?.detail || err.message));
    }
    setSaving(false);
  };

  if (loading) return <LoadingState />;

  return (
    <PageContainer title="Editar Produto" subtitle={product?.name}>
      <NexusCard>
        {product && <ProductForm initialData={product} onSubmit={handleSubmit} isLoading={saving} />}
      </NexusCard>
    </PageContainer>
  );
};

export default ProductEditPage;
