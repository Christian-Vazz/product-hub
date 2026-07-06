import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { NexusButton } from '@/components/ui/NexusButton';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, displayName);
    if (error) {
      toast.error(typeof error === 'string' ? error : error?.message || 'Erro ao criar conta');
    } else {
      toast.success('Conta criada com sucesso!');
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
          <h1 className="text-2xl font-bold text-foreground">Criar Conta</h1>
          <p className="text-sm text-muted-foreground mt-1">Preencha os dados para se cadastrar.</p>
        </div>

        <div className="nexus-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="nexus-label">Nome completo</label>
              <input
                type="text"
                className="nexus-input"
                placeholder="Seu nome"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
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
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <NexusButton type="submit" disabled={loading} className="w-full">
              <UserPlus className="w-4 h-4" />
              {loading ? 'Criando...' : 'Criar Conta'}
            </NexusButton>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
