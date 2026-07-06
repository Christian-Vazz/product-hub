import { useNavigate } from 'react-router-dom';
import { NexusButton } from '@/components/ui/NexusButton';
import { Home } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center animate-fade-in">
        <p className="text-8xl font-bold text-primary/20 mb-4">404</p>
        <h1 className="text-2xl font-bold text-foreground mb-2">Página não encontrada</h1>
        <p className="text-muted-foreground mb-8">A página que você procura não existe ou foi movida.</p>
        <NexusButton onClick={() => navigate('/')}>
          <Home className="w-4 h-4" />
          Voltar ao Dashboard
        </NexusButton>
      </div>
    </div>
  );
};

export default NotFoundPage;
