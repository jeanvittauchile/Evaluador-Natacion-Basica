import * as Crypto from 'expo-crypto';
import { getDb } from '../client';
import type { Evaluacion, Observacion, Sesion } from '../types';
import { CRITERIA, ROWS, type ObsKey } from '../../domain/rubric';
import { calcularPuntaje, notaNum, type Escala, type Puntaje1a3, type Scores } from '../../domain/calculo';
import type { Estilo } from '../../domain/rubric';
import { encolarSync } from './colaSync';

export interface EvaluacionConObs {
  evaluacion: Evaluacion;
  scores: Scores;
}

function fila(evaluacionId: string): Evaluacion | null {
  return getDb().getFirstSync<Evaluacion>(`SELECT * FROM evaluacion WHERE id = ?`, evaluacionId);
}

function scoresDe(evaluacionId: string): Scores {
  const rows = getDb().getAllSync<Observacion>(
    `SELECT * FROM observacion WHERE evaluacion_id = ?`,
    evaluacionId
  );
  const scores: Scores = {};
  for (const r of rows) {
    if (r.puntaje !== null) scores[r.obs_key as ObsKey] = r.puntaje as Puntaje1a3;
  }
  return scores;
}

/** Evaluación en curso (o la más reciente) para un estudiante+estilo; null si nunca se empezó. */
export function obtenerEvaluacionActual(estudianteId: string, estilo: Estilo): EvaluacionConObs | null {
  const evaluacion = getDb().getFirstSync<Evaluacion>(
    `SELECT * FROM evaluacion WHERE estudiante_id = ? AND estilo = ? ORDER BY actualizado_en DESC LIMIT 1`,
    estudianteId,
    estilo
  );
  if (!evaluacion) return null;
  return { evaluacion, scores: scoresDe(evaluacion.id) };
}

function recalcularYGuardar(evaluacionId: string, scores: Scores, incompleta: boolean): Evaluacion {
  const db = getDb();
  const actual = fila(evaluacionId);
  if (!actual) throw new Error('Evaluación no encontrada');
  const escala = actual.escala as Escala;
  const { puntaje, max } = calcularPuntaje(scores, escala, incompleta);
  const notaValor = notaNum(puntaje, max, actual.exigencia);
  const ahora = new Date().toISOString();
  db.runSync(
    `UPDATE evaluacion SET puntaje = ?, puntaje_max = ?, nota = ?, incompleta = ?, actualizado_en = ?, dirty = 1 WHERE id = ?`,
    puntaje,
    max,
    notaValor,
    incompleta ? 1 : 0,
    ahora,
    evaluacionId
  );
  return { ...actual, puntaje, puntaje_max: max, nota: notaValor, incompleta: incompleta ? 1 : 0, actualizado_en: ahora, dirty: 1 };
}

/** Crea el borrador de evaluación si no existe uno para este estudiante+estilo. */
export function obtenerOCrearBorrador(
  estudianteId: string,
  estilo: Estilo,
  sesion: Sesion,
  escala: Escala,
  exigencia: number
): EvaluacionConObs {
  const existente = obtenerEvaluacionActual(estudianteId, estilo);
  if (existente) return existente;

  const db = getDb();
  const ahora = new Date().toISOString();
  const evaluacion: Evaluacion = {
    id: Crypto.randomUUID(),
    estudiante_id: estudianteId,
    estilo,
    distancia_m: 50,
    piscina_m: 25,
    incompleta: 0,
    escala,
    exigencia,
    puntaje: 0,
    puntaje_max: escala === '30' ? 30 : 24,
    nota: notaNum(0, escala === '30' ? 30 : 24, exigencia),
    asignatura: sesion.asignatura,
    seccion: sesion.seccion,
    lugar: sesion.lugar,
    evaluador: sesion.evaluador ?? null,
    evaluado_en: ahora,
    actualizado_en: ahora,
    dirty: 1,
  };
  db.runSync(
    `INSERT INTO evaluacion (id, estudiante_id, estilo, distancia_m, piscina_m, incompleta, escala, exigencia, puntaje, puntaje_max, nota, asignatura, seccion, lugar, evaluador, evaluado_en, actualizado_en, dirty)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    evaluacion.id,
    evaluacion.estudiante_id,
    evaluacion.estilo,
    evaluacion.distancia_m,
    evaluacion.piscina_m,
    evaluacion.incompleta,
    evaluacion.escala,
    evaluacion.exigencia,
    evaluacion.puntaje,
    evaluacion.puntaje_max,
    evaluacion.nota,
    evaluacion.asignatura,
    evaluacion.seccion,
    evaluacion.lugar,
    evaluacion.evaluador,
    evaluacion.evaluado_en,
    evaluacion.actualizado_en,
    evaluacion.dirty
  );
  return { evaluacion, scores: {} };
}

/** Un toque de puntaje: upsert transaccional de la observación + recálculo de la evaluación. */
export function guardarPuntaje(evaluacionId: string, key: ObsKey, valor: Puntaje1a3): Evaluacion {
  const db = getDb();
  const row = ROWS.find((r) => r.key === key);
  if (!row) throw new Error(`Observación desconocida: ${key}`);
  const criterio = CRITERIA[row.criterioIndex].name;
  const etiqueta = row.tag || null;

  let resultado!: Evaluacion;
  db.withTransactionSync(() => {
    db.runSync(
      `INSERT INTO observacion (evaluacion_id, obs_key, criterio, etiqueta, puntaje) VALUES (?,?,?,?,?)
       ON CONFLICT(evaluacion_id, obs_key) DO UPDATE SET puntaje = excluded.puntaje`,
      evaluacionId,
      key,
      criterio,
      etiqueta,
      valor
    );
    const actual = fila(evaluacionId)!;
    const scores = scoresDe(evaluacionId);
    resultado = recalcularYGuardar(evaluacionId, scores, actual.incompleta === 1);
  });
  return resultado;
}

/** Alterna el modo "prueba incompleta" y recalcula max/nota en vivo. */
export function setIncompleta(evaluacionId: string, incompleta: boolean): Evaluacion {
  const scores = scoresDe(evaluacionId);
  return recalcularYGuardar(evaluacionId, scores, incompleta);
}

/** Cierra la evaluación: la encola para Sheets. Idempotente por evaluacion_id. */
export function cerrarEvaluacion(evaluacionId: string): void {
  encolarSync(evaluacionId, 'upsert');
}

export function listarPorEstudiante(estudianteId: string): Evaluacion[] {
  return getDb().getAllSync<Evaluacion>(
    `SELECT e.* FROM evaluacion e
     INNER JOIN (
       SELECT estudiante_id, estilo, MAX(actualizado_en) AS ultima
       FROM evaluacion WHERE estudiante_id = ? GROUP BY estilo
     ) mx ON mx.estudiante_id = e.estudiante_id AND mx.estilo = e.estilo AND mx.ultima = e.actualizado_en`,
    estudianteId
  );
}

export function listarRecientes(limite: number): Evaluacion[] {
  return getDb().getAllSync<Evaluacion>(`SELECT * FROM evaluacion ORDER BY actualizado_en DESC LIMIT ?`, limite);
}

export function obtenerPorId(evaluacionId: string): EvaluacionConObs | null {
  const evaluacion = fila(evaluacionId);
  if (!evaluacion) return null;
  return { evaluacion, scores: scoresDe(evaluacionId) };
}

export function obtenerObservaciones(evaluacionId: string): Observacion[] {
  return getDb().getAllSync<Observacion>(
    `SELECT * FROM observacion WHERE evaluacion_id = ?`,
    evaluacionId
  );
}
