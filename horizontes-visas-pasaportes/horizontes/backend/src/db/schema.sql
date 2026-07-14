-- Esquema inicial para Horizontes Visas y Pasaportes
-- Ejecutar en el SQL Editor de Supabase

create extension if not exists "uuid-ossp";

-- ==========================
-- Tabla: candidatos
-- ==========================
create table if not exists candidatos (
  id uuid primary key default uuid_generate_v4(),

  -- Datos personales
  nombre text not null,
  apellido_paterno text not null,
  apellido_materno text,
  fecha_nacimiento date not null,
  curp text not null unique,        -- Se almacena encriptada desde el backend
  rfc text,                         -- Se almacena encriptado desde el backend

  -- Contacto
  correo text not null,
  telefono text not null,
  direccion text,
  ciudad text,
  estado text,

  -- Experiencia laboral / disponibilidad
  experiencia_laboral text,
  puesto_interes text,
  disponibilidad text check (disponibilidad in ('inmediata', '15_dias', '30_dias', 'a_convenir')),
  tipo_visa text,                   -- Ej: turista, trabajo, residencia, etc.

  -- Estado del proceso
  estado_solicitud text not null default 'pendiente'
    check (estado_solicitud in ('pendiente', 'en_revision', 'aprobado', 'rechazado')),

  -- Consentimiento (aviso de privacidad)
  consentimiento_privacidad boolean not null default false,
  consentimiento_fecha timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_candidatos_estado on candidatos (estado_solicitud);
create index if not exists idx_candidatos_created_at on candidatos (created_at);
create index if not exists idx_candidatos_disponibilidad on candidatos (disponibilidad);

-- ==========================
-- Tabla: documentos
-- ==========================
create table if not exists documentos (
  id uuid primary key default uuid_generate_v4(),
  candidato_id uuid not null references candidatos (id) on delete cascade,
  tipo_documento text not null
    check (tipo_documento in ('ine', 'pasaporte', 'curp', 'acta', 'comprobante', 'licencia', 'cv', 'fotografia')),
  nombre_archivo text not null,
  ruta_storage text not null,       -- Ruta dentro del bucket de Supabase Storage
  mime_type text not null,
  tamano_bytes integer not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_documentos_candidato on documentos (candidato_id);

-- ==========================
-- Tabla: administradores (panel)
-- ==========================
create table if not exists administradores (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  correo text not null unique,
  password_hash text not null,
  rol text not null default 'admin' check (rol in ('admin', 'superadmin')),
  created_at timestamptz not null default now()
);

-- ==========================
-- Trigger: actualizar updated_at
-- ==========================
create or replace function actualizar_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_candidatos_updated_at on candidatos;
create trigger trg_candidatos_updated_at
before update on candidatos
for each row execute function actualizar_updated_at();

-- ==========================
-- Row Level Security
-- ==========================
alter table candidatos enable row level security;
alter table documentos enable row level security;
alter table administradores enable row level security;

-- El backend usa el service_role key (bypassea RLS), por lo que estas
-- políticas son una capa adicional de defensa si en algún momento se
-- expone la anon key para lecturas públicas controladas.
create policy "Bloquear acceso publico a candidatos" on candidatos
  for all using (false);

create policy "Bloquear acceso publico a documentos" on documentos
  for all using (false);

create policy "Bloquear acceso publico a administradores" on administradores
  for all using (false);
