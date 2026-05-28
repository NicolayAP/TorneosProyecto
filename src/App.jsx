import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Inicio from './pages/Inicio'
import NuevoTorneo from './pages/NuevoTorneo'
import DetalleTorneo from './pages/DetalleTorneo'
import Partido from './pages/Partido'
import EstadoConexion from './components/EstadoConexion'
import Jugadores from './pages/Jugadores'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-green-600 text-white p-4 shadow">
          <h1 className="text-xl font-bold text-center">⚽ TorneoApp</h1>
        </header>
        <EstadoConexion />
        <main className="max-w-lg mx-auto p-4">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/nuevo-torneo" element={<NuevoTorneo />} />
            <Route path="/torneo/:id" element={<DetalleTorneo />} />
            <Route path="/partido/:id" element={<Partido />} />
            <Route path="/equipo/:equipoId/jugadores" element={<Jugadores />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}