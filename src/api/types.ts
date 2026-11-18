export type CategoryType = 'INCOME' | 'EXPENSE';

export interface User {
  id: string;
  email: string;
  name: string;
  currency: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  sortOrder: number;
  archived: boolean;
}

export interface Budget {
  id: string;
  categoryId: string;
  month: string;
  amount: number;
}

export interface Transaction {
  id: string;
  type: CategoryType;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  note: string | null;
  categoryId: string;
  category: { id: string; name: string; color: string };
}

export interface TransactionInput {
  categoryId: string;
  date: string;
  description: string;
  amount: number;
  note?: string | null;
}

export interface TransactionList {
  transactions: Transaction[];
  total: number;
  totalAmount: number;
}

export interface SummaryRow {
  categoryId: string;
  name: string;
  color: string;
  budgeted: number;
  actual: number;
  difference: number;
  count: number;
}

export interface SummaryTotals {
  budgeted: number;
  actual: number;
  difference: number;
}

export interface Summary {
  month: string;
  totals: {
    totalIncome: number;
    totalExpenses: number;
    leftOver: number;
    shareSpent: number;
    budgetedIncome: number;
    budgetedExpenses: number;
  };
  income: { rows: SummaryRow[]; totals: SummaryTotals };
  expenses: { rows: SummaryRow[]; totals: SummaryTotals };
}

export interface TrendPoint {
  month: string;
  income: number;
  expenses: number;
}
