import { solicitarPermisoNotificaciones } from '../firebase'
import { createContext, useContext, useEffect, useState } from 'react'
import { db } from '../db/db'

const AuthContext = createContext(null)

async function hashPIN(pin) {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function seedUsuarios() {
  const count = await db.usuarios.count()
  if (count === 0) {
    const adminHash = await hashPIN('1234')
    const arbitroHash = await hashPIN('0000')
    await db.usuarios.bulkAdd([
      { username: 'admin', pinHash: adminHash, rol: 'admin' },
      { username: 'arbitro', pinHash: arbitroHash, rol: 'arbitro' },
    ])
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    seedUsuarios()
    const guardado = sessionStorage.getItem('usuario')
    if (guardado) setUsuario(JSON.parse(guardado))
    setCargando(false)
  }, [])

  async function login(username, pin) {
    const pinHash = await hashPIN(pin)
    const user = await db.usuarios
      .where('username').equals(username)
      .and(u => u.pinHash === pinHash)
      .first()
    if (!user) return false
    const sesion = { id: user.id, username: user.username, rol: user.rol }
    setUsuario(sesion)
    sessionStorage.setItem('usuario', JSON.stringify(sesion))
    solicitarPermisoNotificaciones()
    return true
  }

  function logout() {
    setUsuario(null)
    sessionStorage.removeItem('usuario')
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}