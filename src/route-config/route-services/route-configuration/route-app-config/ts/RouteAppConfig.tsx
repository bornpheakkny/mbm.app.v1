import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@layout/outlet/app-outlet/ts/AppOutlet';
import { AccountPage } from '@page/user-services/setting/account-setting/ts/main/AccountPage';
import { BudgetPage } from '@page/user-services/budget/budget-plan/ts/main/BudgetPage';
import { CategoriesPage } from '@page/user-services/category/category-directory/ts/main/CategoriesPage';
import { DashboardPage } from '@page/user-services/summary/dashboard/ts/main/DashboardPage';
import { ForgotPasswordPage } from '@page/auth-services/authentication/recovery-password/ts/main/ForgotPasswordPage';
import { ForgotUsernamePage } from '@page/auth-services/authentication/forgot-username/ts/main/ForgotUsernamePage';
import { LoginPage } from '@page/auth-services/authentication/login/ts/main/LoginPage';
import { RegisterPage } from '@page/auth-services/authentication/register/ts/main/RegisterPage';
import { ResetPasswordPage } from '@page/auth-services/authentication/reset-password/ts/main/ResetPasswordPage';
import { TransactionsPage } from '@page/user-services/transaction/transaction-directory/ts/main/TransactionsPage';
import { UsersPage } from '@page/root-services/user/user-directory/ts/main/UsersPage';
import { VerifyEmailPage } from '@page/auth-services/authentication/verify-email/ts/main/VerifyEmailPage';
import { AdminRoute, GuestRoute, ProtectedRoute } from '@route/route-protect/route-guard/ts/RouteGuards';

export function AppRoutes() {
  return (
    <Routes>
      {/* Signed-out only */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/forgot-username" element={<ForgotUsernamePage />} />
      </Route>

      {/* Opened from email links — work signed in or out */}
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Signed-in */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="income" element={<TransactionsPage key="income" type="INCOME" />} />
          <Route path="expenses" element={<TransactionsPage key="expenses" type="EXPENSE" />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="account" element={<AccountPage />} />

          {/* Admin only */}
          <Route element={<AdminRoute />}>
            <Route path="admin/users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
