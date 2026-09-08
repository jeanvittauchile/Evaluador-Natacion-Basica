import { SheetsSyncError } from './errors';
import type { FilaEvaluacionSheet, ReporteFilaSheet, SheetsClient } from './types';

interface RespuestaScript {
  ok: boolean;
  error?: string;
  retryable?: boolean;
  requiresReauth?: boolean;
}

/**
 * Cliente real: habla con un Google Apps Script Web App atado a la planilla
 * (ver apps-script/README.md), no con la Sheets API directamente. La app
 * nunca guarda credenciales de Google — solo la URL del script y una clave
 * compartida simple, ambas de configuración pública (no dan acceso a la
 * cuenta de Google, solo al endpoint del script).
 */
export class AppsScriptSheetsClient implements SheetsClient {
  constructor(private webAppUrl: string, private apiKey: string) {}

  private async post(action: 'sync' | 'reporte', payload: object): Promise<void> {
    let res: Response;
    try {
      res = await fetch(this.webAppUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action, apiKey: this.apiKey, ...payload }),
      });
    } catch {
      throw new SheetsSyncError('Sin red o timeout', { reintentable: true });
    }

    let data: RespuestaScript | null = null;
    try {
      data = await res.json();
    } catch {
      // Apps Script devuelve HTML (no JSON) si el despliegue no existe, no es
      // público, o el proyecto quedó con una excepción no capturada.
      throw new SheetsSyncError(`Respuesta inesperada del script (HTTP ${res.status})`, { reintentable: true });
    }

    if (!res.ok || !data?.ok) {
      throw new SheetsSyncError(data?.error ?? `Error HTTP ${res.status}`, {
        reintentable: data?.retryable ?? true,
        requiereReauth: data?.requiresReauth ?? false,
      });
    }
  }

  async upsertEvaluacion(fila: FilaEvaluacionSheet): Promise<void> {
    await this.post('sync', { fila });
  }

  async regenerarReporte(asignatura: string, seccion: string, filas: ReporteFilaSheet[]): Promise<void> {
    await this.post('reporte', { asignatura, seccion, filas });
  }
}
