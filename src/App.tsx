import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { MonthProvider } from '@/context/MonthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ConfirmProvider } from '@/context/ConfirmContext';
import { AppRoutes } from '@/routes/AppRoutes';

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
