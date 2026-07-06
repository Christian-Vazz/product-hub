import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export const EmptyState = ({
  title = 'Nenhum dado encontrado',
  message = 'Não há registros para exibir no momento.',
}: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
    <div className="p-4 rounded-2xl bg-secondary mb-4">
      <PackageOpen className="w-8 h-8 text-muted-foreground" />
    </div>
    <h3 className="font-semibold text-foreground mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);
