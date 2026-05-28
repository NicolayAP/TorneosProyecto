import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../db/db'

export default function Partido() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [partido, setPartido] = useState(null)
  const [equipoLocal, setEquipoLocal] = useState(null)
  const [equipoVisita, setEquipoVisita] = useState(null)
  const [golesLocal, setGolesLocal] = useState(0)
  const [golesVisita, setGolesVisita] = useState(0)

  useEffect(() => {
    const partidoId = parseInt(id)
    db.partidos.get(partidoId).then(async p => {
      setPartido(p)
      setGolesLocal(p.golesLocal ?? 0)
      setGolesVisita(p.golesVisita ?? 0)
      const local = await db.equipos.get(p.equipoLocalId)
      const visita = await db.equipos.get(p.equipoVisitaId)
      setEquipoLocal(local)
      setEquipoVisita(visita)
    })
  }, [id])

  async function guardarResultado() {
    await db.partidos.update(parseInt(id), {
      golesLocal,
      golesVisita,
      jugado: true,
    })
    navigate(`/torneo/${partido.torneoId}`)
  }

  if (!partido || !equipoLocal || !equipoVisita) {
    return <p className="text-center text-gray-400 mt-8">Cargando...</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate(`/torneo/${partido.torneoId}`)}
          className="text-green-600 text-sm mb-2"
        >
          ← Volver
        </button>
        <h2 className="text-xl font-bold text-gray-800">Registrar resultado</h2>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between gap-4">

          {/* Equipo Local */}
          <div className="flex-1 text-center">
            <p className="font-bold text-gray-800 mb-3">{equipoLocal.nombre}</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setGolesLocal(Math.max(0, golesLocal - 1))}
                className="w-10 h-10 rounded-full bg-gray-200 text-xl font-bold text-gray-700"
              >
                −
              </button>
              <span className="text-4xl font-bold text-green-600 w-10 text-center">
                {golesLocal}
              </span>
              <button
                onClick={() => setGolesLocal(golesLocal + 1)}
                className="w-10 h-10 rounded-full bg-green-600 text-white text-xl font-bold"
              >
                +
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">{equipoLocal.color}</p>
          </div>

          <div className="text-2xl font-bold text-gray-300">VS</div>

          {/* Equipo Visita */}
          <div className="flex-1 text-center">
            <p className="font-bold text-gray-800 mb-3">{equipoVisita.nombre}</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setGolesVisita(Math.max(0, golesVisita - 1))}
                className="w-10 h-10 rounded-full bg-gray-200 text-xl font-bold text-gray-700"
              >
                −
              </button>
              <span className="text-4xl font-bold text-green-600 w-10 text-center">
                {golesVisita}
              </span>
              <button
                onClick={() => setGolesVisita(golesVisita + 1)}
                className="w-10 h-10 rounded-full bg-green-600 text-white text-xl font-bold"
              >
                +
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">{equipoVisita.color}</p>
          </div>

        </div>
      </div>

      {partido.jugado && (
        <p className="text-center text-green-600 text-sm font-medium">
          ✓ Este partido ya fue registrado
        </p>
      )}

      <button
        onClick={guardarResultado}
        className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-lg shadow"
      >
        Guardar resultado
      </button>
    </div>
  )
}