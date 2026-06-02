import React, { useState } from 'react';
import { Calendar, Layers, MapPin, AlignLeft, Info, Send, ArrowLeft, Users, CheckCircle2, Circle } from 'lucide-react';
import { Tournament, Team } from '../types';
import { addTournament, generateFixtures, getTeams } from '../utils/storage';

interface CreateTournamentFormProps {
  onBackToLeagues: () => void;
  onSuccess: () => void;
}

export function CreateTournamentForm({ onBackToLeagues, onSuccess }: CreateTournamentFormProps) {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 — datos del torneo
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

  // Step 2 — selección de equipos
  const allTeams = getTeams().filter(t => t.status === 'active');
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);

  const daysOptions = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const togglePreferredDay = (day: string) => {
    setPreferredDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleTeam = (teamId: string) => {
    setSelectedTeamIds(prev =>
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : prev.length < numTeams
          ? [...prev, teamId]
          : prev
    );
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStep(2);
  };

  const handleFinalSubmit = () => {
    if (selectedTeamIds.length < 2) return;

    const newTournament: Tournament = {
      id: `t_${Date.now()}`,
      name,
      sport,
      format,
      numTeams: selectedTeamIds.length,
      playersPerTeam,
      startDate: startDate || '2026-10-01',
      endDate: endDate || '2026-11-15',
      status: 'draft',
      location: location || 'Canchas Municipales',
      preferredDays,
      startTime,
      endTime,
    };

    addTournament(newTournament);

    // Solo los equipos seleccionados participan en este torneo
    const selectedTeams = allTeams.filter(t => selectedTeamIds.includes(t.id));
    generateFixtures(newTournament, selectedTeams);

    onSuccess();
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="no-print flex items-center justify-between">
        <button
          onClick={step === 1 ? onBackToLeagues : () => setStep(1)}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
        >
          <ArrowLeft size={16} />
          <span>{step === 1 ? 'Volver a Torneos' : 'Volver al paso 1'}</span>
        </button>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${step >= 1 ? 'bg-[#0b1f18]' : 'bg-gray-200'}`} />
          <span className={`h-2 w-2 rounded-full ${step >= 2 ? 'bg-[#0b1f18]' : 'bg-gray-200'}`} />
          <span className="text-xs font-semibold text-gray-400 ml-1">Paso {step} de 2</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <h2 className="font-display text-xl font-bold text-gray-900 md:text-2xl">
          {step === 1 ? 'Configurar Nuevo Torneo' : `Inscribir Equipos — ${name}`}
        </h2>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
          {step === 1 ? 'PASO 1 DE 2 • DATOS GENERALES' : 'PASO 2 DE 2 • SELECCIÓN DE PARTICIPANTES'}
        </p>
      </div>

      {/* ── PASO 1: Datos del torneo ── */}
      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="space-y-6">
          {/* Información general */}
          <section className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
            <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-[#fcd400]" />
            <div className="flex items-center gap-2 mb-6">
              <AlignLeft size={18} className="text-[#0b1f18]" />
              <h3 className="font-display text-sm font-bold text-gray-900 uppercase tracking-wide">1. Información de Competición</h3>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase">Nombre Completo del Torneo</label>
                <input
                  type="text" required value={name} onChange={e => setName(e.target.value)}
                  placeholder="Ej. Copa de Verano Premium 2026"
                  className="w-full rounded-lg border border-gray-200 p-2.5 text-xs outline-none focus:border-[#fcba00]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase">Deporte Regulado</label>
                <select value={sport} onChange={e => setSport(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 p-2.5 text-xs outline-none bg-white font-medium">
                  <option>Fútbol 11</option><option>Fútbol 7</option>
                  <option>Fútsal</option><option>Básquetbol</option><option>Vóleibol</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase">Sede General / Complejo</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><MapPin size={14} /></span>
                  <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                    placeholder="Ej. Estadio Olímpico Municipal"
                    className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#fcba00]" />
                </div>
              </div>
            </div>
          </section>

          {/* Formato */}
          <section className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
            <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-[#fcd400]" />
            <div className="flex items-center gap-2 mb-6">
              <Layers size={18} className="text-[#0b1f18]" />
              <h3 className="font-display text-sm font-bold text-gray-900 uppercase tracking-wide">2. Formato de Competición</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase">Tipo de Fixture</label>
                <div className="space-y-2">
                  {[
                    { id: 'league', label: 'Liga (Todos vs Todos)', desc: 'Fixture ida y vuelta equitativa' },
                    { id: 'knockout', label: 'Eliminación Directa', desc: 'Cruces directos con playoffs' },
                    { id: 'groups', label: 'Grupos y Final Stages', desc: 'Tablas previas + cruces de copa' }
                  ].map(f => (
                    <label key={f.id}
                      className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer hover:bg-gray-50 transition-all ${format === f.id ? 'bg-yellow-400/10 border-yellow-400/50' : 'border-gray-200 bg-white'}`}>
                      <input type="radio" name="format" checked={format === f.id}
                        onChange={() => setFormat(f.id as any)} className="mt-1" />
                      <div>
                        <p className="text-xs font-bold text-[#0b1f18]">{f.label}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{f.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 uppercase">Límite de Equipos</label>
                    <input type="number" value={numTeams} onChange={e => setNumTeams(Number(e.target.value))}
                      className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none" min={2} max={64} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 uppercase">Jugadores por Planilla</label>
                    <input type="number" value={playersPerTeam} onChange={e => setPlayersPerTeam(Number(e.target.value))}
                      className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none" min={5} max={40} />
                  </div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 flex gap-3 text-xs text-gray-700 leading-relaxed font-medium">
                  <Info size={16} className="text-gray-400 shrink-0 mt-0.5" />
                  <p>En el siguiente paso elegirás qué equipos ya registrados participan. El fixture se generará automáticamente con esos equipos.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Fechas */}
          <section className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
            <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-[#fcd400]" />
            <div className="flex items-center gap-2 mb-6">
              <Calendar size={18} className="text-[#0b1f18]" />
              <h3 className="font-display text-sm font-bold text-gray-900 uppercase tracking-wide">3. Fechas y Horarios</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 uppercase">Fecha Inicio</label>
                    <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 p-2.5 text-xs outline-none bg-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 uppercase">Fecha Fin</label>
                    <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 p-2.5 text-xs outline-none bg-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 uppercase">Hora Inicio</label>
                    <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 p-2.5 text-xs outline-none bg-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 uppercase">Hora Cierre</label>
                    <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 p-2.5 text-xs outline-none bg-white" />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-500 uppercase">Días preferidos para partidos</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {daysOptions.map(day => (
                    <button key={day} type="button" onClick={() => togglePreferredDay(day)}
                      className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${preferredDays.includes(day) ? 'bg-[#0b1f18] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button type="button" onClick={onBackToLeagues}
              className="rounded-xl border border-gray-200 px-6 py-3.5 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 active:scale-95 transition-all">
              Cancelar
            </button>
            <button type="submit"
              className="flex items-center gap-2 rounded-xl bg-[#0b1f18] px-6 py-3.5 text-xs font-bold text-white hover:bg-black active:scale-95 transition-all shadow-md">
              <Users size={14} />
              <span>Siguiente: Elegir Equipos</span>
            </button>
          </div>
        </form>
      )}

      {/* ── PASO 2: Selección de equipos ── */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Contador */}
          <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fcd400] font-display text-lg font-black text-[#6e5c00]">
                {selectedTeamIds.length}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Equipos seleccionados</p>
                <p className="text-xs text-gray-400">Máximo {numTeams} • mínimo 2</p>
              </div>
            </div>
            {selectedTeamIds.length >= 2 && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                ✓ Listo para generar fixture
              </span>
            )}
          </div>

          {/* Lista de equipos disponibles */}
          {allTeams.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
              <Users size={36} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-700">No hay equipos registrados</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                Ve a <strong>Gestión de Clubes</strong> y registra al menos 2 equipos antes de crear un torneo.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {allTeams.map(team => {
                const selected = selectedTeamIds.includes(team.id);
                const maxReached = !selected && selectedTeamIds.length >= numTeams;
                return (
                  <button
                    key={team.id}
                    onClick={() => !maxReached && toggleTeam(team.id)}
                    disabled={maxReached}
                    className={`relative flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                      selected
                        ? 'border-[#fcd400] bg-yellow-400/10 shadow-sm'
                        : maxReached
                          ? 'border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed'
                          : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    {/* Color bar */}
                    <div className="absolute top-0 bottom-0 left-0 w-1 rounded-l-2xl" style={{ backgroundColor: team.color }} />

                    {/* Icono equipo */}
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 border border-gray-100 font-display text-sm font-bold text-gray-500 shrink-0">
                      {team.name.substring(0, 2).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{team.name}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{team.division} · {team.playerCount} jugadores</p>
                    </div>

                    {/* Checkbox visual */}
                    <div className={`shrink-0 ${selected ? 'text-[#6e5c00]' : 'text-gray-300'}`}>
                      {selected ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Aviso si no hay suficientes */}
          {selectedTeamIds.length < 2 && allTeams.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 flex gap-2 text-xs text-amber-800">
              <Info size={14} className="shrink-0 mt-0.5 text-amber-600" />
              <span>Selecciona al menos <strong>2 equipos</strong> para poder generar el fixture del torneo.</span>
            </div>
          )}

          {/* Acciones finales */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button onClick={() => setStep(1)}
              className="rounded-xl border border-gray-200 px-6 py-3.5 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 active:scale-95 transition-all">
              Atrás
            </button>
            <button
              onClick={handleFinalSubmit}
              disabled={selectedTeamIds.length < 2}
              className="flex items-center gap-2 rounded-xl bg-[#0b1f18] px-6 py-3.5 text-xs font-bold text-white hover:bg-black active:scale-95 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={14} />
              <span>Publicar Torneo con {selectedTeamIds.length} equipos</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}