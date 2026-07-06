import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PageContainer } from '@/components/layout/PageContainer';
import { NexusCard } from '@/components/ui/NexusCard';
import { NexusBadge } from '@/components/ui/NexusBadge';
import { LoadingState } from '@/components/feedback/LoadingState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ShoppingBag } from 'lucide-react';
import api from '@/api/axios';

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  items: { product_name: string; quantity: number; unit_price: number }[];
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default' }> = {
  pending: { label: 'Pendente', variant: 'warning' },
  confirmed: { label: 'Confirmado', variant: 'success' },
  shipped: { label: 'Enviado', variant: 'info' },
  delivered: { label: 'Entregue', variant: 'success' },
  cancelled: { label: 'Cancelado', variant: 'danger' },
};

const PurchasesPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const { data: ordersData } = await api.get('/orders', {
          params: { user_id: user.id },
        });

        if (ordersData) {
          setOrders(ordersData);
        }
      } catch {
        setOrders([]);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return <LoadingState />;

  return (
    <PageContainer title="Minhas Compras" subtitle="Histórico de pedidos realizados.">
      {orders.length === 0 ? (
        <EmptyState title="Nenhuma compra" message="Você ainda não realizou nenhuma compra." />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const cfg = statusConfig[order.status] || statusConfig.pending;
            return (
              <NexusCard key={order.id}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <ShoppingBag className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Pedido #{String(order.id).slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <NexusBadge variant={cfg.variant}>{cfg.label}</NexusBadge>
                    <span className="font-bold text-foreground tabular-nums">R$ {Number(order.total).toFixed(2)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm py-1 border-t border-border/50">
                      <span className="text-muted-foreground">{item.quantity}x {item.product_name}</span>
                      <span className="text-foreground tabular-nums">R$ {(item.quantity * Number(item.unit_price)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </NexusCard>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
};

export default PurchasesPage;
