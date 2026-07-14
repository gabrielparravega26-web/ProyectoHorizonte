/**
 * Script de un solo uso para crear el primer administrador del panel.
 * Uso: node src/db/seedAdmin.js "Nombre Admin" "correo@dominio.com" "contraseña"
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { supabaseAdmin } = require('../config/supabase');

async function main() {
  const [, , nombre, correo, password] = process.argv;

  if (!nombre || !correo || !password) {
    console.error('Uso: node src/db/seedAdmin.js "Nombre Admin" "correo@dominio.com" "contraseña"');
    process.exit(1);
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabaseAdmin
    .from('administradores')
    .insert({ nombre, correo, password_hash, rol: 'superadmin' })
    .select('id, nombre, correo')
    .single();

  if (error) {
    console.error('Error al crear administrador:', error.message);
    process.exit(1);
  }

  console.log('Administrador creado exitosamente:', data);
  process.exit(0);
}

main();
