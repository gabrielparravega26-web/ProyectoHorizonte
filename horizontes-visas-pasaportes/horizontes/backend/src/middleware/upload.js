const multer = require('multer');
require('dotenv').config();

const MAX_FILE_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB || 5);
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const MIME_PERMITIDOS = ['image/jpeg', 'image/png', 'application/pdf'];

const TIPOS_DOCUMENTO_VALIDOS = [
  'ine',
  'pasaporte',
  'curp',
  'acta',
  'comprobante',
  'licencia',
  'cv',
  'fotografia',
];

// Se guarda en memoria y luego se sube a Supabase Storage (no se persiste en disco local)
const storage = multer.memoryStorage();

function filtroArchivo(req, file, cb) {
  if (!MIME_PERMITIDOS.includes(file.mimetype)) {
    return cb(new Error('Formato no permitido. Solo se aceptan JPG, PNG o PDF.'));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: filtroArchivo,
});

// Middleware para capturar errores de Multer con mensajes claros
function manejarErroresUpload(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: `El archivo excede el tamaño máximo permitido (${MAX_FILE_SIZE_MB} MB).`,
      });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
}

module.exports = { upload, manejarErroresUpload, TIPOS_DOCUMENTO_VALIDOS, MIME_PERMITIDOS };
