import { ShoppingCart, Minus, Plus, Trash2, X } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { NexusButton } from '@/components/ui/NexusButton';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '@/api/axios';
import { stockMovementsService } from '@/api/stockMovements.service';
import { toast } from 'sonner';
import { useState } from 'react';

export const CartDrawer = () => {
  const { items, isOpen, setOpen, removeItem, updateQuantity, clearCart, total } = useCartStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Faça login para finalizar a compra.');
      navigate('/login');
      return;
    }

    setChecking(true);
    try {
      // Create order
      const orderTotal = total();
      const { data: order } = await api.post('/orders', {
        total: orderTotal,
        status: 'confirmed',
      });

      // Create order items
      const orderItems = items.map((item) => ({
        product_id: Number(item.productId),
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      await api.post(`/orders/${order.id}/items`, orderItems);

      // Decreasing stock and logging movement is now handled in a single loop
      // but only the movement log is needed as the backend updates stock automatically
      for (const item of items) {
        await stockMovementsService.create({
          productId: item.productId,
          productName: item.name,
          movementType: 'OUT',
          quantity: item.quantity,
          userResponsible: user.email || 'Usuário',
          observation: `Compra - Pedido #${String(order.id).slice(0, 8)}`,
        });
      }

      // Log activity (best effort)
      try {
        await api.post('/activity-logs', {
          user_id: user.id,
          action: 'PURCHASE',
          details: `Compra realizada - R$ ${orderTotal.toFixed(2)} - ${items.length} itens`,
        });
      } catch {
        // optional
      }

      clearCart();
      setOpen(false);
      toast.success('Compra realizada com sucesso!');
      navigate('/compras');
    } catch (err: any) {
      toast.error('Erro ao finalizar compra: ' + (err.response?.data?.detail || err.message || 'Tente novamente.'));
    } finally {
      setChecking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-card border-l border-border shadow-elevated animate-slide-in flex flex-col"
        style={{ animationName: 'none', animation: 'slide-in-right 0.3s ease-out' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Carrinho ({items.length})</h2>
          </div>
          <NexusButton variant="ghost" size="sm" onClick={() => setOpen(false)}>
            <X className="w-4 h-4" />
          </NexusButton>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 && (
            <p className="text-center text-muted-foreground py-12">Seu carrinho está vazio.</p>
          )}
          {items.map((item) => (
            <div key={item.productId} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">R$ {item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="p-1 rounded bg-card border border-border hover:bg-secondary"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm font-semibold w-6 text-center tabular-nums">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="p-1 rounded bg-card border border-border hover:bg-secondary"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <button onClick={() => removeItem(item.productId)} className="p-1 text-destructive hover:bg-destructive/10 rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">Total</span>
              <span className="text-lg font-bold text-foreground tabular-nums">R$ {total().toFixed(2)}</span>
            </div>
            <NexusButton className="w-full" onClick={handleCheckout} disabled={checking}>
              {checking ? 'Processando...' : 'Finalizar Compra'}
            </NexusButton>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
};
