import type { Escala } from '../domain/calculo';
import type { Estilo } from '../domain/rubric';

export interface Estudiante {
  id: string;
  nombre: string;
  apellidos: string;
  seccion: string;
  rut: string | null;
  creado_en: string;
}

export interface Evaluacion {
  id: string;
  estudiante_id: string;
  estilo: Estilo;
  distancia_m: number;
  piscina_m: number;
  incompleta: 0 | 1;
  escala: Escala;
  exigencia: number;
  puntaje: number;
  puntaje_max: number;
  nota: number;
  asignatura: string;
  seccion: string;
  lugar: string | null;
  evaluador: string | null;
  evaluado_en: string;
  actualizado_en: string;
  dirty: 0 | 1;
}

export interface Observacion {
  evaluacion_id: string;
  obs_key: string;
  criterio: string;
  etiqueta: string | null;
  puntaje: number | null;
}

export interface Sesion {
  asignatura: string;
  seccion: string;
  lugar: string;
  horario: string;
  estilos: string;
  evaluador: string | null;
}

export interface Config {
  escala: Escala;
  exigencia: number;
  auto_avance: 0 | 1;
}

export type ColaEstado = 'pendiente' | 'enviando' | 'ok' | 'fallido';

export interface ColaSync {
  id: number;
  evaluacion_id: string;
  operacion: 'upsert' | 'delete';
  intentos: number;
  proximo_intento: string | null;
  ultimo_error: string | null;
  estado: ColaEstado;
}
