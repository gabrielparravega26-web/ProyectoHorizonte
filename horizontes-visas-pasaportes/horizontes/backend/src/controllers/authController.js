const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { supabaseAdmin } = require('../config/supabase');
const { loginSchema } = require('../utils/validators');
require('dotenv').config();

async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }
  const { correo, password } = parsed.data;

  const { data: admin, error } = await supabaseAdmin
    .from('administradores')
    .select('*')
    .eq('correo', correo)
    .single();

  if (error || !admin) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const passwordValido = await bcrypt.compare(password, admin.password_hash);
  if (!passwordValido) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = jwt.sign(
    { id: admin.id, correo: admin.correo, rol: admin.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  return res.json({
    token,
    admin: { id: admin.id, nombre: admin.nombre, correo: admin.correo, rol: admin.rol },
  });
}

// Endpoint de utilidad para verificar sesión desde el frontend
async function perfil(req, res) {
  return res.json({ admin: req.admin });
}

module.exports = { login, perfil };
