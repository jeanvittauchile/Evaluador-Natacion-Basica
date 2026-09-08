import type { VercelRequest, VercelResponse } from '@vercel/node';
import { baseUrlFromRequest, requireEnv } from '../../lib/env';

const SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/spreadsheets'];

/**
 * Visita esta URL una vez, en un navegador, con la cuenta de Google que debe
 * recibir la planilla (README §"Configuración OAuth2 (paso a paso)"). No la
 * llama la app móvil.
 */
export default function handler(req: VercelRequest, res: VercelResponse): void {
  const clientId = requireEnv('GOOGLE_CLIENT_ID');
  const redirectUri = `${baseUrlFromRequest(req)}/api/oauth/callback`;

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', SCOPES.join(' '));
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');
  if (typeof req.query.asignatura === 'string') {
    url.searchParams.set('state', req.query.asignatura);
  }

  res.writeHead(302, { Location: url.toString() });
  res.end();
}
