importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: "AIzaSyCcHJK9LnMmwlMmfFgow9NUu51YYTioARU",
  authDomain: "torneoapp-79189.firebaseapp.com",
  projectId: "torneoapp-79189",
  storageBucket: "torneoapp-79189.firebasestorage.app",
  messagingSenderId: "62511914899",
  appId: "1:62511914899:web:d6504585b9d01ca3139266"
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  console.log('Notificación en background:', payload)
  const { title, body } = payload.notification
  self.registration.showNotification(title, {
    body,
    icon: '/icon-192.jpeg'
  })
})