import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkApiKey } from '../lib/auth';
import { requireEnv } from '../lib/env';
import { getAccessToken } from '../lib/googleAuth';
import { upsertFila } from '../lib/sheets';
import type { FilaEvaluacionSheet } from '../lib/types';

function validar(fila: unknown): fila is FilaEvaluacionSheet {
  if (!fila || typeof fila !== 'object') return false;
  const f = fila as Record<string, unknown>;
  return typeof f.id_local === 'string' && f.id_local.length > 0 && typeof f.estudiante === 'string' && Array.isArray(f.observaciones);
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!checkApiKey(req, res)) return;

  const fila = (req.body as { fila?: unknown } | undefined)?.fila;
  if (!validar(fila)) {
    res.status(400).json({ error: 'Cuerpo inválido: se espera { fila: FilaEvaluacionSheet }' });
    return;
  }

  try {
    const spreadsheetId = requireEnv('GOOGLE_SPREADSHEET_ID');
    const accessToken = await getAccessToken();
    await upsertFila(accessToken, spreadsheetId, fila);
    res.status(200).json({ ok: true });
  } catch (e) {
    const status = (e as { status?: number }).status;
    const codigo = status && status >= 400 && status < 600 ? status : 500;
    res.status(codigo).json({ error: e instanceof Error ? e.message : 'Error desconocido' });
  }
}
