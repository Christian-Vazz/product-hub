import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { MovementChartItem } from '@/types';
import { NexusCard } from '@/components/ui/NexusCard';

interface MovementChartProps {
  data: MovementChartItem[];
}

export const MovementChart = ({ data }: MovementChartProps) => (
  <NexusCard title="Movimentação Semanal">
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorExits" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220, 13%, 91%)" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'hsl(220, 10%, 46%)', fontSize: 12 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(220, 10%, 46%)', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
              background: 'hsl(0, 0%, 100%)',
            }}
          />
          <Legend />
          <Area type="monotone" dataKey="entries" name="Entradas" stroke="hsl(239, 84%, 67%)" fillOpacity={1} fill="url(#colorEntries)" strokeWidth={2} />
          <Area type="monotone" dataKey="exits" name="Saídas" stroke="hsl(0, 84%, 60%)" fillOpacity={1} fill="url(#colorExits)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </NexusCard>
);
