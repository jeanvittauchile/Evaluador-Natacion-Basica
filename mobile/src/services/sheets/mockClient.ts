import type { FilaEvaluacionSheet, ReporteFilaSheet, SheetsClient } from './types';

/**
 * Cliente simulado — se usa mientras no hay credenciales de Google Cloud
 * configuradas (ver README §"Preguntar antes de asumir"). Cumple la interfaz
 * real para que el resto de la app (cola de sync, pantallas) no distinga
 * entre mock y backend real.
 */
export class MockSheetsClient implements SheetsClient {
  upserts: FilaEvaluacionSheet[] = [];
  reportes: { asignatura: string; seccion: string; filas: ReporteFilaSheet[] }[] = [];

  async upsertEvaluacion(fila: FilaEvaluacionSheet): Promise<void> {
    await new Promise((r) => setTimeout(r, 300));
    this.upserts = this.upserts.filter((f) => f.id_local !== fila.id_local);
    this.upserts.push(fila);
  }

  async regenerarReporte(asignatura: string, seccion: string, filas: ReporteFilaSheet[]): Promise<void> {
    await new Promise((r) => setTimeout(r, 300));
    this.reportes.push({ asignatura, seccion, filas });
  }
}
