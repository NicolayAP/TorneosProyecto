import { useEffect, useRef } from 'react'
import { solicitarPermisoNotificaciones, escucharNotificaciones } from '../firebase'

/**
 * Hook que:
 * 1. Solicita permiso de notificaciones al montar
 * 2. Escucha notificaciones en primer plano
 * 3. Programa alertas 30 min antes de cada partido
 */
export function useNotificaciones(partidos = []) {
  const timeoutsRef = useRef([]) // guarda los IDs de setTimeout para limpiarlos

  // Solicitar permiso y escuchar notificaciones en foreground
  useEffect(() => {
    solicitarPermisoNotificaciones()

    escucharNotificaciones((payload) => {
      const { title, body } = payload.notification || {}
      if (!title) return

      // Mostrar notificación nativa si la app está en primer plano
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/icon-192.jpeg',
          badge: '/icon-192.jpeg',
        })
      }
    })
  }, [])

  // Programar notificaciones 30 min antes de cada partido
  useEffect(() => {
    // Limpiar timeouts anteriores
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []

    if (Notification.permission !== 'granted') return

    partidos.forEach((partido) => {
      if (!partido.date || !partido.time || partido.status === 'finished') return

      // Construir fecha del partido
      const fechaPartido = new Date(`${partido.date}T${partido.time}:00`)
      const ahora = new Date()
      const msHasta30MinAntes = fechaPartido.getTime() - 30 * 60 * 1000 - ahora.getTime()

      // Solo programar si faltan más de 0 ms (es decir, aún no pasó)
      if (msHasta30MinAntes <= 0) return

      const timeoutId = setTimeout(() => {
        new Notification('⚽ Partido en 30 minutos', {
          body: `${partido.teamAName} vs ${partido.teamBName} — ${partido.location || 'Cancha principal'}`,
          icon: '/icon-192.jpeg',
          badge: '/icon-192.jpeg',
          tag: `partido-${partido.id}`, // evita duplicados
        })
      }, msHasta30MinAntes)

      timeoutsRef.current.push(timeoutId)
    })

    // Cleanup al desmontar o cuando cambian los partidos
    return () => {
      timeoutsRef.current.forEach(clearTimeout)
    }
  }, [partidos])
}