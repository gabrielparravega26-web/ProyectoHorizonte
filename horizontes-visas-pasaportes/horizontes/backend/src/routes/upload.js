const express = require('express');
const router = express.Router();
const { upload, manejarErroresUpload } = require('../middleware/upload');
const { subirDocumento, obtenerUrlFirmada } = require('../controllers/uploadController');
const { verificarToken } = require('../middleware/auth');

// POST /api/upload (público, usado desde el formulario de registro)
router.post('/', upload.single('archivo'), manejarErroresUpload, subirDocumento);

// GET /api/upload/:documentoId/url (protegido, usado desde el panel admin)
router.get('/:documentoId/url', verificarToken, obtenerUrlFirmada);

module.exports = router;
