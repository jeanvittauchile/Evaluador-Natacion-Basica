import { CRITERIA_HOJA_RUBRICA } from './rubric';
import type { FilaEvaluacionSheet, ReporteFilaSheet } from './types';

const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

export const HOJA_EVALUACIONES = 'Evaluaciones';
export const HOJA_REPORTE = 'Reporte de notas';
export const HOJA_RUBRICA = 'Rúbrica';

// Columnas A–AA — README §"Estructura de la planilla".
export const ENCABEZADOS_EVALUACIONES = [
  'id_local', 'fecha', 'asignatura', 'seccion', 'estudiante', 'rut', 'estilo', 'distancia_m', 'piscina_m',
  'salida', 'sub1', 'bo1', 'resp', 'braz', 'pat', 'vir', 'sub2', 'bo2', 'lleg',
  'puntaje', 'puntaje_max', 'nota', 'incompleta', 'exigencia', 'evaluador', 'lugar', 'sincronizado_en',
];

async function sheetsFetch(accessToken: string, path: string, init?: RequestInit): Promise<any> {
  const res = await fetch(`${SHEETS_BASE}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const err = new Error(`Sheets API ${res.status}: ${await res.text()}`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

/** Crea la planilla con sus 3 hojas y escribe encabezados + la rúbrica de referencia. */
export async function crearPlanilla(accessToken: string, titulo: string): Promise<string> {
  const data = await sheetsFetch(accessToken, '', {
    method: 'POST',
    body: JSON.stringify({
      properties: { title: titulo },
      sheets: [
        { properties: { title: HOJA_EVALUACIONES } },
        { properties: { title: HOJA_REPORTE } },
        { properties: { title: HOJA_RUBRICA } },
      ],
    }),
  });
  const spreadsheetId = data.spreadsheetId as string;

  await sheetsFetch(accessToken, `/${spreadsheetId}/values/${encodeURIComponent(`${HOJA_EVALUACIONES}!A1`)}?valueInputOption=RAW`, {
    method: 'PUT',
    body: JSON.stringify({ values: [ENCABEZADOS_EVALUACIONES] }),
  });

  await sheetsFetch(accessToken, `/${spreadsheetId}/values/${encodeURIComponent(`${HOJA_REPORTE}!A1`)}?valueInputOption=RAW`, {
    method: 'PUT',
    body: JSON.stringify({ values: [['estudiante', 'Crol', 'Espalda', 'Pecho', 'Mariposa', 'nota_general', 'estilos_evaluados']] }),
  });

  const filasRubrica: string[][] = [['criterio', 'nivel', 'descripcion']];
  for (const c of CRITERIA_HOJA_RUBRICA) {
    filasRubrica.push([c.name, '1 · No logrado', c.d1]);
    filasRubrica.push([c.name, '2 · Medianamente logrado', c.d2]);
    filasRubrica.push([c.name, '3 · Logrado', c.d3]);
  }
  await sheetsFetch(accessToken, `/${spreadsheetId}/values/${encodeURIComponent(`${HOJA_RUBRICA}!A1`)}?valueInputOption=RAW`, {
    method: 'PUT',
    body: JSON.stringify({ values: filasRubrica }),
  });

  return spreadsheetId;
}

function construirFilaValores(fila: FilaEvaluacionSheet): (string | number)[] {
  const obs = fila.observaciones.map((v) => (v === null ? '' : v));
  return [
    fila.id_local,
    fila.fecha,
    fila.asignatura,
    fila.seccion,
    fila.estudiante,
    fila.rut ?? '',
    fila.estilo,
    fila.distancia_m,
    fila.piscina_m,
    ...obs,
    fila.puntaje,
    fila.puntaje_max,
    fila.nota,
    fila.incompleta ? 'sí' : 'no',
    fila.exigencia,
    fila.evaluador ?? '',
    fila.lugar ?? '',
    new Date().toISOString(),
  ];
}

/** Upsert por id_local (columna A) — nunca duplica. README §"Estructura de la planilla › Upsert". */
export async function upsertFila(accessToken: string, spreadsheetId: string, fila: FilaEvaluacionSheet): Promise<void> {
  const colA = await sheetsFetch(accessToken, `/${spreadsheetId}/values/${encodeURIComponent(`${HOJA_EVALUACIONES}!A:A`)}`);
  const valores: string[][] = colA.values ?? [];
  const rowIndex = valores.findIndex((r) => r[0] === fila.id_local);
  const row = construirFilaValores(fila);

  if (rowIndex >= 0) {
    const rowNumber = rowIndex + 1; // 1-indexado en la API
    await sheetsFetch(
      accessToken,
      `/${spreadsheetId}/values/${encodeURIComponent(`${HOJA_EVALUACIONES}!A${rowNumber}:AA${rowNumber}`)}?valueInputOption=RAW`,
      { method: 'PUT', body: JSON.stringify({ values: [row] }) }
    );
  } else {
    await sheetsFetch(
      accessToken,
      `/${spreadsheetId}/values/${encodeURIComponent(`${HOJA_EVALUACIONES}!A:AA`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      { method: 'POST', body: JSON.stringify({ values: [row] }) }
    );
  }
}

/** Regenera la hoja "Reporte de notas" completa — no incremental. */
export async function regenerarReporte(accessToken: string, spreadsheetId: string, filas: ReporteFilaSheet[]): Promise<void> {
  await sheetsFetch(accessToken, `/${spreadsheetId}/values/${encodeURIComponent(`${HOJA_REPORTE}!A2:Z10000`)}:clear`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  if (!filas.length) return;
  const values = filas.map((f) => [
    f.estudiante,
    f.crol ?? '',
    f.espalda ?? '',
    f.pecho ?? '',
    f.mariposa ?? '',
    f.notaGeneral ?? '',
    f.estilosEvaluados,
  ]);
  await sheetsFetch(accessToken, `/${spreadsheetId}/values/${encodeURIComponent(`${HOJA_REPORTE}!A2`)}?valueInputOption=RAW`, {
    method: 'PUT',
    body: JSON.stringify({ values }),
  });
}
