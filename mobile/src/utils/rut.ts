// Validación y normalización de RUT chileno (módulo 11) — README §"Nuevo estudiante".

function digitoVerificador(cuerpo: string): string {
  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  const resto = 11 - (suma % 11);
  if (resto === 11) return '0';
  if (resto === 10) return 'K';
  return String(resto);
}

/** true si el RUT (con o sin puntos/guion) tiene dígito verificador válido. */
export function esRutValido(rut: string): boolean {
  const limpio = rut.replace(/[.\s]/g, '').toUpperCase();
  const match = /^(\d{1,8})-?([0-9K])$/.exec(limpio);
  if (!match) return false;
  const [, cuerpo, dv] = match;
  return digitoVerificador(cuerpo) === dv;
}

/** Normaliza a `12345678-5` (sin puntos, con guion, dv en mayúscula). Asume RUT ya validado. */
export function normalizarRut(rut: string): string {
  const limpio = rut.replace(/[.\s]/g, '').toUpperCase();
  const match = /^(\d{1,8})-?([0-9K])$/.exec(limpio);
  if (!match) return limpio;
  const [, cuerpo, dv] = match;
  return `${cuerpo}-${dv}`;
}
