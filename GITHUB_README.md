# Natación UMCE — Evaluación técnica en terreno

App móvil para evaluar la técnica de natación de estudiantes de **Pedagogía en Educación Física de la UMCE**, asignatura Natación Básica. Un nadador a la vez, prueba de 50 m en piscina de 25 m, 10 observaciones puntuadas 1–3, nota en escala chilena 1,0–7,0. Funciona offline y sincroniza a Google Sheets.

## Estado

Implementación en curso: dominio de cálculo de notas (con tests), persistencia SQLite, las 9 pantallas y la cola de sincronización están construidos. La integración real con Google Sheets está detrás de una interfaz mockeada — ver `apps-script/README.md` para activarla con tu propia planilla.

## Estructura

- `mobile/` — la app, Expo + TypeScript (React Native, iOS y Android).
  - `src/domain/` — reglas de cálculo de puntaje y nota (`nota()`, `promedio()`, `official()`), con tests en `src/domain/__tests__/`. Es la especificación ejecutable: ningún puntaje o nota en la UI es un literal.
  - `src/db/` — esquema SQLite, migraciones y repositorios (estudiantes, evaluaciones, cola de sync, sesión/config, reporte).
  - `src/screens/` — las 9 pantallas descritas en `README.md`.
  - `src/services/sync/` — worker de sincronización (backoff, reintentos, idempotencia por `id_local`).
  - `src/services/sheets/` — cliente hacia el backend, con un mock automático cuando no hay backend configurado.
- `apps-script/` — el backend: un Google Apps Script Web App atado a la planilla. Corre dentro de la cuenta de Google dueña de la hoja, así que no hay OAuth2 propio, ni client secret, ni servidor que desplegar aparte. Ver `apps-script/README.md` para la puesta en marcha completa.
- `README.md` — especificación completa de diseño e implementación (fuente de verdad).
- `CLAUDE.md` — instrucciones de trabajo para Claude Code.
- `Natación VITTA.dc.html` — prototipo navegable de las 9 pantallas (referencia de diseño, no se porta como código). Ábrelo en un navegador.
- `support.js`, `ios-frame.jsx` — andamiaje del prototipo, no forman parte de la app.
- `assets/vitta-logo.png` — logo usado en la ficha de contexto del prototipo, no de la app (falta el escudo institucional UMCE).

## Cómo correr la app

```bash
cd mobile
npm install
npm start        # abre Expo Dev Tools — elige Android, iOS o Web
npm test         # tests del dominio de cálculo
```

Sin `EXPO_PUBLIC_APPS_SCRIPT_URL`/`EXPO_PUBLIC_API_KEY` configurados (ver `mobile/.env.example`), la sincronización usa un cliente simulado y no requiere ninguna credencial de Google.

## Activar Google Sheets de verdad

Sigue `apps-script/README.md` — son ~10 minutos, todo desde el navegador: crear
el proyecto de Apps Script desde tu propia Google Sheet (Extensiones → Apps
Script), pegar el código de `apps-script/`, implementarlo como Web App, y
copiar la URL + una clave propia a `mobile/.env`. No requiere Google Cloud
Console ni una cuenta de Vercel.

## Stack

React Native (Expo) + TypeScript · expo-sqlite · NetInfo para la cola de sincronización · Google Apps Script como backend de Sheets.
