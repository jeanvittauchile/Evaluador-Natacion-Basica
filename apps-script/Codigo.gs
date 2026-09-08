// Backend de Sheets — Google Apps Script atado a la planilla de evaluaciones.
// Reemplaza al backend con OAuth2 propio: al correr "dentro" de la cuenta de
// Google dueña de la hoja, no necesita client ID/secret ni refresh token — ver
// apps-script/README.md para la puesta en marcha completa.

const HOJA_EVALUACIONES = 'Evaluaciones';
const HOJA_REPORTE = 'Reporte de notas';
const HOJA_RUBRICA = 'Rúbrica';

// Columnas A–AA — README raíz §"Estructura de la planilla".
const ENCABEZADOS_EVALUACIONES = [
  'id_local', 'fecha', 'asignatura', 'seccion', 'estudiante', 'rut', 'estilo', 'distancia_m', 'piscina_m',
  'salida', 'sub1', 'bo1', 'resp', 'braz', 'pat', 'vir', 'sub2', 'bo2', 'lleg',
  'puntaje', 'puntaje_max', 'nota', 'incompleta', 'exigencia', 'evaluador', 'lugar', 'sincronizado_en',
];

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse_({ ok: false, error: 'Cuerpo no es JSON válido', retryable: false });
  }

  if (body.apiKey !== obtenerApiKey_()) {
    return jsonResponse_({ ok: false, error: 'API key inválida', retryable: false, requiresReauth: true });
  }

  try {
    if (body.action === 'sync') {
      upsertFila_(body.fila);
      return jsonResponse_({ ok: true });
    }
    if (body.action === 'reporte') {
      regenerarReporte_(body.filas);
      return jsonResponse_({ ok: true });
    }
    return jsonResponse_({ ok: false, error: 'Acción desconocida: ' + body.action, retryable: false });
  } catch (err) {
    // Cualquier excepción de Sheets (cuota, hoja bloqueada, etc.) se trata
    // como reintentable — el worker de la app ya tiene backoff exponencial.
    return jsonResponse_({ ok: false, error: String(err), retryable: true });
  }
}

/** Permite abrir la URL del Web App en un navegador para confirmar que está desplegado. */
function doGet() {
  return jsonResponse_({ ok: true, mensaje: 'Backend de Natación UMCE activo.' });
}

function upsertFila_(fila) {
  const hoja = obtenerHoja_(HOJA_EVALUACIONES, [ENCABEZADOS_EVALUACIONES]);
  const idLocal = fila.id_local;
  const fila_ = construirFilaValores_(fila);

  const ultimaFila = hoja.getLastRow();
  const numero = ultimaFila > 1 ? encontrarFilaPorIdLocal_(hoja, idLocal, ultimaFila) : -1;

  if (numero > 0) {
    hoja.getRange(numero, 1, 1, fila_.length).setValues([fila_]);
  } else {
    hoja.appendRow(fila_);
  }
}

function encontrarFilaPorIdLocal_(hoja, idLocal, ultimaFila) {
  const columnaA = hoja.getRange(2, 1, ultimaFila - 1, 1).getValues();
  for (let i = 0; i < columnaA.length; i++) {
    if (columnaA[i][0] === idLocal) return i + 2; // +2: encabezado + índice 0-based
  }
  return -1;
}

function construirFilaValores_(fila) {
  const obs = (fila.observaciones || []).map(function (v) {
    return v === null || v === undefined ? '' : v;
  });
  return [
    fila.id_local,
    fila.fecha,
    fila.asignatura,
    fila.seccion,
    fila.estudiante,
    fila.rut || '',
    fila.estilo,
    fila.distancia_m,
    fila.piscina_m,
  ].concat(obs, [
    fila.puntaje,
    fila.puntaje_max,
    fila.nota,
    fila.incompleta ? 'sí' : 'no',
    fila.exigencia,
    fila.evaluador || '',
    fila.lugar || '',
    new Date().toISOString(),
  ]);
}

/** Regenera la hoja "Reporte de notas" completa — no incremental. */
function regenerarReporte_(filas) {
  const hoja = obtenerHoja_(HOJA_REPORTE, [['estudiante', 'Crol', 'Espalda', 'Pecho', 'Mariposa', 'nota_general', 'estilos_evaluados']]);
  const ultimaFila = hoja.getLastRow();
  if (ultimaFila > 1) {
    hoja.getRange(2, 1, ultimaFila - 1, hoja.getLastColumn()).clearContent();
  }
  if (!filas || !filas.length) return;
  const valores = filas.map(function (f) {
    return [f.estudiante, f.crol || '', f.espalda || '', f.pecho || '', f.mariposa || '', f.notaGeneral || '', f.estilosEvaluados];
  });
  hoja.getRange(2, 1, valores.length, valores[0].length).setValues(valores);
}

function obtenerHoja_(nombre, filasEncabezadoSiNueva) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = ss.getSheetByName(nombre);
  if (!hoja) {
    hoja = ss.insertSheet(nombre);
    hoja.getRange(1, 1, filasEncabezadoSiNueva.length, filasEncabezadoSiNueva[0].length).setValues(filasEncabezadoSiNueva);
  }
  return hoja;
}

function obtenerApiKey_() {
  return PropertiesService.getScriptProperties().getProperty('API_KEY');
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
