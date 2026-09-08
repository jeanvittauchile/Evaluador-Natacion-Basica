// Contrato del backend de Google Sheets — README §"Integración con Google
// Drive / Sheets". La app nunca habla con Google directamente: todo pasa por
// el backend en Vercel, que guarda el refresh token y hace de proxy seguro.

export interface FilaEvaluacionSheet {
  id_local: string; // clave de idempotencia — columna A
  fecha: string; // ISO 8601 — columna B
  asignatura: string;
  seccion: string;
  estudiante: string; // "Apellidos, Nombre"
  rut: string | null;
  estilo: string;
  distancia_m: number;
  piscina_m: number;
  /** Las 10 observaciones en el orden J–S: salida, sub1, bo1, resp, braz, pat, vir, sub2, bo2, lleg. null = N/O. */
  observaciones: (number | null)[];
  puntaje: number;
  puntaje_max: number;
  nota: number;
  incompleta: boolean;
  exigencia: number;
  evaluador: string | null;
  lugar: string | null;
}

export interface ReporteFilaSheet {
  estudiante: string;
  crol: string | null;
  espalda: string | null;
  pecho: string | null;
  mariposa: string | null;
  notaGeneral: string | null;
  estilosEvaluados: number;
}

export interface SheetsClient {
  upsertEvaluacion(fila: FilaEvaluacionSheet): Promise<void>;
  regenerarReporte(asignatura: string, seccion: string, filas: ReporteFilaSheet[]): Promise<void>;
}
