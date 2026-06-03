import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import RutaProtegida from './components/RutaProtegida'
import Inicio from './pages/Inicio'
import Login from './pages/Login'
import NuevoTorneo from './pages/NuevoTorneo'
import DetalleTorneo from './pages/DetalleTorneo'
import Partido from './pages/Partido'
import EstadoConexion from './components/EstadoConexion'
import Jugadores from './pages/Jugadores'

function Header() {
  const { usuario, logout } = useAuth()
  return (
    <header className="bg-green-600 text-white p-4 shadow">
      <div className="max-w-lg mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">⚽ TorneoApp</h1>
        {usuario && (
          <div className="flex items-center gap-3">
            <span className="text-sm opacity-80">
              {usuario.rol === 'admin' ? '🛡️ Admin' : '🟨 Árbitro'}
            </span>
            <button
              onClick={logout}
              className="bg-white text-green-700 text-xs font-semibold px-3 py-1 rounded-full"
            >
              Salir
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <EstadoConexion />
          <main className="max-w-lg mx-auto p-4">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<RutaProtegida><Inicio /></RutaProtegida>} />
              <Route path="/nuevo-torneo" element={
                <RutaProtegida soloAdmin><NuevoTorneo /></RutaProtegida>
              } />
              <Route path="/torneo/:id" element={
                <RutaProtegida><DetalleTorneo /></RutaProtegida>
              } />
              <Route path="/partido/:id" element={
                <RutaProtegida><Partido /></RutaProtegida>
              } />
              <Route path="/equipo/:equipoId/jugadores" element={
                <RutaProtegida><Jugadores /></RutaProtegida>
              } />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}