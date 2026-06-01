import Dexie from 'dexie'

export const db = new Dexie('TorneoApp')

db.version(2).stores({
  torneos:   '++id, nombre, formato, deporte, fecha',
  equipos:   '++id, torneoId, nombre, color',
  jugadores: '++id, equipoId, torneoId, nombre, numero, posicion',
  partidos:  '++id, torneoId, equipoLocalId, equipoVisitaId, golesLocal, golesVisita, jugado',
  eventos:   '++id, partidoId, torneoId, jugadorId, equipoId, tipo, minuto',
})