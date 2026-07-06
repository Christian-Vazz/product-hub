import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, RefreshCw, LogOut, Menu, X, ChevronLeft,
  ShoppingCart, ShoppingBag, Shield, PackagePlus, Store,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore } from '@/store/cart.store';
import { NexusBadge } from '@/components/ui/NexusBadge';

const AppSidebarInner = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAdmin, signOut, user } = useAuth();
  const { itemCount, toggleCart } = useCartStore();
  const count = itemCount();

  // Items visible to ALL authenticated users
  const userItems = [
    { icon: Store, label: 'Loja', path: '/loja' },
    { icon: ShoppingBag, label: 'Minhas Compras', path: '/compras' },
  ];

  // Items visible ONLY to admins
  const adminMainItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Package, label: 'Produtos', path: '/produtos' },
    { icon: RefreshCw, label: 'Movimentações', path: '/movimentacoes' },
  ];

  const adminExtraItems = [
    { icon: Shield, label: 'Painel Admin', path: '/admin' },
    { icon: PackagePlus, label: 'Reabastecer', path: '/reabastecer' },
  ];

  const renderLink = (item: { icon: any; label: string; path: string }) => {
    const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => setMobileOpen(false)}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
          active ? 'bg-sidebar-active-bg text-sidebar-active' : 'text-sidebar-foreground hover:bg-secondary hover:text-foreground',
          collapsed && 'justify-center px-0'
        )}
        title={collapsed ? item.label : undefined}
      >
        <item.icon className="w-5 h-5 shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-card border border-border shadow-sm"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-card border-r border-sidebar-border flex flex-col z-50 transition-all duration-300',
          collapsed ? 'w-[72px]' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className={cn('flex items-center gap-3 p-5 border-b border-sidebar-border', collapsed && 'justify-center px-3')}>
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">N</div>
          {!collapsed && <span className="text-lg font-bold tracking-tight text-foreground">Stock Hub</span>}
          <button className="ml-auto lg:hidden" onClick={() => setMobileOpen(false)}>
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {/* Admin-only main navigation */}
          {isAdmin && (
            <>
              {adminMainItems.map(renderLink)}
              {!collapsed && (
                <div className="pt-3 pb-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 font-semibold">Loja</p>
                </div>
              )}
              {collapsed && <div className="border-t border-sidebar-border my-2" />}
            </>
          )}

          {/* User navigation (visible to all) */}
          {userItems.map(renderLink)}

          {/* Cart button */}
          <button
            onClick={() => { toggleCart(); setMobileOpen(false); }}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 w-full text-sidebar-foreground hover:bg-secondary hover:text-foreground',
              collapsed && 'justify-center px-0'
            )}
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 shrink-0" />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[10px] flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </div>
            {!collapsed && <span>Carrinho</span>}
          </button>

          {/* Admin-only extra navigation */}
          {isAdmin && (
            <>
              <div className={cn('pt-4 pb-1', collapsed && 'hidden')}>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 font-semibold">Admin</p>
              </div>
              {collapsed && <div className="border-t border-sidebar-border my-2" />}
              {adminExtraItems.map(renderLink)}
            </>
          )}
        </nav>

        <div className="hidden lg:block px-3 py-2 border-t border-sidebar-border">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-sidebar-foreground hover:bg-secondary transition-all',
              collapsed && 'justify-center px-0'
            )}
          >
            <ChevronLeft className={cn('w-5 h-5 transition-transform', collapsed && 'rotate-180')} />
            {!collapsed && <span>Recolher</span>}
          </button>
        </div>

        <div className="px-3 py-3 border-t border-sidebar-border">
          <button
            onClick={signOut}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-sidebar-foreground hover:text-destructive hover:bg-destructive/10 transition-all',
              collapsed && 'justify-center px-0'
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export const AppSidebar = AppSidebarInner;
