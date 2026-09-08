import type { VercelRequest, VercelResponse } from '@vercel/node';

/** Todas las rutas que la app móvil llama (no las de OAuth) exigen esta cabecera. */
export function checkApiKey(req: VercelRequest, res: VercelResponse): boolean {
  const expected = process.env.APP_API_KEY;
  const got = req.headers['x-api-key'];
  if (!expected || got !== expected) {
    res.status(401).json({ error: 'API key inválida o no configurada (APP_API_KEY).' });
    return false;
  }
  return true;
}
