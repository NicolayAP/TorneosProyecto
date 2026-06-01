/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, Landmark, Clock, CheckCircle, PlusCircle, ArrowRight, Download, Printer, Activity } from 'lucide-react';
import { Match, Team, Tournament } from '../types';
import { getMatches, getTeams, getTournaments } from '../utils/storage';
import { exportMatchesToCSV, triggerPDFReportPrint } from '../utils/export';

interface DashboardViewProps {
  onNavigateToTab: (tab: string) => void;
  onOpenCreateTournament: () => void;
  onOpenCreateTeam: () => void;
}

export function DashboardView({ onNavigateToTab, onOpenCreateTournament, onOpenCreateTeam }: DashboardViewProps) {
  const navigate = useNavigate();
  const matches = getMatches();
  const teams = getTeams();
  const tournaments = getTournaments();

  // Statistics derived
  const liveMatches = matches.filter(m => m.status === 'live');
  const finishedMatches = matches.filter(m => m.status === 'finished');
  const scheduledMatches = matches.filter(m => m.status === 'scheduled');

  // Filter local state for the dashboard matches table preview
  const [matchFilter, setMatchFilter] = useState<'all' | 'live' | 'scheduled'>('all');

  const filteredMatches = matches.filter(m => {
    if (matchFilter === 'live') return m.status === 'live';
    if (matchFilter === 'scheduled') return m.status === 'scheduled';
    return true;
  });

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Header Hero Panel */}
      <section className="relative overflow-hidden rounded-2xl bg-[#0b1f18] p-6 text-white md:p-8">
        <div className="relative z-10 max-w-2xl space-y-3">
          <p className="font-display text-xs font-bold tracking-widest text-yellow-400 uppercase">Panel de Control</p>
          <h2 className="font-display text-2xl font-bold md:text-3xl">¡Bienvenido, Administrador!</h2>
          <p className="text-sm text-gray-300 leading-normal">
            Gestiona torneos, publica las programaciones oficiales en tiempo real, controla las canchas y asiste a los árbitros en modo offline sin interrupciones.
          </p>
        </div>
        {/* Abstract Stadium decoration behind */}
        <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center p-4">
          <Landmark size={240} className="stroke-1" />
        </div>
      </section>

      {/* 2. Bento Core Statistics Widgets */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Leagues */}
        <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs font-bold uppercase tracking-wider text-gray-400">Torneos Activos</span>
            <span className="rounded-full bg-emerald-50 p-2 text-emerald-700">
              <Trophy size={18} />
            </span>
          </div>
          <div className="mt-4">
            <span className="font-display text-3xl font-black text-[#0b1f18]">{tournaments.length}</span>
            <span className="ml-2 text-xs font-semibold text-emerald-700">+12% esta temp</span>
          </div>
        </div>

        {/* Total Teams */}
        <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs font-bold uppercase tracking-wider text-gray-400">Equipos Registrados</span>
            <span className="rounded-full bg-yellow-400/10 p-2 text-yellow-800">
              <Users size={18} />
            </span>
          </div>
          <div className="mt-4">
            <span className="font-display text-3xl font-black text-[#0b1f18]">{teams.length}</span>
            <span className="ml-2 text-xs font-semibold text-emerald-700">+5 nuevos hoy</span>
          </div>
        </div>

        {/* Matches En Vivo */}
        <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs font-bold uppercase tracking-wider text-gray-400">Partidos En Vivo</span>
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600"></span>
            </span>
          </div>
          <div className="mt-4">
            <span className="font-display text-3xl font-black text-[#0b1f18]">{liveMatches.length}</span>
            <span className="ml-2 text-xs font-semibold text-red-600">Transmitiéndose</span>
          </div>
        </div>

        {/* Venues active */}
        <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs font-bold uppercase tracking-wider text-gray-400">Canchas Activas</span>
            <span className="rounded-full bg-blue-50 p-2 text-blue-700">
              <Landmark size={18} />
            </span>
          </div>
          <div className="mt-4">
            <span className="font-display text-3xl font-black text-[#0b1f18]">4</span>
            <span className="ml-2 text-xs text-gray-500">Complejo Principal</span>
          </div>
        </div>
      </section>

      {/* 3. Torneos Activos Section */}
      {tournaments.length > 0 && (
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg font-bold text-gray-900">Mis Torneos</h3>
              <p className="text-xs text-gray-500">Haz click en un torneo para gestionar detalles</p>
            </div>
            <button
              onClick={onOpenCreateTournament}
              className="flex items-center gap-1.5 rounded-lg bg-[#fcd400] text-[#6e5c00] px-3 py-1.5 text-xs font-bold hover:bg-yellow-400 transition-all"
            >
              <PlusCircle size={14} />
              Nuevo Torneo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tournaments.map((tournament) => (
              <button
                key={tournament.id}
                onClick={() => navigate(`/torneo/${tournament.id}`)}
                className="text-left rounded-lg border border-gray-100 bg-gray-50 p-4 hover:border-gray-300 hover:bg-white hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy size={14} className="text-yellow-600" />
                      <h4 className="font-semibold text-sm text-gray-900 group-hover:text-[#0b1f18]">{tournament.name}</h4>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{tournament.sport}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase text-gray-600 bg-gray-100">
                        {tournament.format === 'league' ? 'Liga' : tournament.format}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        tournament.status === 'draft' ? 'text-gray-600 bg-gray-100' :
                        tournament.status === 'active' ? 'text-green-700 bg-green-100' :
                        'text-blue-700 bg-blue-100'
                      }`}>
                        {tournament.status === 'draft' ? 'Borrador' : tournament.status === 'active' ? 'Activo' : 'Finalizado'}
                      </span>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all mt-1" />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 4. Main Dashboard Layout Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left/Center Column: Upcoming or Live Matches Row Preview */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs lg:col-span-8 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-50 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-gray-900">Agenda Deportiva Reciente</h3>
                <p className="text-xs text-gray-500">Cronograma rápido de partidos para hoy y ayer</p>
              </div>
              <div className="flex gap-1.5 rounded-lg bg-gray-100 p-0.5 text-xs font-semibold">
                <button
                  onClick={() => setMatchFilter('all')}
                  className={`rounded-md px-3 py-1.5 ${matchFilter === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'}`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setMatchFilter('live')}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 ${matchFilter === 'live' ? 'bg-white text-red-600 shadow-xs' : 'text-gray-500'}`}
                >
                  En Vivo
                </button>
                <button
                  onClick={() => setMatchFilter('scheduled')}
                  className={`rounded-md px-3 py-1.5 ${matchFilter === 'scheduled' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'}`}
                >
                  Programado
                </button>
              </div>
            </div>

            {/* List preview of matches */}
            <div className="mt-4 divide-y divide-gray-50">
              {filteredMatches.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm font-medium text-gray-400">No se encontraron encuentros con el filtro seleccionado.</p>
                </div>
              ) : (
                filteredMatches.map((m) => (
                  <div key={m.id} className="group flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center">
                    {/* Time & Venue */}
                    <div className="flex items-center gap-3 sm:w-28 shrink-0">
                      <div className="text-left">
                        {m.status === 'live' ? (
                          <span className="inline-flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-600 animate-pulse uppercase">
                            min {m.liveMinute}'
                          </span>
                        ) : (
                          <p className="font-display text-sm font-bold text-[#0b1f18]">{m.time}</p>
                        )}
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{m.location}</p>
                      </div>
                    </div>

                    {/* Competitors */}
                    <div className="flex flex-1 items-center justify-between sm:justify-start gap-4">
                      {/* Team A */}
                      <div className="flex flex-1 items-center justify-end gap-2.5 text-right sm:flex-none sm:w-[150px]">
                        <span className="text-xs font-bold text-gray-900 truncate">{m.teamAName}</span>
                        <div className="h-7 w-7 rounded-full bg-gray-50 flex items-center justify-center font-display text-[10px] font-bold text-gray-500 border border-gray-100 uppercase">
                          {m.teamAName.substring(0, 2)}
                        </div>
                      </div>

                      {/* Score Board Badge */}
                      <div className="rounded-lg bg-gray-50 px-3 py-1 text-center font-display text-sm font-extrabold text-gray-900 border border-gray-100 min-w-[70px]">
                        {m.status === 'scheduled' ? (
                          <span className="text-xs font-semibold text-gray-400">VS</span>
                        ) : (
                          <span>{m.scoreA} - {m.scoreB}</span>
                        )}
                      </div>

                      {/* Team B */}
                      <div className="flex flex-1 items-center justify-start gap-2.5 sm:flex-none sm:w-[150px]">
                        <div className="h-7 w-7 rounded-full bg-gray-50 flex items-center justify-center font-display text-[10px] font-bold text-gray-500 border border-gray-100 uppercase">
                          {m.teamBName.substring(0, 2)}
                        </div>
                        <span className="text-xs font-bold text-gray-900 truncate">{m.teamBName}</span>
                      </div>
                    </div>

                    {/* Quick Access Status controls */}
                    <div className="flex justify-end gap-2">
                      {m.status === 'live' ? (
                        <button
                          onClick={() => onNavigateToTab('fixtures')}
                          className="rounded-lg bg-[#fcd400] text-[#6e5c00] px-3 py-1.5 text-xs font-bold transition-all hover:bg-yellow-400"
                        >
                          Marcador
                        </button>
                      ) : (
                        <span className={`inline-flex rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                          m.status === 'finished' ? 'bg-gray-100 text-gray-600' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {m.status === 'finished' ? 'Finalizado' : 'Programado'}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-gray-50 pt-3">
            <button
              onClick={() => onNavigateToTab('fixtures')}
              className="flex items-center gap-1.5 text-xs font-bold text-[#705d00] hover:underline"
            >
              <span>Ver calendario completo</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </section>

        {/* Right Columns: Quick Actions Widget & Real Activity Ticker */}
        <section className="space-y-6 lg:col-span-4 no-print flex flex-col">
          {/* Quick Actions Card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
            <h4 className="font-display text-sm font-bold text-gray-900">Acciones Administrativas</h4>
            <div className="mt-4 gap-2 flex flex-col">
              <button
                onClick={onOpenCreateTournament}
                className="flex w-full items-center justify-between rounded-xl bg-gray-50 border border-gray-100 p-3.5 hover:bg-[#fcd400]/10 hover:border-[#fcd400]/40 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-yellow-400/10 p-2 text-yellow-800">
                    <PlusCircle size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Crear Nuevo Torneo</p>
                    <p className="text-[10px] text-gray-400 font-medium">Ida/vuelta, eliminación directa</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-gray-400 group-hover:text-[#705d00] group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={onOpenCreateTeam}
                className="flex w-full items-center justify-between rounded-xl bg-gray-50 border border-gray-100 p-3.5 hover:bg-emerald-50 hover:border-emerald-200 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Registrar Equipo</p>
                    <p className="text-[10px] text-gray-400 font-medium">Asignar colores y planillas</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-gray-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Data exporters */}
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-50">
                <button
                  onClick={() => exportMatchesToCSV(matches, "TorneoApp")}
                  className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
                >
                  <Download size={14} />
                  <span>CSV Partidos</span>
                </button>
                <button
                  onClick={triggerPDFReportPrint}
                  className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
                >
                  <Printer size={14} />
                  <span>Imprimir PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Activity Feed Widget */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={18} className="text-gray-400" />
              <h4 className="font-display text-sm font-bold text-gray-900">Historial Reciente</h4>
            </div>

            <div className="relative border-l border-gray-100 pl-4 space-y-5">
              <div className="relative">
                <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-yellow-400 ring-4 ring-white" />
                <p className="text-xs font-bold text-gray-900">Árbitro Ruiz subió resultado</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Marcador guardado: Titanes FC 2 - 1 Atlas SC.</p>
                <span className="text-[9px] font-bold text-gray-400 tracking-wider">HACE 10 MINUTOS</span>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                <p className="text-xs font-bold text-gray-900">Inscripción validada offline o local</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Se registró planilla de Dragons FC sin errores.</p>
                <span className="text-[9px] font-bold text-gray-400 tracking-wider">HACE 45 MINUTOS</span>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-white" />
                <p className="text-xs font-bold text-gray-900">Cancha 1 reservada programada</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Asignación de Estadio Olímpico oficializado.</p>
                <span className="text-[9px] font-bold text-gray-400 tracking-wider">HACE 1 HORA</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
