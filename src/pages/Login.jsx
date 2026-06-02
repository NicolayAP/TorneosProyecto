import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const destino = location.state?.from || '/'

  async function handleLogin() {
    if (!username || pin.length < 4) {
      setError('Ingresa usuario y PIN de 4 dígitos.')
      return
    }
    setCargando(true)
    const ok = await login(username, pin)
    setCargando(false)
    if (ok) {
      navigate(destino, { replace: true })
    } else {
      setError('Usuario o PIN incorrecto.')
      setPin('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm space-y-4">
        <div className="text-center">
          <p className="text-5xl mb-2">🏆</p>
          <h2 className="text-xl font-bold text-gray-800">TorneoApp</h2>
          <p className="text-sm text-gray-500">Inicia sesión para continuar</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="admin / arbitro"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">PIN</label>
          <input
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            type="password"
            inputMode="numeric"
            placeholder="••••"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={cargando}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-lg shadow disabled:opacity-50"
        >
          {cargando ? 'Verificando...' : 'Entrar'}
        </button>

        <p className="text-xs text-center text-gray-400">
          Admin: usuario <strong>admin</strong>, PIN <strong>1234</strong><br />
          Árbitro: usuario <strong>arbitro</strong>, PIN <strong>0000</strong>
        </p>
      </div>
    </div>
  )
}