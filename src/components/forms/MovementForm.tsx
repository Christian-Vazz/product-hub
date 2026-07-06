import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { NexusButton } from '@/components/ui/NexusButton';
import { Product } from '@/types';

const movementSchema = z.object({
  productId: z.string().min(1, 'Selecione um produto'),
  movementType: z.enum(['IN', 'OUT', 'ADJUSTMENT'], { required_error: 'Selecione o tipo' }),
  quantity: z.coerce.number().min(1, 'Quantidade deve ser > 0'),
  userResponsible: z.string().min(1, 'Responsável é obrigatório'),
  observation: z.string().optional(),
});

type MovementFormData = z.infer<typeof movementSchema>;

interface MovementFormProps {
  products: Product[];
  onSubmit: (data: MovementFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const MovementForm = ({ products, onSubmit, onCancel, isLoading }: MovementFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <label className="nexus-label">Produto</label>
        <select {...register('productId')} className="nexus-input">
          <option value="">Selecione um produto</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {errors.productId && <p className="text-xs text-destructive">{errors.productId.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="nexus-label">Tipo de Movimentação</label>
        <select {...register('movementType')} className="nexus-input">
          <option value="">Selecione o tipo</option>
          <option value="IN">Entrada</option>
          <option value="OUT">Saída</option>
          <option value="ADJUSTMENT">Ajuste</option>
        </select>
        {errors.movementType && <p className="text-xs text-destructive">{errors.movementType.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="nexus-label">Quantidade</label>
        <input type="number" {...register('quantity')} className="nexus-input" placeholder="0" />
        {errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="nexus-label">Responsável</label>
        <input {...register('userResponsible')} className="nexus-input" placeholder="Nome do responsável" />
        {errors.userResponsible && <p className="text-xs text-destructive">{errors.userResponsible.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="nexus-label">Observação</label>
        <textarea {...register('observation')} rows={2} className="nexus-input resize-none" placeholder="Opcional..." />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <NexusButton variant="secondary" type="button" onClick={onCancel}>Cancelar</NexusButton>
        <NexusButton type="submit" disabled={isLoading}>
          {isLoading ? 'Registrando...' : 'Registrar'}
        </NexusButton>
      </div>
    </form>
  );
};
