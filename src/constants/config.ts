/** Base URL of mbm.api.v1 (no trailing slash) */
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

/** Render's free tier can take a while to wake up */
export const API_TIMEOUT_MS = 30_000;

/** localStorage key for the JWT */
export const TOKEN_KEY = 'mbm_token';

export const APP_NAME = 'Budget Manager';
