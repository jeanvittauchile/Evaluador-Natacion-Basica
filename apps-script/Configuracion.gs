// Funciones para correr manualmente, una vez, desde el editor de Apps Script
// (menú "Ejecutar" con la función seleccionada). No las llama la app móvil.

/**
 * 1. Reemplaza el texto de abajo por una clave larga tuya (ej. generada con
 *    `openssl rand -hex 32` en una terminal, o cualquier string difícil de
 *    adivinar).
 * 2. Selecciona esta función en el menú de arriba del editor y presiona ▶ Ejecutar.
 * 3. La primera vez te va a pedir autorizar el script — es normal, es tu propio
 *    proyecto accediendo a tu propia hoja.
 * 4. Copia esa misma clave a EXPO_PUBLIC_API_KEY en mobile/.env.
 */
function guardarApiKey() {
  const CLAVE = 'CAMBIA_ESTO_POR_UNA_CLAVE_LARGA_Y_UNICA';
  if (CLAVE === 'CAMBIA_ESTO_POR_UNA_CLAVE_LARGA_Y_UNICA') {
    throw new Error('Edita CLAVE en Configuracion.gs antes de ejecutar guardarApiKey().');
  }
  PropertiesService.getScriptProperties().setProperty('API_KEY', CLAVE);
  Logger.log('API key guardada.');
}

/**
 * Crea (si no existen) las hojas Evaluaciones, Reporte de notas y Rúbrica con
 * sus encabezados. Es opcional correrla a mano: doPost() también las crea
 * solas en el primer sync si hace falta.
 */
function setup() {
  obtenerHoja_(HOJA_EVALUACIONES, [ENCABEZADOS_EVALUACIONES]);
  obtenerHoja_(HOJA_REPORTE, [['estudiante', 'Crol', 'Espalda', 'Pecho', 'Mariposa', 'nota_general', 'estilos_evaluados']]);
  escribirHojaRubrica_();
  Logger.log('Listo: hojas creadas/verificadas.');
}
