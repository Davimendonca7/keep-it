'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import type { Category, TransactionType } from '@/types';
import { ApiError, api } from '@/lib/api';

const schema = z.object({
  name: z
    .string()
    .min(1, 'Informe o nome')
    .max(50, 'Máximo de 50 caracteres'),
  type: z.enum(['INCOME', 'EXPENSE']),
});
type FormValues = z.infer<typeof schema>;

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  category?: Category | null;
  onSaved: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!category;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', type: 'EXPENSE' },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: category?.name ?? '',
        type: category?.type ?? 'EXPENSE',
      });
    }
  }, [open, category, reset]);

  const selectedType = watch('type');

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      if (isEdit && category) {
        await api.updateCategory(category.id, values);
        toast.success('Categoria atualizada.');
      } else {
        await api.createCategory(values);
        toast.success('Categoria criada.');
      }
      onSaved();
      onOpenChange(false);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? 'Não foi possível salvar. Verifique se já não existe uma categoria com o mesmo nome e tipo.'
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
          <DialogTitle>{isEdit ? 'Editar categoria' : 'Nova categoria'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Atualize o nome e o tipo da categoria.'
              : 'Crie uma categoria para classificar suas transações.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nome</label>
            <Input
              placeholder="Ex: Moradia, Salário..."
              {...register('name')}
              autoFocus
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo</label>
            <RadioGroup
              value={selectedType}
              onValueChange={(v: TransactionType) =>
                setValue('type', v, { shouldValidate: true })
              }
              className="grid grid-cols-2 gap-3"
              disabled={isEdit}
            >
              <TypeOption
                value="INCOME"
                label="Receita"
                description="Entrada de dinheiro"
                accent="success"
                selected={selectedType === 'INCOME'}
              />
              <TypeOption
                value="EXPENSE"
                label="Despesa"
                description="Saída de dinheiro"
                accent="destructive"
                selected={selectedType === 'EXPENSE'}
              />
            </RadioGroup>
            {isEdit && (
              <p className="text-xs text-muted-foreground">
                O tipo não pode ser alterado após a criação.
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
  description,
  accent,
  selected,
}: {
  value: string;
  label: string;
  description: string;
  accent: 'success' | 'destructive';
  selected: boolean;
}) {
  return (
    <label
      className={`relative flex cursor-pointer flex-col gap-0.5 rounded-lg border p-3 transition-colors ${
        selected
          ? accent === 'success'
            ? 'border-success/50 bg-success/5'
            : 'border-destructive/50 bg-destructive/5'
          : 'border-border hover:bg-accent'
      }`}
    >
      <RadioGroupItem value={value} className="sr-only" />
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        {selected && (
          <span
            className={`h-2 w-2 rounded-full ${
              accent === 'success' ? 'bg-success' : 'bg-destructive'
            }`}
          />
        )}
      </div>
      <span className="text-xs text-muted-foreground">{description}</span>
    </label>
  );
}
