# Arquitectura

## Diagrama general

```
                    ┌──────────────────────┐
                    │   Frontend (React)   │
                    │  Vercel / Netlify    │
                    │                      │
                    │  /  → Formulario     │
                    │  /admin → Login      │
                    │  /admin/panel → CRUD │
                    └──────────┬───────────┘
                               │ HTTPS (fetch/axios)
                               ▼
                    ┌──────────────────────┐
                    │  Backend (Express)   │
                    │  Railway / Render    │
                    │                      │
                    │  /api/register       │
                    │  /api/upload         │
                    │  /api/candidate      │
                    │  /api/reports        │
                    │  /api/auth           │
                    └──────────┬───────────┘
                               │ service_role key
                               ▼
                    ┌──────────────────────┐
                    │      Supabase        │
                    │  Postgres + Storage  │
                    │                      │
                    │  candidatos          │
                    │  documentos          │
                    │  administradores     │
                    └──────────┬───────────┘
                               │
                     ┌─────────┴─────────┐
                     ▼                   ▼
              Google Sheets API      Metabase
              (reportes básicos)   (dashboards)
```

## Flujo del formulario público

1. El usuario llena el formulario en el frontend; la validación de formato (CURP,
   RFC, correo, teléfono) ocurre primero en el cliente para dar retroalimentación
   inmediata.
2. Al enviar, el frontend hace `POST /api/register` con los datos personales,
   de contacto, experiencia y disponibilidad. El backend valida de nuevo con Zod
   (nunca confiar solo en el cliente), encripta CURP/RFC y guarda el registro.
3. El backend responde con el `candidato_id` generado.
4. El frontend sube cada documento adjunto con `POST /api/upload`
   (`multipart/form-data`), incluyendo el `candidato_id` y el `tipo_documento`.
   Cada archivo se valida por tipo MIME y tamaño antes de subirse a Supabase Storage.
5. Se muestra la confirmación visual de registro exitoso.

## Flujo del panel administrativo

1. El administrador inicia sesión (`POST /api/auth/login`); el backend valida
   contraseña con bcrypt y firma un JWT.
2. El frontend guarda el JWT en `localStorage` y lo envía en el header
   `Authorization: Bearer <token>` en cada petición subsecuente.
3. El middleware `verificarToken` protege todas las rutas de `/api/candidate` y
   `/api/reports`.
4. Para descargar un documento, el panel solicita una URL firmada
   (`GET /api/upload/:id/url`), válida por 5 minutos, en vez de exponer una URL
   pública permanente.

## Decisiones técnicas

- **Supabase** se eligió por incluir Postgres + Storage + Auth en un solo servicio
  con plan gratuito generoso, ideal para el MVP.
- **Multer con `memoryStorage`**: los archivos nunca tocan el disco del servidor;
  se suben directamente al buffer y de ahí a Supabase Storage, reduciendo riesgo
  y simplificando el despliegue en plataformas efímeras como Railway/Render.
- **Zod** para validación de esquemas en backend: validaciones declarativas,
  fáciles de mantener y con mensajes de error claros para el frontend.
- **Encriptación a nivel de aplicación (AES-256)** para CURP/RFC, adicional al
  cifrado en reposo que ya provee Supabase, dado que son datos personales sensibles.
