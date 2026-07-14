# Reportes: Google Sheets y Metabase

## Opción A — Google Sheets API (reportes básicos)

Recomendada para la Semana 4 del roadmap, con menor esfuerzo de configuración.

1. Crea un proyecto en [Google Cloud Console](https://console.cloud.google.com) y
   habilita la **Google Sheets API**.
2. Crea una cuenta de servicio y descarga su JSON de credenciales.
3. Comparte tu hoja de cálculo de destino con el correo de la cuenta de servicio
   (`...@...iam.gserviceaccount.com`) con permiso de editor.
4. Guarda en el `.env` del backend:
   - `GOOGLE_SHEETS_CLIENT_EMAIL`
   - `GOOGLE_SHEETS_PRIVATE_KEY`
   - `GOOGLE_SHEETS_SPREADSHEET_ID`
5. Instala la librería oficial en el backend: `npm install googleapis`.
6. Crea un endpoint (o un job programado) que llame a `GET /api/reports/resumen`
   o consulte directamente Supabase, y escriba las filas en la hoja usando
   `spreadsheets.values.update`.

Este proyecto ya incluye `GET /api/reports/csv` y `GET /api/reports/resumen`
como fuente de datos lista para alimentar ese script de sincronización.

## Opción B — Metabase (dashboards)

Recomendada si se necesitan dashboards interactivos y filtros visuales para el
equipo interno.

1. Despliega Metabase (existe un plan gratuito self-hosted, por ejemplo en
   Railway/Render usando su imagen Docker oficial `metabase/metabase`).
2. Conéctalo directamente a la base de datos de Supabase (Postgres) usando las
   credenciales de conexión que Supabase expone en **Project Settings > Database**.
3. Crea preguntas/dashboards sobre las tablas `candidatos` y `documentos`
   directamente desde la interfaz de Metabase, sin necesidad de tocar el backend.

## Recomendación

Empezar con la Opción A (CSV/Sheets) para reportes rápidos y de bajo costo de
mantenimiento durante las primeras semanas, e incorporar Metabase cuando el
volumen de candidatos justifique dashboards más ricos.
