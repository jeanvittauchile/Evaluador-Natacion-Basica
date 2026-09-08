# Backend de Sheets (Vercel)

Funciones serverless que hacen de intermediario seguro entre la app móvil y
Google Sheets. La app **nunca** habla con Google directamente ni guarda un
client secret — todo el OAuth2 y el proxy a la Sheets API viven acá, siguiendo
`README.md` (raíz) §"Integración con Google Drive / Sheets" y §"Estrategia de
errores".

## Rutas

- `GET /api/oauth/start` — arranca el consentimiento de Google. Se visita **una
  vez, a mano, en un navegador**, con la cuenta de Google que va a recibir la
  planilla. La app móvil nunca la llama.
- `GET /api/oauth/callback` — recibe el `code` de Google, lo cambia por un
  `refresh_token`, crea la planilla (`Evaluaciones`, `Reporte de notas`,
  `Rúbrica`) y muestra en pantalla los dos valores que hay que copiar a las
  variables de entorno del proyecto.
- `POST /api/sync` — upsert de una evaluación (una fila) por `id_local`. La
  llama la app móvil desde su cola de sincronización.
- `POST /api/reporte` — regenera completa la hoja "Reporte de notas".

`/api/sync` y `/api/reporte` exigen la cabecera `x-api-key` igual a
`APP_API_KEY`; si no coincide devuelven 401.

## Puesta en marcha

1. Sigue `README.md` (raíz) §"Configuración OAuth2 (paso a paso)" pasos 1–3
   para crear el proyecto en Google Cloud, habilitar Sheets API + Drive API, y
   configurar la pantalla de consentimiento con los scopes `drive.file` y
   `spreadsheets`.
2. En **Credenciales → Crear ID de cliente OAuth**, tipo **Aplicación web**.
   Como *URI de redirección autorizado* usa
   `https://<tu-deploy>.vercel.app/api/oauth/callback` (o
   `http://localhost:3000/api/oauth/callback` para probar con `vercel dev`).
3. Copia `.env.example` a `.env` (o carga las mismas variables en el dashboard
   de Vercel → Project Settings → Environment Variables):
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — del cliente OAuth del paso 2.
   - `APP_API_KEY` — cualquier string largo que tú generes.
   - `GOOGLE_REFRESH_TOKEN`, `GOOGLE_SPREADSHEET_ID` — **se obtienen en el paso
     siguiente**, déjalos vacíos por ahora.
4. Despliega (`vercel deploy` o conecta el repo) y visita
   `/api/oauth/start` con la cuenta de Google del docente/institución.
   Autoriza el consentimiento; la página de callback te mostrará
   `GOOGLE_REFRESH_TOKEN` y `GOOGLE_SPREADSHEET_ID`.
5. Copia esos dos valores a las variables de entorno de Vercel y **vuelve a
   desplegar** (los env vars nuevos no aplican al deploy ya corriendo).
6. En la app móvil, configura `EXPO_PUBLIC_API_BASE_URL` (la URL del deploy de
   Vercel) y `EXPO_PUBLIC_API_KEY` (igual a `APP_API_KEY`) — ver
   `mobile/.env.example`. Sin esas dos variables, la app usa un cliente
   simulado (`MockSheetsClient`) y no intenta hablar con este backend.

## Notas

- No hay base de datos: el `spreadsheetId` vive como variable de entorno
  (`GOOGLE_SPREADSHEET_ID`), no en un archivo ni en una tabla — es la manera
  más simple de "recordarlo" en un backend serverless para una sola planilla
  institucional.
- Si el refresh token se revoca (403) o la planilla se borra/mueve (404), hay
  que repetir el paso 4 y actualizar las variables de entorno de nuevo.
