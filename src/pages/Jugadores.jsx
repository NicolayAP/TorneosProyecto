import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../db/db'

export default function Jugadores() {
  const { equipoId } = useParams()
  const navigate = useNavigate()
  const [equipo, setEquipo] = useState(null)
  const [jugadores, setJugadores] = useState([])
  const [form, setForm] = useState({ nombre: '', numero: '', posicion: 'Delantero' })

  useEffect(() => {
    db.equipos.get(parseInt(equipoId)).then(setEquipo)
    db.jugadores.where('equipoId').equals(parseInt(equipoId)).toArray().then(setJugadores)
  }, [equipoId])

  async function agregarJugador() {
    if (!form.nombre) { alert('Escribe el nombre del jugador.'); return }
    await db.jugadores.add({
      ...form,
      numero: parseInt(form.numero) || 0,
      equipoId: parseInt(equipoId),
      torneoId: equipo.torneoId,
    })
    const actualizados = await db.jugadores.where('equipoId').equals(parseInt(equipoId)).toArray()
    setJugadores(actualizados)
    setForm({ nombre: '', numero: '', posicion: 'Delantero' })
  }

  async function eliminarJugador(id) {
    await db.jugadores.delete(id)
    setJugadores(jugadores.filter(j => j.id !== id))
  }

  if (!equipo) return <p className="text-center text-gray-400 mt-8">Cargando...</p>

  return (
    <div className="space-y-4">
      <div>
        <button onClick={() => navigate(`/torneo/${equipo.torneoId}`)} className="text-green-600 text-sm mb-2">← Volver</button>
        <h2 className="text-xl font-bold text-gray-800">Jugadores — {equipo.nombre}</h2>
        <p className="text-sm text-gray-400">{equipo.color}</p>
      </div>

      <div className="bg-white rounded-xl shadow p-4 space-y-3">
        <input
          placeholder="Nombre del jugador"
          value={form.nombre}
          onChange={e => setForm({ ...form, nombre: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          placeholder="Número de camiseta"
          type="number"
          value={form.numero}
          onChange={e => setForm({ ...form, numero: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <select
          value={form.posicion}
          onChange={e => setForm({ ...form, posicion: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option>Portero</option>
          <option>Defensa</option>
          <option>Mediocampista</option>
          <option>Delantero</option>
        </select>
        <button
          onClick={agregarJugador}
          className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-semibold"
        >
          + Agregar jugador
        </button>
      </div>

      {jugadores.length === 0 ? (
        <p className="text-center text-gray-400 text-sm mt-4">No hay jugadores aún.</p>
      ) : (
        jugadores.map(j => (
          <div key={j.id} className="bg-white rounded-xl shadow px-4 py-3 flex justify-between items-center">
            <div>
              <span className="font-medium text-gray-800">{j.nombre}</span>
              <span className="ml-2 text-xs text-gray-400">#{j.numero} · {j.posicion}</span>
            </div>
            <button
              onClick={() => eliminarJugador(j.id)}
              className="text-red-400 text-xs"
            >
              Eliminar
            </button>
          </div>
        ))
      )}
    </div>
  )
}