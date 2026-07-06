import { ReactNode } from 'react';
import { NexusCard } from '@/components/ui/NexusCard';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
}

export const StatCard = ({ title, value, icon, iconBg, iconColor }: StatCardProps) => (
  <NexusCard>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${iconBg} ${iconColor}`}>
        {icon}
      </div>
    </div>
  </NexusCard>
);
