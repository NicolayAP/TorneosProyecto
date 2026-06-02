import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import RutaProtegida from './components/RutaProtegida'
import Inicio from './pages/Inicio'
import Login from './pages/Login'
import NuevoTorneo from './pages/NuevoTorneo'
import DetalleTorneo from './pages/DetalleTorneo'
import Partido from './pages/Partido'
import EstadoConexion from './components/EstadoConexion'
import Jugadores from './pages/Jugadores'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-green-600 text-white p-4 shadow">
            <h1 className="text-xl font-bold text-center">⚽ TorneoApp</h1>
          </header>
          <EstadoConexion />
          <main className="max-w-lg mx-auto p-4">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Inicio />} />
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