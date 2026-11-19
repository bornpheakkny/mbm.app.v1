import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@context/auth-provider/ts/AuthContext';
import { MonthProvider } from '@context/month-provider/ts/MonthContext';
import { ThemeProvider } from '@context/theme-provider/ts/ThemeContext';
import { ConfirmProvider } from '@context/confirm-provider/ts/ConfirmContext';
import { AppRoutes } from '@route/route-configuration/route-app-config/ts/RouteAppConfig';

/** Root component: router + global providers */
export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <MonthProvider>
            <ConfirmProvider>
              <AppRoutes />
            </ConfirmProvider>
          </MonthProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
