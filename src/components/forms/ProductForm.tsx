import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ProductInput } from '@/types';
import { NexusButton } from '@/components/ui/NexusButton';
import { useNavigate } from 'react-router-dom';
import { ImagePlus, Link as LinkIcon, Upload } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  sku: z.string().min(3, 'SKU inválido'),
  quantity: z.coerce.number().min(0, 'Quantidade mínima é 0'),
  minimumStock: z.coerce.number().min(0, 'Estoque mínimo deve ser >= 0'),
  price: z.coerce.number().min(0.01, 'Preço deve ser maior que zero'),
  imageUrl: z.string().optional(),
});

interface ProductFormProps {
  initialData?: Partial<ProductInput>;
  onSubmit: (data: ProductInput) => void;
  isLoading?: boolean;
}

const categories = ['Periféricos', 'Monitores', 'Áudio', 'Armazenamento', 'Notebooks', 'Acessórios'];

export const ProductForm = ({ initialData, onSubmit, isLoading }: ProductFormProps) => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData,
  });

  const previewUrl = watch('imageUrl');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert('Arquivo muito grande. Limite de 2MB para imagens locais.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('imageUrl', reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Imagem Preview e Upload */}
        <div className="md:col-span-2 lg:col-span-1 space-y-4">
          <label className="nexus-label">Imagem do Produto</label>
          <div className="relative aspect-square rounded-xl border-2 border-dashed border-border overflow-hidden bg-secondary/30 flex flex-col items-center justify-center text-muted-foreground group">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <ImagePlus className="w-10 h-10 opacity-20" />
                <span className="text-xs">Sem imagem</span>
              </div>
            )}
            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <label className="p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:scale-110 transition-transform">
                <Upload className="w-4 h-4" />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <LinkIcon className="w-3 h-3" />
              <span>Ou cole uma URL da imagem</span>
            </div>
            <input 
              {...register('imageUrl')} 
              className="nexus-input text-xs" 
              placeholder="https://exemplo.com/imagem.jpg" 
            />
          </div>
        </div>

        {/* Outros Campos */}
        <div className="md:col-span-2 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="nexus-label">Nome do Produto</label>
            <input {...register('name')} className="nexus-input" placeholder="Ex: Teclado Mecânico RGB" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="nexus-label">SKU</label>
            <input {...register('sku')} className="nexus-input" placeholder="TEC-MEC-001" />
            {errors.sku && <p className="text-xs text-destructive">{errors.sku.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="nexus-label">Categoria</label>
            <select {...register('category')} className="nexus-input">
              <option value="">Selecione uma categoria</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="nexus-label">Preço (R$)</label>
            <input type="number" step="0.01" {...register('price')} className="nexus-input" placeholder="0.00" />
            {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="nexus-label">Quantidade</label>
            <input type="number" {...register('quantity')} className="nexus-input" placeholder="0" />
            {errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="nexus-label">Estoque Mínimo</label>
            <input type="number" {...register('minimumStock')} className="nexus-input" placeholder="0" />
            {errors.minimumStock && <p className="text-xs text-destructive">{errors.minimumStock.message}</p>}
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="nexus-label">Descrição</label>
            <textarea {...register('description')} rows={3} className="nexus-input resize-none" placeholder="Descreva o produto..." />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <NexusButton variant="secondary" type="button" onClick={() => navigate('/produtos')}>
          Cancelar
        </NexusButton>
        <NexusButton type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar Produto'}
        </NexusButton>
      </div>
    </form>
  );
};
