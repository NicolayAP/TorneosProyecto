import Dexie from 'dexie'
export const db = new Dexie('TorneoApp')
db.version(3).stores({
  torneos:   '++id, nombre, formato, deporte, fecha',
  equipos:   '++id, torneoId, nombre, color',
  jugadores: '++id, equipoId, torneoId, nombre, numero, posicion',
  partidos:  '++id, torneoId, equipoLocalId, equipoVisitaId, golesLocal, golesVisita, jugado',
  eventos:   '++id, partidoId, tipo, jugadorId, minuto, equipoId, jugadorEntraId',
  usuarios:  '++id, username, pinHash, rol',
})