import type {
  DashboardData,
  MonthComparison,
  Transaction,
} from '@/types';
import { api } from '@/lib/api';
import { monthNames } from '@/lib/formatters';

type Tx = Transaction;

function monthKey(d: Date): { month: number; year: number } {
  return { month: d.getMonth() + 1, year: d.getFullYear() };
}

export async function fetchDashboard(
  baseMonth: number,
  baseYear: number,
  categoryNames: Map<number, string>
): Promise<DashboardData> {
  const requests: Promise<Tx[]>[] = [];
  const months: { month: number; year: number }[] = [];

  const baseDate = new Date(baseYear, baseMonth - 1, 1);
  for (let i = 5; i >= 0; i--) {
    const d = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
    const k = monthKey(d);
    months.push(k);
    requests.push(
      api.listTransactions({ month: k.month, year: k.year })
    );
  }

  const results = await Promise.all(requests);

  const baseIndex = months.length - 1;
  const baseTx = results[baseIndex] ?? [];
  const allCompleted = results.flat().filter((t) => t.status === 'COMPLETED');

  const totalReceitasMes = baseTx
    .filter((t) => t.type === 'INCOME' && t.status === 'COMPLETED')
    .reduce((s, t) => s + t.amount, 0);
  const totalDespesasMes = baseTx
    .filter((t) => t.type === 'EXPENSE' && t.status === 'COMPLETED')
    .reduce((s, t) => s + t.amount, 0);

  // saldoAtual = receitas - despesas de todos os meses até o atual
  const saldoAtual = allCompleted
    .filter((t) => {
      const txDate = new Date(t.date + 'T00:00:00');
      const k = monthKey(txDate);
      return (
        k.year < baseYear ||
        (k.year === baseYear && k.month <= baseMonth)
      );
    })
    .reduce((s, t) => s + (t.type === 'INCOME' ? t.amount : -t.amount), 0);

  // saldoProjetado = saldoAtual + pendentes + (não realizações futuras do mês)
  const pendentes = baseTx.filter((t) => t.status === 'PENDING');
  const saldoProjetado =
    saldoAtual +
    pendentes.reduce(
      (s, t) => s + (t.type === 'INCOME' ? t.amount : -t.amount),
      0
    );

  // despesasPorCategoria (mês atual, completed)
  const byCategory = new Map<string, number>();
  baseTx
    .filter((t) => t.type === 'EXPENSE' && t.status === 'COMPLETED')
    .forEach((t) => {
      const name =
        categoryNames.get(t.categoryId) ?? 'Sem categoria';
      byCategory.set(name, (byCategory.get(name) ?? 0) + t.amount);
    });
  const despesasPorCategoria = Array.from(byCategory.entries())
    .map(([categoryName, total]) => ({ categoryName, total }))
    .sort((a, b) => b.total - a.total);

  // receitaVsDespesa6Meses
  const receitaVsDespesa6Meses: MonthComparison[] = months.map((k, i) => {
    const txs = results[i] ?? [];
    return {
      month: k.month,
      year: k.year,
      totalReceitas: txs
        .filter((t) => t.type === 'INCOME' && t.status === 'COMPLETED')
        .reduce((s, t) => s + t.amount, 0),
      totalDespesas: txs
        .filter((t) => t.type === 'EXPENSE' && t.status === 'COMPLETED')
        .reduce((s, t) => s + t.amount, 0),
    };
  });

  const ultimosLancamentos = [...baseTx]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, 10);

  const fixosPendentesMes = baseTx.filter(
    (t) => t.status === 'PENDING' && t.recurringTransactionId != null
  );

  return {
    saldoAtual,
    totalReceitasMes,
    totalDespesasMes,
    saldoMes: totalReceitasMes - totalDespesasMes,
    saldoProjetado,
    despesasPorCategoria,
    receitaVsDespesa6Meses,
    ultimosLancamentos,
    fixosPendentesMes,
  };
}

export function monthShortName(month: number): string {
  return monthNames[month - 1]?.slice(0, 3) ?? '';
}
