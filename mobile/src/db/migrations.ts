import { getDb } from './client';

// Esquema — README §"Modelo de dominio › Esquema local sugerido (SQLite)".
// `sesion` y `config` no están en el README (ese documenta solo las tablas de
// datos) pero son necesarias para persistir el estado de sesión/configuración
// descrito en §"State Management".
const MIGRATIONS: readonly string[] = [
  `
  CREATE TABLE estudiante (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    seccion TEXT NOT NULL,
    rut TEXT,
    creado_en TEXT NOT NULL
  );

  CREATE TABLE evaluacion (
    id TEXT PRIMARY KEY,
    estudiante_id TEXT NOT NULL REFERENCES estudiante(id),
    estilo TEXT NOT NULL,
    distancia_m INTEGER NOT NULL DEFAULT 50,
    piscina_m INTEGER NOT NULL DEFAULT 25,
    incompleta INTEGER NOT NULL DEFAULT 0,
    escala TEXT NOT NULL,
    exigencia INTEGER NOT NULL,
    puntaje INTEGER NOT NULL,
    puntaje_max INTEGER NOT NULL,
    nota REAL NOT NULL,
    asignatura TEXT NOT NULL,
    seccion TEXT NOT NULL,
    lugar TEXT,
    evaluador TEXT,
    evaluado_en TEXT NOT NULL,
    actualizado_en TEXT NOT NULL,
    dirty INTEGER NOT NULL DEFAULT 1,
    UNIQUE (estudiante_id, estilo, evaluado_en)
  );

  CREATE TABLE observacion (
    evaluacion_id TEXT NOT NULL REFERENCES evaluacion(id) ON DELETE CASCADE,
    obs_key TEXT NOT NULL,
    criterio TEXT NOT NULL,
    etiqueta TEXT,
    puntaje INTEGER,
    PRIMARY KEY (evaluacion_id, obs_key)
  );

  CREATE TABLE cola_sync (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evaluacion_id TEXT NOT NULL,
    operacion TEXT NOT NULL,
    intentos INTEGER NOT NULL DEFAULT 0,
    proximo_intento TEXT,
    ultimo_error TEXT,
    estado TEXT NOT NULL DEFAULT 'pendiente'
  );

  CREATE TABLE sesion (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    asignatura TEXT NOT NULL DEFAULT 'Natación Básica UMCE',
    seccion TEXT NOT NULL DEFAULT 'Sección 1',
    lugar TEXT NOT NULL DEFAULT 'Piscina UMCE',
    horario TEXT NOT NULL DEFAULT '',
    estilos TEXT NOT NULL DEFAULT '',
    evaluador TEXT
  );
  INSERT INTO sesion (id) VALUES (1);

  CREATE TABLE config (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    escala TEXT NOT NULL DEFAULT '30',
    exigencia INTEGER NOT NULL DEFAULT 60,
    auto_avance INTEGER NOT NULL DEFAULT 1
  );
  INSERT INTO config (id) VALUES (1);

  CREATE INDEX idx_estudiante_seccion ON estudiante(seccion);
  CREATE INDEX idx_evaluacion_estudiante ON evaluacion(estudiante_id);
  CREATE INDEX idx_cola_sync_estado ON cola_sync(estado, proximo_intento);
  `,
];

export function runMigrations(): void {
  const db = getDb();
  const row = db.getFirstSync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;
  for (let i = version; i < MIGRATIONS.length; i++) {
    db.withTransactionSync(() => {
      db.execSync(MIGRATIONS[i]);
      db.execSync(`PRAGMA user_version = ${i + 1}`);
    });
    version = i + 1;
  }
}
