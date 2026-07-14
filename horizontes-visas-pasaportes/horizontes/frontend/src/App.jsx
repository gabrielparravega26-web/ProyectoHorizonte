import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import RegisterForm from './pages/RegisterForm.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import RutaProtegida from './components/RutaProtegida.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <header className="border-b border-tinta-100 bg-tinta-900 text-papel">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-display text-xl tracking-wide">
            Horizontes <span className="text-sello-400">Visas y Pasaportes</span>
          </Link>
          <Link to="/admin" className="font-mono text-xs uppercase tracking-widest text-tinta-300 hover:text-papel">
            Panel administrativo
          </Link>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<RegisterForm />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/panel/*"
          element={
            <RutaProtegida>
              <AdminPanel />
            </RutaProtegida>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
