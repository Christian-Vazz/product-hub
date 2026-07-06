import { StockMovement, MovementType } from '@/types';
import { NexusBadge } from '@/components/ui/NexusBadge';

interface StockMovementsTableProps {
  movements: StockMovement[];
}

const typeConfig: Record<MovementType, { label: string; variant: 'success' | 'danger' | 'info' }> = {
  IN: { label: 'Entrada', variant: 'success' },
  OUT: { label: 'Saída', variant: 'danger' },
  ADJUSTMENT: { label: 'Ajuste', variant: 'info' },
};

export const StockMovementsTable = ({ movements }: StockMovementsTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" role="table">
        <thead>
          <tr className="border-b border-border">
            <th className="nexus-table-header text-left py-3 px-4">Produto</th>
            <th className="nexus-table-header text-left py-3 px-4">Tipo</th>
            <th className="nexus-table-header text-right py-3 px-4">Qtd</th>
            <th className="nexus-table-header text-left py-3 px-4 hidden md:table-cell">Responsável</th>
            <th className="nexus-table-header text-left py-3 px-4 hidden lg:table-cell">Observação</th>
            <th className="nexus-table-header text-left py-3 px-4 hidden sm:table-cell">Data</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((m) => {
            const config = typeConfig[m.movementType];
            return (
              <tr key={m.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                <td className="py-3 px-4 font-medium text-foreground">{m.productName}</td>
                <td className="py-3 px-4">
                  <NexusBadge variant={config.variant}>{config.label}</NexusBadge>
                </td>
                <td className="py-3 px-4 text-right font-semibold tabular-nums text-foreground">{m.quantity}</td>
                <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{m.userResponsible}</td>
                <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell max-w-[200px] truncate">{m.observation}</td>
                <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">
                  {new Date(m.createdAt).toLocaleDateString('pt-BR')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
