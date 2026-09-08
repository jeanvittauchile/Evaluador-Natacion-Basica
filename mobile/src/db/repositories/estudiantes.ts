import * as Crypto from 'expo-crypto';
import { getDb } from '../client';
import type { Estudiante } from '../types';
import { esRutValido, normalizarRut } from '../../utils/rut';

export interface NuevoEstudianteInput {
  nombre: string;
  apellidos: string;
  seccion: string;
  rut?: string | null;
}

export class RutInvalidoError extends Error {}
export class EstudianteDuplicadoError extends Error {}
export class CampoObligatorioError extends Error {
  constructor(public campo: 'nombre' | 'apellidos' | 'seccion') {
    super(`Falta el campo ${campo}`);
  }
}

function limpiar(s: string): string {
  return s.trim().replace(/\s+/g, ' ');
}

/** Comprueba nombre/apellidos/sección y RUT antes de guardar. Lanza si algo no cumple. */
export function validarEstudiante(input: NuevoEstudianteInput): { nombre: string; apellidos: string; seccion: string; rut: string | null } {
  const nombre = limpiar(input.nombre ?? '');
  const apellidos = limpiar(input.apellidos ?? '');
  const seccion = limpiar(input.seccion ?? '');

  if (nombre.length < 2) throw new CampoObligatorioError('nombre');
  if (apellidos.length < 2) throw new CampoObligatorioError('apellidos');
  if (!seccion) throw new CampoObligatorioError('seccion');

  let rut: string | null = null;
  if (input.rut && limpiar(input.rut).length > 0) {
    const crudo = limpiar(input.rut);
    if (!esRutValido(crudo)) throw new RutInvalidoError('El RUT no es válido (dígito verificador incorrecto).');
    rut = normalizarRut(crudo);
  }

  if (existeDuplicado({ nombre, apellidos, seccion, rut })) {
    throw new EstudianteDuplicadoError('Ya existe un estudiante con estos datos en la sección.');
  }

  return { nombre, apellidos, seccion, rut };
}

export function existeDuplicado(input: { nombre: string; apellidos: string; seccion: string; rut: string | null }): boolean {
  const db = getDb();
  const porNombre = db.getFirstSync<{ id: string }>(
    `SELECT id FROM estudiante WHERE lower(nombre) = lower(?) AND lower(apellidos) = lower(?) AND seccion = ?`,
    input.nombre,
    input.apellidos,
    input.seccion
  );
  if (porNombre) return true;
  if (input.rut) {
    const porRut = db.getFirstSync<{ id: string }>(`SELECT id FROM estudiante WHERE rut = ?`, input.rut);
    if (porRut) return true;
  }
  return false;
}

export function crearEstudiante(input: NuevoEstudianteInput): Estudiante {
  const { nombre, apellidos, seccion, rut } = validarEstudiante(input);
  const db = getDb();
  const estudiante: Estudiante = {
    id: Crypto.randomUUID(),
    nombre,
    apellidos,
    seccion,
    rut,
    creado_en: new Date().toISOString(),
  };
  db.runSync(
    `INSERT INTO estudiante (id, nombre, apellidos, seccion, rut, creado_en) VALUES (?, ?, ?, ?, ?, ?)`,
    estudiante.id,
    estudiante.nombre,
    estudiante.apellidos,
    estudiante.seccion,
    estudiante.rut,
    estudiante.creado_en
  );
  return estudiante;
}

export function listarEstudiantes(seccion?: string): Estudiante[] {
  const db = getDb();
  if (seccion) {
    return db.getAllSync<Estudiante>(
      `SELECT * FROM estudiante WHERE seccion = ? ORDER BY apellidos, nombre`,
      seccion
    );
  }
  return db.getAllSync<Estudiante>(`SELECT * FROM estudiante ORDER BY apellidos, nombre`);
}

export function obtenerEstudiante(id: string): Estudiante | null {
  return getDb().getFirstSync<Estudiante>(`SELECT * FROM estudiante WHERE id = ?`, id);
}

export function listarSecciones(): string[] {
  const rows = getDb().getAllSync<{ seccion: string }>(
    `SELECT DISTINCT seccion FROM estudiante ORDER BY seccion`
  );
  return rows.map((r) => r.seccion);
}

/** Derivado de la nómina — nunca un literal. */
export function contarPorSeccion(seccion: string): number {
  const row = getDb().getFirstSync<{ n: number }>(
    `SELECT COUNT(*) as n FROM estudiante WHERE seccion = ?`,
    seccion
  );
  return row?.n ?? 0;
}
