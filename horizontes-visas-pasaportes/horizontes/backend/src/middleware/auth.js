const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Verifica el JWT enviado en el header Authorization: Bearer <token>.
 * Se usa para proteger todas las rutas del panel administrativo.
 */
function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = payload; // { id, correo, rol }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

/**
 * Restringe una ruta a un rol específico (ej. 'superadmin').
 */
function requiereRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.admin || !rolesPermitidos.includes(req.admin.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' });
    }
    next();
  };
}

module.exports = { verificarToken, requiereRol };
