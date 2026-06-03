import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: "AIzaSyCcHJK9LnMmwlMmfFgow9NUu51YYTioARU",
  authDomain: "torneoapp-79189.firebaseapp.com",
  projectId: "torneoapp-79189",
  storageBucket: "torneoapp-79189.firebasestorage.app",
  messagingSenderId: "62511914899",
  appId: "1:62511914899:web:d6504585b9d01ca3139266"
}

const app = initializeApp(firebaseConfig)
export const messaging = getMessaging(app)

export async function solicitarPermisoNotificaciones() {
  try {
    const permiso = await Notification.requestPermission()
    if (permiso !== 'granted') {
      console.warn('Permiso de notificaciones denegado')
      return null
    }
    const token = await getToken(messaging, {
      vapidKey: 'BFeYt1UotD2HY6CI4rF-LOkOU2J8mGv6yrf1wBud3tdoxOFjU8u1K573fFFmitMVfh7yxnCUF50HgMc63KMygbM'
    })
    console.log('FCM Token:', token)
    return token
  } catch (error) {
    console.error('Error obteniendo token FCM:', error)
    return null
  }
}

export function escucharNotificaciones(callback) {
  onMessage(messaging, (payload) => {
    console.log('Notificación recibida:', payload)
    callback(payload)
  })
}