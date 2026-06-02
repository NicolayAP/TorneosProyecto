/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Tournament {
  id: string;
  name: string;
  sport: string;
  format: 'league' | 'knockout' | 'groups';
  numTeams: number;
  playersPerTeam: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'finished';
  location: string;
  preferredDays: string[];
  startTime: string;
  endTime: string;
}

export interface Team {
  id: string;
  name: string;
  division: string;
  category: string;
  logoUrl?: string;
  color: string;
  status: 'active' | 'suspended' | 'inactive';
  playerCount: number;
}

export interface Player {
  id: string;
  teamId: string;
  name: string;
  number: number;
  position: string;
}

export interface Match {
  id: string;
  tournamentId: string;
  tournamentName: string;
  matchday: string; // e.g. "Jornada 3"
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  teamALogoUrl?: string;
  teamBLogoUrl?: string;
  scoreA: number;
  scoreB: number;
  status: 'scheduled' | 'live' | 'finished';
  location: string;
  time: string; // e.g. "16:45"
  date: string; // YYYY-MM-DD
  refereeName?: string;
  liveMinute?: number;
  additionalTimeMinutes?: number;
}

export interface MatchEvent {
  id: string;
  matchId: string;
  teamId: string;
  teamName: string;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution';
  minute: number;
  playerId: string;
  playerName: string;
  playerNumber?: number;
  playerInId?: string;
  playerInName?: string;
  playerInNumber?: number;
}

export interface Referee {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  specializations: string[];
  status: 'active' | 'inactive';
}

export interface OfflineChange {
  id: string;
  type: 'create_tournament' | 'create_team' | 'record_match_event' | 'finalize_match' | 'update_tournament' | 'create_player' | 'update_player' | 'delete_player' | 'create_match';
  timestamp: string;
  description: string;
  payload: any;
}
