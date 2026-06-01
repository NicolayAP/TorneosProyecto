/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Tournament, Team, Player, Match, MatchEvent, OfflineChange } from '../types';

// Pre-populated realistic initial datasets matching mockups
const INITIAL_TOURNAMENTS: Tournament[] = [
  {
    id: 't1',
    name: "Champions League 2024",
    sport: "Fútbol 11",
    format: "league",
    numTeams: 16,
    playersPerTeam: 18,
    startDate: "2026-10-20",
    endDate: "2026-11-30",
    status: 'active',
    location: "Estadio Olímpico",
    preferredDays: ["Sáb", "Dom"],
    startTime: "09:00",
    endTime: "22:00"
  },
  {
    id: 't2',
    name: "Liga Senior",
    sport: "Fútbol 11",
    format: "groups",
    numTeams: 12,
    playersPerTeam: 18,
    startDate: "2026-06-01",
    endDate: "2026-08-15",
    status: 'active',
    location: "Complejo Municipal Canchas",
    preferredDays: ["Sáb"],
    startTime: "14:00",
    endTime: "19:00"
  }
];

const INITIAL_TEAMS: Team[] = [
  { id: 'team1', name: "Falcons FC", division: "Primera División A", category: "PRO LEAGUE", color: "#004d40", status: "active", playerCount: 24 },
  { id: 'team2', name: "Titan United", division: "Segunda División", category: "DIVISION B", color: "#fbc02d", status: "active", playerCount: 18 },
  { id: 'team3', name: "Zenith SC", division: "Primera División A", category: "PRO LEAGUE", color: "#1a237e", status: "active", playerCount: 22 },
  { id: 'team4', name: "Red Wolves FC", division: "Primera División B", category: "SUSPENDED", color: "#b71c1c", status: "suspended", playerCount: 20 },
  { id: 'team5', name: "Titans FC", division: "Primera División A", category: "PREM", color: "#1e3a8a", status: "active", playerCount: 18 },
  { id: 'team6', name: "Aurora Rovers", division: "Segunda División", category: "SEC", color: "#047857", status: "active", playerCount: 22 },
  { id: 'team7', name: "Crimson Kings", division: "Primera División B", category: "PREM", color: "#991b1b", status: "active", playerCount: 19 },
  { id: 'team8', name: "Steel Hawks", division: "Juveniles - Sub 21", category: "JUV", color: "#334155", status: "active", playerCount: 25 },
  { id: 'team9', name: "Nomad United", division: "Primera División A", category: "PREM", color: "#ea580c", status: "active", playerCount: 20 },
  { id: 'team10', name: "Atlas SC", division: "Primera División A", category: "PREM", color: "#1c1b1b", status: "active", playerCount: 18 },
  { id: 'team11', name: "Dragons FC", division: "Primera División A", category: "PRO LEAGUE", color: "#313030", status: "active", playerCount: 18 },
  { id: 'team12', name: "Eagles SC", division: "Primera División A", category: "PRO LEAGUE", color: "#00838f", status: "active", playerCount: 18 }
];

const INITIAL_PLAYERS: Player[] = [
  // Falcons
  { id: 'p1', teamId: 'team1', name: "Carlos Méndez", number: 10, position: "Mediocampista del." },
  { id: 'p2', teamId: 'team1', name: "Santi G.", number: 9, position: "Delantero" },
  { id: 'p3', teamId: 'team1', name: "Luis Fernandez", number: 1, position: "Portero" },
  // Dragons
  { id: 'p4', teamId: 'team11', name: "Carlos Méndez", number: 10, position: "Delantero Centro" },
  { id: 'p5', teamId: 'team11', name: "Santi G.", number: 9, position: "Extremo Izquierdo" },
  { id: 'p6', teamId: 'team11', name: "Felipe Gomez", number: 7, position: "Mediocentro" },
  // Eagles
  { id: 'p7', teamId: 'team12', name: "Jordi Alba", number: 4, position: "Defensa" },
  { id: 'p8', teamId: 'team12', name: "Ramiro Funes", number: 8, position: "Mediocampista" },
  { id: 'p9', teamId: 'team12', name: "Enzo Fernandez", number: 5, position: "Defensa Central" },
];

