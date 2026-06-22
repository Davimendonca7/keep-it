'use client';

import { TrendingUp, TrendingDown, Circle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TransactionStatus, TransactionType } from '@/types';

export function TypeBadge({
  type,
  className,
}: {
  type: TransactionType;
  className?: string;
}) {
  const isIncome = type === 'INCOME';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        isIncome
          ? 'bg-success/10 text-success'
          : 'bg-destructive/10 text-destructive',
        className
      )}
    >
      {isIncome ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {isIncome ? 'Receita' : 'Despesa'}
    </span>
  );
}

export function StatusBadge({
  status,
  className,
}: {
  status: TransactionStatus;
  className?: string;
}) {
  const isPending = status === 'PENDING';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        isPending
          ? 'bg-warning/15 text-warning'
          : 'bg-muted text-muted-foreground',
        className
      )}
    >
      {isPending ? (
        <Circle className="h-3 w-3" />
      ) : (
        <CheckCircle2 className="h-3 w-3" />
      )}
      {isPending ? 'Pendente' : 'Realizado'}
    </span>
  );
}
