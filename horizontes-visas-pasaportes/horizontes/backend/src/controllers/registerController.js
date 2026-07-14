const { supabaseAdmin } = require('../config/supabase');
const { registroSchema } = require('../utils/validators');
const { encriptar } = require('../utils/encryption');

async function registrarCandidato(req, res) {
  const parsed = registroSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Datos inválidos',
      detalles: parsed.error.errors.map((e) => ({ campo: e.path.join('.'), mensaje: e.message })),
    });
  }

  const datos = parsed.data;

  // Verificar duplicado por CURP (se compara en texto plano antes de encriptar)
  const { data: existente } = await supabaseAdmin
    .from('candidatos')
    .select('id')
    .eq('curp', datos.curp)
    .maybeSingle();

  if (existente) {
    return res.status(409).json({ error: 'Ya existe un registro con esta CURP' });
  }

  const registro = {
    nombre: datos.nombre,
    apellido_paterno: datos.apellido_paterno,
    apellido_materno: datos.apellido_materno || null,
    fecha_nacimiento: datos.fecha_nacimiento,
    curp: encriptar(datos.curp),
    rfc: datos.rfc ? encriptar(datos.rfc) : null,
    correo: datos.correo,
    telefono: datos.telefono,
    direccion: datos.direccion || null,
    ciudad: datos.ciudad || null,
    estado: datos.estado || null,
    experiencia_laboral: datos.experiencia_laboral || null,
    puesto_interes: datos.puesto_interes || null,
    disponibilidad: datos.disponibilidad,
    tipo_visa: datos.tipo_visa || null,
    consentimiento_privacidad: true,
    consentimiento_fecha: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from('candidatos')
    .insert(registro)
    .select('id')
    .single();

  if (error) {
    console.error('[registrarCandidato] Error Supabase:', error.message);
    return res.status(500).json({ error: 'No se pudo guardar el registro, intenta de nuevo' });
  }

  return res.status(201).json({
    mensaje: 'Registro guardado exitosamente',
    candidato_id: data.id,
  });
}

module.exports = { registrarCandidato };
