import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { MonthProvider } from '@/context/MonthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AppRoutes } from '@/routes/AppRoutes';

/** Root component: router + global providers */
export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <MonthProvider>
            <AppRoutes />
          </MonthProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
