// Clasificación de errores de sincronización — README §"Estrategia de errores y recuperación".

export class SheetsSyncError extends Error {
  reintentable: boolean;
  requiereReauth: boolean;
  recrearPlanilla: boolean;

  constructor(
    message: string,
    opts: { reintentable: boolean; requiereReauth?: boolean; recrearPlanilla?: boolean }
  ) {
    super(message);
    this.name = 'SheetsSyncError';
    this.reintentable = opts.reintentable;
    this.requiereReauth = opts.requiereReauth ?? false;
    this.recrearPlanilla = opts.recrearPlanilla ?? false;
  }
}

/** Clasifica un error de red/HTTP según la tabla del README. Respeta Retry-After en 429. */
export function clasificarErrorHttp(status: number | null, retryAfterSeconds?: number): SheetsSyncError {
  if (status === null) {
    return new SheetsSyncError('Sin red o timeout', { reintentable: true });
  }
  if (status === 401) {
    return new SheetsSyncError('Token expirado', { reintentable: true });
  }
  if (status === 403) {
    return new SheetsSyncError('Permisos insuficientes o consentimiento revocado', {
      reintentable: false,
      requiereReauth: true,
    });
  }
  if (status === 404) {
    return new SheetsSyncError('La planilla no existe (borrada o movida)', {
      reintentable: true,
      recrearPlanilla: true,
    });
  }
  if (status === 429) {
    return new SheetsSyncError(`Límite de tasa excedido${retryAfterSeconds ? ` (Retry-After ${retryAfterSeconds}s)` : ''}`, {
      reintentable: true,
    });
  }
  if (status >= 500) {
    return new SheetsSyncError(`Error del servidor (${status})`, { reintentable: true });
  }
  if (status === 400) {
    return new SheetsSyncError('Datos inválidos rechazados por el backend', { reintentable: false });
  }
  return new SheetsSyncError(`Error HTTP ${status}`, { reintentable: false });
}
