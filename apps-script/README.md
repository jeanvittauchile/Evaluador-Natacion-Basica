# Backend de Sheets (Google Apps Script)

Reemplaza a un backend con OAuth2 propio: el script corre **dentro** de la
cuenta de Google dueña de la planilla, así que no hay client ID/secret,
refresh token, ni servidor que desplegar en otro lado. Sigue el mismo
contrato que `mobile/src/services/sheets/types.ts` — ver `README.md` (raíz)
§"Integración con Google Drive / Sheets" para el formato exacto de columnas.

## Puesta en marcha (~10 minutos, todo a mano, sin Google Cloud Console)

1. Crea una Google Sheet nueva (o abre la que ya usas), con la cuenta de
   Google que va a recibir las evaluaciones.
2. **Extensiones → Apps Script**. Se abre el editor con un proyecto vacío
   atado a esa hoja.
3. Borra el contenido de `Código.gs` (o `Code.gs`) que trae por defecto, y
   crea tres archivos de script con los nombres y el contenido de esta
   carpeta: `Codigo.gs`, `Configuracion.gs`, `Rubrica.gs` (copia y pega tal
   cual). El manifiesto `appsscript.json` normalmente no hace falta tocarlo a
   mano — si quieres editarlo, actívalo con el ícono de engranaje ⚙️
   ("Mostrar archivo de manifiesto appsscript.json" en Configuración del
   proyecto).
4. Abre `Configuracion.gs`, reemplaza `CAMBIA_ESTO_POR_UNA_CLAVE_LARGA_Y_UNICA`
   por una clave tuya (cualquier string largo — es la que la app móvil va a
   mandar para autenticarse). Selecciona la función `guardarApiKey` en el
   desplegable de arriba y presiona ▶ **Ejecutar**. La primera vez pide
   autorizar el script sobre tu propia cuenta — acéptalo.
5. (Opcional) Corre también `setup` una vez para crear de entrada las hojas
   `Evaluaciones`, `Reporte de notas` y `Rúbrica`. Si no la corres, se crean
   solas la primera vez que la app sincroniza algo.
6. **Implementar → Nueva implementación** → tipo **Aplicación web**.
   - Ejecutar como: **Yo** (tu cuenta).
   - Quién tiene acceso: **Cualquier usuario**.
   - Implementar. Copia la **URL de la aplicación web** que te da (termina en
     `/exec`).
7. En `mobile/`, copia `.env.example` a `.env` y completa:
   ```
   EXPO_PUBLIC_APPS_SCRIPT_URL=<la URL /exec del paso 6>
   EXPO_PUBLIC_API_KEY=<la misma clave del paso 4>
   ```
   Reinicia `npm start` — la app deja de usar el mock y sincroniza contra tu
   hoja real.

## Si editas el código después

Cada cambio en el script requiere **Implementar → Gestionar implementaciones
→ ✏️ (editar) → Nueva versión → Implementar** para que el Web App en
producción lo tome (la URL `/exec` se mantiene igual). "Guardar" solo en el
editor no alcanza.

## Límites a tener en cuenta

Cuota de Apps Script para cuentas gratuitas: ejecuciones de hasta 6 minutos,
un número generoso de invocaciones diarias (miles). Para el volumen de este
uso (evaluaciones de una sesión de clase) no es un problema real. Si la
cuenta es Google Workspace de la UMCE, los límites son más altos todavía.

## Seguridad

La URL del Web App es pública (cualquiera con el link puede llamarla), por
eso todo el código exige `apiKey` en el cuerpo del POST antes de tocar la
hoja. Trata esa URL y esa clave con el mismo cuidado que una contraseña: no
las publiques en un repositorio público ni las compartas fuera del equipo.
