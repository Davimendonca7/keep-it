'use client';

import { useMemo, useState } from 'react';
import {
  Plus,
  ArrowRightLeft,
  Pencil,
  Trash2,
  Loader2,
  Check,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  PageHeader,
  EmptyState,
  ErrorState,
} from '@/components/common';
import { StatusBadge } from '@/components/type-badges';
import { MonthYearSelector } from '@/components/month-year-selector';
import { TransactionFormDialog } from './transaction-form-dialog';
import { useAsync, useCurrentMonthYear } from '@/lib/use-async';
import { ApiError, api } from '@/lib/api';
import { formatBRL, formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type {
  Category,
  Transaction,
  TransactionStatus,
} from '@/types';

type StatusFilter = 'ALL' | TransactionStatus;

export default function TransactionsPage() {
  const { month, year } = useCurrentMonthYear();
  const [selectedMonth, setSelectedMonth] = useState(month);
  const [selectedYear, setSelectedYear] = useState(year);
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<StatusFilter>('ALL');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [deletingLoader, setDeletingLoader] = useState(false);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const {
    data: categories,
    loading: catLoading,
  } = useAsync<Category[]>(() => api.listCategories(), []);

  const {
    data: transactions,
    loading,
    error,
    refetch,
    setData,
  } = useAsync<Transaction[]>(
    () =>
      api.listTransactions({
        month: selectedMonth,
        year: selectedYear,
        categoryId,
        status: status === 'ALL' ? undefined : status,
      }),
    [selectedMonth, selectedYear, categoryId, status]
  );

  const categoryMap = useMemo(() => {
    const m = new Map<number, string>();
    categories?.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [categories]);

  const enriched = useMemo(() => {
    return (transactions ?? []).map((t) => ({
      ...t,
      categoryName: t.categoryName ?? categoryMap.get(t.categoryId) ?? '—',
    }));
  }, [transactions, categoryMap]);

  const totals = useMemo(() => {
    const income = enriched
      .filter((t) => t.type === 'INCOME' && t.status === 'COMPLETED')
      .reduce((s, t) => s + t.amount, 0);
    const expense = enriched
      .filter((t) => t.type === 'EXPENSE' && t.status === 'COMPLETED')
      .reduce((s, t) => s + t.amount, 0);
    return { income, expense };
  }, [enriched]);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (t: Transaction) => {
    setEditing(t);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeletingLoader(true);
    try {
      await api.deleteTransaction(deleting.id);
      toast.success('Transação excluída.');
      setData((prev) => prev?.filter((t) => t.id !== deleting.id) ?? null);
      setDeleting(null);
    } catch {
      toast.error('Não foi possível excluir a transação.');
    } finally {
      setDeletingLoader(false);
    }
  };

  const handleConfirm = async (id: number) => {
    setConfirmingId(id);
    try {
      const updated = await api.confirmTransaction(id);
      setData(
        (prev) => prev?.map((t) => (t.id === id ? updated : t)) ?? null
      );
      toast.success('Lançamento confirmado.');
    } catch {
      toast.error('Não foi possível confirmar o lançamento.');
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Transações"
        subtitle="Acompanhe receitas e despesas do período."
        action={
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova transação</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        }
      />

      {/* Filtros */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <MonthYearSelector
          month={selectedMonth}
          year={selectedYear}
          onChange={(m, y) => {
            setSelectedMonth(m);
            setSelectedYear(y);
          }}
        />
        <div className="flex flex-wrap gap-2">
          <Select
            value={categoryId ? String(categoryId) : 'all'}
            onValueChange={(v) =>
              setCategoryId(v === 'all' ? undefined : Number(v))
            }
          >
            <SelectTrigger className="h-9 w-[12rem] gap-1.5">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(v: StatusFilter) => setStatus(v)}
          >
            <SelectTrigger className="h-9 w-[10rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos status</SelectItem>
              <SelectItem value="PENDING">Pendentes</SelectItem>
              <SelectItem value="COMPLETED">Realizados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Resumo */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Receitas"
          value={formatBRL(totals.income)}
          variant="success"
        />
        <SummaryCard
          label="Despesas"
          value={formatBRL(totals.expense)}
          variant="destructive"
        />
        <SummaryCard
          label="Saldo do mês"
          value={formatBRL(totals.income - totals.expense)}
          variant={totals.income - totals.expense >= 0 ? 'success' : 'destructive'}
        />
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : enriched.length === 0 ? (
        <EmptyState
          icon={ArrowRightLeft}
          title="Nenhuma transação no período"
          description="Adicione lançamentos ou ajuste os filtros para visualizá-los aqui."
          action={
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova transação
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card animate-fade-in">
          {enriched.map((t, idx) => (
            <div
              key={t.id}
              className={cn(
                'group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/40',
                idx > 0 && 'border-t'
              )}
            >
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                  t.type === 'INCOME'
                    ? 'bg-success/10 text-success'
                    : 'bg-destructive/10 text-destructive'
                )}
              >
                {t.type === 'INCOME' ? '+' : '−'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">
                    {t.description}
                  </p>
                  {t.recurringTransactionId && (
                    <span className="hidden rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
                      Fixa
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <span>{t.categoryName}</span>
                  <span aria-hidden>·</span>
                  <span>{formatDate(t.date)}</span>
                  <StatusBadge status={t.status} />
                </div>
              </div>
              <div className="flex items-center gap-2">
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
                {t.status === 'PENDING' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                    onClick={() => handleConfirm(t.id)}
                    disabled={confirmingId === t.id}
                  >
                    {confirmingId === t.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                    Confirmar
                  </Button>
                )}
                <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEdit(t)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleting(t)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <TransactionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transaction={editing}
        categories={categories ?? []}
        onSaved={refetch}
      />

      <AlertDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O lançamento{' '}
              <span className="font-medium text-foreground">
                {deleting?.description}
              </span>{' '}
              será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingLoader}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deletingLoader}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deletingLoader && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  variant,
}: {
  label: string;
  value: string;
  variant: 'success' | 'destructive';
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          'mt-1 text-lg font-semibold tabular-nums',
          variant === 'success' ? 'text-success' : 'text-destructive'
        )}
      >
        {value}
      </p>
    </div>
  );
}
