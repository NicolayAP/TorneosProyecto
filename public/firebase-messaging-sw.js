importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

// Versión del SW — cambiar este número fuerza actualización del caché
const SW_VERSION = '1.0.1'

firebase.initializeApp({
  apiKey: "AIzaSyCcHJK9LnMmwlMmfFgow9NUu51YYTioARU",
  authDomain: "torneoapp-79189.firebaseapp.com",
  projectId: "torneoapp-79189",
  storageBucket: "torneoapp-79189.firebasestorage.app",
  messagingSenderId: "62511914899",
  appId: "1:62511914899:web:d6504585b9d01ca3139266"
})

const messaging = firebase.messaging()

// Notificaciones en background (app cerrada o en segundo plano)
messaging.onBackgroundMessage((payload) => {
  console.log(`[SW v${SW_VERSION}] Notificación en background:`, payload)

  const title = payload.notification?.title || '⚽ TorneoApp'
  const body  = payload.notification?.body  || 'Tienes una actualización pendiente'

  self.registration.showNotification(title, {
    body,
    icon: '/icon-192.jpeg',
    badge: '/icon-192.jpeg',
    tag: payload.data?.tag || 'torneoapp-general',
    data: payload.data || {},
    actions: [
      { action: 'abrir', title: 'Ver partido' },
      { action: 'cerrar', title: 'Descartar' }
    ]
  })
})

// Click en la notificación — abre la app
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'cerrar') return

  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una ventana abierta, enfócarla
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus()
        }
      }
      // Si no, abrir una nueva
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})