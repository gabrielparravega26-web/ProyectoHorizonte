const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin, STORAGE_BUCKET } = require('../config/supabase');
const { TIPOS_DOCUMENTO_VALIDOS } = require('../middleware/upload');

async function subirDocumento(req, res) {
  const { candidato_id, tipo_documento } = req.body;
  const archivo = req.file;

  if (!archivo) {
    return res.status(400).json({ error: 'No se recibió ningún archivo' });
  }
  if (!candidato_id) {
    return res.status(400).json({ error: 'Falta el candidato_id' });
  }
  if (!TIPOS_DOCUMENTO_VALIDOS.includes(tipo_documento)) {
    return res.status(400).json({
      error: `tipo_documento inválido. Valores permitidos: ${TIPOS_DOCUMENTO_VALIDOS.join(', ')}`,
    });
  }

  // Verificar que el candidato exista
  const { data: candidato, error: errCandidato } = await supabaseAdmin
    .from('candidatos')
    .select('id')
    .eq('id', candidato_id)
    .maybeSingle();

  if (errCandidato || !candidato) {
    return res.status(404).json({ error: 'Candidato no encontrado' });
  }

  const extension = archivo.originalname.split('.').pop();
  const nombreArchivo = `${tipo_documento}-${uuidv4()}.${extension}`;
  const rutaStorage = `${candidato_id}/${nombreArchivo}`;

  const { error: errorUpload } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(rutaStorage, archivo.buffer, {
      contentType: archivo.mimetype,
      upsert: false,
    });

  if (errorUpload) {
    console.error('[subirDocumento] Error Storage:', errorUpload.message);
    return res.status(500).json({ error: 'No se pudo subir el documento' });
  }

  const { data: registroDoc, error: errorDB } = await supabaseAdmin
    .from('documentos')
    .insert({
      candidato_id,
      tipo_documento,
      nombre_archivo: archivo.originalname,
      ruta_storage: rutaStorage,
      mime_type: archivo.mimetype,
      tamano_bytes: archivo.size,
    })
    .select('id')
    .single();

  if (errorDB) {
    console.error('[subirDocumento] Error DB:', errorDB.message);
    return res.status(500).json({ error: 'Documento subido pero no se pudo registrar en la base de datos' });
  }

  return res.status(201).json({
    mensaje: 'Documento subido exitosamente',
    documento_id: registroDoc.id,
    ruta_storage: rutaStorage,
  });
}

/**
 * Genera una URL firmada (temporal) para descargar un documento de forma segura.
 */
async function obtenerUrlFirmada(req, res) {
  const { documentoId } = req.params;

  const { data: documento, error } = await supabaseAdmin
    .from('documentos')
    .select('ruta_storage')
    .eq('id', documentoId)
    .maybeSingle();

  if (error || !documento) {
    return res.status(404).json({ error: 'Documento no encontrado' });
  }

  const { data: urlFirmada, error: errorUrl } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(documento.ruta_storage, 60 * 5); // 5 minutos

  if (errorUrl) {
    return res.status(500).json({ error: 'No se pudo generar la URL de descarga' });
  }

  return res.json({ url: urlFirmada.signedUrl, expira_en_segundos: 300 });
}

module.exports = { subirDocumento, obtenerUrlFirmada };
