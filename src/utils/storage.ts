/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Tournament, Team, Player, Match, MatchEvent, OfflineChange } from '../types';

// Pre-populated realistic initial datasets matching mockups
const INITIAL_TOURNAMENTS: Tournament[] = [];

const INITIAL_TEAMS: Team[] = [];

const INITIAL_PLAYERS: Player[] = [];

const INITIAL_MATCHES: Match[] = [];

const INITIAL_EVENTS: MatchEvent[] = [];

export function getOfflineSimState(): boolean {
  return localStorage.getItem('torneoapp_offline_sim') === 'true';
}

export function setOfflineSimState(state: boolean): void {
  localStorage.setItem('torneoapp_offline_sim', state ? 'true' : 'false');
  dispatchEvent(new Event('torneoapp_connection_change'));
}

export function initializeDatabase() {
  if (!localStorage.getItem('torneoapp_initialized')) {
    // First time initialization with empty arrays
    localStorage.setItem('torneoapp_tournaments', JSON.stringify(INITIAL_TOURNAMENTS));
    localStorage.setItem('torneoapp_teams', JSON.stringify(INITIAL_TEAMS));
    localStorage.setItem('torneoapp_players', JSON.stringify(INITIAL_PLAYERS));
    localStorage.setItem('torneoapp_matches', JSON.stringify(INITIAL_MATCHES));
    localStorage.setItem('torneoapp_events', JSON.stringify(INITIAL_EVENTS));
    localStorage.setItem('torneoapp_changes', JSON.stringify([]));
    localStorage.setItem('torneoapp_offline_sim', 'false');
    localStorage.setItem('torneoapp_initialized', 'true');
  } else if (localStorage.getItem('torneoapp_schema_version') !== '2') {
    // Migration: clear old seed data from previous versions
    resetDatabase();
    localStorage.setItem('torneoapp_schema_version', '2');
  }
}

export function resetDatabase() {
  localStorage.setItem('torneoapp_tournaments', JSON.stringify(INITIAL_TOURNAMENTS));
  localStorage.setItem('torneoapp_teams', JSON.stringify(INITIAL_TEAMS));
  localStorage.setItem('torneoapp_players', JSON.stringify(INITIAL_PLAYERS));
  localStorage.setItem('torneoapp_matches', JSON.stringify(INITIAL_MATCHES));
  localStorage.setItem('torneoapp_events', JSON.stringify(INITIAL_EVENTS));
  localStorage.setItem('torneoapp_changes', JSON.stringify([]));
  dispatchEvent(new Event('torneoapp_data_updated'));
}

// Low level generic storage helper
function get<T>(key: string): T[] {
  initializeDatabase();
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
  dispatchEvent(new Event('torneoapp_data_updated'));
}

// Tournaments
export function getTournaments(): Tournament[] {
  return get<Tournament>('torneoapp_tournaments');
}

export function addTournament(tournament: Tournament): void {
  const tournaments = getTournaments();
  tournaments.push(tournament);
  save('torneoapp_tournaments', tournaments);

  if (getOfflineSimState()) {
    addOfflineChange({
      id: crypto.randomUUID(),
      type: 'create_tournament',
      timestamp: new Date().toISOString(),
      description: `Torneo registrado: ${tournament.name}`,
      payload: tournament
    });
  }
}

// Teams
export function getTeams(): Team[] {
  return get<Team>('torneoapp_teams');
}

export function addTeam(team: Team, players: Player[]): void {
  const teams = getTeams();
  teams.push(team);
  save('torneoapp_teams', teams);

  const existingPlayers = get<Player>('torneoapp_players');
  existingPlayers.push(...players);
  save('torneoapp_players', existingPlayers);

  if (getOfflineSimState()) {
    addOfflineChange({
      id: crypto.randomUUID(),
      type: 'create_team',
      timestamp: new Date().toISOString(),
      description: `Equipo registrado: ${team.name} con ${players.length} jugadores`,
      payload: { team, players }
    });
  }
}

// Players
export function getPlayers(): Player[] {
  return get<Player>('torneoapp_players');
}

export function getPlayersByTeam(teamId: string): Player[] {
  return getPlayers().filter(p => p.teamId === teamId);
}

