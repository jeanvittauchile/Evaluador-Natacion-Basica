export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

export function baseUrlFromRequest(req: { headers: { [k: string]: string | string[] | undefined } }): string {
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = req.headers.host as string;
  return `${proto}://${host}`;
}
