import { Navigate } from 'react-router-dom';

export default function RutaProtegida({ children }) {
  const token = localStorage.getItem('horizontes_admin_token');
  if (!token) {
    return <Navigate to="/admin" replace />;
  }
  return children;
}
