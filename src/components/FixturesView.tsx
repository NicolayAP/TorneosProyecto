/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Filter, CalendarDays, Search, MapPin, Map, RefreshCw, PlusCircle, ArrowRight, Info, Check, ShieldAlert, X } from 'lucide-react';
import { Match, Referee } from '../types';
import { getMatches, updateMatch, getReferees } from '../utils/storage';

interface FixturesViewProps {
  onManageMatch: (matchId: string) => void;
  onOpenCreateTournament: () => void;
}

export function FixturesView({ onManageMatch, onOpenCreateTournament }: FixturesViewProps) {
  const [renderTick, setRenderTick] = useState(0);
  const matches = getMatches();
  const [showRefPicker, setShowRefPicker] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => setRenderTick(t => t + 1);
    window.addEventListener('torneoapp_data_updated', handler);
    return () => window.removeEventListener('torneoapp_data_updated', handler);
  }, []);

  // Re-read matches when renderTick changes (data updated event)
  void renderTick;

  const [search, setSearch] = useState('');
  const [selectedMatchday, setSelectedMatchday] = useState('Jornada 3');
  const [filterStatus, setFilterStatus] = useState<'all' | 'live' | 'scheduled' | 'finished'>('all');
  const [selectedStadium, setSelectedStadium] = useState('All');

  // Matchdays preloaded list content
  const matchdays = ["Jornada 1", "Jornada 2", "Jornada 3", "Jornada 4", "Jornada 5", "Fase de Grupos"];

  // Unique venues list derived
  const stadiums = ["All", "Estadio Santiago Bernabéu", "Etihad Stadium", "Anfield Road", "Cancha 1", "Cancha 2"];

  // Filter implementation
  const filteredMatches = matches.filter(m => {
    const matchesSearch = 
      m.teamAName.toLowerCase().includes(search.toLowerCase()) || 
      m.teamBName.toLowerCase().includes(search.toLowerCase()) ||
      m.tournamentName.toLowerCase().includes(search.toLowerCase());
    
    const matchesMatchday = m.matchday === selectedMatchday;
    
    const matchesStatus = 
      filterStatus === 'all' ? true : m.status === filterStatus;

    const matchesStadium = 
      selectedStadium === 'All' ? true : m.location === selectedStadium;

    return matchesSearch && matchesMatchday && matchesStatus && matchesStadium;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-gray-900 md:text-2xl">Fixtures & Programación</h2>
          <p className="text-xs text-gray-500">Agendamiento general y controladores de canchas para árbitros</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreateTournament}
            className="flex items-center gap-1.5 rounded-lg bg-[#0b1f18] px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-black active:scale-95"
          >
            <PlusCircle size={14} />
            <span>Crear Competición</span>
          </button>
        </div>
      </div>

      {/* 2. Matchdays horizontal slider */}
      <div className="no-print -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-2 scrollbar-none md:-mx-8 md:px-8">
        {matchdays.map((day) => {
          const isActive = selectedMatchday === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedMatchday(day)}
              className={`whitespace-nowrap rounded-full px-5 py-2 text-xs font-semibold tracking-wide transition-all ${
                isActive
                  ? 'bg-[#fcd400] text-[#6e5c00] font-black shadow-xs border border-yellow-300'
                  : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              {day === "Jornada 3" ? `${day} (ACTIVA)` : day}
            </button>
          );
        })}
      </div>

      {/* 3. Main Split View Grid (Matches + Filters Sidebar) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left Column: Matches list grouped by status or Date */}
        <section className="space-y-5 xl:col-span-8">
          
          {/* Quick inline search panel for Mobile */}
          <div className="no-print relative flex items-center md:hidden">
            <span className="absolute left-3.5 text-gray-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por equipo o torneo..."
              className="w-full rounded-xl border border-gray-100 bg-white py-2.5 pl-10 pr-3 text-xs outline-hidden focus:border-[#fcba00] focus:ring-1 focus:ring-[#fcba00]"
            />
          </div>

          <div className="space-y-4">
            {filteredMatches.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center shadow-xs">
                <CalendarDays size={36} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-semibold text-gray-700">No hay partidos en esta fecha</p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                  No se encontraron encuentros para <strong className="text-[#0b1f18]">{selectedMatchday}</strong> con los criterios seleccionados.
                </p>
              </div>
            ) : (
              filteredMatches.map((m) => {
                const isLive = m.status === 'live';
                const isFinished = m.status === 'finished';
                return (
                  <div
                    key={m.id}
                    className={`relative overflow-hidden rounded-2xl border bg-white shadow-xs transition-shadow hover:shadow-md ${
                      isLive 
                        ? 'border-red-200 bg-red-50/10' 
                        : isFinished 
                          ? 'border-gray-100 opacity-95' 
                          : 'border-gray-100'
                    }`}
                  >
                    {/* Visual left vertical bar matching design specs */}
                    <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                      isLive ? 'bg-red-500' : isFinished ? 'bg-gray-400' : 'bg-yellow-400'
                    }`} />

                    <div className="p-5 space-y-4">
                      {/* Card meta header */}
                      <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                            {m.tournamentName} • {m.matchday}
                          </span>
                          <span className="flex items-center gap-1 text-gray-500 mt-1 font-medium">
                            <MapPin size={12} className="text-gray-400" />
                            {m.location}
                          </span>
                        </div>

                        {/* Connection / live ticker */}
                        {isLive ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-bold text-red-700 pulse">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse"></span>
                            <span>EN VIVO (min {m.liveMinute}')</span>
                          </span>
                        ) : isFinished ? (
                          <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-600">
                            FINALIZADO
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                            PROGRAMADO
                          </span>
                        )}
                      </div>

                      {/* Score interface layout adapted responsive */}
                      <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-3 sm:items-center">
                        {/* Team A competitor */}
                        <div className="flex items-center gap-3 sm:justify-end">
                          <span className="font-display text-sm font-bold text-gray-900 order-2 sm:order-1 sm:text-base">
                            {m.teamAName}
                          </span>
                          <div className="h-9 w-9 rounded-full bg-gray-50 flex items-center justify-center font-display text-xs font-bold text-gray-500 border border-gray-100 order-1 sm:order-2">
                            {m.teamAName.substring(0,2).toUpperCase()}
                          </div>
                        </div>

                        {/* Mid score scoreboard */}
                        <div className="flex flex-col items-center justify-center">
                          {isFinished || isLive ? (
                            <div className="flex items-center gap-4 text-center">
                              <span className="font-display text-3xl font-black text-[#0b1f18]">{m.scoreA}</span>
                              <span className="text-gray-300 font-display text-xl font-bold">-</span>
                              <span className="font-display text-3xl font-black text-[#0b1f18]">{m.scoreB}</span>
                            </div>
                          ) : (
                            <div className="rounded-lg bg-gray-100 px-4 py-1.5 text-center font-display text-sm font-bold text-[#0b1f18] border border-gray-100 min-w-[100px]">
                              {m.time}
                            </div>
                          )}
                        </div>

                        {/* Team B competitor */}
                        <div className="flex items-center gap-3 justify-start">
                          <div className="h-9 w-9 rounded-full bg-gray-50 flex items-center justify-center font-display text-xs font-bold text-gray-500 border border-gray-100">
                            {m.teamBName.substring(0,2).toUpperCase()}
                          </div>
                          <span className="font-display text-sm font-bold text-gray-900 sm:text-base">
                            {m.teamBName}
                          </span>
                        </div>
                      </div>

                      {/* Card meta footer / Admin quick controller */}
                      <div className="flex flex-col gap-2 pt-3 border-t border-gray-100 sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500">
                        <p className="font-medium">
                          Árbitro Principal: <strong className="text-gray-800">{m.refereeName || 'Por definir'}</strong>
                        </p>
                        
                        <div className="flex justify-end gap-2">
                          {isLive || isFinished ? (
                            <button
                              onClick={() => onManageMatch(m.id)}
                              className={`rounded-lg px-4 py-2 font-bold tracking-wide transition-all ${
                                isLive 
                                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {isLive ? 'Controlar En Vivo' : 'Ver Estadísticas'}
                            </button>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowRefPicker(showRefPicker === m.id ? null : m.id)}
                                className="rounded-lg px-3 py-2 font-bold tracking-wide transition-all bg-[#fcd400] text-[#6e5c00] hover:bg-yellow-400"
                              >
                                {m.refereeName && m.refereeName !== 'Árbitro por asignar' ? (
                                  <span className="flex items-center gap-1.5 text-xs">
                                    <ShieldAlert size={14} />
                                    {m.refereeName}
                                  </span>
                                ) : (
                                  <span className="text-xs">Asignar Árbitro</span>
                                )}
                              </button>
                              {m.refereeName && m.refereeName !== 'Árbitro por asignar' && (
                                <button
                                  onClick={() => {
                                    m.status = 'live';
                                    m.liveMinute = 0;
                                    updateMatch(m);
                                    window.dispatchEvent(new Event('torneoapp_data_updated'));
                                    onManageMatch(m.id);
                                  }}
                                  className="rounded-lg px-3 py-2 text-xs font-bold tracking-wide transition-all bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                  Iniciar Partido
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right Sidebar: Administration filters panel */}
        <aside className="no-print space-y-6 xl:col-span-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-50 pb-3">
              <h3 className="font-display text-sm font-black text-gray-900 flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <span>Selector de Filtros</span>
              </h3>
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedStadium('All');
                  setFilterStatus('all');
                }}
                className="text-[10px] text-gray-400 font-bold tracking-wide uppercase hover:text-gray-900"
              >
                Limpiar
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Search query input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-400 uppercase">Buscar Equipo</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Real Madrid, Atlas..."
                    className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2 pl-9 pr-3 text-xs outline-hidden focus:border-[#fcba00] focus:ring-1 focus:ring-[#fcba00]"
                  />
                </div>
              </div>

              {/* Status checkboxes */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-gray-400 uppercase">Estado del Encuentro</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'live', label: 'En Vivo' },
                    { id: 'scheduled', label: 'Programado' },
                    { id: 'finished', label: 'Finalizado' }
                  ].map(stat => (
                    <button
                      key={stat.id}
                      onClick={() => setFilterStatus(stat.id as any)}
                      className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                        filterStatus === stat.id 
                          ? 'bg-[#0b1f18] text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {stat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sede lists selector dropdown */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-400 uppercase">Sede de Campo</label>
                <select
                  value={selectedStadium}
                  onChange={(e) => setSelectedStadium(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2 text-xs text-gray-700 outline-none"
                >
                  {stadiums.map((stadium) => (
                    <option key={stadium} value={stadium}>
                      {stadium === 'All' ? 'Todas las sedes' : stadium}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tournament highlight helper card for referees */}
              <div className="rounded-xl bg-yellow-400/15 p-4 border border-yellow-300/30 text-xs text-[#705d00] space-y-1.5">
                <p className="font-bold flex items-center gap-1.5">
                  <Info size={14} className="text-yellow-600" />
                  <span>Configuración Árbitros</span>
                </p>
                <p className="leading-relaxed text-gray-700 text-[11px]">
                  Todos los registrados como árbitros autorizados pueden controlar en directo las planillas, goles e incidencias desde este portal deportivo de juego.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
      {showRefPicker && (
        <RefereePickerModal
          matchId={showRefPicker}
          onClose={() => setShowRefPicker(null)}
          onStartMatch={onManageMatch}
        />
      )}
    </div>
  );
}

function RefereePickerModal({ matchId, onClose, onStartMatch }: { matchId: string; onClose: () => void; onStartMatch?: (id: string) => void }) {
  const referees = getReferees().filter(r => r.status === 'active');
  const matches = getMatches();
  const match = matches.find(m => m.id === matchId);

  const handleAssign = (referee: Referee) => {
    if (!match) return;
    match.refereeName = referee.name;
    updateMatch(match);
    window.dispatchEvent(new Event('torneoapp_data_updated'));
  };

  const handleRemove = () => {
    if (!match) return;
    match.refereeName = 'Árbitro por asignar';
    updateMatch(match);
    window.dispatchEvent(new Event('torneoapp_data_updated'));
  };

  const handleStart = () => {
    if (!match) return;
    match.status = 'live';
    match.liveMinute = 0;
    updateMatch(match);
    if (onStartMatch) onStartMatch(match.id);
  };

  if (!match) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-lg font-bold text-gray-900">Asignar Árbitro</h3>
            <p className="text-xs text-gray-500 mt-0.5">{match.teamAName} vs {match.teamBName}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900">
            <X size={18} />
          </button>
        </div>

        {match.refereeName && match.refereeName !== 'Árbitro por asignar' && (
          <div className="mb-4 rounded-xl bg-yellow-50 border border-yellow-200 p-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-yellow-800">
              Actual: <strong>{match.refereeName}</strong>
            </span>
            <button
              onClick={handleRemove}
              className="text-[10px] font-bold text-red-600 hover:text-red-800 uppercase"
            >
              Quitar
            </button>
          </div>
        )}

        {referees.length === 0 ? (
          <div className="py-8 text-center">
            <ShieldAlert size={28} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-semibold text-gray-600">No hay árbitros activos</p>
            <p className="text-xs text-gray-400 mt-1">Registra árbitros desde la sección Árbitros.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {referees.map((ref) => {
              const isSelected = match.refereeName === ref.name;
              return (
                <button
                  key={ref.id}
                  onClick={() => handleAssign(ref)}
                  className={`w-full text-left rounded-xl border p-3.5 transition-all hover:shadow-sm ${
                    isSelected
                      ? 'border-[#fcd400] bg-yellow-50'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gray-50 flex items-center justify-center font-display text-xs font-bold text-gray-500 border border-gray-100">
                        {ref.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{ref.name}</p>
                        {ref.specializations.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {ref.specializations.slice(0, 2).map((s, i) => (
                              <span key={i} className="text-[9px] font-bold text-gray-400 uppercase">{s}{i < Math.min(ref.specializations.length, 2) - 1 ? ',' : ''}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check size={18} className="text-[#fcd400]" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          {match.refereeName && match.refereeName !== 'Árbitro por asignar' && onStartMatch && (
            <button
              onClick={handleStart}
              className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
            >
              Iniciar Partido y Controlar
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
