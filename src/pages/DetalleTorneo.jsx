import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../db/db'

export default function DetalleTorneo() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [torneo, setTorneo] = useState(null)
  const [equipos, setEquipos] = useState([])
  const [partidos, setPartidos] = useState([])
  const [nuevoEquipo, setNuevoEquipo] = useState({ nombre: '', color: '' })
  const [tab, setTab] = useState('equipos')

  useEffect(() => {
    const torneoId = parseInt(id)
    db.torneos.get(torneoId).then(setTorneo)
    db.equipos.where('torneoId').equals(torneoId).toArray().then(setEquipos)
    db.partidos.where('torneoId').equals(torneoId).toArray().then(setPartidos)
  }, [id])

  async function agregarEquipo() {
    if (!nuevoEquipo.nombre) {
      alert('Escribe el nombre del equipo.')
      return
    }
    await db.equipos.add({ ...nuevoEquipo, torneoId: parseInt(id) })
    const actualizados = await db.equipos.where('torneoId').equals(parseInt(id)).toArray()
    setEquipos(actualizados)
    setNuevoEquipo({ nombre: '', color: '' })
  }

  async function generarFixture() {
    if (equipos.length < 2) {
      alert('Necesitas al menos 2 equipos para generar el fixture.')
      return
    }
    const existentes = await db.partidos.where('torneoId').equals(parseInt(id)).toArray()
    if (existentes.length > 0) {
      alert('El fixture ya fue generado.')
      return
    }
    const nuevosPartidos = []
    for (let i = 0; i < equipos.length; i++) {
      for (let j = i + 1; j < equipos.length; j++) {
        nuevosPartidos.push({
          torneoId: parseInt(id),
          equipoLocalId: equipos[i].id,
          equipoVisitaId: equipos[j].id,
          golesLocal: null,
          golesVisita: null,
          jugado: false,
        })
      }
    }
    await db.partidos.bulkAdd(nuevosPartidos)
    const actualizados = await db.partidos.where('torneoId').equals(parseInt(id)).toArray()
    setPartidos(actualizados)
    setTab('fixture')
  }

  function nombreEquipo(equipoId) {
    return equipos.find(e => e.id === equipoId)?.nombre || '?'
  }

  function calcularTabla() {
    const tabla = {}
    equipos.forEach(e => {
      tabla[e.id] = { nombre: e.nombre, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 }
    })
    partidos.filter(p => p.jugado).forEach(p => {
      const l = tabla[p.equipoLocalId]
      const v = tabla[p.equipoVisitaId]
      if (!l || !v) return
      l.pj++; v.pj++
      l.gf += p.golesLocal; l.gc += p.golesVisita
      v.gf += p.golesVisita; v.gc += p.golesLocal
      if (p.golesLocal > p.golesVisita) { l.pg++; l.pts += 3; v.pp++ }
      else if (p.golesLocal < p.golesVisita) { v.pg++; v.pts += 3; l.pp++ }
      else { l.pe++; v.pe++; l.pts++; v.pts++ }
    })
    return Object.values(tabla).sort((a, b) => b.pts - a.pts)
  }

  if (!torneo) return <p className="text-center text-gray-400 mt-8">Cargando...</p>

  return (
    <div className="space-y-4">
      <div>
        <button onClick={() => navigate('/')} className="text-green-600 text-sm mb-2">← Volver</button>
        <h2 className="text-xl font-bold text-gray-800">{torneo.nombre}</h2>
        <p className="text-sm text-gray-500">{torneo.deporte} · {torneo.formato} · {torneo.fecha}</p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200">
        {['equipos', 'fixture', 'tabla'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium capitalize transition ${
              tab === t ? 'bg-green-600 text-white' : 'bg-white text-gray-600'
            }`}
          >
            {t === 'equipos' ? '👥 Equipos' : t === 'fixture' ? '📅 Fixture' : '🏆 Tabla'}
          </button>
        ))}
      </div>

      {/* Tab Equipos */}
      {tab === 'equipos' && (
        <div className="space-y-3">
          <div className="bg-white rounded-xl shadow p-4 space-y-3">
            <input
              placeholder="Nombre del equipo"
              value={nuevoEquipo.nombre}
              onChange={e => setNuevoEquipo({ ...nuevoEquipo, nombre: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              placeholder="Color de camiseta (ej: Rojo)"
              value={nuevoEquipo.color}
              onChange={e => setNuevoEquipo({ ...nuevoEquipo, color: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={agregarEquipo}
              className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-semibold"
            >
              + Agregar equipo
            </button>
          </div>

          {equipos.length === 0 ? (
            <p className="text-center text-gray-400 text-sm mt-4">No hay equipos aún.</p>
          ) : (
            equipos.map(eq => (
              <div key={eq.id} className="bg-white rounded-xl shadow px-4 py-3 flex justify-between items-center">
                <div>
                  <span className="font-medium text-gray-800">{eq.nombre}</span>
                  <span className="ml-2 text-sm text-gray-400">{eq.color}</span>
                </div>
                <button
                  onClick={() => navigate(`/equipo/${eq.id}/jugadores`)}
                  className="text-green-600 text-sm font-medium"
                >
                  👥 Jugadores
                </button>
              </div>
            ))  
          )}

          {equipos.length >= 2 && (
            <button
              onClick={generarFixture}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold shadow mt-2"
            >
              Generar fixture
            </button>
          )}
        </div>
      )}

      {/* Tab Fixture */}
      {tab === 'fixture' && (
        <div className="space-y-3">
          {partidos.length === 0 ? (
            <p className="text-center text-gray-400 text-sm mt-4">Aún no se ha generado el fixture.</p>
          ) : (
            partidos.map(partido => (
              <div
                key={partido.id}
                onClick={() => navigate(`/partido/${partido.id}`)}
                className="bg-white rounded-xl shadow px-4 py-3 cursor-pointer hover:shadow-md transition"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800 text-sm">{nombreEquipo(partido.equipoLocalId)}</span>
                  <span className="text-gray-400 text-sm mx-2">
                    {partido.jugado ? `${partido.golesLocal} - ${partido.golesVisita}` : 'vs'}
                  </span>
                  <span className="font-medium text-gray-800 text-sm">{nombreEquipo(partido.equipoVisitaId)}</span>
                </div>
                {partido.jugado && (
                  <p className="text-xs text-green-600 text-center mt-1">✓ Jugado</p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Tabla */}
      {tab === 'tabla' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="text-left px-3 py-2">Equipo</th>
                <th className="py-2">PJ</th>
                <th className="py-2">PG</th>
                <th className="py-2">PE</th>
                <th className="py-2">PP</th>
                <th className="py-2">Pts</th>
              </tr>
            </thead>
            <tbody>
              {calcularTabla().map((fila, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-3 py-2 font-medium">{fila.nombre}</td>
                  <td className="text-center py-2">{fila.pj}</td>
                  <td className="text-center py-2">{fila.pg}</td>
                  <td className="text-center py-2">{fila.pe}</td>
                  <td className="text-center py-2">{fila.pp}</td>
                  <td className="text-center py-2 font-bold text-green-600">{fila.pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}