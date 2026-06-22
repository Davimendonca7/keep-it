'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Check } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  Category,
  RecurringTransaction,
  TransactionType,
} from '@/types';
import { ApiError, api } from '@/lib/api';
import { cn } from '@/lib/utils';

const schema = z.object({
  description: z
    .string()
    .min(1, 'Informe uma descrição')
    .max(120, 'Máximo de 120 caracteres'),
  amount: z.coerce
    .number({ invalid_type_error: 'Informe um valor válido' })
    .refine((v) => v > 0, 'O valor deve ser maior que zero'),
  dayOfMonth: z.coerce
    .number({ invalid_type_error: 'Informe o dia' })
    .int()
    .min(1, 'Dia entre 1 e 31')
    .max(31, 'Dia entre 1 e 31'),
  type: z.enum(['INCOME', 'EXPENSE']),
  categoryId: z.coerce
    .number({ invalid_type_error: 'Selecione uma categoria' })
    .refine((v) => v > 0, 'Selecione uma categoria'),
});
type FormValues = z.infer<typeof schema>;

export function RecurringFormDialog({
  open,
  onOpenChange,
  recurring,
  categories,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  recurring?: RecurringTransaction | null;
  categories: Category[];
  onSaved: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!recurring;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: '',
      amount: undefined,
      dayOfMonth: 1,
      type: 'EXPENSE',
      categoryId: 0,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        description: recurring?.description ?? '',
        amount: recurring?.amount ?? undefined,
        dayOfMonth: recurring?.dayOfMonth ?? 1,
        type: recurring?.type ?? 'EXPENSE',
        categoryId: recurring?.categoryId ?? 0,
      });
    }
  }, [open, recurring, reset]);

  const selectedType = watch('type');
  const selectedCategoryId = watch('categoryId');
  const availableCategories = categories.filter(
    (c) => c.type === selectedType
  );

  useEffect(() => {
    if (
      selectedCategoryId &&
      !availableCategories.some((c) => c.id === selectedCategoryId)
    ) {
      setValue('categoryId', 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType]);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      if (isEdit && recurring) {
        await api.updateRecurring(recurring.id, values);
        toast.success('Conta fixa atualizada.');
      } else {
        await api.createRecurring(values);
        toast.success('Conta fixa criada.');
      }
      onSaved();
      onOpenChange(false);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? 'Não foi possível salvar. Verifique os dados.'
          : 'Não foi possível conectar ao servidor.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar conta fixa' : 'Nova conta fixa'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Atualize os dados do lançamento recorrente.'
              : 'Lançamentos que se repetem todo mês, como aluguel ou salário.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Descrição</label>
            <Textarea
              placeholder="Ex: Aluguel, Netflix, salário..."
              rows={2}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Valor (R$)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                inputMode="decimal"
                {...register('amount')}
              />
              {errors.amount && (
                <p className="text-xs text-destructive">
                  {errors.amount.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Dia do mês</label>
              <Input
                type="number"
                min="1"
                max="31"
                placeholder="1-31"
                inputMode="numeric"
                {...register('dayOfMonth')}
              />
              {errors.dayOfMonth && (
                <p className="text-xs text-destructive">
                  {errors.dayOfMonth.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo</label>
            <RadioGroup
              value={selectedType}
              onValueChange={(v: TransactionType) =>
                setValue('type', v, { shouldValidate: true })
              }
              className="grid grid-cols-2 gap-3"
            >
              <TypeOption
                value="INCOME"
                label="Receita"
                accent="success"
                selected={selectedType === 'INCOME'}
              />
              <TypeOption
                value="EXPENSE"
                label="Despesa"
                accent="destructive"
                selected={selectedType === 'EXPENSE'}
              />
            </RadioGroup>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Categoria</label>
            <Select
              value={selectedCategoryId ? String(selectedCategoryId) : ''}
              onValueChange={(v) =>
                setValue('categoryId', Number(v), { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar categoria" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.length === 0 ? (
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    Nenhuma categoria de{' '}
                    {selectedType === 'INCOME' ? 'receita' : 'despesa'}.
                  </div>
                ) : (
                  availableCategories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-xs text-destructive">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TypeOption({
  value,
  label,
  accent,
  selected,
}: {
  value: string;
  label: string;
  accent: 'success' | 'destructive';
  selected: boolean;
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors',
        selected
          ? accent === 'success'
            ? 'border-success/50 bg-success/5 text-success'
            : 'border-destructive/50 bg-destructive/5 text-destructive'
          : 'border-border hover:bg-accent'
      )}
    >
      <RadioGroupItem value={value} className="sr-only" />
      {selected && <Check className="h-3.5 w-3.5" />}
      {label}
    </label>
  );
}
