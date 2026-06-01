/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Play, Pause, Landmark, CalendarDays, User, PlusCircle, RotateCcw, AlertTriangle, ShieldCheck, CheckCircle2, ChevronLeft } from 'lucide-react';
import { Match, MatchEvent } from '../types';
import { getMatches, updateMatch, getEventsByMatch, addMatchEvent, finalizeMatch, getOfflineSimState } from '../utils/storage';

interface RefereePortalProps {
  matchId: string;
  onBackToFixtures: () => void;
  onMatchFinalized: () => void;
}

export function RefereePortal({ matchId, onBackToFixtures, onMatchFinalized }: RefereePortalProps) {
  const [match, setMatch] = useState<Match | null>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [offline, setOffline] = useState(getOfflineSimState());

  // Input states for registering a generic event
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [dialogTeam, setDialogTeam] = useState('');
  const [dialogType, setDialogType] = useState<'goal' | 'yellow_card' | 'red_card'>('goal');
  const [dialogPlayerName, setDialogPlayerName] = useState('');
  const [dialogPlayerNumber, setDialogPlayerNumber] = useState<number | ''>('');

  // Loaded upon mount
  useEffect(() => {
    const activeMatch = getMatches().find(m => m.id === matchId);
    if (activeMatch) {
      setMatch(activeMatch);
      setEvents(getEventsByMatch(matchId).sort((a,b) => b.minute - a.minute)); // descending order
      
      // Calculate start seconds, mock 68 minutes or matching match status
      const initialMinutes = activeMatch.liveMinute || 68;
      setSeconds(initialMinutes * 60);
    }

    const handleConnectionUpdate = () => {
      setOffline(getOfflineSimState());
    };
    window.addEventListener('torneoapp_connection_change', handleConnectionUpdate);
    return () => {
      window.removeEventListener('torneoapp_connection_change', handleConnectionUpdate);
    };
  }, [matchId]);

  // Game timer clock tick
  useEffect(() => {
    if (!isPlaying || !match || match.status !== 'live') return;

    const timer = setInterval(() => {
      setSeconds(prev => {
        const nextSec = prev + 1;
        // Periodic match info sync back
        if (nextSec % 60 === 0 && match) {
          const updatedMatch = { ...match, liveMinute: Math.floor(nextSec / 60) };
          updateMatch(updatedMatch);
        }
        return nextSec;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, match]);

  if (!match) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p>Cargando controles de juego para el árbitro...</p>
      </div>
    );
  }

  const formatTimer = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRunningMinute = () => {
    return Math.floor(seconds / 60);
  };

  // Immediate Action Buttons click (Goals and Cards)
  const openActionDialog = (team: string, type: 'goal' | 'yellow_card' | 'red_card') => {
    setDialogTeam(team);
    setDialogType(type);
    
    // Quick auto-drafting standard player names if empty
    if (team === match.teamAName) {
      setDialogPlayerName('Carlos Méndez (10)');
      setDialogPlayerNumber(10);
    } else {
      setDialogPlayerName('Jordi Alba (4)');
      setDialogPlayerNumber(4);
    }

    setShowEventDialog(true);
  };

  const handleRegisterEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!match) return;

    const newEvent: MatchEvent = {
      id: `ev_${Date.now()}`,
      matchId: match.id,
      teamName: dialogTeam,
      type: dialogType,
      minute: getRunningMinute(),
      playerName: dialogPlayerName,
      playerNumber: dialogPlayerNumber === '' ? undefined : Number(dialogPlayerNumber)
    };

    // Save
    addMatchEvent(newEvent);

    // Refresh match scoreboard state after storage changes
    const refreshedMatch = getMatches().find(m => m.id === match.id);
    if (refreshedMatch) {
      setMatch(refreshedMatch);
    }
    
    setEvents(getEventsByMatch(match.id).sort((a,b) => b.minute - a.minute));
    setShowEventDialog(false);
  };

  const handleConcludeGame = () => {
    if (!match) return;
    finalizeMatch(match.id);
    const refreshedMatch = getMatches().find(m => m.id === match.id);
    if (refreshedMatch) {
      setMatch(refreshedMatch);
    }
    onMatchFinalized();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header Navigation anchor back */}
      <div className="no-print flex items-center justify-between">
        <button
          onClick={onBackToFixtures}
          className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
        >
          <ChevronLeft size={16} />
          <span>Volver a Partidos</span>
        </button>
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#705d00] bg-yellow-400/10 px-2 py-1 rounded">
          Mesa Técnica • Árbitro
        </span>
      </div>

      {/* 2. Responsive Live Scoreboard Display */}
      <section className="relative overflow-hidden rounded-2xl bg-zinc-900 p-6 text-white md:p-8 shadow-lg">
        {/* Background gradient layout */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 to-[#122820] opacity-90" />

        <div className="relative z-10 flex flex-col justify-between items-center sm:flex-row gap-6">
          
          {/* Team A Info */}
          <div className="flex flex-col items-center flex-1 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 uppercase font-display text-lg font-black tracking-wider shadow-inner text-yellow-400">
              {match.teamAName.substring(0,2)}
            </div>
            <h4 className="mt-2 text-sm font-black md:text-base">{match.teamAName}</h4>
            <span className="text-[10px] text-gray-400 font-bold uppercase">Local</span>
          </div>

          {/* Living Ticker Clock */}
          <div className="flex flex-col items-center shrink-0">
            <span className="text-xs font-bold text-red-500 flex items-center gap-1 animate-pulse uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse"></span>
              {match.status === 'live' ? 'En Vivo' : 'CONCLUIDO'}
            </span>
            <div className="mt-2 font-display text-4xl font-extrabold tracking-wider flex items-center gap-4">
              <span>{match.scoreA}</span>
              <span className="text-gray-500">:</span>
              <span>{match.scoreB}</span>
            </div>

            {/* Run controls for active referees */}
            {match.status === 'live' && (
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition-all text-white"
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <div className="rounded-full bg-[#fcd400] text-[#6e5c00] px-3.5 py-1 text-xs font-black tracking-wider flex items-center gap-1 shadow-sm border border-yellow-300">
                  <span>{formatTimer()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Team B Info */}
          <div className="flex flex-col items-center flex-1 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 uppercase font-display text-lg font-black tracking-wider shadow-inner text-emerald-400">
              {match.teamBName.substring(0,2)}
            </div>
            <h4 className="mt-2 text-sm font-black md:text-base">{match.teamBName}</h4>
            <span className="text-[10px] text-gray-400 font-bold uppercase">Visitante</span>
          </div>

        </div>
      </section>

      {/* Offline simulation alert details */}
      {offline && (
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 flex gap-3 text-xs text-red-800 shadow-3xs">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-red-100 text-red-600 shrink-0">
            !
          </div>
          <div>
            <p className="font-bold">Offline Activado en la Cancha</p>
            <p className="mt-0.5 leading-normal text-gray-700">
              Todas las incidencias cargadas se encolarán de manera local en el navegador. Las estadísticas públicas de la web se unificarán al activar el modo Online.
            </p>
          </div>
        </div>
      )}

      {/* 3. Tactical Record Buttons ("Thumb Zone" Optimization) */}
      {match.status === 'live' && (
        <section className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
          <div className="text-center">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Panel de Cambios En Campo</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Team A columns layout controls */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-center text-gray-600 truncate">{match.teamAName}</p>
              
              {/* Massive thumb safe GOAL key */}
              <button
                onClick={() => openActionDialog(match.teamAName, 'goal')}
                className="w-full h-20 rounded-xl bg-emerald-600 text-white flex flex-col items-center justify-center gap-1 active:scale-95 transition-all shadow-sm font-display text-sm font-black tracking-wide"
              >
                <span>soccer_ball</span>
                <span>GOL</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => openActionDialog(match.teamAName, 'yellow_card')}
                  className="h-14 rounded-xl bg-yellow-400 text-yellow-950 flex flex-col items-center justify-center active:scale-95 transition-all border border-yellow-500 font-bold text-[10px]"
                >
                  Amarilla
                </button>
                <button
                  onClick={() => openActionDialog(match.teamAName, 'red_card')}
                  className="h-14 rounded-xl bg-red-600 text-white flex flex-col items-center justify-center active:scale-95 transition-all border border-red-700 font-bold text-[10px]"
                >
                  Roja
                </button>
              </div>
            </div>

            {/* Team B columns layout controls */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-center text-gray-600 truncate">{match.teamBName}</p>
              
              {/* Massive thumb safe GOAL key */}
              <button
                onClick={() => openActionDialog(match.teamBName, 'goal')}
                className="w-full h-20 rounded-xl bg-[#0b1f18] text-white flex flex-col items-center justify-center gap-1 active:scale-95 transition-all shadow-lg font-display text-sm font-black tracking-wide"
              >
                <span>soccer_ball</span>
                <span>GOL</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => openActionDialog(match.teamBName, 'yellow_card')}
                  className="h-14 rounded-xl bg-yellow-400 text-yellow-950 flex flex-col items-center justify-center active:scale-95 transition-all border border-yellow-500 font-bold text-[10px]"
                >
                  Amarilla
                </button>
                <button
                  onClick={() => openActionDialog(match.teamBName, 'red_card')}
                  className="h-14 rounded-xl bg-red-600 text-white flex flex-col items-center justify-center active:scale-95 transition-all border border-red-700 font-bold text-[10px]"
                >
                  Roja
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Match Timeline chronological list */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-gray-900">Historial del Encuentro</h3>
          <span className="text-[10px] font-bold text-gray-400 tracking-wider">CRONOLOGÍA DIRECTA</span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {events.length === 0 ? (
            <div className="text-center py-8 bg-white border border-gray-100 rounded-xl">
              <p className="text-xs font-medium text-gray-400">El árbitro aún no ha registrado sucesos.</p>
            </div>
          ) : (
            events.map((ev) => (
              <div
                key={ev.id}
                className={`flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-2xs animate-in slide-in-from-left duration-200`}
              >
                <span className="font-display text-sm font-black text-gray-400 shrink-0 w-8">{ev.minute}'</span>

                <div className={`p-2 rounded-full shrink-0 ${
                  ev.type === 'goal' ? 'bg-emerald-50 text-emerald-700' : ev.type === 'yellow_card' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
                }`}>
                  {ev.type === 'goal' ? '⚽' : '🟨'}
                </div>

                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-900">
                    {ev.type === 'goal' ? '¡GOL!' : ev.type === 'yellow_card' ? 'Tarjeta Amarilla' : 'Tarjeta Roja'}{' '}
                    <span className="text-[10px] bg-gray-100 text-gray-600 rounded px-1">{ev.teamName}</span>
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium">Player: {ev.playerName}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 5. Complete Game / Conclude pitch Match Button */}
      {match.status === 'live' && (
        <div className="pt-4">
          <button
            onClick={handleConcludeGame}
            className="w-full h-13 bg-red-650 hover:bg-red-700 text-white rounded-xl font-display font-bold text-sm tracking-wide shadow-md hover:shadow-lg active:scale-95 transition-all text-center flex items-center justify-center gap-2"
            style={{ backgroundColor: '#ba1a1a' }}
          >
            <CheckCircle2 size={18} />
            <span>Finalizar Encuentro Oficial</span>
          </button>
        </div>
      )}

      {/* Incident Input Details Dialog Modal */}
      {showEventDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-3">Detalle del Evento</h4>
            <p className="text-xs text-gray-400 mb-4">Ingresa el jugador responsable para registrarlo en el minuto actual ({getRunningMinute}')</p>

            <form onSubmit={handleRegisterEventSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase">Nombre Completo del Jugador</label>
                <input
                  type="text"
                  required
                  value={dialogPlayerName}
                  onChange={(e) => setDialogPlayerName(e.target.value)}
                  placeholder="Ej. S. Gomez"
                  className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase">Dorsal Camiseta (Nº)</label>
                <input
                  type="number"
                  value={dialogPlayerNumber}
                  onChange={(e) => setDialogPlayerNumber(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="10"
                  className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none text-center"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEventDialog(false)}
                  className="flex-1 rounded-lg border border-gray-200 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-[#0b1f18] py-2 text-xs font-bold text-white hover:bg-black"
                >
                  Añadir Suceso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
