const { z } = require('zod');

// CURP: 18 caracteres, formato oficial mexicano
const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;

// RFC: 12 (persona moral) o 13 (persona física) caracteres
const rfcRegex = /^([A-ZÑ&]{3,4})\d{6}[A-Z0-9]{3}$/;

// Teléfono: 10 dígitos (México), permite espacios/guiones que se limpian antes
const telefonoRegex = /^\d{10}$/;

const registroSchema = z.object({
  // Datos personales
  nombre: z.string().trim().min(2, 'El nombre es obligatorio'),
  apellido_paterno: z.string().trim().min(2, 'El apellido paterno es obligatorio'),
  apellido_materno: z.string().trim().optional().or(z.literal('')),
  fecha_nacimiento: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Fecha de nacimiento inválida',
  }),
  curp: z
    .string()
    .trim()
    .toUpperCase()
    .regex(curpRegex, 'CURP inválida, verifica el formato (18 caracteres)'),
  rfc: z
    .string()
    .trim()
    .toUpperCase()
    .regex(rfcRegex, 'RFC inválido')
    .optional()
    .or(z.literal('')),

  // Contacto
  correo: z.string().trim().email('Correo electrónico inválido'),
  telefono: z
    .string()
    .trim()
    .transform((val) => val.replace(/[\s-]/g, ''))
    .refine((val) => telefonoRegex.test(val), 'El teléfono debe tener 10 dígitos'),
  direccion: z.string().trim().optional().or(z.literal('')),
  ciudad: z.string().trim().optional().or(z.literal('')),
  estado: z.string().trim().optional().or(z.literal('')),

  // Experiencia / disponibilidad
  experiencia_laboral: z.string().trim().optional().or(z.literal('')),
  puesto_interes: z.string().trim().optional().or(z.literal('')),
  disponibilidad: z.enum(['inmediata', '15_dias', '30_dias', 'a_convenir'], {
    errorMap: () => ({ message: 'Selecciona una disponibilidad válida' }),
  }),
  tipo_visa: z.string().trim().optional().or(z.literal('')),

  // Consentimiento (obligatorio)
  consentimiento_privacidad: z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar el aviso de privacidad' }),
  }),
});

const loginSchema = z.object({
  correo: z.string().trim().email('Correo inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

module.exports = { registroSchema, loginSchema, curpRegex, rfcRegex, telefonoRegex };
