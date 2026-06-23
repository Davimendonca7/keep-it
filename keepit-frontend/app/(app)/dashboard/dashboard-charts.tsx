'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { formatBRL, formatCompactBRL } from '@/lib/formatters';

const PIE_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--primary))',
  'hsl(var(--warning))',
];

interface PieChartData {
  name: string;
  value: number;
}

interface BarChartData {
  name: string;
  Receitas: number;
  Despesas: number;
}

interface DashboardChartsProps {
  pieData: PieChartData[];
  barData: BarChartData[];
}

export function DashboardCharts({ pieData, barData }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Pie Chart */}
      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold">Despesas por categoria</h3>
          <p className="text-xs text-muted-foreground">
            Distribuição dos gastos do mês
          </p>
        </div>
        {pieData.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            Sem despesas no período.
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="h-56 w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {pieData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => formatBRL(v)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full space-y-1.5 sm:w-1/2">
              {pieData.slice(0, 6).map((c, i) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                      }}
                    />
                    <span className="truncate text-muted-foreground">
                      {c.name}
                    </span>
                  </div>
                  <span className="font-medium tabular-nums">
                    {formatCompactBRL(c.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Bar Chart */}
      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold">Receitas vs Despesas</h3>
          <p className="text-xs text-muted-foreground">
            Últimos 6 meses
          </p>
        </div>
        {barData.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            Sem dados no período.
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(v: number) => formatBRL(v)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                  }}
                />
                <Legend />
                <Bar dataKey="Receitas" fill="hsl(var(--chart-1))" />
                <Bar dataKey="Despesas" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}
