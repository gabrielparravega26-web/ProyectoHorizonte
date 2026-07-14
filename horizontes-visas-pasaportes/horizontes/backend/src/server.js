require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const registerRoutes = require('./routes/register');
const uploadRoutes = require('./routes/upload');
const candidateRoutes = require('./routes/candidate');
const reportsRoutes = require('./routes/reports');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 4000;

// --- Seguridad y utilidades base ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  })
);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Limitador de peticiones (protege /register y /upload de abuso)
const limitadorPublico = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: { error: 'Demasiadas solicitudes, intenta de nuevo más tarde.' },
});
app.use('/api/register', limitadorPublico);
app.use('/api/upload', limitadorPublico);

// --- Rutas ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', servicio: 'Horizontes API', fecha: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/register', registerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/reports', reportsRoutes);

// --- Manejo de rutas no encontradas ---
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// --- Manejo de errores global ---
app.use((err, req, res, next) => {
  console.error('[error]', err);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Horizontes API escuchando en el puerto ${PORT} (${process.env.NODE_ENV || 'development'})`);
});
