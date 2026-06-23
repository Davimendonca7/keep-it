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
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
  Transaction,
  TransactionType,
} from '@/types';
import { CalendarIcon, Check } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
  date: z.string().min(1, 'Informe a data'),
  type: z.enum(['INCOME', 'EXPENSE']),
  categoryId: z.coerce
    .number({ invalid_type_error: 'Selecione uma categoria' })
    .refine((v) => v > 0, 'Selecione uma categoria'),
});
type FormValues = z.infer<typeof schema>;

export interface TransactionFormData {
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  categoryId: number;
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  transaction,
  categories,
  onSaved,
  defaultType,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  transaction?: Transaction | null;
  categories: Category[];
  onSaved: () => void;
  defaultType?: TransactionType;
}) {
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!transaction;

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
      date: format(new Date(), 'yyyy-MM-dd'),
      type: defaultType ?? 'EXPENSE',
      categoryId: 0,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        description: transaction?.description ?? '',
        amount: transaction?.amount ?? undefined,
        date: transaction?.date ?? format(new Date(), 'yyyy-MM-dd'),
        type: transaction?.type ?? defaultType ?? 'EXPENSE',
        categoryId: transaction?.categoryId ?? 0,
      });
    }
  }, [open, transaction, defaultType, reset]);

  const selectedType = watch('type');
  const selectedDate = watch('date');
  const selectedCategoryId = watch('categoryId');

  const availableCategories = categories.filter(
    (c) => c.type === selectedType
  );

  // Se a categoria selecionada não bate com o tipo, limpa.
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
      if (isEdit && transaction) {
        await api.updateTransaction(transaction.id, values);
        toast.success('Transação atualizada.');
      } else {
        await api.createTransaction(values);
        toast.success('Transação criada.');
      }
      onSaved();
      onOpenChange(false);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? 'Não foi possível salvar. Verifique se o tipo da transação bate com o da categoria.'
          : 'Não foi possível conectar ao servidor.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const parsedDate = selectedDate ? parseISO(selectedDate) : new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar transação' : 'Nova transação'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Atualize os dados do lançamento.'
              : 'Registre uma receita ou despesa.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Descrição</label>
            <Textarea
              placeholder="Ex: Supermercado, salário, conta de luz..."
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
              <label className="text-sm font-medium">Data</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {selectedDate
                      ? format(parsedDate, 'dd/MM/yyyy')
                      : 'Selecionar'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={parsedDate}
                    onSelect={(d) => {
                      if (d)
                        setValue('date', format(d, 'yyyy-MM-dd'), {
                          shouldValidate: true,
                        });
                    }}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.date && (
                <p className="text-xs text-destructive">
                  {errors.date.message}
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
                    {selectedType === 'INCOME' ? 'receita' : 'despesa'}. Crie
                    uma em Categorias.
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
