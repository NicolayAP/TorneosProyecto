import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../db/db'

export default function Inicio() {
  const [torneos, setTorneos] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    db.torneos.toArray().then(setTorneos)
  }, [])

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