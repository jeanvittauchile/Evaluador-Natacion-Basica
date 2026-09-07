# Subir a GitHub

Descarga y descomprime el paquete, luego:

```bash
cd design_handoff_natacion_umce
mv gitignore.txt .gitignore
mv GITHUB_README.md README_REPO.md   # opcional: úsalo como README del repo
git init
git add .
git commit -m "Diseño: app de evaluación técnica de natación UMCE"
```

Crea el repositorio en GitHub (privado si la nómina de estudiantes es real) y conéctalo:

```bash
git remote add origin https://github.com/<usuario>/natacion-umce.git
git branch -M main
git push -u origin main
```

Con GitHub CLI es un solo paso:

```bash
gh repo create natacion-umce --private --source=. --push
```

## Luego, en Claude Code

```bash
cd natacion-umce
claude
```

`CLAUDE.md` se carga automáticamente y le da el contexto y el orden de trabajo. Pídele:

> Implementa la app descrita en README.md con Expo y TypeScript. Empieza por el dominio y los tests de cálculo de notas antes de cualquier pantalla.

## Antes del primer push

- **Nombres reales:** el prototipo trae 12 nombres de ejemplo inventados. Si los reemplazas por la nómina real, el repositorio debe ser **privado** — son datos personales de estudiantes.
- **Credenciales:** `.gitignore` ya excluye `google-services.json`, `GoogleService-Info.plist`, keystores y `.env`. No los subas nunca.
