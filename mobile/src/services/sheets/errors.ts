// Clasificación de errores de sincronización — README §"Estrategia de errores y recuperación".
// El backend es un Google Apps Script Web App: siempre responde HTTP 200 con
// un cuerpo JSON (Apps Script no permite fijar códigos de estado propios), así
// que la clasificación se basa en los campos del cuerpo, no en el status HTTP
// — ver appsScriptClient.ts.

export class SheetsSyncError extends Error {
  reintentable: boolean;
  requiereReauth: boolean;

  constructor(message: string, opts: { reintentable: boolean; requiereReauth?: boolean }) {
    super(message);
    this.name = 'SheetsSyncError';
    this.reintentable = opts.reintentable;
    this.requiereReauth = opts.requiereReauth ?? false;
  }
}
