import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatBRL(value: number | string | null | undefined): string {
  const n = typeof value === 'string' ? parseFloat(value) : value ?? 0;
  if (Number.isNaN(n)) return 'R$ 0,00';
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

export function formatCompactBRL(value: number | null | undefined): string {
  const n = value ?? 0;
  if (Math.abs(n) < 1000) return formatBRL(n);
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  });
}

export function formatDate(
  date: string | Date | null | undefined,
  pattern = 'dd/MM/yyyy'
): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (Number.isNaN(d.getTime())) return '—';
  return format(d, pattern, { locale: ptBR });
}

export function formatMonthLabel(month: number, year: number): string {
  const d = new Date(year, month - 1, 1);
  return format(d, "MMMM 'de' yyyy", { locale: ptBR });
}

export const monthNames = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
