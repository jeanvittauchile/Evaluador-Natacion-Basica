import { MockSheetsClient } from './mockClient';
import { HttpSheetsClient } from './httpClient';
import type { SheetsClient } from './types';

const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const apiKey = process.env.EXPO_PUBLIC_API_KEY;

/**
 * Sin EXPO_PUBLIC_API_BASE_URL configurado (backend de Vercel), la app cae al
 * mock automáticamente — nunca bloquea el desarrollo por falta de credenciales.
 */
export const sheetsClient: SheetsClient =
  baseUrl && apiKey ? new HttpSheetsClient(baseUrl, apiKey) : new MockSheetsClient();

export * from './types';
export * from './errors';
export { MockSheetsClient } from './mockClient';
export { HttpSheetsClient } from './httpClient';
