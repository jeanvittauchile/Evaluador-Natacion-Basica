import { MockSheetsClient } from './mockClient';
import { AppsScriptSheetsClient } from './appsScriptClient';
import type { SheetsClient } from './types';

const webAppUrl = process.env.EXPO_PUBLIC_APPS_SCRIPT_URL;
const apiKey = process.env.EXPO_PUBLIC_API_KEY;

/**
 * Sin EXPO_PUBLIC_APPS_SCRIPT_URL configurado (ver apps-script/README.md), la
 * app cae al mock automáticamente — nunca bloquea el desarrollo por falta de
 * credenciales de Google.
 */
export const sheetsClient: SheetsClient =
  webAppUrl && apiKey ? new AppsScriptSheetsClient(webAppUrl, apiKey) : new MockSheetsClient();

export * from './types';
export * from './errors';
export { MockSheetsClient } from './mockClient';
export { AppsScriptSheetsClient } from './appsScriptClient';
