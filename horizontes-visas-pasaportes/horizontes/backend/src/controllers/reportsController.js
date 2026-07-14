const { supabaseAdmin } = require('../config/supabase');

/**
 * Exporta candidatos en formato CSV (usado por el panel admin para descarga
 * directa, y como base para la integración con Google Sheets / Excel).
 */
async function exportarCSV(req, res) {
  const { estado, tipo_visa, disponibilidad } = req.query;

  let query = supabaseAdmin
    .from('candidatos')
    .select(
      'nombre, apellido_paterno, apellido_materno, correo, telefono, ciudad, estado, tipo_visa, disponibilidad, estado_solicitud, created_at'
    )
    .order('created_at', { ascending: false });

  if (estado) query = query.eq('estado_solicitud', estado);
  if (tipo_visa) query = query.eq('tipo_visa', tipo_visa);
  if (disponibilidad) query = query.eq('disponibilidad', disponibilidad);

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: 'No se pudo generar el reporte' });
  }

  const encabezados = [
    'Nombre',
    'Apellido Paterno',
    'Apellido Materno',
    'Correo',
    'Teléfono',
    'Ciudad',
    'Estado',
    'Tipo de Visa',
    'Disponibilidad',
    'Estado de Solicitud',
    'Fecha de Registro',
  ];

  const filas = data.map((c) =>
    [
      c.nombre,
      c.apellido_paterno,
      c.apellido_materno || '',
      c.correo,
      c.telefono,
      c.ciudad || '',
      c.estado || '',
      c.tipo_visa || '',
      c.disponibilidad,
      c.estado_solicitud,
      new Date(c.created_at).toLocaleDateString('es-MX'),
    ]
      .map((valor) => `"${String(valor).replace(/"/g, '""')}"`)
      .join(',')
  );

  const csv = [encabezados.join(','), ...filas].join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="candidatos.csv"');
  return res.send(csv);
}

/**
 * Resumen numérico para dashboards (base para Metabase / Google Sheets).
 */
async function resumen(req, res) {
  const { data, error } = await supabaseAdmin
    .from('candidatos')
    .select('estado_solicitud, disponibilidad, tipo_visa');

  if (error) {
    return res.status(500).json({ error: 'No se pudo generar el resumen' });
  }

  const contarPor = (campo) =>
    data.reduce((acc, item) => {
      const clave = item[campo] || 'sin_dato';
      acc[clave] = (acc[clave] || 0) + 1;
      return acc;
    }, {});

  return res.json({
    total_candidatos: data.length,
    por_estado_solicitud: contarPor('estado_solicitud'),
    por_disponibilidad: contarPor('disponibilidad'),
    por_tipo_visa: contarPor('tipo_visa'),
  });
}

module.exports = { exportarCSV, resumen };
