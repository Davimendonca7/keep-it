'use client';

import { useMemo, useState, lazy, Suspense } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Scale,
  ArrowRightLeft,
  CheckCircle2,
  Loader2,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import {
  PageHeader,
  EmptyState,
  ErrorState,
} from '@/components/common';
import { StatusBadge } from '@/components/type-badges';
import { MonthYearSelector } from '@/components/month-year-selector';
import { useAsync, useCurrentMonthYear } from '@/lib/use-async';
import { api, ApiError } from '@/lib/api';
import { fetchDashboard, monthShortName } from '@/lib/dashboard';
import { formatBRL, formatCompactBRL, formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type {
  Category,
  Transaction,
} from '@/types';

// Lazy load charts component
const DashboardCharts = lazy(() =>
  import('./dashboard-charts').then((m) => ({ default: m.DashboardCharts }))
);

export default function DashboardPage() {
  const { month, year } = useCurrentMonthYear();
  const [selectedMonth, setSelectedMonth] = useState(month);
  const [selectedYear, setSelectedYear] = useState(year);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const { data: categories } = useAsync<Category[]>(
    () => api.listCategories(),
    []
  );

  const categoryNames = useMemo(() => {
    const m = new Map<number, string>();
    categories?.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [categories]);

  const {
    data: dashboard,
    loading,
    error,
    refetch,
    setData,
  } = useAsync(
    () => fetchDashboard(selectedMonth, selectedYear, categoryNames),
    [selectedMonth, selectedYear, categories]
  );

  const handleConfirm = async (t: Transaction) => {
    setConfirmingId(t.id);
    try {
      await api.confirmTransaction(t.id);
      toast.success('Lançamento confirmado.');
      refetch();
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? 'Não foi possível confirmar o lançamento.'
          : 'Não foi possível conectar ao servidor.';
      toast.error(msg);
    } finally {
      setConfirmingId(null);
    }
  };

  const barData = (dashboard?.receitaVsDespesa6Meses ?? []).map((m) => ({
    name: `${monthShortName(m.month)}/${String(m.year).slice(2)}`,
    Receitas: m.totalReceitas,
    Despesas: m.totalDespesas,
  }));

  const pieData = (dashboard?.despesasPorCategoria ?? []).map((c) => ({
    name: c.categoryName,
    value: c.total,
  }));

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Visão consolidada das suas finanças."
        action={
          <MonthYearSelector
            month={selectedMonth}
            year={selectedYear}
            onChange={(m, y) => {
              setSelectedMonth(m);
              setSelectedYear(y);
            }}
          />
        }
      />

      {loading ? (
        <DashboardSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !dashboard ? null : (
        <div className="space-y-6 animate-fade-in">
          {/* Cards de saldo */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Saldo atual"
              value={formatBRL(dashboard.saldoAtual)}
              icon={Wallet}
              variant={
                dashboard.saldoAtual >= 0 ? 'neutral' : 'destructive'
              }
            />
            <StatCard
              label="Receitas do mês"
              value={formatBRL(dashboard.totalReceitasMes)}
              icon={TrendingUp}
              variant="success"
            />
            <StatCard
              label="Despesas do mês"
              value={formatBRL(dashboard.totalDespesasMes)}
              icon={TrendingDown}
              variant="destructive"
            />
            <StatCard
              label="Saldo projetado"
              value={formatBRL(dashboard.saldoProjetado)}
              icon={Scale}
              variant={
                dashboard.saldoProjetado >= 0 ? 'neutral' : 'destructive'
              }
              hint="Inclui lançamentos pendentes"
            />
          </div>

          {/* Gráficos */}
          <Suspense fallback={
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Skeleton className="h-80 rounded-xl" />
              <Skeleton className="h-80 rounded-xl" />
            </div>
          }>
            <DashboardCharts pieData={pieData} barData={barData} />
          </Suspense>

          {/* Lançamentos + Pendentes */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Últimos lançamentos */}
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Últimos lançamentos</h3>
                  <p className="text-xs text-muted-foreground">
                    Do mês selecionado
                  </p>
                </div>
              </div>
              {dashboard.ultimosLancamentos.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                  Nenhum lançamento no período.
                </div>
              ) : (
                <div className="space-y-1">
                  {dashboard.ultimosLancamentos.map((t, i) => (
                    <div
                      key={t.id}
                      className={cn(
                        'flex items-center gap-3 py-2',
                        i > 0 && 'border-t'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-medium',
                          t.type === 'INCOME'
                            ? 'bg-success/10 text-success'
                            : 'bg-destructive/10 text-destructive'
                        )}
                      >
                        {t.type === 'INCOME' ? '+' : '−'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {t.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(t.date)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'text-sm font-semibold tabular-nums',
                          t.type === 'INCOME'
                            ? 'text-success'
                            : 'text-destructive'
                        )}
                      >
                        {t.type === 'INCOME' ? '+' : '−'}
                        {formatBRL(t.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Fixos pendentes */}
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">
                    Contas fixas pendentes
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Aguardando confirmação
                  </p>
                </div>
                {dashboard.fixosPendentesMes.length > 0 && (
                  <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
                    {dashboard.fixosPendentesMes.length}
                  </span>
                )}
              </div>
              {dashboard.fixosPendentesMes.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                  Tudo em dia! Nenhum fixo pendente.
                </div>
              ) : (
                <div className="space-y-1">
                  {dashboard.fixosPendentesMes.map((t, i) => (
                    <div
                      key={t.id}
                      className={cn(
                        'flex items-center gap-3 py-2',
                        i > 0 && 'border-t'
                      )}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {t.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDate(t.date)}</span>
                          <StatusBadge status={t.status} />
                        </div>
                      </div>
                      <span
                        className={cn(
                          'text-sm font-semibold tabular-nums',
                          t.type === 'INCOME'
                            ? 'text-success'
                            : 'text-destructive'
                        )}
                      >
                        {t.type === 'INCOME' ? '+' : '−'}
                        {formatBRL(t.amount)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 px-2 text-xs"
                        onClick={() => handleConfirm(t)}
                        disabled={confirmingId === t.id}
                      >
                        {confirmingId === t.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        Confirmar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  variant,
  hint,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'success' | 'destructive' | 'neutral';
  hint?: string;
}) {
  return (
    <Card className="relative overflow-hidden p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p
            className={cn(
              'mt-1 truncate text-xl font-semibold tabular-nums md:text-2xl',
              variant === 'success' && 'text-success',
              variant === 'destructive' && 'text-destructive'
            )}
          >
            {value}
          </p>
          {hint && (
            <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
          )}
        </div>
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            variant === 'success' && 'bg-success/10 text-success',
            variant === 'destructive' && 'bg-destructive/10 text-destructive',
            variant === 'neutral' && 'bg-primary/10 text-primary'
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}
