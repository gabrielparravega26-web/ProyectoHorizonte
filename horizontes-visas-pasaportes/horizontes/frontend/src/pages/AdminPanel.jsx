import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';

const ESTADOS = ['pendiente', 'en_revision', 'aprobado', 'rechazado'];
const DISPONIBILIDADES = ['inmediata', '15_dias', '30_dias', 'a_convenir'];

export default function AdminPanel() {
  const [candidatos, setCandidatos] = useState([]);
  const [total, setTotal] = useState(0);
  const [filtros, setFiltros] = useState({ estado: '', disponibilidad: '', tipo_visa: '', desde: '', hasta: '' });
  const [candidatoSeleccionado, setCandidatoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  async function cargarCandidatos() {
    setCargando(true);
    try {
      const params = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v));
      const { data } = await api.get('/candidate', { params });
      setCandidatos(data.candidatos);
      setTotal(data.total);
    } catch (err) {
      if (err.response?.status === 401) navigate('/admin');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarCandidatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function verDetalle(id) {
    const { data } = await api.get(`/candidate/${id}`);
    setCandidatoSeleccionado(data);
  }

  async function descargarDocumento(documentoId) {
    const { data } = await api.get(`/upload/${documentoId}/url`);
    window.open(data.url, '_blank');
  }

  async function cambiarEstado(id, estado_solicitud) {
    await api.patch(`/candidate/${id}/estado`, { estado_solicitud });
    cargarCandidatos();
    if (candidatoSeleccionado?.candidato.id === id) verDetalle(id);
  }

  function exportarCSV() {
    const params = new URLSearchParams(Object.fromEntries(Object.entries(filtros).filter(([, v]) => v)));
    const token = localStorage.getItem('horizontes_admin_token');
    // La descarga requiere el token, por lo que se hace vía fetch + blob
    fetch(`${api.defaults.baseURL}/reports/csv?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'candidatos.csv';
        a.click();
      });
  }

  function cerrarSesion() {
    localStorage.removeItem('horizontes_admin_token');
    navigate('/admin');
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-tinta-900">Candidatos</h1>
        <div className="flex gap-3">
          <button onClick={exportarCSV} className="rounded-md border border-tinta-700 px-4 py-2 text-xs uppercase tracking-widest text-tinta-700 hover:bg-tinta-900 hover:text-papel">
            Exportar CSV
          </button>
          <button onClick={cerrarSesion} className="rounded-md px-4 py-2 text-xs uppercase tracking-widest text-tinta-500 hover:text-tinta-900">
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <select className="input" value={filtros.estado} onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}>
          <option value="">Estado (todos)</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        <select
          className="input"
          value={filtros.disponibilidad}
          onChange={(e) => setFiltros({ ...filtros, disponibilidad: e.target.value })}
        >
          <option value="">Disponibilidad (todas)</option>
          {DISPONIBILIDADES.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <input
          placeholder="Tipo de visa"
          className="input"
          value={filtros.tipo_visa}
          onChange={(e) => setFiltros({ ...filtros, tipo_visa: e.target.value })}
        />
        <input type="date" className="input" value={filtros.desde} onChange={(e) => setFiltros({ ...filtros, desde: e.target.value })} />
        <input type="date" className="input" value={filtros.hasta} onChange={(e) => setFiltros({ ...filtros, hasta: e.target.value })} />
      </div>
      <button onClick={cargarCandidatos} className="mt-3 rounded-md bg-tinta-900 px-4 py-2 text-xs uppercase tracking-widest text-papel">
        Aplicar filtros
      </button>

      {/* Tabla */}
      <div className="mt-6 overflow-x-auto rounded-md border border-tinta-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-tinta-50 text-tinta-700">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Correo</th>
              <th className="px-4 py-3">Visa</th>
              <th className="px-4 py-3">Disponibilidad</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Registro</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {candidatos.map((c) => (
              <tr key={c.id} className="border-t border-tinta-100">
                <td className="px-4 py-3">{c.nombre} {c.apellido_paterno}</td>
                <td className="px-4 py-3">{c.correo}</td>
                <td className="px-4 py-3">{c.tipo_visa || '—'}</td>
                <td className="px-4 py-3">{c.disponibilidad}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-tinta-50 px-2 py-1 text-xs">{c.estado_solicitud}</span>
                </td>
                <td className="px-4 py-3">{new Date(c.created_at).toLocaleDateString('es-MX')}</td>
                <td className="px-4 py-3">
                  <button onClick={() => verDetalle(c.id)} className="text-sello-500 underline">
                    Ver
                  </button>
                </td>
              </tr>
            ))}
            {!cargando && candidatos.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-tinta-300">
                  No hay candidatos con estos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-tinta-300">{total} candidato(s) en total</p>

      {/* Modal de detalle */}
      {candidatoSeleccionado && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 px-4" onClick={() => setCandidatoSeleccionado(null)}>
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-md bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl text-tinta-900">
              {candidatoSeleccionado.candidato.nombre} {candidatoSeleccionado.candidato.apellido_paterno}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <p><b>CURP:</b> {candidatoSeleccionado.candidato.curp}</p>
              <p><b>RFC:</b> {candidatoSeleccionado.candidato.rfc || '—'}</p>
              <p><b>Correo:</b> {candidatoSeleccionado.candidato.correo}</p>
              <p><b>Teléfono:</b> {candidatoSeleccionado.candidato.telefono}</p>
              <p><b>Ciudad:</b> {candidatoSeleccionado.candidato.ciudad || '—'}</p>
              <p><b>Disponibilidad:</b> {candidatoSeleccionado.candidato.disponibilidad}</p>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-tinta-700">Estado de la solicitud</label>
              <select
                className="input mt-1"
                value={candidatoSeleccionado.candidato.estado_solicitud}
                onChange={(e) => cambiarEstado(candidatoSeleccionado.candidato.id, e.target.value)}
              >
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>

            <h3 className="mt-6 font-display text-lg text-tinta-700">Documentos</h3>
            <ul className="mt-2 space-y-2">
              {candidatoSeleccionado.documentos.map((doc) => (
                <li key={doc.id} className="flex items-center justify-between rounded-md border border-tinta-100 px-3 py-2 text-sm">
                  <span>{doc.tipo_documento} — {doc.nombre_archivo}</span>
                  <button onClick={() => descargarDocumento(doc.id)} className="text-sello-500 underline">
                    Descargar
                  </button>
                </li>
              ))}
              {candidatoSeleccionado.documentos.length === 0 && (
                <p className="text-sm text-tinta-300">Sin documentos adjuntos.</p>
              )}
            </ul>

            <button onClick={() => setCandidatoSeleccionado(null)} className="mt-6 text-xs uppercase tracking-widest text-tinta-500">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
