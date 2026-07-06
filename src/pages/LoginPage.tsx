import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { NexusButton } from '@/components/ui/NexusButton';
import { LogIn } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast.error(typeof error === 'string' ? error : error?.message || 'Erro ao fazer login');
    } else {
      toast.success('Login realizado com sucesso!');
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-2xl mx-auto mb-4">
            N
          </div>
          <h1 className="text-2xl font-bold text-foreground">Entrar no Stock Hub</h1>
          <p className="text-sm text-muted-foreground mt-1">Acesse sua conta para continuar.</p>
        </div>

        <div className="nexus-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="nexus-label">Email</label>
              <input
                type="email"
                className="nexus-input"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="nexus-label">Senha</label>
              <input
                type="password"
                className="nexus-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <NexusButton type="submit" disabled={loading} className="w-full">
              <LogIn className="w-4 h-4" />
              {loading ? 'Entrando...' : 'Entrar'}
            </NexusButton>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Não tem uma conta?{' '}
          <Link to="/cadastro" className="text-primary font-medium hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
