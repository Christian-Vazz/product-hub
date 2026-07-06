import { AlertCircle } from 'lucide-react';
import { NexusButton } from '@/components/ui/NexusButton';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({
  message = 'Ocorreu um erro ao carregar os dados.',
  onRetry,
}: ErrorStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
    <div className="p-4 rounded-2xl bg-destructive/10 mb-4">
      <AlertCircle className="w-8 h-8 text-destructive" />
    </div>
    <h3 className="font-semibold text-foreground mb-1">Erro</h3>
    <p className="text-sm text-muted-foreground mb-4">{message}</p>
    {onRetry && (
      <NexusButton variant="secondary" size="sm" onClick={onRetry}>
        Tentar novamente
      </NexusButton>
    )}
  </div>
);
