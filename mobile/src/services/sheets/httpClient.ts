import { clasificarErrorHttp, SheetsSyncError } from './errors';
import type { FilaEvaluacionSheet, ReporteFilaSheet, SheetsClient } from './types';

/**
 * Cliente real: habla con el backend serverless en Vercel, nunca con Google
 * directamente. El backend guarda el refresh token y hace de proxy — ver
 * server/README.md.
 */
export class HttpSheetsClient implements SheetsClient {
  constructor(private baseUrl: string, private apiKey: string) {}

  private async post(path: string, body: unknown): Promise<void> {
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': this.apiKey },
        body: JSON.stringify(body),
      });
    } catch {
      throw clasificarErrorHttp(null);
    }
    if (res.ok) return;
    const retryAfter = res.headers.get('retry-after');
    throw clasificarErrorHttp(res.status, retryAfter ? Number(retryAfter) : undefined);
  }

  async upsertEvaluacion(fila: FilaEvaluacionSheet): Promise<void> {
    await this.post('/api/sync', { fila });
  }

  async regenerarReporte(asignatura: string, seccion: string, filas: ReporteFilaSheet[]): Promise<void> {
    await this.post('/api/reporte', { asignatura, seccion, filas });
  }
}

export { SheetsSyncError };
