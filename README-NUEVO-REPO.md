# AEFN — Sitio web oficial

Asociación de Estudiantes de Física y Nanotecnología · Yachay Tech

Sitio web construido con **Next.js 16 + TypeScript + Tailwind CSS 4 + shadcn/ui**,
con panel de administración que edita los datos directamente en GitHub vía
GitHub Contents API.

---

## 🚀 Inicio rápido (desde cero)

### Requisitos
- [Node.js 18+](https://nodejs.org/) o [Bun](https://bun.sh/)
- [GitHub Desktop](https://desktop.github.com/) (opcional, pero recomendado)
- Una cuenta en [Vercel](https://vercel.com/)

### Paso 1 — Subir el proyecto a GitHub

1. Descomprime este .zip en una carpeta local, por ejemplo `web_aefn/`
2. Abre **GitHub Desktop**
3. **File → New repository…**
   - Name: `web_aefn` (o el que prefieras)
   - Local path: la carpeta donde descomprimiste el zip
   - **Importante**: marca "Initialize this repository with a README" si la carpeta está vacía (no lo estará porque ya tiene archivos)
   - Si GitHub Desktop detecta que la carpeta no es un repo, te ofrecerá "create a repository here" — acepta
4. GitHub Desktop detectará todos los archivos como "uncommitted changes"
5. Escribe un mensaje de commit (ej: "Initial commit — AEFN website")
6. Click **Commit to main**
7. **Publish repository** (botón azul) — elige si es público o privado

### Paso 2 — Instalar dependencias y probar localmente

```bash
# En la carpeta del proyecto:
bun install
# o si usas npm:
npm install

# Crear archivo de entorno:
cp .env.example .env.local

# Editar .env.local con tu GitHub token y claves de admin
# (instrucciones dentro del archivo)

# Iniciar servidor de desarrollo:
bun run dev
# o:
npm run dev
```

Abre `http://localhost:3000/` — deberías ver el sitio completo.

### Paso 3 — Deploy en Vercel

1. Ve a [vercel.com](https://vercel.com/) e inicia sesión con GitHub
2. **Add New → Project**
3. Importa el repo `web_aefn` que acabas de crear
4. Vercel detectará Next.js automáticamente — no cambies la configuración
5. **Importante**: en "Environment Variables", añade las variables de `.env.example`:
   - `GITHUB_TOKEN` — tu token de GitHub (con scope `repo`)
   - `ACCESS_KEYS` — el JSON con las claves de admin
   - `DATABASE_URL` — `file:./dev.db` (no se usa en producción, pero Vercel puede pedirlo)
6. Click **Deploy**
7. ¡Listo! En ~2 minutos tendrás tu sitio en `https://web-aefn.vercel.app/` (o similar)

### Paso 4 — Configurar el token de GitHub

Para que el panel admin funcione en producción:

1. Ve a [github.com/settings/tokens](https://github.com/settings/tokens)
2. **Generate new token (classic)**
3. Marca el scope **`repo`** (acceso completo a repos)
4. Copia el token (empieza con `ghp_`)
5. En Vercel: **Settings → Environment Variables → Add**:
   - Key: `GITHUB_TOKEN`
   - Value: el token copiado
6. **Redeploy** (Deployments → ⋮ → Redeploy)

---

## 📁 Estructura del proyecto

```
web_aefn/
├── public/                  # Archivos estáticos (HTML, CSS, JS, imágenes, datos)
│   ├── index.html           # Página principal (carrusel dinámico + secciones)
│   ├── profesores.html      # Directorio de profesores
│   ├── clubes.html          # Clubes estudiantiles
│   ├── investigacion.html   # Grupos de investigación
│   ├── calendario.html      # Calendario de eventos
│   ├── galeria.html         # Galería de fotos
│   ├── nosotros.html       # Sobre la AEFN
│   ├── directiva.html       # Directiva
│   ├── css/                 # Bootstrap + tema AEFN + capa científica
│   ├── js/                  # jQuery, Bootstrap, carrusel dinámico
│   ├── data/                # JSON de datos (editables vía admin)
│   ├── images/              # Logos, profesores, galería, noticias
│   ├── mallas/              # Mallas curriculares
│   └── welcome_screen/      # Fotos del carrusel principal
├── src/
│   ├── app/                 # App Router de Next.js
│   │   ├── page.tsx         # Redirect a /index.html
│   │   ├── layout.tsx       # Layout raíz
│   │   ├── globals.css      # Tailwind + utilidades AEFN científicas
│   │   ├── admin/           # Panel de administración (React + shadcn/ui)
│   │   ├── noticias/        # Páginas públicas de noticias (Server Components)
│   │   ├── creditos/        # Página de créditos
│   │   └── api/             # API Routes (GitHub Contents API)
│   ├── components/
│   │   ├── ui/              # shadcn/ui (40+ componentes)
│   │   └── admin/           # Componentes del panel admin
│   ├── hooks/               # Hooks personalizados
│   └── lib/                 # Lógica compartida (types, config, auth, github)
├── prisma/                  # Schema de Prisma (solo desarrollo)
├── .env.example             # Template de variables de entorno
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── components.json          # Config shadcn/ui
└── eslint.config.mjs
```

---

## 🎠 Carrusel dinámico (fotos + videos)

El carrusel de la página principal lee `public/data/carrusel.json`.
Para añadir/quitar fotos o videos, solo edita ese archivo en GitHub.

**Añadir una foto:**
1. Sube la imagen a `public/welcome_screen/` (vía GitHub web o Desktop)
2. Edita `public/data/carrusel.json` y añade:
```json
{
  "id": "mi-foto",
  "tipo": "imagen",
  "src": "welcome_screen/mi-foto.jpg",
  "alt": "Descripción de la foto",
  "duracion": 4000
}
```

**Añadir un video de YouTube:**
1. Sube el video a YouTube (puede ser "No listado")
2. Edita `public/data/carrusel.json` y añade:
```json
{
  "id": "mi-video",
  "tipo": "video",
  "src": "https://youtu.be/VIDEO_ID",
  "alt": "Descripción del video"
}
```

El video se reproduce en bucle, sin sonido (muted), automáticamente.

📄 **Guía completa:** ver `CARRUSEL-GUIA.md`

---

## 🛠 Panel de administración

- URL: `https://tu-dominio.vercel.app/admin`
- Acceso por **claves por módulo** (no usuarios tradicionales)
- Las claves se configuran en la variable de entorno `ACCESS_KEYS`
- Los cambios se guardan automáticamente en GitHub (commits automáticos)

**Módulos disponibles:**
- Profesores (con fotos)
- Eventos (calendario)
- Investigación (grupos + papers + tesis)
- Noticias (con imágenes, Markdown)
- Clubes
- Galería

---

## 🎨 Identidad visual

- **Dorado** (`#FFD700` / `amber-500`) — acento principal
- **Negro** (`#0a0a0a` / `neutral-950`) — headers, footers, fondos oscuros
- **Gris neutro** (`#f5f5f5` / `neutral-50`) — fondos de páginas
- Logos en `public/images/logos/` (AEFN + ECFN)

La capa visual científica (`public/css/aefn-scientific.css`) añade:
- Mesh gradients negro→dorado
- Partículas animadas
- Glow dorado en hover
- Glass morphism sutil
- Skeletons con shimmer
- Tipografía monospace técnica
- Tags científicos tipo terminal

---

## 📚 Documentación

- `ARCHITECTURE.md` — Arquitectura técnica detallada
- `ADMIN_MANUAL.md` — Manual del panel admin
- `DEPLOYMENT.md` — Guía de deployment paso a paso
- `CARRUSEL-GUIA.md` — Guía del carrusel dinámico
- `LEEME.md` — Resumen de mejoras visuales aplicadas

---

## 🔧 Comandos disponibles

```bash
bun run dev      # Servidor de desarrollo (puerto 3000)
bun run build    # Build de producción
bun run start    # Servir build de producción
bun run lint     # Verificar calidad de código
bun run db:push  # Crear/actualizar tablas de Prisma (solo dev)
```

---

## 🆘 Solución de problemas

**El carrusel no carga:** verifica que `public/data/carrusel.json` sea válido (sin comas faltantes, sin trailing comma). Usa [jsonlint.com](https://jsonlint.com).

**El panel admin no guarda cambios:** falta `GITHUB_TOKEN` en las variables de entorno de Vercel. El token debe tener scope `repo`.

**Error 404 en `/noticias`:** las páginas Next.js necesitan que el build de Vercel incluya Server Components. Verifica que `next.config.ts` tenga `output: "standalone"`.

**Los videos de YouTube no se ven:** el video debe ser **Público** o **No listado** (no Privado). Verifica la configuración de privacidad en YouTube Studio.

---

**AEFN · Asociación de Estudiantes de Física y Nanotecnología**
**Escuela de Ciencias Físicas y Nanotecnología · Yachay Tech**
**Ecuador**
