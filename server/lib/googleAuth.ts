import { requireEnv } from './env';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

export async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<TokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: requireEnv('GOOGLE_CLIENT_ID'),
      client_secret: requireEnv('GOOGLE_CLIENT_SECRET'),
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  if (!res.ok) throw new Error(`No se pudo intercambiar el código (${res.status}): ${await res.text()}`);
  return res.json();
}

/** Renueva el access token a partir del refresh token guardado en GOOGLE_REFRESH_TOKEN. */
export async function getAccessToken(): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: requireEnv('GOOGLE_CLIENT_ID'),
      client_secret: requireEnv('GOOGLE_CLIENT_SECRET'),
      refresh_token: requireEnv('GOOGLE_REFRESH_TOKEN'),
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) {
    const err = new Error(`No se pudo renovar el access token (${res.status}): ${await res.text()}`) as Error & { status?: number };
    err.status = res.status === 400 ? 403 : res.status; // refresh_token revocado → tratar como 403 (requiere reautenticación)
    throw err;
  }
  const data: TokenResponse = await res.json();
  return data.access_token;
}
