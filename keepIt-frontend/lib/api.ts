import type {
  Category,
  CreateCategoryDTO,
  CreateRecurringDTO,
  CreateTransactionDTO,
  DashboardData,
  LoginDTO,
  RecurringTransaction,
  RegisterDTO,
  Transaction,
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

const STORAGE_KEY = 'keepit:token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem(STORAGE_KEY, token);
  else localStorage.removeItem(STORAGE_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

type FetchOptions = {
  method?: string;
  body?: unknown;
  params?: Record<string, string | number | undefined | null>;
  skipAuth?: boolean;
  expectEmpty?: boolean;
};

async function request<T>(
  path: string,
  opts: FetchOptions = {}
): Promise<T> {
  const { method = 'GET', body, params, skipAuth, expectEmpty } = opts;

  const url = new URL(
    path.startsWith('http') ? path : `${API_BASE}${path}`
  );
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '')
        url.searchParams.set(k, String(v));
    });
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (!skipAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && !skipAuth) {
    setToken(null);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('keepit:unauthorized'));
    }
    throw new ApiError('Sessão expirada. Faça login novamente.', 401);
  }

  if (!res.ok) {
    let message = `Erro ${res.status}`;
    try {
      const text = await res.text();
      if (text) message = text;
    } catch {
      /* ignore */
    }
    throw new ApiError(message, res.status);
  }

  if (expectEmpty || res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return (await res.json()) as T;
  }
  return undefined as T;
}

export const api = {
  // Auth
  register: (dto: RegisterDTO) =>
    request<void>('/auth/register', {
      method: 'POST',
      body: dto,
      skipAuth: true,
      expectEmpty: true,
    }),
  login: (dto: LoginDTO) =>
    request<{ token: string }>('/auth/login', {
      method: 'POST',
      body: dto,
      skipAuth: true,
    }),

  // Categories
  listCategories: (type?: 'INCOME' | 'EXPENSE') =>
    request<Category[]>('/categories', { params: { type } }),
  createCategory: (dto: CreateCategoryDTO) =>
    request<Category>('/categories', { method: 'POST', body: dto }),
  updateCategory: (id: number, dto: CreateCategoryDTO) =>
    request<Category>(`/categories/${id}`, { method: 'PUT', body: dto }),
  deleteCategory: (id: number) =>
    request<void>(`/categories/${id}`, { method: 'DELETE', expectEmpty: true }),

  // Transactions
  listTransactions: (params: {
    month: number;
    year: number;
    categoryId?: number;
    status?: 'PENDING' | 'COMPLETED';
  }) => request<Transaction[]>('/transactions', { params }),
  createTransaction: (dto: CreateTransactionDTO) =>
    request<Transaction>('/transactions', { method: 'POST', body: dto }),
  updateTransaction: (id: number, dto: CreateTransactionDTO) =>
    request<Transaction>(`/transactions/${id}`, { method: 'PUT', body: dto }),
  deleteTransaction: (id: number) =>
    request<void>(`/transactions/${id}`, { method: 'DELETE', expectEmpty: true }),
  confirmTransaction: (id: number) =>
    request<Transaction>(`/transactions/${id}/confirm`, { method: 'PATCH' }),

  // Recurring
  listRecurring: () => request<RecurringTransaction[]>('/recurring-transactions'),
  createRecurring: (dto: CreateRecurringDTO) =>
    request<RecurringTransaction>('/recurring-transactions', {
      method: 'POST',
      body: dto,
    }),
  updateRecurring: (id: number, dto: CreateRecurringDTO) =>
    request<RecurringTransaction>(`/recurring-transactions/${id}`, {
      method: 'PUT',
      body: dto,
    }),
  deleteRecurring: (id: number) =>
    request<void>(`/recurring-transactions/${id}`, {
      method: 'DELETE',
      expectEmpty: true,
    }),
  pauseRecurring: (id: number) =>
    request<RecurringTransaction>(`/recurring-transactions/${id}/pause`, {
      method: 'PATCH',
    }),
  resumeRecurring: (id: number) =>
    request<RecurringTransaction>(`/recurring-transactions/${id}/resume`, {
      method: 'PATCH',
    }),
  generateRecurring: (month: number, year: number) =>
    request<Transaction[]>('/recurring-transactions/generate', {
      params: { month, year },
    }),

  // Dashboard
  getDashboard: (month: number, year: number) =>
    request<DashboardData>('/dashboard', { params: { month, year } }),
};
