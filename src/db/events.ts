/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from './db';
import { MatchEvent } from '../types';
import { addOfflineChange, getMatches, getOfflineSimState, updateMatch } from '../utils/storage';

interface EventRecord {
  id?: number;
  partidoId: string;
  tipo: MatchEvent['type'];
  jugadorId: string;
  minuto: number;
  equipoId: string;
  equipoNombre: string;
  jugadorNombre: string;
  jugadorNumero?: number;
  jugadorEntraId?: string;
  jugadorEntraNombre?: string;
  jugadorEntraNumero?: number;
}

const eventTable = () => db.table<EventRecord>('eventos');

function recordToMatchEvent(record: EventRecord): MatchEvent {
  return {
    id: String(record.id),
    matchId: record.partidoId,
    teamId: record.equipoId,
    teamName: record.equipoNombre,
    type: record.tipo,
    minute: record.minuto,
    playerId: record.jugadorId,
    playerName: record.jugadorNombre,
    playerNumber: record.jugadorNumero,
    playerInId: record.jugadorEntraId,
    playerInName: record.jugadorEntraNombre,
    playerInNumber: record.jugadorEntraNumero,
  };
}

export async function addMatchEvent(event: MatchEvent): Promise<MatchEvent> {
  const record: EventRecord = {
    partidoId: event.matchId,
    tipo: event.type,
    jugadorId: event.playerId,
    minuto: event.minute,
    equipoId: event.teamId,
    equipoNombre: event.teamName,
    jugadorNombre: event.playerName,
    jugadorNumero: event.playerNumber,
    jugadorEntraId: event.playerInId,
    jugadorEntraNombre: event.playerInName,
    jugadorEntraNumero: event.playerInNumber,
  };

  const id = await eventTable().add(record);
  const savedEvent = { ...event, id: String(id) };

  if (event.type === 'goal') {
    const match = getMatches().find((m) => m.id === event.matchId);
    if (match) {
      updateMatch({
        ...match,
        scoreA: match.teamAId === event.teamId ? match.scoreA + 1 : match.scoreA,
        scoreB: match.teamBId === event.teamId ? match.scoreB + 1 : match.scoreB,
      });
    }
  }

  if (getOfflineSimState()) {
    addOfflineChange({
      id: crypto.randomUUID(),
      type: 'record_match_event',
      timestamp: new Date().toISOString(),
      description: `Evento registrado (${event.type}) en min ${event.minute}' para ${event.teamName}`,
      payload: savedEvent
    });
  }

  window.dispatchEvent(new Event('torneoapp_data_updated'));
  return savedEvent;
}

export async function getMatchEvents(matchId: string): Promise<MatchEvent[]> {
  const records = await eventTable()
    .where('partidoId')
    .equals(matchId)
    .toArray();

  return records
    .map(recordToMatchEvent)
    .sort((a, b) => b.minute - a.minute);
}

export async function getAllMatchEvents(): Promise<MatchEvent[]> {
  const records = await eventTable().toArray();

  return records
    .map(recordToMatchEvent)
    .sort((a, b) => b.minute - a.minute);
}

export async function deleteMatchEvent(eventId: string): Promise<void> {
  await eventTable().delete(Number(eventId));
  window.dispatchEvent(new Event('torneoapp_data_updated'));
}
