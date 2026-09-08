import type { VercelRequest, VercelResponse } from '@vercel/node';
import { baseUrlFromRequest } from '../../lib/env';
import { exchangeCodeForTokens } from '../../lib/googleAuth';
import { crearPlanilla } from '../../lib/sheets';

function pagina(titulo: string, cuerpoHtml: string): string {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${titulo}</title>
  <style>
    body { font-family: -apple-system, Segoe UI, sans-serif; max-width: 640px; margin: 40px auto; padding: 0 20px; color: #16305B; }
    h1 { font-size: 20px; }
    code, pre { background: #F4F0E2; padding: 2px 6px; border-radius: 4px; word-break: break-all; }
    pre { padding: 14px; white-space: pre-wrap; }
    .ok { color: #1B6E7C; } .err { color: #B4553F; }
  </style></head><body>${cuerpoHtml}</body></html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const code = req.query.code as string | undefined;
  const error = req.query.error as string | undefined;

  if (error) {
    res.status(400).send(pagina('OAuth cancelado', `<h1 class="err">Google devolvió un error</h1><p>${error}</p>`));
    return;
  }
  if (!code) {
    res.status(400).send(pagina('Falta code', '<h1 class="err">Falta el parámetro code</h1>'));
    return;
  }

  try {
    const redirectUri = `${baseUrlFromRequest(req)}/api/oauth/callback`;
    const tokens = await exchangeCodeForTokens(code, redirectUri);

    if (!tokens.refresh_token) {
      res.status(200).send(
        pagina(
          'Sin refresh token',
          `<h1 class="err">Google no devolvió un refresh_token</h1>
           <p>Esto pasa cuando la cuenta ya había autorizado esta app antes. Quita el acceso en
           <a href="https://myaccount.google.com/permissions">myaccount.google.com/permissions</a> y vuelve a
           <a href="/api/oauth/start">/api/oauth/start</a>.</p>`
        )
      );
      return;
    }

    const asignatura = typeof req.query.state === 'string' ? req.query.state : 'Natación Básica UMCE';
    const titulo = `Evaluaciones Natación ${asignatura} ${new Date().getFullYear()}`;
    const spreadsheetId = await crearPlanilla(tokens.access_token, titulo);

    res.status(200).send(
      pagina(
        'Configuración lista',
        `<h1 class="ok">Planilla creada</h1>
         <p>Se creó «${titulo}» con las hojas Evaluaciones, Reporte de notas y Rúbrica.</p>
         <p>Copia estos dos valores como variables de entorno del proyecto en Vercel y vuelve a desplegar:</p>
         <pre>GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}
GOOGLE_SPREADSHEET_ID=${spreadsheetId}</pre>
         <p>Ya deberían existir <code>GOOGLE_CLIENT_ID</code>, <code>GOOGLE_CLIENT_SECRET</code> y <code>APP_API_KEY</code>
         (ver server/README.md). Con las cuatro variables configuradas, la app móvil puede apuntar
         <code>EXPO_PUBLIC_API_BASE_URL</code> a esta URL y <code>EXPO_PUBLIC_API_KEY</code> al mismo valor de
         <code>APP_API_KEY</code> para dejar de usar el mock.</p>`
      )
    );
  } catch (e) {
    res.status(500).send(pagina('Error', `<h1 class="err">No se pudo completar el OAuth</h1><pre>${e instanceof Error ? e.message : String(e)}</pre>`));
  }
}
