import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Global styles first, so component styles (imported by the components) can override them
import './index.css';
import App from '@/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
