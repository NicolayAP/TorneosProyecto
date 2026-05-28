import { useEffect, useState } from 'react'

export default function EstadoConexion() {
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    function handleOnline() { setOnline(true) }
    function handleOffline() { setOnline(false) }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (online) return null

  return (
    <div className="bg-red-500 text-white text-center text-sm py-2 font-medium">
      📵 Sin conexión — trabajando offline
    </div>
  )
}