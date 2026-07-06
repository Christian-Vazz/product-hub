import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { NexusButton } from './NexusButton';

interface NexusModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const NexusModal = ({ isOpen, onClose, title, children }: NexusModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 nexus-card animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">{title}</h2>
          <NexusButton variant="ghost" size="sm" onClick={onClose} aria-label="Fechar">
            <X className="w-4 h-4" />
          </NexusButton>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
