import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingState } from '@/components/feedback/LoadingState';
import { AppLayout } from '@/components/layout/AppLayout';
import DashboardPage from '@/pages/DashboardPage';
import ShopPage from '@/pages/ShopPage';

/**
 * Home page that renders different content based on user role:
 * - Admin: Dashboard with inventory analytics
 * - Regular user: Redirects to the shop
 */
export const UserHomePage = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <LoadingState />;
  if (!user) return <Navigate to="/login" replace />;

  if (isAdmin) {
    return <AppLayout><DashboardPage /></AppLayout>;
  }

  // Regular users see the shop as their homepage
  return <AppLayout><ShopPage /></AppLayout>;
};

export default UserHomePage;
