import { getDb } from '../client';
import type { ColaSync } from '../types';

// Backoff exponencial con jitter — README §"Estrategia de errores › Reintentos".
const BACKOFF_STEPS_MS = [5_000, 15_000, 60_000, 5 * 60_000, 30 * 60_000, 2 * 60 * 60_000];
const BACKOFF_CAP_MS = 6 * 60 * 60_000;
export const MAX_INTENTOS = 12;

export function proximoBackoffMs(intentos: number): number {
  const base = BACKOFF_STEPS_MS[Math.min(intentos, BACKOFF_STEPS_MS.length - 1)];
  const capped = Math.min(base, BACKOFF_CAP_MS);
  const jitter = capped * (0.85 + Math.random() * 0.3); // ±15%
  return Math.min(jitter, BACKOFF_CAP_MS);
}

/** Encola una evaluación para Sheets. Si ya hay una entrada pendiente/enviando para esa evaluación, no duplica. */
export function encolarSync(evaluacionId: string, operacion: 'upsert' | 'delete' = 'upsert'): void {
  const db = getDb();
  const existente = db.getFirstSync<{ id: number }>(
    `SELECT id FROM cola_sync WHERE evaluacion_id = ? AND estado IN ('pendiente', 'enviando')`,
    evaluacionId
  );
  if (existente) return;
  db.runSync(
    `INSERT INTO cola_sync (evaluacion_id, operacion, intentos, proximo_intento, estado) VALUES (?, ?, 0, ?, 'pendiente')`,
    evaluacionId,
    operacion,
    new Date().toISOString()
  );
}

export function listarPendientesListas(ahoraIso: string = new Date().toISOString()): ColaSync[] {
  return getDb().getAllSync<ColaSync>(
    `SELECT * FROM cola_sync WHERE estado = 'pendiente' AND (proximo_intento IS NULL OR proximo_intento <= ?) ORDER BY id`,
    ahoraIso
  );
}

export function contarPendientes(): number {
  const row = getDb().getFirstSync<{ n: number }>(
    `SELECT COUNT(*) as n FROM cola_sync WHERE estado IN ('pendiente', 'enviando')`
  );
  return row?.n ?? 0;
}

export function contarFallidos(): number {
  const row = getDb().getFirstSync<{ n: number }>(`SELECT COUNT(*) as n FROM cola_sync WHERE estado = 'fallido'`);
  return row?.n ?? 0;
}

export function marcarEnviando(id: number): void {
  getDb().runSync(`UPDATE cola_sync SET estado = 'enviando' WHERE id = ?`, id);
}

export function marcarOk(id: number, evaluacionId: string): void {
  const db = getDb();
  db.withTransactionSync(() => {
    db.runSync(`UPDATE cola_sync SET estado = 'ok' WHERE id = ?`, id);
    db.runSync(`UPDATE evaluacion SET dirty = 0 WHERE id = ?`, evaluacionId);
  });
}

export interface ErrorClasificado {
  reintentable: boolean;
  motivo: string;
  requiereReauth?: boolean;
}

export function marcarError(id: number, intentosPrevios: number, error: ErrorClasificado): void {
  const db = getDb();
  const intentos = intentosPrevios + 1;
  if (!error.reintentable || intentos >= MAX_INTENTOS) {
    db.runSync(
      `UPDATE cola_sync SET estado = 'fallido', intentos = ?, ultimo_error = ? WHERE id = ?`,
      intentos,
      error.motivo,
      id
    );
    return;
  }
  const proximo = new Date(Date.now() + proximoBackoffMs(intentos)).toISOString();
  db.runSync(
    `UPDATE cola_sync SET estado = 'pendiente', intentos = ?, ultimo_error = ?, proximo_intento = ? WHERE id = ?`,
    intentos,
    error.motivo,
    proximo,
    id
  );
}

/** true si la evaluación fue cerrada (encolada) al menos una vez, sin importar el estado actual del envío. */
export function fueEncolada(evaluacionId: string): boolean {
  const row = getDb().getFirstSync<{ id: number }>(`SELECT id FROM cola_sync WHERE evaluacion_id = ? LIMIT 1`, evaluacionId);
  return !!row;
}

export function reencolarTodoDirty(): void {
  const db = getDb();
  const dirty = db.getAllSync<{ id: string }>(`SELECT id FROM evaluacion WHERE dirty = 1`);
  for (const { id } of dirty) encolarSync(id, 'upsert');
}
