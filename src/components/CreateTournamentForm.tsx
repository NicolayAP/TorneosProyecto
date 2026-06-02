/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Layers, MapPin, AlignLeft, Info, Send, Save, ArrowLeft } from 'lucide-react';
import { Tournament } from '../types';
import { addTournament } from '../utils/storage';
import { generateFixtures } from '../utils/storage';
import { getTeams } from '../utils/storage';


interface CreateTournamentFormProps {
  onBackToLeagues: () => void;
  onSuccess: () => void;
}

export function CreateTournamentForm({ onBackToLeagues, onSuccess }: CreateTournamentFormProps) {
  const [name, setName] = useState('');
  const [sport, setSport] = useState('Fútbol 11');
  const [format, setFormat] = useState<'league' | 'knockout' | 'groups'>('league');
  const [numTeams, setNumTeams] = useState(16);
  const [playersPerTeam, setPlayersPerTeam] = useState(18);
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('22:00');
  const [preferredDays, setPreferredDays] = useState<string[]>(['Sáb', 'Dom']);

  const daysOptions = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const togglePreferredDay = (day: string) => {
    if (preferredDays.includes(day)) {
      setPreferredDays(preferredDays.filter(d => d !== day));
    } else {
      setPreferredDays([...preferredDays, day]);
    }
  };


  const handleCreateSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!name.trim()) return;

  const newTournament: Tournament = {
    id: `t_${Date.now()}`,
    name,
    sport,
    format,
    numTeams,
    playersPerTeam,
    startDate: startDate || '2026-10-01',
    endDate: endDate || '2026-11-15',
    status: 'draft',
    location: location || 'Canchas Municipales',
    preferredDays,
    startTime,
    endTime
  };

  // Guardar torneo
  addTournament(newTournament);
  
  // Generar fixtures automáticamente
  const teams = getTeams();
  generateFixtures(newTournament, teams);
  
  onSuccess();
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* 1. Header with Back anchor */}
      <div className="no-print flex items-center justify-between">
        <button
          onClick={onBackToLeagues}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
        >
          <ArrowLeft size={16} />
          <span>Volver a Torneos</span>
        </button>
        <span className="text-xs font-semibold text-gray-400">Paso 1 de 1 • Registro</span>
      </div>

      <div className="space-y-1.5">
        <h2 className="font-display text-xl font-bold text-gray-900 md:text-2xl">Configurar Nuevo Torneo</h2>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">MODO OFFLINE ACTIVADO AUTOMÁTICAMENTE</p>
      </div>

      <form onSubmit={handleCreateSubmit} className="space-y-6">
        {/* Step Card 1: General Info */}
        <section className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
          {/* Subtle design left tab */}
          <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-[#fcd400]" />

          <div className="flex items-center gap-2 mb-6">
            <AlignLeft size={18} className="text-[#0b1f18]" />
            <h3 className="font-display text-sm font-bold text-gray-900 uppercase tracking-wide">1. Información de Competición</h3>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-gray-500 uppercase">Nombre Completo del Torneo</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Copa de Verano Premium 2024"
                className="w-full rounded-lg border border-gray-200 p-2.5 text-xs outline-none focus:border-[#fcba00]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-500 uppercase">Deporte Regulado</label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="w-full rounded-lg border border-gray-200 p-2.5 text-xs outline-none bg-white font-medium"
              >
                <option>Fútbol 11</option>
                <option>Fútbol 7</option>
                <option>Fútsal</option>
                <option>Básquetbol</option>
                <option>Vóleibol</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-500 uppercase">Sede General / Complejo</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <MapPin size={14} />
                </span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ej. Estadio Olímpico Municipal"
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#fcba00]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Step Card 2: Tournament format selection card */}
        <section className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
          {/* Subtle design left tab */}
          <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-[#fcd400]" />

          <div className="flex items-center gap-2 mb-6">
            <Layers size={18} className="text-[#0b1f18]" />
            <h3 className="font-display text-sm font-bold text-gray-900 uppercase tracking-wide">2. Configuración de Formato</h3>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Format choice radio blocks */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase">Tipo de Fixture</label>
              <div className="space-y-2">
                {[
                  { id: 'league', label: 'Liga (Todos vs Todos)', desc: 'Fixture ida y vuelta equitativa' },
                  { id: 'knockout', label: 'Eliminación Directa', desc: 'Cruces directos con playoffs' },
                  { id: 'groups', label: 'Grupos y Final Stages', desc: 'Tablas previas + cruces de copa' }
                ].map((f) => (
                  <label
                    key={f.id}
                    className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer hover:bg-gray-50 transition-all ${
                      format === f.id
                        ? 'bg-yellow-400/10 border-yellow-400/50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tournament_format_sel"
                      checked={format === f.id}
                      onChange={() => setFormat(f.id as any)}
                      className="mt-1 text-[#0b1f18] focus:ring-[#0b1f18]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#0b1f18]">{f.label}</p>
                      <p className="text-[10px] text-gray-500 leading-normal mt-0.5">{f.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Competitor constraints details */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Límite de Equipos</label>
                  <input
                    type="number"
                    value={numTeams}
                    onChange={(e) => setNumTeams(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none"
                    min={4}
                    max={64}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Planilla Máxima de Jugadores</label>
                  <input
                    type="number"
                    value={playersPerTeam}
                    onChange={(e) => setPlayersPerTeam(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none"
                    min={5}
                    max={40}
                  />
                </div>
              </div>

              {/* Informative tips box */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 flex gap-3 text-xs text-gray-700 leading-relaxed font-medium">
                <Info size={16} className="text-gray-400 shrink-0 mt-0.5" />
                <p>
                  El algoritmo de TorneoApp creará de forma matemática un balance perfecto de fechas libres, jornadas cruzadas equitativas y asignación inicial de canchas de juego basándose en la disponibilidad elegida a continuación.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Step Card 3: Date scheduling preferred days */}
        <section className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
          {/* Subtle design left tab */}
          <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-[#fcd400]" />

          <div className="flex items-center gap-2 mb-6">
            <Calendar size={18} className="text-[#0b1f18]" />
            <h3 className="font-display text-sm font-bold text-gray-900 uppercase tracking-wide">3. Fechas y Horarios de Juego</h3>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Día Lanzamiento / Inicio</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 p-2.5 text-xs outline-none bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Clausura / Fin Estimado</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 p-2.5 text-xs outline-none bg-white"
                  />
                </div>
              </div>

              {/* Time limits range inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Inicio Jornada Diaria</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 p-2.5 text-xs outline-none bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Cierre Jornada Diaria</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 p-2.5 text-xs outline-none bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-500 uppercase">Días de la semana preferidos para partidos</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {daysOptions.map((day) => {
                  const isSelected = preferredDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => togglePreferredDay(day)}
                      className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#0b1f18] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-gray-400 leading-normal pt-2">
                * El sistema evitará asignar partidos oficiales en días distintos a los seleccionados.
              </p>
            </div>
          </div>
        </section>

        {/* Footer Actions block */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onBackToLeagues}
            className="rounded-xl border border-gray-200 px-6 py-3.5 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 active:scale-95 transition-all"
          >
            Guardar como Borrador
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-[#0b1f18] px-6 py-3.5 text-xs font-bold text-white hover:bg-black active:scale-95 transition-all shadow-md"
          >
            <Send size={14} />
            <span>Publicar Torneo Oficial</span>
          </button>
        </div>
      </form>
    </div>
  );
}
