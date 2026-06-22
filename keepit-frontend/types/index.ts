export type TransactionType = 'INCOME' | 'EXPENSE';

export type TransactionStatus = 'PENDING' | 'COMPLETED';

export interface Category {
  id: number;
  name: string;
  type: TransactionType;
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  status: TransactionStatus;
  categoryId: number;
  categoryName?: string;
  recurringTransactionId?: number | null;
}

export interface RecurringTransaction {
  id: number;
  description: string;
  amount: number;
  dayOfMonth: number;
  type: TransactionType;
  active: boolean;
  categoryId: number;
  categoryName?: string;
}

export interface CategoryTotal {
  categoryName: string;
  total: number;
}

export interface MonthComparison {
  month: number;
  year: number;
  totalReceitas: number;
  totalDespesas: number;
}

export interface DashboardData {
  saldoAtual: number;
  totalReceitasMes: number;
  totalDespesasMes: number;
  saldoMes: number;
  saldoProjetado: number;
  despesasPorCategoria: CategoryTotal[];
  receitaVsDespesa6Meses: MonthComparison[];
  ultimosLancamentos: Transaction[];
  fixosPendentesMes: Transaction[];
}

export interface AuthResponse {
  token: string;
}

export interface CreateCategoryDTO {
  name: string;
  type: TransactionType;
}

export interface CreateTransactionDTO {
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  categoryId: number;
}

export interface CreateRecurringDTO {
  description: string;
  amount: number;
  dayOfMonth: number;
  type: TransactionType;
  categoryId: number;
}

export interface RegisterDTO {
  username: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}
