import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { MonthProvider } from '@/context/MonthContext';
import { GuestRoute, ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { LoginPage, RegisterPage } from '@/pages/AuthPages';
import { DashboardPage } from '@/pages/DashboardPage';
import { TransactionsPage } from '@/pages/TransactionsPage';
import { BudgetPage } from '@/pages/BudgetPage';
import { CategoriesPage } from '@/pages/CategoriesPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MonthProvider>
          <Routes>
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route index element={<DashboardPage />} />
                <Route path="income" element={<TransactionsPage key="income" type="INCOME" />} />
                <Route path="expenses" element={<TransactionsPage key="expenses" type="EXPENSE" />} />
                <Route path="budget" element={<BudgetPage />} />
                <Route path="categories" element={<CategoriesPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MonthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
