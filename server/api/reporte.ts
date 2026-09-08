import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkApiKey } from '../lib/auth';
import { requireEnv } from '../lib/env';
import { getAccessToken } from '../lib/googleAuth';
import { regenerarReporte } from '../lib/sheets';
import type { ReporteFilaSheet } from '../lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!checkApiKey(req, res)) return;

  const body = req.body as { asignatura?: string; seccion?: string; filas?: ReporteFilaSheet[] } | undefined;
  if (!body || !Array.isArray(body.filas)) {
    res.status(400).json({ error: 'Cuerpo inválido: se espera { asignatura, seccion, filas: ReporteFilaSheet[] }' });
    return;
  }

  try {
    const spreadsheetId = requireEnv('GOOGLE_SPREADSHEET_ID');
    const accessToken = await getAccessToken();
    await regenerarReporte(accessToken, spreadsheetId, body.filas);
    res.status(200).json({ ok: true });
  } catch (e) {
    const status = (e as { status?: number }).status;
    const codigo = status && status >= 400 && status < 600 ? status : 500;
    res.status(codigo).json({ error: e instanceof Error ? e.message : 'Error desconocido' });
  }
}
