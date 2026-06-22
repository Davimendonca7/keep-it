'use client';

import { useMemo, useState } from 'react';
import { Plus, Tags, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  PageHeader,
  EmptyState,
  ErrorState,
} from '@/components/common';
import { TypeBadge } from '@/components/type-badges';
import { CategoryFormDialog } from './category-form-dialog';
import { useAsync } from '@/lib/use-async';
import { ApiError, api } from '@/lib/api';
import type { Category, TransactionType } from '@/types';

type Filter = 'ALL' | 'INCOME' | 'EXPENSE';

export default function CategoriesPage() {
  const [filter, setFilter] = useState<Filter>('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [deletingLoader, setDeletingLoader] = useState(false);

  const {
    data: categories,
    loading,
    error,
    refetch,
    setData,
  } = useAsync<Category[]>(() => api.listCategories(), []);

  const filtered = useMemo(() => {
    if (!categories) return [];
    if (filter === 'ALL') return categories;
    return categories.filter((c) => c.type === filter);
  }, [categories, filter]);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (c: Category) => {
    setEditing(c);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeletingLoader(true);
    try {
      await api.deleteCategory(deleting.id);
      toast.success('Categoria excluída.');
      setData((prev) => prev?.filter((c) => c.id !== deleting.id) ?? null);
      setDeleting(null);
    } catch (e) {
      const msg =
        e instanceof ApiError && e.status >= 400 && e.status < 500
          ? 'Não foi possível excluir: verifique os dados e tente novamente.'
          : 'Não foi possível excluir esta categoria. Ela pode estar em uso por transações ou contas fixas.';
      toast.error(msg);
    } finally {
      setDeletingLoader(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Categorias"
        subtitle="Organize suas transações com categorias personalizadas."
        action={
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova categoria</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        }
      />

      {/* Filtros */}
      <div className="mb-4 flex gap-2">
        {(['ALL', 'INCOME', 'EXPENSE'] as const).map((f) => (
          <FilterChip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f === 'ALL' ? 'Todas' : f === 'INCOME' ? 'Receitas' : 'Despesas'}
          </FilterChip>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Tags}
          title={
            filter === 'ALL'
              ? 'Nenhuma categoria ainda'
              : `Nenhuma categoria de ${
                  filter === 'INCOME' ? 'receita' : 'despesa'
                }`
          }
          description="Crie categorias para classificar suas transações e ter relatórios mais claros."
          action={
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar categoria
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 animate-fade-in sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="group flex items-center justify-between rounded-xl border bg-card p-4 transition-colors hover:border-border/80 hover:shadow-sm"
            >
              <div className="min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      c.type === 'INCOME' ? 'bg-success' : 'bg-destructive'
                    }`}
                  />
                  <p className="truncate font-medium">{c.name}</p>
                </div>
                <TypeBadge type={c.type} />
              </div>
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openEdit(c)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleting(c)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editing}
        onSaved={refetch}
      />

      <AlertDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A categoria{' '}
              <span className="font-medium text-foreground">
                {deleting?.name}
              </span>{' '}
              será removida permanentemente. Não será possível excluí-la se
              houver transações ou contas fixas vinculadas.
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

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground hover:bg-accent'
      }`}
    >
      {children}
    </button>
  );
}
