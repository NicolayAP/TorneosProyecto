import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RutaProtegida({ children, soloAdmin = false }) {
  const { usuario, cargando } = useAuth()
  const location = useLocation()

  if (cargando) return null

  if (!usuario) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (soloAdmin && usuario.rol !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}