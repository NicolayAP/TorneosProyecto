/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  FileDown,
  Pause,
  Play,
  Plus,
} from "lucide-react";
import { Match, MatchEvent, Player } from "../types";
import { getMatchEvents, addMatchEvent } from "../db/events";
import {
  finalizeMatch,
  getMatches,
  getOfflineSimState,
  getPlayersByTeam,
  updateMatch,
} from "../utils/storage";

interface RefereePortalProps {
  matchId: string;
  onBackToFixtures: () => void;
  onMatchFinalized: () => void;
}

export function RefereePortal({
  matchId,
  onBackToFixtures,
  onMatchFinalized,
}: RefereePortalProps) {
  const [match, setMatch] = useState<Match | null>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [offline, setOffline] = useState(getOfflineSimState());
  const timerWorkerRef = useRef<Worker | null>(null);
  const matchRef = useRef<Match | null>(null);

  const [showEventDialog, setShowEventDialog] = useState(false);
  const [dialogTeamId, setDialogTeamId] = useState("");
  const [dialogType, setDialogType] = useState<MatchEvent["type"]>("goal");
  const [dialogPlayerId, setDialogPlayerId] = useState("");
  const [dialogPlayerInId, setDialogPlayerInId] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    matchRef.current = match;
  }, [match]);

  useEffect(() => {
    const timerWorker = new Worker(
      new URL("../workers/matchTimer.worker.ts", import.meta.url),
      { type: "module" },
    );
    timerWorkerRef.current = timerWorker;

    timerWorker.onmessage = (
      event: MessageEvent<{ type: "tick"; seconds: number; running: boolean }>,
    ) => {
      if (event.data.type !== "tick") return;

      const nextSeconds = event.data.seconds;
      const nextMinute = Math.floor(nextSeconds / 60);
      setSeconds(nextSeconds);
      setIsPlaying(event.data.running);

      const activeMatch = matchRef.current;
      if (
        !activeMatch ||
        activeMatch.status !== "live" ||
        activeMatch.liveMinute === nextMinute
      )
        return;

      const updatedMatch = { ...activeMatch, liveMinute: nextMinute };
      updateMatch(updatedMatch);
      matchRef.current = updatedMatch;
      setMatch(updatedMatch);
    };

    return () => {
      timerWorker.postMessage({ type: "stop" });
      timerWorker.terminate();
      timerWorkerRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadMatch() {
      const activeMatch = getMatches().find((m) => m.id === matchId);
      if (!activeMatch || cancelled) return;

      setMatch(activeMatch);
      matchRef.current = activeMatch;

      const savedSeconds = (activeMatch.liveMinute ?? 0) * 60;
      setSeconds(savedSeconds);
      setIsPlaying(activeMatch.status === "live");
      timerWorkerRef.current?.postMessage(
        activeMatch.status === "live"
          ? { type: "start", seconds: savedSeconds }
          : { type: "set", seconds: savedSeconds },
      );

      setEvents(await getMatchEvents(matchId));
    }

    loadMatch();

    const handleConnectionUpdate = () => {
      setOffline(getOfflineSimState());
    };

    window.addEventListener(
      "torneoapp_connection_change",
      handleConnectionUpdate,
    );
    return () => {
      cancelled = true;
      window.removeEventListener(
        "torneoapp_connection_change",
        handleConnectionUpdate,
      );
    };
  }, [matchId]);

  if (!match) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p>Cargando controles de juego para el arbitro...</p>
      </div>
    );
  }

  const teamAPlayers = getPlayersByTeam(match.teamAId);
  const teamBPlayers = getPlayersByTeam(match.teamBId);
  const dialogTeamName =
    dialogTeamId === match.teamAId ? match.teamAName : match.teamBName;
  const dialogPlayers =
    dialogTeamId === match.teamAId ? teamAPlayers : teamBPlayers;
  const selectedPlayer = dialogPlayers.find(
    (player) => player.id === dialogPlayerId,
  );
  const selectedPlayerIn = dialogPlayers.find(
    (player) => player.id === dialogPlayerInId,
  );

  const formatTimer = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getRunningMinute = () => Math.floor(seconds / 60);

  const handleStartTimer = () => {
    const updatedMatch: Match = {
      ...match,
      status: "live",
      liveMinute: Math.floor(seconds / 60),
      additionalTimeMinutes: match.additionalTimeMinutes ?? 0,
    };

    updateMatch(updatedMatch);
    matchRef.current = updatedMatch;
    setMatch(updatedMatch);
    timerWorkerRef.current?.postMessage({ type: "start", seconds });
  };

  const handlePauseTimer = () => {
    timerWorkerRef.current?.postMessage({ type: "pause" });
  };

  const handleAddAdditionalTime = () => {
    const updatedMatch = {
      ...match,
      additionalTimeMinutes: (match.additionalTimeMinutes ?? 0) + 1,
    };

    updateMatch(updatedMatch);
    matchRef.current = updatedMatch;
    setMatch(updatedMatch);
    timerWorkerRef.current?.postMessage({ type: "add", seconds: 60 });
  };

  const openActionDialog = (teamId: string, type: MatchEvent["type"]) => {
    const players = getPlayersByTeam(teamId);

    setDialogTeamId(teamId);
    setDialogType(type);
    setDialogPlayerId(players[0]?.id || "");
    setDialogPlayerInId(type === "substitution" ? players[1]?.id || "" : "");
    setFormError("");
    setShowEventDialog(true);
  };

  const handleRegisterEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!selectedPlayer) {
      setFormError("Selecciona un jugador registrado para guardar el evento.");
      return;
    }

    if (dialogType === "substitution") {
      if (!selectedPlayerIn) {
        setFormError("Selecciona el jugador que entra.");
        return;
      }

      if (selectedPlayer.id === selectedPlayerIn.id) {
        setFormError("El jugador que sale y el que entra deben ser distintos.");
        return;
      }
    }

    const newEvent: MatchEvent = {
      id: `ev_${Date.now()}`,
      matchId: match.id,
      teamId: dialogTeamId,
      teamName: dialogTeamName,
      type: dialogType,
      minute: getRunningMinute(),
      playerId: selectedPlayer.id,
      playerName: selectedPlayer.name,
      playerNumber: selectedPlayer.number,
      playerInId: selectedPlayerIn?.id,
      playerInName: selectedPlayerIn?.name,
      playerInNumber: selectedPlayerIn?.number,
    };

    await addMatchEvent(newEvent);

    const refreshedMatch = getMatches().find((m) => m.id === match.id);
    if (refreshedMatch) setMatch(refreshedMatch);

    setEvents(await getMatchEvents(match.id));
    setShowEventDialog(false);
  };

  const handleConcludeGame = () => {
    timerWorkerRef.current?.postMessage({ type: "pause" });
    finalizeMatch(match.id);
    const refreshedMatch = getMatches().find((m) => m.id === match.id);
    if (refreshedMatch) setMatch(refreshedMatch);
    onMatchFinalized();
  };

  const eventTitle = (type: MatchEvent["type"]) => {
    if (type === "goal") return "Gol";
    if (type === "yellow_card") return "Tarjeta amarilla";
    if (type === "red_card") return "Tarjeta roja";
    return "Sustitucion";
  };

  const eventClassName = (type: MatchEvent["type"]) => {
    if (type === "goal") return "bg-emerald-50 text-emerald-700";
    if (type === "yellow_card") return "bg-yellow-50 text-yellow-700";
    if (type === "red_card") return "bg-red-50 text-red-700";
    return "bg-blue-50 text-blue-700";
  };

  const playerLabel = (player: Player) => `#${player.number} ${player.name}`;

  return (
    <div className="space-y-6 pb-16">
      <div className="no-print flex items-center justify-between">
        <button
          onClick={onBackToFixtures}
          className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
        >
          <ChevronLeft size={16} />
          <span>Volver a Partidos</span>
        </button>
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#705d00] bg-yellow-400/10 px-2 py-1 rounded">
          Mesa Tecnica - Arbitro
        </span>
      </div>

      <section className="relative overflow-hidden rounded-2xl bg-zinc-900 p-6 text-white md:p-8 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 to-[#122820] opacity-90" />
        <div className="relative z-10 flex flex-col justify-between items-center sm:flex-row gap-6">
          <div className="flex flex-col items-center flex-1 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 uppercase font-display text-lg font-black tracking-wider shadow-inner text-yellow-400">
              {match.teamAName.substring(0, 2)}
            </div>
            <h4 className="mt-2 text-sm font-black md:text-base">
              {match.teamAName}
            </h4>
            <span className="text-[10px] text-gray-400 font-bold uppercase">
              Local
            </span>
          </div>

          <div className="flex flex-col items-center shrink-0">
            <span className="text-xs font-bold text-red-500 flex items-center gap-1 animate-pulse uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
              {match.status === "live" ? "En Vivo" : "Concluido"}
            </span>
            <div className="mt-2 font-display text-4xl font-extrabold tracking-wider flex items-center gap-4">
              <span>{match.scoreA}</span>
              <span className="text-gray-500">:</span>
              <span>{match.scoreB}</span>
            </div>

            {match.status !== "finished" && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={isPlaying ? handlePauseTimer : handleStartTimer}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-white/20"
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  <span>
                    {isPlaying
                      ? "Pausa"
                      : match.status === "live"
                        ? "Reanudar"
                        : "Inicio"}
                  </span>
                </button>
                <div className="rounded-full bg-[#fcd400] text-[#6e5c00] px-3.5 py-1 text-xs font-black tracking-wider flex items-center gap-1 shadow-sm border border-yellow-300">
                  <span>{formatTimer()}</span>
                </div>
                <button
                  onClick={handleAddAdditionalTime}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-white/20"
                >
                  <Plus size={14} />
                  <span>+1 adicional</span>
                </button>
              </div>
            )}

            {(match.additionalTimeMinutes ?? 0) > 0 && (
              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-yellow-300">
                Tiempo adicional: +{match.additionalTimeMinutes}'
              </p>
            )}
          </div>

          <div className="flex flex-col items-center flex-1 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 uppercase font-display text-lg font-black tracking-wider shadow-inner text-emerald-400">
              {match.teamBName.substring(0, 2)}
            </div>
            <h4 className="mt-2 text-sm font-black md:text-base">
              {match.teamBName}
            </h4>
            <span className="text-[10px] text-gray-400 font-bold uppercase">
              Visitante
            </span>
          </div>
        </div>
      </section>

      {offline && (
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 flex gap-3 text-xs text-red-800 shadow-3xs">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-red-100 text-red-600 shrink-0">
            !
          </div>
          <div>
            <p className="font-bold">Offline activado en la cancha</p>
            <p className="mt-0.5 leading-normal text-gray-700">
              Las incidencias se guardan localmente y se sincronizan cuando
              vuelva la conexion.
            </p>
          </div>
        </div>
      )}

      {match.status === "live" && (
        <section className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
          <div className="text-center">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
              Panel de eventos del partido
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              {
                id: match.teamAId,
                name: match.teamAName,
                goalClass: "bg-emerald-600 hover:bg-emerald-700",
              },
              {
                id: match.teamBId,
                name: match.teamBName,
                goalClass: "bg-[#0b1f18] hover:bg-black",
              },
            ].map((team) => (
              <div key={team.id} className="space-y-2.5">
                <p className="text-xs font-bold text-center text-gray-600 truncate">
                  {team.name}
                </p>

                <button
                  onClick={() => openActionDialog(team.id, "goal")}
                  className={`w-full h-16 rounded-xl text-white flex flex-col items-center justify-center gap-1 active:scale-95 transition-all shadow-sm font-display text-sm font-black tracking-wide ${team.goalClass}`}
                >
                  <span>GOL</span>
                </button>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => openActionDialog(team.id, "yellow_card")}
                    className="h-14 rounded-xl bg-yellow-400 text-yellow-950 flex items-center justify-center active:scale-95 transition-all border border-yellow-500 font-bold text-[10px]"
                  >
                    Amarilla
                  </button>
                  <button
                    onClick={() => openActionDialog(team.id, "red_card")}
                    className="h-14 rounded-xl bg-red-600 text-white flex items-center justify-center active:scale-95 transition-all border border-red-700 font-bold text-[10px]"
                  >
                    Roja
                  </button>
                  <button
                    onClick={() => openActionDialog(team.id, "substitution")}
                    className="h-14 rounded-xl bg-blue-600 text-white flex items-center justify-center active:scale-95 transition-all border border-blue-700 font-bold text-[10px]"
                  >
                    Cambio
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-gray-900">
            Historial del encuentro
          </h3>
          <span className="text-[10px] font-bold text-gray-400 tracking-wider">
            CRONOLOGIA DIRECTA
          </span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {events.length === 0 ? (
            <div className="text-center py-8 bg-white border border-gray-100 rounded-xl">
              <p className="text-xs font-medium text-gray-400">
                El arbitro aun no ha registrado sucesos.
              </p>
            </div>
          ) : (
            events.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-2xs animate-in slide-in-from-left duration-200"
              >
                <span className="font-display text-sm font-black text-gray-400 shrink-0 w-8">
                  {ev.minute}'
                </span>

                <div
                  className={`px-2 py-1 rounded-full shrink-0 text-[10px] font-black uppercase ${eventClassName(ev.type)}`}
                >
                  {eventTitle(ev.type)}
                </div>

                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-900">
                    <span className="text-[10px] bg-gray-100 text-gray-600 rounded px-1">
                      {ev.teamName}
                    </span>
                  </p>
                  {ev.type === "substitution" ? (
                    <p className="text-[10px] text-gray-400 font-medium">
                      Sale: {ev.playerName} / Entra: {ev.playerInName}
                    </p>
                  ) : (
                    <p className="text-[10px] text-gray-400 font-medium">
                      Jugador: #{ev.playerNumber} {ev.playerName}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
      
      {(match.status === "live" || match.status === "finished") && (
        <div className="pt-2">
          <button
            onClick={async () => {
              const { downloadMatchPDF } = await import("../utils/pdfExport");
              await downloadMatchPDF(match, events);
            }}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
          >
            <FileDown size={16} />
            Descargar acta PDF
          </button>
        </div>
      )}
      {match.status === "live" && (
        <div className="pt-4">
          <button
            onClick={handleConcludeGame}
            className="w-full h-13 text-white rounded-xl font-display font-bold text-sm tracking-wide shadow-md hover:shadow-lg active:scale-95 transition-all text-center flex items-center justify-center gap-2"
            style={{ backgroundColor: "#ba1a1a" }}
          >
            <CheckCircle2 size={18} />
            <span>Finalizar encuentro oficial</span>
          </button>
        </div>
      )}

      {showEventDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-3">
              {eventTitle(dialogType)}
            </h4>
            <p className="text-xs text-gray-400 mb-4">
              {dialogTeamName} - minuto {getRunningMinute()}'
            </p>

            <form onSubmit={handleRegisterEventSubmit} className="space-y-4">
              {dialogPlayers.length === 0 ? (
                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-xs font-semibold text-yellow-800">
                  Este equipo no tiene jugadores registrados.
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase">
                      {dialogType === "substitution"
                        ? "Jugador que sale"
                        : "Jugador responsable"}
                    </label>
                    <select
                      required
                      value={dialogPlayerId}
                      onChange={(e) => setDialogPlayerId(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs outline-none"
                    >
                      {dialogPlayers.map((player) => (
                        <option key={player.id} value={player.id}>
                          {playerLabel(player)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {dialogType === "substitution" && (
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase">
                        Jugador que entra
                      </label>
                      <select
                        required
                        value={dialogPlayerInId}
                        onChange={(e) => setDialogPlayerInId(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs outline-none"
                      >
                        {dialogPlayers.map((player) => (
                          <option key={player.id} value={player.id}>
                            {playerLabel(player)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              {formError && (
                <p className="text-xs font-semibold text-red-600">
                  {formError}
                </p>
              )}

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
                  disabled={dialogPlayers.length === 0}
                  className="flex-1 rounded-lg bg-[#0b1f18] py-2 text-xs font-bold text-white hover:bg-black disabled:opacity-50"
                >
                  Guardar evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
