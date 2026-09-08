// Cálculo de puntaje y nota — especificación ejecutable (README §"Cálculo de
// puntaje y nota"). Toda nota o puntaje que aparezca en la UI debe salir de
// estas funciones; ninguno es un literal, ni siquiera en datos de ejemplo.

import { CRITERIA, DUAL, ROWS, type ObsKey } from './rubric';

export type Puntaje1a3 = 1 | 2 | 3;
export type Scores = Partial<Record<ObsKey, Puntaje1a3>>;

export type Escala = '30' | '24';
export const ESCALA_LABEL: Record<Escala, string> = {
  '30': '10 observaciones (máx. 30)',
  '24': '8 criterios (máx. 24)',
};

export const EXIGENCIA_DEFAULT = 60;
export const EXIGENCIA_MIN = 50;
export const EXIGENCIA_MAX = 70;
export const EXIGENCIA_STEP = 5;

/** Nota chilena 1,0–7,0, lineal en dos tramos con aprobación en `exigenciaPct`% de `max`. */
export function nota(pts: number, max: number, exigenciaPct: number = EXIGENCIA_DEFAULT): string {
  if (!max) return '—';
  const aprob = max * (exigenciaPct / 100);
  const n = pts < aprob ? 1 + 3 * (pts / aprob) : 4 + 3 * ((pts - aprob) / (max - aprob));
  return n.toFixed(1).replace('.', ',');
}

/** Igual que nota(), pero como número — para promediar o comparar. */
export function notaNum(pts: number, max: number, exigenciaPct: number = EXIGENCIA_DEFAULT): number {
  return parseFloat(nota(pts, max, exigenciaPct).replace(',', '.'));
}

/**
 * Promedio de notas ya calculadas (nunca de puntajes brutos): cada estilo
 * puede tener un `max` distinto si hubo una prueba incompleta, así que el
 * promedio se arma sobre las notas resultantes, no sobre un `max` común.
 */
export interface PuntajeDeEstilo {
  puntaje: number;
  max: number;
  exigenciaPct?: number;
}

export function promedio(entradas: PuntajeDeEstilo[], exigenciaPctDefault: number = EXIGENCIA_DEFAULT): string {
  if (!entradas.length) return '—';
  const ns = entradas.map((e) => notaNum(e.puntaje, e.max, e.exigenciaPct ?? exigenciaPctDefault));
  return (ns.reduce((a, b) => a + b, 0) / ns.length).toFixed(1).replace('.', ',');
}

/** Consolida las 10 observaciones en los 8 criterios oficiales. */
export function official(scores: Scores): (number | null)[] {
  return CRITERIA.map((_c, i) => {
    const dualKeys = DUAL[i];
    if (dualKeys) {
      const vs = dualKeys.map((k) => scores[k]).filter((v): v is Puntaje1a3 => v !== undefined);
      if (!vs.length) return null;
      return Math.floor(vs.reduce((a, b) => a + b, 0) / vs.length);
    }
    const row = ROWS.find((r) => r.criterioIndex === i);
    const v = row ? scores[row.key] : undefined;
    return v === undefined ? null : v;
  });
}

export interface ResultadoPuntaje {
  puntaje: number;
  /** 30/24 si la prueba está completa, o `completadas * 3` si es incompleta. */
  max: number;
  completadas: number;
  total: number;
}

/** Puntaje y max efectivo del estilo, según la escala configurada y si la prueba quedó incompleta. */
export function calcularPuntaje(scores: Scores, escala: Escala, incompleta: boolean): ResultadoPuntaje {
  if (escala === '30') {
    const valores = ROWS.map((r) => scores[r.key]).filter((v): v is Puntaje1a3 => v !== undefined);
    const total = ROWS.length;
    const completadas = valores.length;
    const puntaje = valores.reduce((a, b) => a + b, 0);
    const max = incompleta ? completadas * 3 : 30;
    return { puntaje, max, completadas, total };
  }
  const off = official(scores).filter((v): v is number => v !== null);
  const total = CRITERIA.length;
  const completadas = off.length;
  const puntaje = off.reduce((a, b) => a + b, 0);
  const max = incompleta ? completadas * 3 : 24;
  return { puntaje, max, completadas, total };
}

/** Nota del estilo, derivada del puntaje/max efectivos (nunca un literal). */
export function notaDeEstilo(scores: Scores, escala: Escala, incompleta: boolean, exigenciaPct: number = EXIGENCIA_DEFAULT): string {
  const { puntaje, max } = calcularPuntaje(scores, escala, incompleta);
  return nota(puntaje, max, exigenciaPct);
}
