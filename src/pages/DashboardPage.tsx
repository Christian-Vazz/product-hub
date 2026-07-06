import { useEffect } from 'react';
import { Package, AlertTriangle, ArrowUpRight, ArrowDownRight, Archive } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { StatCard } from '@/components/charts/StatCard';
import { MovementChart } from '@/components/charts/MovementChart';
import { LowStockAlertList } from '@/components/charts/LowStockAlertList';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useInventoryStore } from '@/store/inventory.store';
import { dashboardService } from '@/api/dashboard.service';

const DashboardPage = () => {
  const {
    dashboardSummary,
    lowStockProducts,
    movementChart,
    isLoading,
    setDashboardSummary,
    setLowStockProducts,
    setMovementChart,
    setLoading,
  } = useInventoryStore();

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        const [summary, lowStock, chart] = await Promise.all([
          dashboardService.getSummary().catch(() => ({
            totalProducts: 0, totalItemsInStock: 0, lowStockProductsCount: 0, totalEntries: 0, totalExits: 0,
          })),
          dashboardService.getLowStockProducts().catch(() => []),
          dashboardService.getMovementChart().catch(() => []),
        ]);

        setDashboardSummary(summary);
        setLowStockProducts(lowStock);
        setMovementChart(chart);
      } catch {
        // Ensure we at least set something so the page renders
        setDashboardSummary({
          totalProducts: 0, totalItemsInStock: 0, lowStockProductsCount: 0, totalEntries: 0, totalExits: 0,
        });
      }

      setLoading(false);
    };
    load();
  }, []);

  if (isLoading || !dashboardSummary) return <LoadingState />;

  return (
    <PageContainer title="Dashboard" subtitle="Visão geral do seu inventário em tempo real.">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard title="Total de Produtos" value={dashboardSummary.totalProducts} icon={<Package className="w-5 h-5" />} iconBg="bg-info/10" iconColor="text-info" />
        <StatCard title="Itens em Estoque" value={dashboardSummary.totalItemsInStock} icon={<Archive className="w-5 h-5" />} iconBg="bg-primary/10" iconColor="text-primary" />
        <StatCard title="Entradas (Total)" value={dashboardSummary.totalEntries} icon={<ArrowUpRight className="w-5 h-5" />} iconBg="bg-success/10" iconColor="text-success" />
        <StatCard title="Saídas (Total)" value={dashboardSummary.totalExits} icon={<ArrowDownRight className="w-5 h-5" />} iconBg="bg-destructive/10" iconColor="text-destructive" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2">
          <MovementChart data={movementChart} />
        </div>
        <LowStockAlertList products={lowStockProducts} />
      </div>
    </PageContainer>
  );
};

export default DashboardPage;
