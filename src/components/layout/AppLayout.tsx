import { AppSidebar } from './AppSidebar';
import { CartDrawer } from './CartDrawer';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <CartDrawer />
      <main className="lg:pl-64 transition-all duration-300">
        <div className="p-6 pt-16 lg:pt-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
