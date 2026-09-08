import { getDb } from '../client';
import type { Config, Sesion } from '../types';

export function obtenerSesion(): Sesion {
  const row = getDb().getFirstSync<Sesion>(`SELECT asignatura, seccion, lugar, horario, estilos, evaluador FROM sesion WHERE id = 1`);
  if (!row) throw new Error('Sesión no inicializada');
  return row;
}

export function actualizarSesion(patch: Partial<Sesion>): Sesion {
  const actual = obtenerSesion();
  const next: Sesion = { ...actual, ...patch };
  getDb().runSync(
    `UPDATE sesion SET asignatura = ?, seccion = ?, lugar = ?, horario = ?, estilos = ?, evaluador = ? WHERE id = 1`,
    next.asignatura,
    next.seccion,
    next.lugar,
    next.horario,
    next.estilos,
    next.evaluador
  );
  return next;
}

export function obtenerConfig(): Config {
  const row = getDb().getFirstSync<Config>(`SELECT escala, exigencia, auto_avance FROM config WHERE id = 1`);
  if (!row) throw new Error('Config no inicializada');
  return row;
}

export function actualizarConfig(patch: Partial<Config>): Config {
  const actual = obtenerConfig();
  const next: Config = { ...actual, ...patch };
  getDb().runSync(
    `UPDATE config SET escala = ?, exigencia = ?, auto_avance = ? WHERE id = 1`,
    next.escala,
    next.exigencia,
    next.auto_avance
  );
  return next;
}
