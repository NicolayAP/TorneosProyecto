/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Match, Team, Tournament } from '../types';

/**
 * Downloads a structured CSV file representing the matches data
 */
export function exportMatchesToCSV(matches: Match[], tournamentName: string) {
  const headers = ['Jornada', 'Fecha', 'Hora', 'Equipo Local', 'Goles Local', 'Goles Visitante', 'Equipo Visitante', 'Sede', 'Estado', 'Arbitro'];
  
  const rows = matches.map(m => [
    m.matchday,
    m.date,
    m.time,
    m.teamAName,
    m.scoreA.toString(),
    m.scoreB.toString(),
    m.teamBName,
    m.location,
    m.status === 'live' ? 'EN VIVO' : m.status === 'finished' ? 'FINALIZADO' : 'PROGRAMADO',
    m.refereeName || 'Por definir'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const fileName = `reporte_partidos_${tournamentName.toLowerCase().replace(/\s+/g, '_')}.csv`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Downloads a structured CSV representation of the current active team rosters
 */
export function exportTeamsToCSV(teams: Team[]) {
  const headers = ['Nombre de Equipo', 'Division', 'Categoria', 'Color Hex', 'Estado', 'Total Jugadores'];
  const rows = teams.map(t => [
    t.name,
    t.division,
    t.category,
    t.color,
    t.status.toUpperCase(),
    t.playerCount.toString()
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'reporte_equipos_torneoapp.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * High-fidelity print preview trigger styled elegantly for PDF printer redirection
 */
export function triggerPDFReportPrint() {
  window.print();
}
