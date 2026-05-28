import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../db/db'

export default function NuevoTorneo() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nombre: '',
    deporte: 'Fútbol',
    formato: 'Liga',
    fecha: '',
  })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleGuardar() {
    if (!form.nombre || !form.fecha) {
      alert('Por favor completa el nombre y la fecha.')
      return
    }
    await db.torneos.add(form)
    navigate('/')
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Nuevo torneo</h2>

      <div className="bg-white rounded-xl shadow p-4 space-y-4">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del torneo
          </label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej: Copa Barrio 2026"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deporte
          </label>
          <select
            name="deporte"
            value={form.deporte}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option>Fútbol</option>
            <option>Baloncesto</option>
            <option>Voleibol</option>
            <option>Microfútbol</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Formato
          </label>
          <select
            name="formato"
            value={form.formato}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option>Liga</option>
            <option>Eliminación directa</option>
            <option>Fase de grupos</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de inicio
          </label>
          <input
            name="fecha"
            type="date"
            value={form.fecha}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

      </div>

      <button
        onClick={handleGuardar}
        className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-lg shadow"
      >
        Guardar torneo
      </button>

      <button
        onClick={() => navigate('/')}
        className="w-full text-gray-500 py-2 text-sm"
      >
        Cancelar
      </button>
    </div>
  )
}