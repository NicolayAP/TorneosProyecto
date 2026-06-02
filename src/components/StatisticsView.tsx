/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, Goal, RectangleVertical, Shirt } from 'lucide-react';
import { MatchEvent } from '../types';
import { getAllMatchEvents } from '../db/events';
import { getMatches, getPlayers, getTeams, getTournaments } from '../utils/storage';

interface PlayerStats {
  playerId: string;
  playerName: string;
  playerNumber?: number;
  teamName: string;
  goals: number;
  yellowCards: number;
  redCards: number;
  matchesPlayed: number;
}

export function StatisticsView() {
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState('all');
  const [refreshTick, setRefreshTick] = useState(0);

  const tournaments = getTournaments();
  const matches = getMatches();
  const teams = getTeams();
  const players = getPlayers();

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      const savedEvents = await getAllMatchEvents();
      if (!cancelled) setEvents(savedEvents);
    }

    loadEvents();

    const handleDataUpdate = () => {
      setRefreshTick((tick) => tick + 1);
      void loadEvents();
    };

    window.addEventListener('torneoapp_data_updated', handleDataUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener('torneoapp_data_updated', handleDataUpdate);
    };
  }, []);

  void refreshTick;

  const filteredMatches = useMemo(() => {
    return selectedTournamentId === 'all'
      ? matches
      : matches.filter((match) => match.tournamentId === selectedTournamentId);
  }, [matches, selectedTournamentId]);

  const filteredMatchIds = useMemo(() => {
    return new Set(filteredMatches.map((match) => match.id));
  }, [filteredMatches]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => filteredMatchIds.has(event.matchId));
  }, [events, filteredMatchIds]);

  const stats = useMemo(() => {
    const teamNameById = new Map(teams.map((team) => [team.id, team.name]));
    const playedMatchesByTeam = new Map<string, number>();

    filteredMatches
      .filter((match) => match.status === 'live' || match.status === 'finished')
      .forEach((match) => {
        playedMatchesByTeam.set(match.teamAId, (playedMatchesByTeam.get(match.teamAId) || 0) + 1);
        playedMatchesByTeam.set(match.teamBId, (playedMatchesByTeam.get(match.teamBId) || 0) + 1);
      });

    const rows = new Map<string, PlayerStats>();

    players.forEach((player) => {
      rows.set(player.id, {
        playerId: player.id,
        playerName: player.name,
        playerNumber: player.number,
        teamName: teamNameById.get(player.teamId) || 'Sin equipo',
        goals: 0,
        yellowCards: 0,
        redCards: 0,
        matchesPlayed: playedMatchesByTeam.get(player.teamId) || 0,
      });
    });

    filteredEvents.forEach((event) => {
      const current = rows.get(event.playerId) || {
        playerId: event.playerId,
        playerName: event.playerName,
        playerNumber: event.playerNumber,
        teamName: event.teamName,
        goals: 0,
        yellowCards: 0,
        redCards: 0,
        matchesPlayed: 0,
      };

      if (event.type === 'goal') current.goals += 1;
      if (event.type === 'yellow_card') current.yellowCards += 1;
      if (event.type === 'red_card') current.redCards += 1;
      rows.set(event.playerId, current);
    });

    return Array.from(rows.values());
  }, [filteredEvents, filteredMatches, players, teams]);

  const topScorers = stats
    .filter((row) => row.goals > 0)
    .sort((a, b) => b.goals - a.goals || a.playerName.localeCompare(b.playerName));

  const cardLeaders = stats
    .filter((row) => row.yellowCards > 0 || row.redCards > 0)
    .sort((a, b) => (b.yellowCards + b.redCards) - (a.yellowCards + a.redCards) || b.redCards - a.redCards);

  const matchesPlayed = stats
    .filter((row) => row.matchesPlayed > 0)
    .sort((a, b) => b.matchesPlayed - a.matchesPlayed || a.playerName.localeCompare(b.playerName));

  const summary = {
    goals: filteredEvents.filter((event) => event.type === 'goal').length,
    yellowCards: filteredEvents.filter((event) => event.type === 'yellow_card').length,
    redCards: filteredEvents.filter((event) => event.type === 'red_card').length,
    playedMatches: filteredMatches.filter((match) => match.status === 'live' || match.status === 'finished').length,
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-gray-900 md:text-2xl">Estadisticas</h2>
          <p className="text-xs text-gray-500">Goleadores, tarjetas y partidos calculados desde datos locales</p>
        </div>

        <select
          value={selectedTournamentId}
          onChange={(e) => setSelectedTournamentId(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 outline-none focus:border-[#fcd400]"
        >
          <option value="all">Todos los torneos</option>
          {tournaments.map((tournament) => (
            <option key={tournament.id} value={tournament.id}>
              {tournament.name}
            </option>
          ))}
        </select>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryMetric label="Goles" value={summary.goals} icon={Goal} />
        <SummaryMetric label="Amarillas" value={summary.yellowCards} icon={RectangleVertical} />
        <SummaryMetric label="Rojas" value={summary.redCards} icon={RectangleVertical} />
        <SummaryMetric label="Partidos jugados" value={summary.playedMatches} icon={BarChart3} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <StatsTable
          title="Goleadores"
          emptyText="Aun no hay goles registrados."
          columns={['Jugador', 'Equipo', 'Goles']}
          rows={topScorers.map((row) => [
            playerDisplay(row),
            row.teamName,
            String(row.goals),
          ])}
        />

        <StatsTable
          title="Tarjetas acumuladas"
          emptyText="Aun no hay tarjetas registradas."
          columns={['Jugador', 'Amarillas', 'Rojas']}
          rows={cardLeaders.map((row) => [
            playerDisplay(row),
            String(row.yellowCards),
            String(row.redCards),
          ])}
        />

        <StatsTable
          title="Partidos por jugador"
          emptyText="Aun no hay partidos disputados."
          columns={['Jugador', 'Equipo', 'PJ']}
          rows={matchesPlayed.map((row) => [
            playerDisplay(row),
            row.teamName,
            String(row.matchesPlayed),
          ])}
        />
      </section>

      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-900">
        <div className="flex items-start gap-2">
          <Shirt size={16} className="mt-0.5 shrink-0" />
          <p>
            Los partidos jugados se calculan localmente por pertenencia al equipo, usando partidos en vivo o finalizados. Cuando exista alineacion individual, esta tabla puede pasar a contar apariciones exactas.
          </p>
        </div>
      </div>
    </div>
  );
}

function playerDisplay(row: PlayerStats) {
  return row.playerNumber ? `#${row.playerNumber} ${row.playerName}` : row.playerName;
}

function SummaryMetric({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<{ size?: number; className?: string }> }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
        <Icon size={16} className="text-[#705d00]" />
      </div>
      <p className="mt-2 font-display text-2xl font-black text-[#0b1f18]">{value}</p>
    </div>
  );
}

function StatsTable({ title, columns, rows, emptyText }: { title: string; columns: string[]; rows: string[][]; emptyText: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs">
      <h3 className="font-display text-base font-bold text-gray-900">{title}</h3>
      <div className="mt-4 overflow-x-auto">
        {rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 py-8 text-center text-xs font-medium text-gray-400">
            {emptyText}
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="border-b border-gray-100 text-left text-[10px] uppercase tracking-widest text-gray-400">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="px-2 py-2 font-bold">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`${title}-${rowIndex}`} className="border-b border-gray-50 last:border-0">
                  {row.map((cell, cellIndex) => (
                    <td key={`${title}-${rowIndex}-${cellIndex}`} className="px-2 py-3 font-semibold text-gray-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
