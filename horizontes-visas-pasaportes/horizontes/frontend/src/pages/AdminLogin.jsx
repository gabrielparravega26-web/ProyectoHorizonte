import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';

export default function AdminLogin() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  async function manejarEnvio(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const { data } = await api.post('/auth/login', { correo, password });
      localStorage.setItem('horizontes_admin_token', data.token);
      navigate('/admin/panel');
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo iniciar sesión');
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-md flex-col px-6 py-24">
      <h1 className="font-display text-2xl text-tinta-900">Panel administrativo</h1>
      <p className="mt-2 text-sm text-tinta-500">Inicia sesión para gestionar candidatos y reportes.</p>

      <form onSubmit={manejarEnvio} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-tinta-700">Correo</label>
          <input type="email" className="input" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-tinta-700">Contraseña</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={cargando}
          className="w-full rounded-md bg-tinta-900 py-2.5 font-mono text-sm uppercase tracking-widest text-papel hover:bg-tinta-700 disabled:opacity-60"
        >
          {cargando ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </main>
  );
}
