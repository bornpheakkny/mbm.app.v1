import axios, { AxiosError } from 'axios';

export const TOKEN_KEY = 'mbm_token';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api',
  timeout: 30_000, // Render free tier can take a while to wake up
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem(TOKEN_KEY);
      if (!window.location.pathname.startsWith('/login')) window.location.assign('/login');
    }
    return Promise.reject(error);
  },
);

/** Human-readable message from an API error */
export function errorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string; details?: Record<string, string[]> } | undefined;
    if (data?.details && typeof data.details === 'object') {
      const first = Object.entries(data.details)[0];
      if (first) return `${first[0]}: ${first[1]?.[0] ?? 'invalid'}`;
    }
    if (data?.error) return data.error;
    if (err.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.';
    if (!err.response) return 'Cannot reach the server. Check your connection.';
  }
  return err instanceof Error ? err.message : 'Something went wrong';
}