const INITIAL_MATCHES: Match[] = [
  {
    id: 'm1',
    tournamentId: 't1',
    tournamentName: "Champions League 2024",
    matchday: "Jornada 3",
    teamAId: 'team1',
    teamBId: 'team3',
    teamAName: "Real Madrid",
    teamBName: "Barcelona",
    scoreA: 2,
    scoreB: 1,
    status: 'live',
    location: "Estadio Santiago Bernabéu",
    time: "16:45",
    date: "2026-10-24",
    refereeName: "Mark Thompson",
    liveMinute: 64
  },
  {
    id: 'm2',
    tournamentId: 't1',
    tournamentName: "Champions League 2024",
    matchday: "Jornada 3",
    teamAId: 'team8',
    teamBId: 'team7',
    teamAName: "Man. City",
    teamBName: "Bayern",
    scoreA: 0,
    scoreB: 0,
    status: 'scheduled',
    location: "Etihad Stadium",
    time: "21:00",
    date: "2026-10-24",
    refereeName: "Lucas Martinez"
  },
  {
    id: 'm3',
    tournamentId: 't1',
    tournamentName: "Champions League 2024",
    matchday: "Jornada 3",
    teamAId: 'team1',
    teamBId: 'team2',
    teamAName: "Liverpool",
    teamBName: "Milan",
    scoreA: 3,
    scoreB: 0,
    status: 'finished',
    location: "Anfield Road",
    time: "12:00",
    date: "2026-10-23",
    refereeName: "Sarah Jenkins"
  },
  {
    id: 'm4',
    tournamentId: 't1',
    tournamentName: "Champions League 2024",
    matchday: "Jornada 3",
    teamAId: 'team5',
    teamBId: 'team10',
    teamAName: "Titanes FC",
    teamBName: "Atlas SC",
    scoreA: 2,
    scoreB: 1,
    status: 'live',
    location: "Cancha 1",
    time: "16:00",
    date: "2026-10-24",
    refereeName: "Andrés Ruiz",
    liveMinute: 72
  },
  {
    id: 'ref-match-1',
    tournamentId: 't1',
    tournamentName: "Champions League 2024",
    matchday: "Jornada 3",
    teamAId: 'team11',
    teamBId: 'team12',
    teamAName: "Dragons FC",
    teamBName: "Eagles SC",
    scoreA: 2,
    scoreB: 1,
    status: 'live',
    location: "Cancha 2",
    time: "15:00",
    date: "2026-10-24",
    refereeName: "Carlos González (Árbitro)",
    liveMinute: 68
  },
  {
    id: 'm5',
    tournamentId: 't2',
    tournamentName: "Liga Senior",
    matchday: "Fase de Grupos",
    teamAId: 'team2',
    teamBId: 'team1',
    teamAName: "Galgos FC",
    teamBName: "Halcones FC",
    scoreA: 0,
    scoreB: 0,
    status: 'scheduled',
    location: "Cancha 1",
    time: "14:30",
    date: "2026-10-24",
    refereeName: "Tomas Ortiz"
  }
];

const INITIAL_EVENTS: MatchEvent[] = [
  { id: 'e1', matchId: 'ref-match-1', teamName: "Dragons FC", type: "goal", minute: 64, playerName: "Carlos Méndez", playerNumber: 10 },
  { id: 'e2', matchId: 'ref-match-1', teamName: "Eagles SC", type: "red_card", minute: 42, playerName: "Jordi Alba", playerNumber: 4 },
  { id: 'e3', matchId: 'ref-match-1', teamName: "Dragons FC", type: "goal", minute: 28, playerName: "Santi G.", playerNumber: 9 }
];

export function getOfflineSimState(): boolean {
  return localStorage.getItem('torneoapp_offline_sim') === 'true';
}

export function setOfflineSimState(state: boolean): void {
  localStorage.setItem('torneoapp_offline_sim', state ? 'true' : 'false');
  dispatchEvent(new Event('torneoapp_connection_change'));
}

export function initializeDatabase() {
  if (!localStorage.getItem('torneoapp_initialized')) {
    localStorage.setItem('torneoapp_tournaments', JSON.stringify(INITIAL_TOURNAMENTS));
    localStorage.setItem('torneoapp_teams', JSON.stringify(INITIAL_TEAMS));
    localStorage.setItem('torneoapp_players', JSON.stringify(INITIAL_PLAYERS));
    localStorage.setItem('torneoapp_matches', JSON.stringify(INITIAL_MATCHES));
    localStorage.setItem('torneoapp_events', JSON.stringify(INITIAL_EVENTS));
    localStorage.setItem('torneoapp_changes', JSON.stringify([]));
    localStorage.setItem('torneoapp_offline_sim', 'false');
    localStorage.setItem('torneoapp_initialized', 'true');
  }
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