export function addPlayer(player: Player): void {
  const players = getPlayers();
  players.push(player);
  save('torneoapp_players', players);

  if (getOfflineSimState()) {
    addOfflineChange({
      id: crypto.randomUUID(),
      type: 'create_player',
      timestamp: new Date().toISOString(),
      description: `Jugador registrado: ${player.name} (#${player.number})`,
      payload: player
    });
  }
}

export function updatePlayer(player: Player): void {
  const players = getPlayers();
  const idx = players.findIndex(p => p.id === player.id);
  if (idx !== -1) {
    players[idx] = player;
    save('torneoapp_players', players);

    if (getOfflineSimState()) {
      addOfflineChange({
        id: crypto.randomUUID(),
        type: 'update_player',
        timestamp: new Date().toISOString(),
        description: `Jugador actualizado: ${player.name} (#${player.number})`,
        payload: player
      });
    }
  }
}

export function deletePlayer(playerId: string): void {
  const players = getPlayers();
  const playerToDelete = players.find(p => p.id === playerId);
  const filteredPlayers = players.filter(p => p.id !== playerId);
  save('torneoapp_players', filteredPlayers);

  if (playerToDelete && getOfflineSimState()) {
    addOfflineChange({
      id: crypto.randomUUID(),
      type: 'delete_player',
      timestamp: new Date().toISOString(),
      description: `Jugador eliminado: ${playerToDelete.name}`,
      payload: playerToDelete
    });
  }
}

// Matches
export function getMatches(): Match[] {
  return get<Match>('torneoapp_matches');
}

export function updateMatch(match: Match): void {
  const matches = getMatches();
  const idx = matches.findIndex(m => m.id === match.id);
  if (idx !== -1) {
    matches[idx] = match;
    save('torneoapp_matches', matches);
  }
}

// Events
export function getEvents(): MatchEvent[] {
  return get<MatchEvent>('torneoapp_events');
}

export function getEventsByMatch(matchId: string): MatchEvent[] {
  return getEvents().filter(e => e.matchId === matchId);
}

export function addMatchEvent(event: MatchEvent): void {
  const events = getEvents();
  events.push(event);
  save('torneoapp_events', events);

  // Update match score if the event is a goal
  if (event.type === 'goal') {
    const matches = getMatches();
    const match = matches.find(m => m.id === event.matchId);
    if (match) {
      if (match.teamAName === event.teamName) {
        match.scoreA += 1;
      } else {
        match.scoreB += 1;
      }
      updateMatch(match);
    }
  }

  if (getOfflineSimState()) {
    addOfflineChange({
      id: crypto.randomUUID(),
      type: 'record_match_event',
      timestamp: new Date().toISOString(),
      description: `Evento registrado (${event.type}) en min ${event.minute}' para ${event.teamName}`,
      payload: event
    });
  }
}

export function finalizeMatch(matchId: string): void {
  const matches = getMatches();
  const match = matches.find(m => m.id === matchId);
  if (match) {
    match.status = 'finished';
    updateMatch(match);

    if (getOfflineSimState()) {
      addOfflineChange({
        id: crypto.randomUUID(),
        type: 'finalize_match',
        timestamp: new Date().toISOString(),
        description: `Partido finalizado: ${match.teamAName} (${match.scoreA}) vs (${match.scoreB}) ${match.teamBName}`,
        payload: { matchId }
      });
    }
  }
}

// Offline Sync Cache Queue
export function getOfflineChanges(): OfflineChange[] {
  return get<OfflineChange>('torneoapp_changes');
}

export function addOfflineChange(change: OfflineChange): void {
  const changes = getOfflineChanges();
  changes.push(change);
  save('torneoapp_changes', changes);
  dispatchEvent(new Event('torneoapp_changes_count_updated'));
}

export function clearOfflineChanges(): void {
  save('torneoapp_changes', []);
  dispatchEvent(new Event('torneoapp_changes_count_updated'));
}

export function uploadOfflineQueueToServer(onSuccess: () => void) {
  // Simulate network synchronization delay
  setTimeout(() => {
    clearOfflineChanges();
    onSuccess();
  }, 1800);
}
