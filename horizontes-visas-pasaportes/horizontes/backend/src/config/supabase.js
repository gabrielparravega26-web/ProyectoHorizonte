const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    '[supabase] Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el .env. ' +
    'La conexión a la base de datos y storage fallará hasta configurarlas.'
  );
}

// Cliente con service role: solo se usa en el backend (nunca en el frontend),
// ya que este key ignora las políticas de Row Level Security (RLS).
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'documentos-candidatos';

module.exports = { supabaseAdmin, STORAGE_BUCKET };
