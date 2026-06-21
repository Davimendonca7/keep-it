'use client';

import { useMemo, useState } from 'react';
import {
  Plus,
  Repeat,
  Pencil,
  Trash2,
  Loader2,
  Sparkles,
  Pause,
  Play,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
import { MonthYearSelector } from '@/components/month-year-selector';
import { RecurringFormDialog } from './recurring-form-dialog';
import { useAsync, useCurrentMonthYear } from '@/lib/use-async';
import { ApiError, api } from '@/lib/api';
import { formatBRL } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type {
  Category,
  RecurringTransaction,
} from '@/types';

export default function RecurringPage() {
  const { month, year } = useCurrentMonthYear();
  const [generateMonth, setGenerateMonth] = useState(month);
  const [generateYear, setGenerateYear] = useState(year);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringTransaction | null>(null);
  const [deleting, setDeleting] = useState<RecurringTransaction | null>(null);
  const [deletingLoader, setDeletingLoader] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);

  const {
    data: categories,
  } = useAsync<Category[]>(() => api.listCategories(), []);

  const {
    data: recurring,
    loading,
    error,
    refetch,
    setData,
  } = useAsync<RecurringTransaction[]>(() => api.listRecurring(), []);

  const categoryMap = useMemo(() => {
    const m = new Map<number, string>();
    categories?.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [categories]);

  const enriched = useMemo(() => {
    return (recurring ?? []).map((r) => ({
      ...r,
      categoryName: r.categoryName ?? categoryMap.get(r.categoryId) ?? '—',
    }));
  }, [recurring, categoryMap]);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (r: RecurringTransaction) => {
    setEditing(r);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeletingLoader(true);
    try {
      await api.deleteRecurring(deleting.id);
      toast.success('Conta fixa excluída.');
      setData((prev) => prev?.filter((r) => r.id !== deleting.id) ?? null);
      setDeleting(null);
    } catch {
      toast.error('Não foi possível excluir a conta fixa.');
    } finally {
      setDeletingLoader(false);
    }
  };

  const handleToggle = async (r: RecurringTransaction) => {
    setTogglingId(r.id);
    try {
      const updated = r.active
        ? await api.pauseRecurring(r.id)
        : await api.resumeRecurring(r.id);
      setData(
        (prev) => prev?.map((x) => (x.id === r.id ? updated : x)) ?? null
      );
      toast.success(r.active ? 'Conta fixa pausada.' : 'Conta fixa reativada.');
    } catch {
      toast.error('Não foi possível alterar o status.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const generated = await api.generateRecurring(generateMonth, generateYear);
      if (generated.length === 0) {
        toast.info('Nenhum novo lançamento para gerar neste período.');
      } else {
        toast.success(
          `${generated.length} lançamento${
            generated.length > 1 ? 's' : ''
          } gerado${generated.length > 1 ? 's' : ''} para o período.`
        );
      }
    } catch {
      toast.error('Não foi possível gerar os lançamentos.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Contas fixas"
        subtitle="Lançamentos que se repetem todo mês. Gere os do período com um clique."
        action={
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova conta fixa</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        }
      />

      {/* Gerar fixos */}
      <div className="mb-5 flex flex-col gap-3 rounded-xl border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">Gerar lançamentos do mês</p>
            <p className="text-xs text-muted-foreground">
              Cria as transações pendentes das contas fixas ativas no período
              selecionado.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MonthYearSelector
            month={generateMonth}
            year={generateYear}
            onChange={(m, y) => {
              setGenerateMonth(m);
              setGenerateYear(y);
            }}
          />
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="gap-2"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Gerar</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : enriched.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="Nenhuma conta fixa ainda"
          description="Cadastre lançamentos recorrentes como aluguel, assinaturas ou salário para gerá-los automaticamente todo mês."
          action={
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova conta fixa
            </Button>
          }
        />
      ) : (
        <div className="space-y-2 animate-fade-in">
          {enriched.map((r) => (
            <div
              key={r.id}
              className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:shadow-sm"
            >
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                  r.type === 'INCOME'
                    ? 'bg-success/10 text-success'
                    : 'bg-destructive/10 text-destructive',
                  !r.active && 'opacity-40'
                )}
              >
                {r.type === 'INCOME' ? '+' : '−'}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      'truncate text-sm font-medium',
                      !r.active && 'text-muted-foreground line-through'
                    )}
                  >
                    {r.description}
                  </p>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                      r.active
                        ? 'bg-success/10 text-success'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {r.active ? (
                      <Play className="h-3 w-3" />
                    ) : (
                      <Pause className="h-3 w-3" />
                    )}
                    {r.active ? 'Ativa' : 'Pausada'}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{r.categoryName}</span>
                  <span aria-hidden>·</span>
                  <span>Dia {r.dayOfMonth}</span>
                </div>
              </div>

              <span
                className={cn(
                  'text-sm font-semibold tabular-nums',
                  r.type === 'INCOME' ? 'text-success' : 'text-destructive'
                )}
              >
                {r.type === 'INCOME' ? '+' : '−'}
                {formatBRL(r.amount)}
              </span>

              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleToggle(r)}
                  disabled={togglingId === r.id}
                  title={r.active ? 'Pausar' : 'Reativar'}
                >
                  {togglingId === r.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : r.active ? (
                    <Pause className="h-3.5 w-3.5" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => openEdit(r)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => setDeleting(r)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <RecurringFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        recurring={editing}
        categories={categories ?? []}
        onSaved={refetch}
      />

      <AlertDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta fixa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A conta fixa{' '}
              <span className="font-medium text-foreground">
                {deleting?.description}
              </span>{' '}
              será removida. As transações já geradas por ela não serão
              afetadas.
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
