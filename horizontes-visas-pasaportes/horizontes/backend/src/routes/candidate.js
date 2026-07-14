const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const {
  listarCandidatos,
  obtenerCandidato,
  actualizarEstadoCandidato,
} = require('../controllers/candidateController');

// Todas las rutas de candidatos (panel admin) requieren autenticación
router.use(verificarToken);

// GET /api/candidate?estado=&tipo_visa=&disponibilidad=&desde=&hasta=&pagina=&limite=
router.get('/', listarCandidatos);

// GET /api/candidate/:id
router.get('/:id', obtenerCandidato);

// PATCH /api/candidate/:id/estado
router.patch('/:id/estado', actualizarEstadoCandidato);

module.exports = router;
