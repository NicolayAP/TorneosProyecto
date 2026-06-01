/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Plus, Layers, UserPlus, Users, Trash2, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Team, Player } from '../types';
import { getTeams, addTeam, getPlayersByTeam } from '../utils/storage';
import { exportTeamsToCSV } from '../utils/export';

interface TeamsViewProps {
  onAddTeamSuccess: () => void;
}

export function TeamsView({ onAddTeamSuccess }: TeamsViewProps) {
  const [teams, setTeams] = useState<Team[]>(getTeams());
  const [search, setSearch] = useState('');
  const [showAddDrawer, setShowAddDrawer] = useState(false);

  // New team form state variables
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('Primera División A');
  const [selectedCategory, setSelectedCategory] = useState('PRO LEAGUE');
  const [selectedColor, setSelectedColor] = useState('#cd2626');
  
  // Players inside player lists inside the team registrar module
  const [playerList, setPlayerList] = useState<{ name: string; number: number; position: string }[]>([
    { name: 'Carlos Méndez', number: 10, position: 'Delantero' },
    { name: 'Santi G.', number: 9, position: 'Mediocampista' }
  ]);
  const [tempPlayerName, setTempPlayerName] = useState('');
  const [tempPlayerNumber, setTempPlayerNumber] = useState<number | ''>('');
  const [tempPlayerPosition, setTempPlayerPosition] = useState('Defensa');

  const availableColors = [
    { label: 'Rojo', value: '#dc2626' },
    { label: 'Azul', value: '#2563eb' },
    { label: 'Verde', value: '#059669' },
    { label: 'Amarillo', value: '#f59e0b' },
    { label: 'Púrpura', value: '#9333ea' },
    { label: 'Grafito', value: '#313030' },
    { label: 'Fucsia', value: '#db2777' }
  ];

  const filteredTeams = teams.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.division.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  const addNewPlayerToDraft = () => {
    if (!tempPlayerName.trim()) return;
    const numberVal = tempPlayerNumber === '' ? playerList.length + 1 : Number(tempPlayerNumber);
    setPlayerList([...playerList, {
      name: tempPlayerName,
      number: numberVal,
      position: tempPlayerPosition
    }]);
    setTempPlayerName('');
    setTempPlayerNumber('');
  };

  const removeDraftPlayer = (index: number) => {
    const listCopy = [...playerList];
    listCopy.splice(index, 1);
    setPlayerList(listCopy);
  };

  const handleRegisterTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    const newTeamId = `team_${Date.now()}`;
    const newTeamData: Team = {
      id: newTeamId,
      name: newTeamName,
      division: selectedDivision,
      category: selectedCategory,
      color: selectedColor,
      status: 'active',
      playerCount: playerList.length
    };

    const newPlayersList: Player[] = playerList.map((p, i) => ({
      id: `p_${newTeamId}_${i}`,
      teamId: newTeamId,
      name: p.name,
      number: p.number,
      position: p.position
    }));

    addTeam(newTeamData, newPlayersList);
    setTeams(getTeams()); // Refresh listings

    // Reset states
    setNewTeamName('');
    setPlayerList([
      { name: 'Juan Perez', number: 10, position: 'Delantero' },
      { name: 'Andrés Gil', number: 1, position: 'Portero' }
    ]);
    setShowAddDrawer(false);
    onAddTeamSuccess();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Area with CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-gray-900 md:text-2xl">Gestión de Clubes y Roster</h2>
          <p className="text-xs text-gray-500">Administración de identidades, colores e inscripciones de jugadores</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportTeamsToCSV(teams)}
            className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
          >
            Exportar CSV
          </button>
          <button
            onClick={() => setShowAddDrawer(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#0b1f18] px-4 py-2 text-xs font-semibold text-white hover:bg-black active:scale-95 transition-all"
          >
            <Plus size={14} />
            <span>Nuevo Club</span>
          </button>
        </div>
      </div>

      {/* 2. Search box */}
      <div className="no-print relative flex items-center">
        <span className="absolute left-3.5 text-gray-400">
          <Search size={16} />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar equipo por nombre o división..."
          className="w-full rounded-xl border border-gray-100 bg-white py-3 pl-10 pr-4 text-xs outline-hidden focus:border-[#fcba00] focus:ring-1 focus:ring-[#fcba00] shadow-2xs"
        />
      </div>

      {/* 3. Teams Bento Listings Grid */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTeams.map((team) => {
          const isSuspended = team.status === 'suspended';
          return (
            <div
              key={team.id}
              className={`group relative rounded-2xl border bg-white p-5 shadow-xs transition-all hover:shadow-md ${
                isSuspended ? 'border-red-100 bg-red-50/5' : 'border-gray-100'
              }`}
            >
              {/* Accented side vertical color representation bar */}
              <div
                className="absolute top-0 bottom-0 left-0 w-1.5 rounded-l-2xl"
                style={{ backgroundColor: team.color }}
              />

              {/* Card Meta row */}
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 uppercase font-display text-sm font-bold text-gray-400 border border-gray-100">
                  {team.name.substring(0, 2)}
                </div>

                {isSuspended ? (
                  <span className="inline-flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-[9px] font-bold text-red-700 tracking-wider uppercase font-display">
                    <AlertTriangle size={10} />
                    Suspendido
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-800 uppercase trackers-wide font-display">
                    {team.category}
                  </span>
                )}
              </div>

              {/* Roster Information layout */}
              <div className="mt-4">
                <h4 className="font-display text-base font-bold text-[#0b1f18] group-hover:text-[#705d00] transition-colors">
                  {team.name}
                </h4>
                <p className="text-xs text-gray-400 mt-1 font-semibold">{team.division}</p>
              </div>

              {/* Team specific catalog counters */}
              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-gray-50 pt-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Jugadores</p>
                  <p className="font-display text-sm font-extrabold text-gray-900">{team.playerCount}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Equipacion</p>
                  <div className="flex items-center gap-1.5">
                    <span className="h-4 w-4 rounded-full border border-gray-200" style={{ backgroundColor: team.color }} />
                    <span className="text-xs font-semibold text-gray-700">Principal</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 4. Interactive Team Creation catalog slide panel / Drawer */}
      {showAddDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white shadow-xl h-full flex flex-col justify-between animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="font-display text-lg font-bold text-gray-900">Configurar Nuevo Equipo</h3>
                <p className="text-xs text-gray-500">Asigna las planillas oficiales y el color principal</p>
              </div>
              <button
                onClick={() => setShowAddDrawer(false)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-900"
              >
                ✕
              </button>
            </div>

            {/* Drawer Form Scrollable */}
            <form onSubmit={handleRegisterTeamSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Form Team Basic details */}
              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-800">1. Datos Generales de Inscripción</label>
                
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500">Nombre Oficial del Club</label>
                  <input
                    type="text"
                    required
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Ej. Real Madrid F.C."
                    className="w-full rounded-lg border border-gray-200 p-2.5 text-xs outline-none focus:border-[#fcba00]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500">División Física</label>
                    <select
                      value={selectedDivision}
                      onChange={(e) => setSelectedDivision(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 p-2.5 text-xs outline-none bg-white"
                    >
                      <option>Primera División A</option>
                      <option>Primera División B</option>
                      <option>Segunda División</option>
                      <option>Juveniles - Sub 21</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500">Categoría Liga</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 p-2.5 text-xs outline-none bg-white"
                    >
                      <option>PRO LEAGUE</option>
                      <option>PREM</option>
                      <option>DIVISION B</option>
                      <option>SEC</option>
                    </select>
                  </div>
                </div>

                {/* Team Jersey Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500">Color Principal Equipacion</label>
                  <div className="grid grid-cols-7 gap-2">
                    {availableColors.map((col) => (
                      <button
                        key={col.value}
                        type="button"
                        onClick={() => setSelectedColor(col.value)}
                        className={`h-9 w-full rounded-lg transition-all border-2 border-transparent relative hover:scale-105 active:scale-95 ${
                          selectedColor === col.value ? 'ring-2 ring-yellow-400 scale-105' : 'shadow-xs'
                        }`}
                        style={{ backgroundColor: col.value }}
                      >
                        {selectedColor === col.value && <span className="text-white text-[10px] font-bold">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Players Roster Builder */}
              <div className="space-y-4 border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-bold text-gray-800">2. Plantilla Inicial de Jugadores</label>
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                    {playerList.length} Registrados
                  </span>
                </div>

                {/* Inline Quick Add widget */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-8 space-y-1">
                      <label className="block text-[9px] font-bold text-gray-400 uppercase">Nombre Completo</label>
                      <input
                        type="text"
                        value={tempPlayerName}
                        onChange={(e) => setTempPlayerName(e.target.value)}
                        placeholder="Luis Suarez, James..."
                        className="w-full rounded-md border border-gray-200 bg-white p-2 text-xs outline-none"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="block text-[9px] font-bold text-gray-400 uppercase">Dorsal</label>
                      <input
                        type="number"
                        value={tempPlayerNumber}
                        onChange={(e) => setTempPlayerNumber(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="Nº"
                        className="w-full rounded-md border border-gray-200 bg-white p-2 text-xs outline-none text-center"
                      />
                    </div>
                    <div className="col-span-2 flex items-end">
                      <button
                        type="button"
                        onClick={addNewPlayerToDraft}
                        className="w-full h-8 flex items-center justify-center rounded-md bg-[#0b1f18] text-white hover:bg-black transition-all"
                      >
                        <UserPlus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Posición de Campo</label>
                      <select
                        value={tempPlayerPosition}
                        onChange={(e) => setTempPlayerPosition(e.target.value)}
                        className="w-full rounded-md border border-gray-200 bg-white p-1.5 text-xs outline-none"
                      >
                        <option>Portero</option>
                        <option>Defensa</option>
                        <option>Mediocampista</option>
                        <option>Delantero</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Dynamic listed table of players drafted inside team creation */}
                <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                  {playerList.map((player, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-2.5 shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-gray-50 h-7 w-7 text-center font-display text-xs font-bold text-gray-800 flex items-center justify-center border border-gray-100">
                          {player.number}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">{player.name}</p>
                          <p className="text-[10px] text-gray-400 font-medium">{player.position}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDraftPlayer(index)}
                        className="rounded-lg p-1 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </form>

            {/* Bottom Actions of Drawer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddDrawer(false)}
                className="flex-1 rounded-xl border border-gray-200 py-3 text-xs font-bold text-gray-700 hover:bg-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRegisterTeamSubmit}
                disabled={!newTeamName.trim()}
                className="flex-1 rounded-xl bg-[#0b1f18] py-3 text-xs font-bold text-white hover:bg-black transition-all disabled:opacity-55"
              >
                Inscribir Club Oficial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
