// Espejo de mobile/src/services/sheets/types.ts — server y mobile son
// proyectos deployables independientes (Expo vs. Vercel), así que este
// contrato se duplica intencionalmente en vez de compartir un paquete.

export interface FilaEvaluacionSheet {
  id_local: string;
  fecha: string;
  asignatura: string;
  seccion: string;
  estudiante: string;
  rut: string | null;
  estilo: string;
  distancia_m: number;
  piscina_m: number;
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
