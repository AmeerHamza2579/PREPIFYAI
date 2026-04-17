import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const TOKEN_KEY = 'access_token';

type ConstantsExtras = {
  expoGoConfig?: { debuggerHost?: string };
  manifest?: { debuggerHost?: string; hostUri?: string };
  manifest2?: { extra?: { expoClient?: { debuggerHost?: string; hostUri?: string } } };
};

/**
 * Metro / dev-server host (LAN IP or emulator alias). Used so native builds can reach FastAPI on the dev PC.
 * Works with: physical Android/iPhone (same Wi‑Fi), Android emulator (10.0.2.2), iOS Simulator (localhost).
 */
function getDevMachineHost(): string | null {
  const C = Constants as typeof Constants & ConstantsExtras;
  const candidates: (string | undefined)[] = [
    Constants.expoConfig?.hostUri,
    C.expoGoConfig?.debuggerHost,
    C.manifest2?.extra?.expoClient?.debuggerHost,
    C.manifest2?.extra?.expoClient?.hostUri,
    C.manifest?.debuggerHost,
    C.manifest?.hostUri,
  ];

  for (const raw of candidates) {
    if (!raw || typeof raw !== 'string') continue;
    const host = raw.split(':')[0]?.trim();
    if (host && host.length > 0) {
      return host;
    }
  }
  return null;
}

/**
 * Android emulator: localhost/127.0.0.1 from Metro must map to 10.0.2.2 to reach the host machine.
 * iOS Simulator: keep localhost. Physical phones: keep LAN IP from Expo.
 */
function apiHostForPlatform(host: string): string {
  const h = host.toLowerCase();
  if (Platform.OS === 'android') {
    if (h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0') {
      return '10.0.2.2';
    }
  }
  if (Platform.OS === 'ios' && h === '127.0.0.1') {
    return 'localhost';
  }
  return host;
}

/** API port on the dev PC (Expo default assumes 8000; use 8001 if Windows blocks :8000). */
function getApiPort(): string {
  const p = process.env.EXPO_PUBLIC_API_PORT?.trim();
  return p && p.length > 0 ? p : '8000';
}

const getApiBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL.replace(/\/$/, '');
  }

  const port = getApiPort();

  if (Platform.OS === 'web') {
    return `http://localhost:${port}`;
  }

  const rawHost = getDevMachineHost();
  const devHost = rawHost ? apiHostForPlatform(rawHost) : null;
  if (devHost) {
    return `http://${devHost}:${port}`;
  }

  const fallbackHost = process.env.EXPO_PUBLIC_DEV_LAN_HOST?.trim();
  if (fallbackHost) {
    const normalized = apiHostForPlatform(fallbackHost.replace(/^https?:\/\//i, '').split('/')[0]);
    return `http://${normalized}:${port}`;
  }

  // Physical device but Expo did not expose a host — set EXPO_PUBLIC_API_BASE_URL or EXPO_PUBLIC_DEV_LAN_HOST
  return `http://192.168.100.19:${port}`;
};

const API_BASE_URL = getApiBaseUrl();
const API_PREFIX = process.env.EXPO_PUBLIC_API_PREFIX || '/api/v1';
export const FULL_API_URL = `${API_BASE_URL}${API_PREFIX}`;

console.log('API URL:', FULL_API_URL, '(Platform:', Platform.OS + ')');

function isLikelyNetworkFailure(err: unknown): boolean {
  if (err instanceof TypeError) return true;
  if (err instanceof Error) {
    const m = err.message.toLowerCase();
    return (
      m.includes('network request failed') ||
      m.includes('failed to fetch') ||
      m.includes('networkerror') ||
      m.includes('load failed') ||
      m.includes('connection refused')
    );
  }
  return false;
}

function networkFailureMessage(url: string): Error {
  const port = getApiPort();
  return new Error(
    `Cannot reach the API (${url}).\n\n` +
      `• Start Docker (Postgres) and run uvicorn on your PC.\n` +
      `• Expo must use the same port as the API (EXPO_PUBLIC_API_PORT=${port}, or set EXPO_PUBLIC_API_BASE_URL).\n` +
      `• On a real phone: same Wi‑Fi as the PC, set EXPO_PUBLIC_DEV_LAN_HOST to the PC’s IPv4.\n` +
      `• Android emulator: API host is usually 10.0.2.2.\n` +
      `• Allow the port in Windows Firewall.`
  );
}

async function apiFetch(
  endpoint: string,
  init: RequestInit,
  includeAuth: boolean
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((init.headers as Record<string, string> | undefined) ?? {}),
  };
  if (includeAuth) {
    const token = await apiClient.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  const url = `${FULL_API_URL}${endpoint}`;
  try {
    return await fetch(url, { ...init, headers });
  } catch (e) {
    if (isLikelyNetworkFailure(e)) {
      throw networkFailureMessage(url);
    }
    throw e;
  }
}

async function parseErrorResponse(response: Response): Promise<string> {
  const text = await response.text();
  const status = response.status;
  if (!text) {
    return status >= 500
      ? `Server error (${status}). Open the PC where uvicorn runs and read the traceback in that terminal.`
      : `Request failed (${status})`;
  }
  try {
    const data = JSON.parse(text) as { detail?: unknown; message?: string };
    if (typeof data.detail === 'string') {
      if (status >= 500 && data.detail === 'Internal Server Error') {
        return (
          'The API crashed (500). On your PC, check the terminal running uvicorn — the real error is printed there ' +
          '(often database connection, missing migration, or bcrypt).'
        );
      }
      return data.detail;
    }
    if (typeof data.message === 'string') {
      return data.message;
    }
    if (Array.isArray(data.detail)) {
      return data.detail
        .map((e: unknown) => {
          if (typeof e === 'object' && e !== null && 'msg' in e) {
            return String((e as { msg: string }).msg);
          }
          return typeof e === 'string' ? e : JSON.stringify(e);
        })
        .join(' ');
    }
    return text.slice(0, 400);
  } catch {
    return text.slice(0, 280);
  }
}

export const apiClient = {
  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken: async (token: string): Promise<void> => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  removeToken: async (): Promise<void> => {
    await AsyncStorage.removeItem(TOKEN_KEY);
  },

  get: async (endpoint: string, includeAuth: boolean = false) => {
    const response = await apiFetch(endpoint, { method: 'GET' }, includeAuth);
    if (!response.ok) {
      throw new Error(await parseErrorResponse(response));
    }
    return response.json();
  },

  post: async (endpoint: string, data: unknown, includeAuth: boolean = false) => {
    const response = await apiFetch(
      endpoint,
      { method: 'POST', body: JSON.stringify(data) },
      includeAuth
    );
    if (!response.ok) {
      throw new Error(await parseErrorResponse(response));
    }
    return response.json();
  },

  patch: async (endpoint: string, data: unknown, includeAuth: boolean = false) => {
    const response = await apiFetch(
      endpoint,
      { method: 'PATCH', body: JSON.stringify(data ?? {}) },
      includeAuth
    );
    if (!response.ok) {
      throw new Error(await parseErrorResponse(response));
    }
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return {};
    }
  },

  put: async (endpoint: string, data: unknown, includeAuth: boolean = false) => {
    const response = await apiFetch(
      endpoint,
      { method: 'PUT', body: JSON.stringify(data) },
      includeAuth
    );
    if (!response.ok) {
      throw new Error(await parseErrorResponse(response));
    }
    return response.json();
  },

  delete: async (endpoint: string, includeAuth: boolean = false) => {
    const response = await apiFetch(endpoint, { method: 'DELETE' }, includeAuth);
    if (!response.ok) {
      throw new Error(await parseErrorResponse(response));
    }
    return response.json();
  },
};
