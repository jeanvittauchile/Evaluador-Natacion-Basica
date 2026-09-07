# Implementar la app de evaluación de natación UMCE

Lee `README.md` completo antes de escribir código: contiene la especificación de las nueve pantallas con valores exactos, el modelo de datos, la fórmula de notas, el esquema SQLite, la integración con Google Sheets y la estrategia de errores.

## Contexto

Los archivos `.dc.html`, `support.js` y `ios-frame.jsx` de esta carpeta son **prototipos de referencia en HTML**, no código a portar. `support.js` e `ios-frame.jsx` son andamiaje de previsualización: ignóralos como código, pero abre el `.dc.html` en un navegador para ver el diseño funcionando.

Target: **React Native (Expo) + TypeScript**, iOS y Android.

## Orden de trabajo sugerido

1. **Scaffold** — Expo + TypeScript, fuentes Barlow y Barlow Condensed, tokens de color del README como constantes tipadas, safe areas.
2. **Dominio y cálculo de notas primero, con tests.** Porta `CRITERIA`, `ROWS`, `DUAL` y las funciones `nota()`, `promedio()` y `official()` desde la clase de lógica del prototipo. Casos de prueba obligatorios: puntaje mínimo y máximo en ambas escalas (10–30 y 8–24), la nota 4,0 exacta en el punto de exigencia, prueba incompleta con `max` reducido, promedio general con estilos de distinto `max`, y la consolidación `floor(mean(...))` de sub acuático y break out.
3. **Persistencia** — SQLite con el esquema del README, migraciones, y escritura transaccional por toque de puntaje.
4. **Pantallas** en este orden: Evaluación (la crítica) → Resumen → Estilo → Estudiantes → Nuevo estudiante → Inicio → Reporte → Rúbrica → Editar sesión.
5. **Validaciones** de formulario: nombre y apellidos, sección obligatoria, RUT con módulo 11, detección de duplicados.
6. **Cola de sincronización** — worker con backoff, clasificación de errores e idempotencia por `id_local`.
7. **OAuth2 y Sheets** — al final, detrás de una interfaz que se pueda mockear.

## Reglas no negociables

- **Ninguna nota ni puntaje es un literal.** Todo sale de las funciones de cálculo, incluidos los datos de ejemplo. El prototipo cumple esto y es fácil de romper al portar.
- **Los botones de puntaje miden 52×52 px.** El evaluador toca sin mirar.
- **Sin sombras.** El sistema separa con color de fondo y borde de 1px, por legibilidad bajo sol directo.
- **La UI nunca espera a la red.** Escribir local, encolar, sincronizar aparte.
- **Los conteos se derivan de la nómina**, nunca se escriben a mano.
- Reemplaza los glifos Unicode del prototipo (`◉ ☷ ▤ ☰ ⌕`) por iconos reales.

## Preguntar antes de asumir

- Si no hay credenciales de Google Cloud: implementa la capa de Sheets contra una interfaz y déjala mockeada; el README tiene el paso a paso de OAuth2 para cuando lleguen.
- Escudo institucional UMCE: no está en el paquete, hay que pedirlo.
- El cronómetro / tiempo de los 50 m **no** está diseñado todavía.
