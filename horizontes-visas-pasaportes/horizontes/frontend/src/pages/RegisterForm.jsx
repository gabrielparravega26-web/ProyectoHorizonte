import { useState } from 'react';
import api from '../api/client.js';

const CURP_REGEX = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;
const RFC_REGEX = /^([A-ZÑ&]{3,4})\d{6}[A-Z0-9]{3}$/;
const TELEFONO_REGEX = /^\d{10}$/;
const MIME_PERMITIDOS = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_MB = 5;

const DOCUMENTOS_REQUERIDOS = [
  { clave: 'ine', etiqueta: 'INE' },
  { clave: 'pasaporte', etiqueta: 'Pasaporte' },
  { clave: 'curp', etiqueta: 'CURP (documento)' },
  { clave: 'acta', etiqueta: 'Acta de nacimiento' },
  { clave: 'comprobante', etiqueta: 'Comprobante de domicilio' },
  { clave: 'licencia', etiqueta: 'Licencia de conducir' },
  { clave: 'cv', etiqueta: 'Curriculum Vitae' },
  { clave: 'fotografia', etiqueta: 'Fotografía' },
];

const estadoInicial = {
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  fecha_nacimiento: '',
  curp: '',
  rfc: '',
  correo: '',
  telefono: '',
  direccion: '',
  ciudad: '',
  estado: '',
  experiencia_laboral: '',
  puesto_interes: '',
  disponibilidad: '',
  tipo_visa: '',
  consentimiento_privacidad: false,
};

