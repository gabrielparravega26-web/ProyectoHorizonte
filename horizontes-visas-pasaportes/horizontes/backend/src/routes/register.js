const express = require('express');
const router = express.Router();
const { registrarCandidato } = require('../controllers/registerController');

// POST /api/register
router.post('/', registrarCandidato);

module.exports = router;
