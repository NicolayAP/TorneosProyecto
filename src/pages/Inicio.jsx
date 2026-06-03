import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../db/db'
import { useAuth } from '../context/AuthContext'

export default function Inicio() {
  const [torneos, setTorneos] = useState([])
  const [partidos, setPartidos] = useState([])
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const esArbitro = usuario?.rol === 'arbitro'

  useEffect(() => {
    db.torneos.toArray().then(setTorneos)
    if (esArbitro) {
      db.partidos.filter(p => !p.jugado).toArray().then(setPartidos)
    }
  }, [esArbitro])

  // Vista árbitro: solo partidos pendientes
  if (esArbitro) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800">
          🟨 Modo árbitro — solo puedes ver y registrar partidos pendientes.
        </div>
        <h2 className="font-bold text-gray-700">Partidos pendientes</h2>
        {partidos.length === 0 ? (
          <div className="text-center text-gray-400 mt-12">
            <p className="text-5xl mb-4">🏁</p>
            <p className="text-lg">No hay partidos pendientes.</p>
          </div>
        ) : (
          partidos.map(partido => (
            <div
              key={partido.id}
              onClick={() => navigate(`/partido/${partido.id}`)}
              className="bg-white rounded-xl shadow p-4 cursor-pointer hover:shadow-md transition"
            >
              <p className="text-sm text-gray-500">Partido #{partido.id}</p>
              <p className="text-xs text-gray-400 mt-1">Toca para registrar resultado</p>
            </div>
          ))
        )}
      </div>
    )
  }

  // Vista admin: lista de torneos
  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate('/nuevo-torneo')}
        className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-lg shadow"
      >
        + Crear nuevo torneo
      </button>
      {torneos.length === 0 ? (
        <div className="text-center text-gray-400 mt-12">
          <p className="text-5xl mb-4">🏆</p>
          <p className="text-lg">No hay torneos aún.</p>
          <p className="text-sm">Crea el primero para comenzar.</p>
        </div>
      ) : (
        torneos.map(torneo => (
          <div
            key={torneo.id}
            onClick={() => navigate(`/torneo/${torneo.id}`)}
            className="bg-white rounded-xl shadow p-4 cursor-pointer hover:shadow-md transition"
          >
            <h2 className="font-bold text-lg text-gray-800">{torneo.nombre}</h2>
            <p className="text-sm text-gray-500">{torneo.deporte} · {torneo.formato}</p>
            <p className="text-xs text-gray-400 mt-1">{torneo.fecha}</p>
          </div>
        ))
      )}
    </div>
  )
}