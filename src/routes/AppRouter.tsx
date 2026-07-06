import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute, AdminRoute, PublicRoute } from '@/components/layout/RouteGuards';
import DashboardPage from '@/pages/DashboardPage';
import ProductsPage from '@/pages/ProductsPage';
import ProductCreatePage from '@/pages/ProductCreatePage';
import ProductEditPage from '@/pages/ProductEditPage';
import StockMovementsPage from '@/pages/StockMovementsPage';
import ShopPage from '@/pages/ShopPage';
import PurchasesPage from '@/pages/PurchasesPage';
import AdminPage from '@/pages/AdminPage';
import RestockPage from '@/pages/RestockPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import NotFoundPage from '@/pages/NotFoundPage';
import { UserHomePage } from '@/pages/UserHomePage';

const withLayout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/cadastro" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Home route — admin goes to Dashboard, user goes to Shop */}
      <Route path="/" element={<ProtectedRoute><UserHomePage /></ProtectedRoute>} />

      {/* Routes available to ALL authenticated users */}
      <Route path="/loja" element={<ProtectedRoute>{withLayout(<ShopPage />)}</ProtectedRoute>} />
      <Route path="/compras" element={<ProtectedRoute>{withLayout(<PurchasesPage />)}</ProtectedRoute>} />

      {/* Admin-only routes */}
      <Route path="/dashboard" element={<AdminRoute>{withLayout(<DashboardPage />)}</AdminRoute>} />
      <Route path="/produtos" element={<AdminRoute>{withLayout(<ProductsPage />)}</AdminRoute>} />
      <Route path="/produtos/novo" element={<AdminRoute>{withLayout(<ProductCreatePage />)}</AdminRoute>} />
      <Route path="/produtos/editar/:id" element={<AdminRoute>{withLayout(<ProductEditPage />)}</AdminRoute>} />
      <Route path="/movimentacoes" element={<AdminRoute>{withLayout(<StockMovementsPage />)}</AdminRoute>} />
      <Route path="/admin" element={<AdminRoute>{withLayout(<AdminPage />)}</AdminRoute>} />
      <Route path="/reabastecer" element={<AdminRoute>{withLayout(<RestockPage />)}</AdminRoute>} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
);
