const crypto = require('crypto');
require('dotenv').config();

const ALGORITHM = 'aes-256-cbc';
const KEY = Buffer.from((process.env.ENCRYPTION_KEY || '').padEnd(32, '0').slice(0, 32));

/**
 * Encripta un texto plano (usado para CURP, RFC antes de guardarlos en DB).
 * Devuelve "iv:contenidoEncriptado" en hex.
 */
function encriptar(texto) {
  if (!texto) return texto;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encriptado = cipher.update(texto, 'utf8', 'hex');
  encriptado += cipher.final('hex');
  return `${iv.toString('hex')}:${encriptado}`;
}

/**
 * Desencripta un texto generado por encriptar().
 */
function desencriptar(textoEncriptado) {
  if (!textoEncriptado || !textoEncriptado.includes(':')) return textoEncriptado;
  const [ivHex, contenido] = textoEncriptado.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  let decriptado = decipher.update(contenido, 'hex', 'utf8');
  decriptado += decipher.final('utf8');
  return decriptado;
}

module.exports = { encriptar, desencriptar };
