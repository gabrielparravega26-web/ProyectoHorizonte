const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const { exportarCSV, resumen } = require('../controllers/reportsController');

router.use(verificarToken);

// GET /api/reports/csv
router.get('/csv', exportarCSV);

// GET /api/reports/resumen
router.get('/resumen', resumen);

module.exports = router;
