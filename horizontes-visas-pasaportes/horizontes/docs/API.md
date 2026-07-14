# Contratos de la API

Base URL local: `http://localhost:4000/api`

## POST /register

Registra un nuevo candidato. Público, sin autenticación.

**Body (JSON):**
```json
{
  "nombre": "Ana",
  "apellido_paterno": "Gómez",
  "apellido_materno": "Ruiz",
  "fecha_nacimiento": "1995-04-12",
  "curp": "GORA950412MDFXXX01",
  "rfc": "GORA950412ABC",
  "correo": "ana@correo.com",
  "telefono": "6671234567",
  "direccion": "Calle Falsa 123",
  "ciudad": "Los Mochis",
  "estado": "Sinaloa",
  "experiencia_laboral": "3 años en atención a cliente",
  "puesto_interes": "Agente de viajes",
  "disponibilidad": "inmediata",
  "tipo_visa": "trabajo",
  "consentimiento_privacidad": true
}
```

**Respuesta 201:**
```json
{ "mensaje": "Registro guardado exitosamente", "candidato_id": "uuid" }
```

**Respuesta 400/409:** `{ "error": "..." }` (validación fallida o CURP duplicada)

---

## POST /upload

Sube un documento de un candidato. Público. `Content-Type: multipart/form-data`.

**Campos del form-data:**
- `archivo` (file, JPG/PNG/PDF, máx. 5 MB)
- `candidato_id` (uuid)
- `tipo_documento` (uno de: `ine`, `pasaporte`, `curp`, `acta`, `comprobante`, `licencia`, `cv`, `fotografia`)

**Respuesta 201:**
```json
{ "mensaje": "Documento subido exitosamente", "documento_id": "uuid", "ruta_storage": "..." }
```

---

## POST /auth/login

**Body:** `{ "correo": "admin@horizontes.com", "password": "..." }`

**Respuesta 200:**
```json
{ "token": "jwt...", "admin": { "id": "uuid", "nombre": "...", "correo": "...", "rol": "admin" } }
```

---

## GET /candidate

Requiere header `Authorization: Bearer <token>`.

**Query params opcionales:** `estado`, `tipo_visa`, `disponibilidad`, `desde`, `hasta`, `pagina`, `limite`

**Respuesta 200:**
```json
{ "candidatos": [ /* ... */ ], "total": 42, "pagina": 1, "limite": 20 }
```

---

## GET /candidate/:id

Requiere token. Devuelve el candidato completo (CURP/RFC desencriptados solo aquí)
junto con sus documentos.

---

## PATCH /candidate/:id/estado

Requiere token. **Body:** `{ "estado_solicitud": "en_revision" }`

---

## GET /upload/:documentoId/url

Requiere token. Devuelve una URL firmada temporal (5 minutos) para descargar el
documento directamente desde Supabase Storage.

---

## GET /reports/csv

Requiere token. Acepta los mismos filtros que `/candidate`. Devuelve un archivo CSV.

## GET /reports/resumen

Requiere token. Devuelve conteos agregados por estado, disponibilidad y tipo de
visa, útil como fuente para Metabase o Google Sheets.
