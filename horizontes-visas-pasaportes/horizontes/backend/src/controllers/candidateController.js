const { supabaseAdmin } = require('../config/supabase');
const { desencriptar } = require('../utils/encryption');

/**
 * Listado de candidatos con filtros: fecha, estado, tipo de visa, disponibilidad.
 * Query params: desde, hasta, estado, tipo_visa, disponibilidad, pagina, limite
 */
async function listarCandidatos(req, res) {
  const {
    desde,
    hasta,
    estado,
    tipo_visa,
    disponibilidad,
    pagina = 1,
    limite = 20,
  } = req.query;

  let query = supabaseAdmin
    .from('candidatos')
    .select(
      'id, nombre, apellido_paterno, apellido_materno, correo, telefono, tipo_visa, disponibilidad, estado_solicitud, created_at',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false });

  if (desde) query = query.gte('created_at', desde);
  if (hasta) query = query.lte('created_at', hasta);
  if (estado) query = query.eq('estado_solicitud', estado);
  if (tipo_visa) query = query.eq('tipo_visa', tipo_visa);
  if (disponibilidad) query = query.eq('disponibilidad', disponibilidad);

  const inicio = (Number(pagina) - 1) * Number(limite);
  const fin = inicio + Number(limite) - 1;
  query = query.range(inicio, fin);

  const { data, error, count } = await query;

  if (error) {
    console.error('[listarCandidatos] Error:', error.message);
    return res.status(500).json({ error: 'No se pudo obtener el listado de candidatos' });
  }

  return res.json({
    candidatos: data,
    total: count,
    pagina: Number(pagina),
    limite: Number(limite),
  });
}

/**
 * Detalle de un candidato, incluyendo sus documentos asociados.
 * Los campos sensibles (CURP, RFC) se desencriptan solo aquí, para el panel admin.
 */
async function obtenerCandidato(req, res) {
  const { id } = req.params;

  const { data: candidato, error } = await supabaseAdmin
    .from('candidatos')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !candidato) {
    return res.status(404).json({ error: 'Candidato no encontrado' });
  }

  const { data: documentos } = await supabaseAdmin
    .from('documentos')
    .select('id, tipo_documento, nombre_archivo, mime_type, tamano_bytes, created_at')
    .eq('candidato_id', id);

  return res.json({
    candidato: {
      ...candidato,
      curp: desencriptar(candidato.curp),
      rfc: desencriptar(candidato.rfc),
    },
    documentos: documentos || [],
  });
}

/**
 * Actualiza el estado de una solicitud (pendiente, en_revision, aprobado, rechazado).
 */
async function actualizarEstadoCandidato(req, res) {
  const { id } = req.params;
  const { estado_solicitud } = req.body;

  const estadosValidos = ['pendiente', 'en_revision', 'aprobado', 'rechazado'];
  if (!estadosValidos.includes(estado_solicitud)) {
    return res.status(400).json({ error: `Estado inválido. Usa: ${estadosValidos.join(', ')}` });
  }

  const { error } = await supabaseAdmin
    .from('candidatos')
    .update({ estado_solicitud })
    .eq('id', id);

  if (error) {
    return res.status(500).json({ error: 'No se pudo actualizar el estado' });
  }

  return res.json({ mensaje: 'Estado actualizado correctamente' });
}

module.exports = { listarCandidatos, obtenerCandidato, actualizarEstadoCandidato };
