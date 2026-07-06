import { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { NexusCard } from '@/components/ui/NexusCard';
import { NexusBadge } from '@/components/ui/NexusBadge';
import { NexusButton } from '@/components/ui/NexusButton';
import { NexusModal } from '@/components/ui/NexusModal';
import { StatCard } from '@/components/charts/StatCard';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Users, Package, ShoppingBag, Activity, AlertTriangle, DollarSign, Shield, UserCog, Trash2 } from 'lucide-react';
import { adminService } from '@/api/admin.service';
import api from '@/api/axios';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface UserData {
  id: number;
  email: string;
  display_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const AdminPage = () => {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, revenue: 0, lowStock: 0 });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [editUser, setEditUser] = useState<UserData | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [adminStats, orders, logs] = await Promise.all([
        adminService.getStats(),
        adminService.getRecentOrders(),
        adminService.getRecentLogs(),
      ]);

      setStats(adminStats);
      setRecentOrders(orders);
      setRecentLogs(logs);
      setLoading(false);
    };
    load();
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data || []);
    } catch {
      setUsers([]);
    }
    setUsersLoading(false);
  };

  const handleEditUser = (u: UserData) => {
    setEditUser(u);
    setEditRole(u.role);
    setEditActive(u.is_active);
  };

  const handleSaveUser = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      await api.put(`/users/${editUser.id}`, {
        role: editRole,
        is_active: editActive,
      });
      toast.success('Usuário atualizado!');
      setEditUser(null);
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erro ao atualizar usuário.');
    }
    setSaving(false);
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success('Usuário excluído!');
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erro ao excluir usuário.');
    }
  };

  if (loading) return <LoadingState />;

  const statusCfg: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'danger' | 'default' }> = {
    pending: { label: 'Pendente', variant: 'warning' },
    confirmed: { label: 'Confirmado', variant: 'success' },
    shipped: { label: 'Enviado', variant: 'info' },
    delivered: { label: 'Entregue', variant: 'success' },
    cancelled: { label: 'Cancelado', variant: 'danger' },
  };

  return (
    <PageContainer title="Painel Admin" subtitle="Visão completa do sistema e gerenciamento de usuários.">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Usuários" value={stats.users} icon={<Users className="w-5 h-5" />} iconBg="bg-info/10" iconColor="text-info" />
        <StatCard title="Produtos" value={stats.products} icon={<Package className="w-5 h-5" />} iconBg="bg-primary/10" iconColor="text-primary" />
        <StatCard title="Pedidos" value={stats.orders} icon={<ShoppingBag className="w-5 h-5" />} iconBg="bg-success/10" iconColor="text-success" />
        <StatCard title="Receita" value={`R$ ${stats.revenue.toFixed(2)}`} icon={<DollarSign className="w-5 h-5" />} iconBg="bg-success/10" iconColor="text-success" />
        <StatCard title="Estoque Baixo" value={stats.lowStock} icon={<AlertTriangle className="w-5 h-5" />} iconBg="bg-warning/10" iconColor="text-warning" />
      </div>

      {/* User Management */}
      <NexusCard title="Gerenciamento de Usuários">
        {usersLoading ? (
          <LoadingState />
        ) : users.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum usuário encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="nexus-table-header text-left py-3 px-4">Usuário</th>
                  <th className="nexus-table-header text-left py-3 px-4">Email</th>
                  <th className="nexus-table-header text-left py-3 px-4">Role</th>
                  <th className="nexus-table-header text-left py-3 px-4">Status</th>
                  <th className="nexus-table-header text-left py-3 px-4">Cadastro</th>
                  <th className="nexus-table-header text-right py-3 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">{u.display_name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{u.email}</td>
                    <td className="py-3 px-4">
                      <NexusBadge variant={u.role === 'admin' ? 'info' : 'default'}>
                        {u.role === 'admin' ? (
                          <><Shield className="w-3 h-3 mr-1" /> Admin</>
                        ) : (
                          'Usuário'
                        )}
                      </NexusBadge>
                    </td>
                    <td className="py-3 px-4">
                      <NexusBadge variant={u.is_active ? 'success' : 'danger'}>
                        {u.is_active ? 'Ativo' : 'Inativo'}
                      </NexusBadge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <NexusButton size="sm" variant="secondary" onClick={() => handleEditUser(u)}>
                          <UserCog className="w-3 h-3" /> Editar
                        </NexusButton>
                        {String(u.id) !== currentUser?.id && (
                          <NexusButton size="sm" variant="danger" onClick={() => handleDeleteUser(u.id)}>
                            <Trash2 className="w-3 h-3" />
                          </NexusButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </NexusCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <NexusCard title="Pedidos Recentes">
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum pedido ainda.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.slice(0, 8).map((order: any) => {
                const cfg = statusCfg[order.status] || statusCfg.pending;
                return (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">#{String(order.id).slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <NexusBadge variant={cfg.variant}>{cfg.label}</NexusBadge>
                      <span className="text-sm font-semibold tabular-nums">R$ {Number(order.total).toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </NexusCard>

        {/* Activity Logs */}
        <NexusCard title="Atividade Recente">
          {recentLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma atividade registrada.</p>
          ) : (
            <div className="space-y-3">
              {recentLogs.slice(0, 8).map((log: any) => (
                <div key={log.id} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                  <Activity className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-foreground">{log.action}</p>
                    <p className="text-xs text-muted-foreground">{log.details}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(log.created_at).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </NexusCard>
      </div>

      {/* Edit User Modal */}
      <NexusModal isOpen={!!editUser} onClose={() => setEditUser(null)} title={`Editar Usuário: ${editUser?.display_name || ''}`}>
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-secondary/50 text-sm">
            <p className="text-muted-foreground">Email: <span className="font-bold text-foreground">{editUser?.email}</span></p>
          </div>
          <div className="space-y-1.5">
            <label className="nexus-label">Função (Role)</label>
            <select className="nexus-input" value={editRole} onChange={(e) => setEditRole(e.target.value)}>
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="nexus-label">Status</label>
            <select className="nexus-input" value={editActive ? 'true' : 'false'} onChange={(e) => setEditActive(e.target.value === 'true')}>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <NexusButton variant="secondary" onClick={() => setEditUser(null)}>Cancelar</NexusButton>
            <NexusButton onClick={handleSaveUser} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </NexusButton>
          </div>
        </div>
      </NexusModal>
    </PageContainer>
  );
};

export default AdminPage;
