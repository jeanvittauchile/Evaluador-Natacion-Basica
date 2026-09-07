# Natación UMCE — Evaluación técnica en terreno

App móvil para evaluar la técnica de natación de estudiantes de **Pedagogía en Educación Física de la UMCE**, asignatura Natación Básica. Un nadador a la vez, prueba de 50 m en piscina de 25 m, 10 observaciones puntuadas 1–3, nota en escala chilena 1,0–7,0. Funciona offline y sincroniza a Google Sheets.

## Estado

Diseño terminado (prototipo de alta fidelidad en HTML). Implementación pendiente.

## Contenido

- `README.md` — especificación completa de diseño e implementación.
- `CLAUDE.md` — instrucciones de trabajo para Claude Code.
- `Natación VITTA.dc.html` — prototipo navegable de las 9 pantallas. Ábrelo en un navegador.
- `support.js`, `ios-frame.jsx` — andamiaje del prototipo, no forman parte de la app.
- `assets/vitta-logo.png` — logo usado en la ficha de contexto del prototipo.

## Cómo empezar

```bash
claude
```

Y pide: *implementa la app descrita en README.md con Expo y TypeScript, empezando por el dominio y los tests de cálculo de notas*.

## Stack objetivo

React Native (Expo) + TypeScript · expo-sqlite · Google Sheets API vía OAuth2 · NetInfo para la cola de sincronización.
