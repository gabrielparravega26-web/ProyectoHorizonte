# Horizontes Visas y Pasaportes

Plataforma web para el registro de candidatos (datos personales, experiencia laboral,
disponibilidad y documentos), con un panel administrativo para su gestión, revisión
y reporte.

## Estructura del repositorio

```
horizontes/
├── backend/          Node.js + Express + Supabase (API REST)
├── frontend/          React + Vite + TailwindCSS (formulario público + panel admin)
└── docs/              Documentación técnica adicional
```

## Requisitos previos

- Node.js 18 o superior
- Una cuenta de [Supabase](https://supabase.com) (plan gratuito es suficiente)
- Cuenta en [Vercel](https://vercel.com)/[Netlify](https://netlify.com) (frontend) y
  [Railway](https://railway.app)/[Render](https://render.com) (backend) para producción

## 1. Configurar Supabase

1. Crea un proyecto nuevo en Supabase.
2. En **SQL Editor**, ejecuta el contenido de `backend/src/db/schema.sql` para crear
   las tablas `candidatos`, `documentos` y `administradores`.
3. En **Storage**, crea un bucket llamado `documentos-candidatos` (privado, sin acceso
   público) — o el nombre que definas en `SUPABASE_STORAGE_BUCKET`.
4. En **Project Settings > API**, copia:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (solo en el backend, nunca en el frontend)

## 2. Backend

```bash
cd backend
cp .env.example .env      # Completa las variables (Supabase, JWT, etc.)
npm install
npm run dev                # http://localhost:4000
```

Para crear el primer usuario del panel administrativo:

```bash
node src/db/seedAdmin.js "Nombre del Admin" "admin@horizontes.com" "una-contraseña-segura"
```

### Endpoints principales

| Método | Ruta                          | Descripción                                   | Auth |
|--------|-------------------------------|------------------------------------------------|------|
| POST   | `/api/register`               | Registra un candidato                          | No   |
| POST   | `/api/upload`                 | Sube un documento (multipart/form-data)        | No   |
| GET    | `/api/upload/:id/url`         | URL firmada para descargar un documento        | Sí   |
| GET    | `/api/candidate`              | Lista candidatos con filtros                   | Sí   |
| GET    | `/api/candidate/:id`          | Detalle de un candidato + documentos           | Sí   |
| PATCH  | `/api/candidate/:id/estado`   | Actualiza el estado de una solicitud           | Sí   |
| GET    | `/api/reports/csv`            | Exporta candidatos en CSV                      | Sí   |
| GET    | `/api/reports/resumen`        | Resumen numérico (para dashboards)             | Sí   |
| POST   | `/api/auth/login`             | Login del panel administrativo                | No   |

Ver `docs/API.md` para el detalle de payloads y respuestas.

## 3. Frontend

```bash
cd frontend
cp .env.example .env       # Define VITE_API_URL apuntando al backend
npm install
npm run dev                 # http://localhost:5173
```

- `/` — Formulario público de registro
- `/admin` — Login del panel administrativo
- `/admin/panel` — Panel administrativo (protegido)

## 4. Despliegue

| Componente  | Servicio sugerido      | Notas                                             |
|-------------|-------------------------|----------------------------------------------------|
| Frontend    | Vercel o Netlify         | Configurar `VITE_API_URL` con la URL del backend   |
| Backend     | Railway o Render (free)  | Configurar todas las variables de `.env.example`   |
| DB/Storage  | Supabase (free tier)     | Ya configurado en el paso 1                        |
| Reportes    | Google Sheets API / Metabase | Ver `docs/REPORTES.md`                         |

Recuerda habilitar HTTPS en ambos servicios (Vercel/Netlify y Railway/Render lo
proveen automáticamente) y actualizar `FRONTEND_URL` en el backend para el CORS.

## 5. Seguridad implementada

- Validación de campos obligatorios y formato (CURP, RFC, correo, teléfono) en
  frontend y backend.
- Validación de tipo MIME (`image/jpeg`, `image/png`, `application/pdf`) y tamaño
  máximo (5 MB) de archivos.
- CURP y RFC se almacenan encriptados (AES-256) en la base de datos.
- Documentos en Supabase Storage con acceso solo vía URLs firmadas de corta duración
  (5 minutos), nunca públicas.
- Autenticación JWT para todas las rutas del panel administrativo.
- Row Level Security habilitado en Supabase como capa adicional.
- Rate limiting en `/register` y `/upload` para mitigar abuso.
- Aviso de privacidad y checkbox de consentimiento obligatorio en el formulario.

## 6. Roadmap

| Semana | Entregable                                             |
|--------|----------------------------------------------------------|
| 1      | Formulario público + conexión a base de datos            |
| 2      | Subida de documentos + validaciones de tipo/tamaño        |
| 3      | Panel administrativo con login y reportes básicos         |
| 4      | Integración con Google Sheets / Metabase                  |

## Documentación adicional

- [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md) — diagrama y decisiones técnicas
- [`docs/API.md`](docs/API.md) — contratos de cada endpoint
- [`docs/REPORTES.md`](docs/REPORTES.md) — integración con Google Sheets y Metabase