export default function RegisterForm() {
  const [datos, setDatos] = useState(estadoInicial);
  const [archivos, setArchivos] = useState({});
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null); // 'exito' | 'error' | null
  const [mensajeError, setMensajeError] = useState('');

  function actualizarCampo(campo, valor) {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => ({ ...prev, [campo]: undefined }));
  }

  function manejarArchivo(clave, file) {
    if (!file) return;
    if (!MIME_PERMITIDOS.includes(file.type)) {
      setErrores((prev) => ({ ...prev, [clave]: 'Solo se aceptan JPG, PNG o PDF' }));
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setErrores((prev) => ({ ...prev, [clave]: `El archivo supera los ${MAX_MB} MB` }));
      return;
    }
    setArchivos((prev) => ({ ...prev, [clave]: file }));
    setErrores((prev) => ({ ...prev, [clave]: undefined }));
  }

  function validar() {
    const nuevosErrores = {};
    if (!datos.nombre.trim()) nuevosErrores.nombre = 'Campo obligatorio';
    if (!datos.apellido_paterno.trim()) nuevosErrores.apellido_paterno = 'Campo obligatorio';
    if (!datos.fecha_nacimiento) nuevosErrores.fecha_nacimiento = 'Campo obligatorio';
    if (!CURP_REGEX.test(datos.curp.toUpperCase())) nuevosErrores.curp = 'CURP inválida (18 caracteres)';
    if (datos.rfc && !RFC_REGEX.test(datos.rfc.toUpperCase())) nuevosErrores.rfc = 'RFC inválido';
    if (!/^\S+@\S+\.\S+$/.test(datos.correo)) nuevosErrores.correo = 'Correo inválido';
    if (!TELEFONO_REGEX.test(datos.telefono.replace(/[\s-]/g, ''))) nuevosErrores.telefono = 'Debe tener 10 dígitos';
    if (!datos.disponibilidad) nuevosErrores.disponibilidad = 'Selecciona una opción';
    if (!datos.consentimiento_privacidad) nuevosErrores.consentimiento_privacidad = 'Debes aceptar el aviso de privacidad';

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  async function manejarEnvio(e) {
    e.preventDefault();
    if (!validar()) return;

    setEnviando(true);
    setResultado(null);
    setMensajeError('');

    try {
      const payload = {
        ...datos,
        curp: datos.curp.toUpperCase(),
        rfc: datos.rfc ? datos.rfc.toUpperCase() : '',
        telefono: datos.telefono.replace(/[\s-]/g, ''),
      };

      const { data } = await api.post('/register', payload);
      const candidatoId = data.candidato_id;

      // Subir cada documento adjunto de forma secuencial
      const entradas = Object.entries(archivos);
      for (const [tipoDocumento, archivo] of entradas) {
        const formData = new FormData();
        formData.append('archivo', archivo);
        formData.append('candidato_id', candidatoId);
        formData.append('tipo_documento', tipoDocumento);
        await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setResultado('exito');
      setDatos(estadoInicial);
      setArchivos({});
    } catch (err) {
      setResultado('error');
      setMensajeError(err.response?.data?.error || 'Ocurrió un error al enviar tu registro. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  if (resultado === 'exito') {
    return (
      <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-sello-500 text-sello-500">
          <span className="font-display text-4xl">✓</span>
        </div>
        <h1 className="mt-8 font-display text-3xl text-tinta-900">Registro recibido</h1>
        <p className="mt-3 text-tinta-500">
          Tu solicitud fue registrada exitosamente. Nuestro equipo revisará tu información y documentos, y te
          contactaremos a través del correo o teléfono proporcionado.
        </p>
        <button
          onClick={() => setResultado(null)}
          className="mt-8 rounded-md border border-tinta-700 px-5 py-2 font-mono text-xs uppercase tracking-widest text-tinta-700 hover:bg-tinta-900 hover:text-papel"
        >
          Registrar otra solicitud
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="font-display text-3xl text-tinta-900">Registro de candidatos</h1>
      <p className="mt-2 text-tinta-500">
        Completa tus datos, adjunta tus documentos y da seguimiento a tu proceso de visa y pasaporte.
      </p>

      <form onSubmit={manejarEnvio} className="mt-10 space-y-10">
        {/* Datos personales */}
        <Seccion titulo="Datos personales">
          <Campo label="Nombre(s) *" error={errores.nombre}>
            <input className="input" value={datos.nombre} onChange={(e) => actualizarCampo('nombre', e.target.value)} />
          </Campo>
          <Campo label="Apellido paterno *" error={errores.apellido_paterno}>
            <input
              className="input"
              value={datos.apellido_paterno}
              onChange={(e) => actualizarCampo('apellido_paterno', e.target.value)}
            />
          </Campo>
          <Campo label="Apellido materno" error={errores.apellido_materno}>
            <input
              className="input"
              value={datos.apellido_materno}
              onChange={(e) => actualizarCampo('apellido_materno', e.target.value)}
            />
          </Campo>
          <Campo label="Fecha de nacimiento *" error={errores.fecha_nacimiento}>
            <input
              type="date"
              className="input"
              value={datos.fecha_nacimiento}
              onChange={(e) => actualizarCampo('fecha_nacimiento', e.target.value)}
            />
          </Campo>
          <Campo label="CURP *" error={errores.curp} ayuda="18 caracteres">
            <input
              className="input uppercase"
              maxLength={18}
              value={datos.curp}
              onChange={(e) => actualizarCampo('curp', e.target.value)}
            />
          </Campo>
          <Campo label="RFC" error={errores.rfc} ayuda="Opcional">
            <input
              className="input uppercase"
              maxLength={13}
              value={datos.rfc}
              onChange={(e) => actualizarCampo('rfc', e.target.value)}
            />
          </Campo>
        </Seccion>

        {/* Contacto */}
        <Seccion titulo="Contacto">
          <Campo label="Correo electrónico *" error={errores.correo}>
            <input
              type="email"
              className="input"
              value={datos.correo}
              onChange={(e) => actualizarCampo('correo', e.target.value)}
            />
          </Campo>
          <Campo label="Teléfono (10 dígitos) *" error={errores.telefono}>
            <input className="input" value={datos.telefono} onChange={(e) => actualizarCampo('telefono', e.target.value)} />
          </Campo>
          <Campo label="Dirección">
            <input className="input" value={datos.direccion} onChange={(e) => actualizarCampo('direccion', e.target.value)} />
          </Campo>
          <Campo label="Ciudad">
            <input className="input" value={datos.ciudad} onChange={(e) => actualizarCampo('ciudad', e.target.value)} />
          </Campo>
          <Campo label="Estado">
            <input className="input" value={datos.estado} onChange={(e) => actualizarCampo('estado', e.target.value)} />
          </Campo>
        </Seccion>

        {/* Experiencia y disponibilidad */}
        <Seccion titulo="Experiencia laboral y disponibilidad">
          <Campo label="Experiencia laboral" full>
            <textarea
              className="input h-24"
              value={datos.experiencia_laboral}
              onChange={(e) => actualizarCampo('experiencia_laboral', e.target.value)}
            />
          </Campo>
          <Campo label="Puesto de interés">
            <input
              className="input"
              value={datos.puesto_interes}
              onChange={(e) => actualizarCampo('puesto_interes', e.target.value)}
            />
          </Campo>
          <Campo label="Tipo de visa de interés">
            <input className="input" value={datos.tipo_visa} onChange={(e) => actualizarCampo('tipo_visa', e.target.value)} />
          </Campo>
          <Campo label="Disponibilidad *" error={errores.disponibilidad}>
            <select
              className="input"
              value={datos.disponibilidad}
              onChange={(e) => actualizarCampo('disponibilidad', e.target.value)}
            >
              <option value="">Selecciona una opción</option>
              <option value="inmediata">Inmediata</option>
              <option value="15_dias">15 días</option>
              <option value="30_dias">30 días</option>
              <option value="a_convenir">A convenir</option>
            </select>
          </Campo>
        </Seccion>

        {/* Documentos */}
        <Seccion titulo="Documentos (JPG, PNG o PDF · máx. 5 MB)">
          {DOCUMENTOS_REQUERIDOS.map(({ clave, etiqueta }) => (
            <Campo key={clave} label={etiqueta} error={errores[clave]}>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="input file:mr-3 file:rounded file:border-0 file:bg-tinta-700 file:px-3 file:py-1.5 file:text-papel"
                onChange={(e) => manejarArchivo(clave, e.target.files?.[0])}
              />
              {archivos[clave] && <p className="mt-1 text-xs text-tinta-500">{archivos[clave].name}</p>}
            </Campo>
          ))}
        </Seccion>

        {/* Consentimiento */}
        <div className="borde-perforado pt-6">
          <label className="flex items-start gap-3 text-sm text-tinta-700">
            <input
              type="checkbox"
              className="mt-1"
              checked={datos.consentimiento_privacidad}
              onChange={(e) => actualizarCampo('consentimiento_privacidad', e.target.checked)}
            />
            <span>
              He leído y acepto el{' '}
              <a href="/aviso-privacidad" className="underline decoration-sello-500 underline-offset-2" target="_blank">
                aviso de privacidad
              </a>{' '}
              y autorizo el tratamiento de mis datos personales para fines del proceso de reclutamiento y trámite migratorio.
            </span>
          </label>
          {errores.consentimiento_privacidad && (
            <p className="mt-1 text-xs text-red-600">{errores.consentimiento_privacidad}</p>
          )}
        </div>

        {resultado === 'error' && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{mensajeError}</p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-md bg-tinta-900 py-3 font-mono text-sm uppercase tracking-widest text-papel hover:bg-tinta-700 disabled:opacity-60"
        >
          {enviando ? 'Enviando…' : 'Enviar registro'}
        </button>
      </form>
    </main>
  );
}

function Seccion({ titulo, children }) {
  return (
    <section>
      <h2 className="font-display text-lg text-tinta-700">{titulo}</h2>
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Campo({ label, error, ayuda, full, children }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="mb-1 block text-sm font-medium text-tinta-700">{label}</label>
      {children}
      {ayuda && !error && <p className="mt-1 text-xs text-tinta-300">{ayuda}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
