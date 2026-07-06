import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { NexusCard } from '@/components/ui/NexusCard';
import { ProductForm } from '@/components/forms/ProductForm';
import { useInventoryStore } from '@/store/inventory.store';
import { productsService } from '@/api/products.service';
import { ProductInput } from '@/types';
import { toast } from 'sonner';

const ProductCreatePage = () => {
  const navigate = useNavigate();
  const { addProduct } = useInventoryStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: ProductInput) => {
    setIsLoading(true);
    try {
      const created = await productsService.create(data);
      addProduct(created);
      toast.success('Produto cadastrado com sucesso!');
      navigate('/produtos');
    } catch (err: any) {
      toast.error('Erro ao cadastrar: ' + (err.response?.data?.detail || err.message));
    }
    setIsLoading(false);
  };

  return (
    <PageContainer title="Novo Produto" subtitle="Preencha os dados do novo produto.">
      <NexusCard>
        <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />
      </NexusCard>
    </PageContainer>
  );
};

export default ProductCreatePage;
