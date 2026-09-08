// Funciones para correr manualmente, una vez, desde el editor de Apps Script
// (menú "Ejecutar" con la función seleccionada). No las llama la app móvil.

/**
 * 1. Reemplaza el valor de CLAVE de abajo (entre comillas) por una clave tuya
 *    (ej. generada con `openssl rand -hex 32` en una terminal, o cualquier
 *    string difícil de adivinar).
 * 2. Selecciona esta función en el menú de arriba del editor y presiona ▶ Ejecutar.
 * 3. La primera vez te va a pedir autorizar el script — es normal, es tu propio
 *    proyecto accediendo a tu propia hoja.
 * 4. Revisa el panel de Ejecución: debe decir "API key guardada: [tu-clave]".
 * 5. Copia esa misma clave a EXPO_PUBLIC_API_KEY en mobile/.env.
 */
function guardarApiKey() {
  const CLAVE = 'TU_CLAVE_AQUI';
  PropertiesService.getScriptProperties().setProperty('API_KEY', CLAVE);
  Logger.log('API key guardada: [' + CLAVE + ']');
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
