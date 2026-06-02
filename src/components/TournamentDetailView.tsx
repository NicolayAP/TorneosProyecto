/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Users, Calendar, MapPin, Clock, CheckCircle, PlayCircle, AlertCircle, Edit2, Save, X } from 'lucide-react';
import { Tournament, Match } from '../types';
import { getTournamentById, updateTournament, getMatchesByTournament, getTeams } from '../utils/storage';

export function TournamentDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedLocation, setEditedLocation] = useState('');

  useEffect(() => {
    if (id) {
      const torneo = getTournamentById(id);
      setTournament(torneo);
      if (torneo) {
        const matchesList = getMatchesByTournament(id);
        setMatches(matchesList);
        setEditedName(torneo.name);
        setEditedLocation(torneo.location);
      }
    }

    const handleDataUpdate = () => {
      if (id) {
        const torneo = getTournamentById(id);
        setTournament(torneo);
        if (torneo) {
          const matchesList = getMatchesByTournament(id);
          setMatches(matchesList);
        }
      }
    };

    window.addEventListener('torneoapp_data_updated', handleDataUpdate);
    return () => window.removeEventListener('torneoapp_data_updated', handleDataUpdate);
  }, [id]);

  if (!tournament) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle size={48} className="text-gray-400 mb-4" />
        <p className="text-lg font-semibold text-gray-600">Torneo no encontrado</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          Volver al Inicio
        </button>
      </div>
    );
  }

  const handleStatusChange = (newStatus: 'draft' | 'active' | 'finished') => {
    const updated = { ...tournament, status: newStatus };
    updateTournament(updated);
    setTournament(updated);
  };

  const handleSaveEdit = () => {
    const updated = {
      ...tournament,
      name: editedName,
      location: editedLocation
    };
    updateTournament(updated);
    setTournament(updated);
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'active': return 'bg-green-100 text-green-700';
      case 'finished': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'active': return 'Activo';
      case 'finished': return 'Finalizado';
      default: return status;
    }
  };

  const statusFlow = [
    { value: 'draft', label: 'Borrador', description: 'En preparación' },
    { value: 'active', label: 'Activo', description: 'En ejecución' },
    { value: 'finished', label: 'Finalizado', description: 'Terminado' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
        >
          <ArrowLeft size={16} />
          <span>Volver</span>
        </button>
        <div className="flex items-center gap-2">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${getStatusColor(tournament.status)}`}>
            {getStatusLabel(tournament.status)}
          </span>
        </div>
      </div>

      {/* Main Tournament Card */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del Torneo</label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 p-2.5 text-sm font-semibold outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ubicación</label>
                  <input
                    type="text"
                    value={editedLocation}
                    onChange={(e) => setEditedLocation(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 p-2.5 text-sm outline-none focus:border-green-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center gap-2 rounded-lg bg-green-600 text-white px-3 py-2 text-xs font-semibold hover:bg-green-700"
                  >
                    <Save size={14} />
                    Guardar
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white text-gray-700 px-3 py-2 text-xs font-semibold hover:bg-gray-50"
                  >
                    <X size={14} />
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">{tournament.name}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Trophy size={16} />
                        <span>{tournament.sport}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={16} />
                        <span>{tournament.numTeams} equipos</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white text-gray-700 px-3 py-2 text-xs font-semibold hover:bg-gray-50"
                  >
                    <Edit2 size={14} />
                    Editar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 pt-6 border-t border-gray-100">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase">Formato</p>
            <p className="text-sm font-semibold text-gray-900 capitalize">{tournament.format === 'league' ? 'Liga' : tournament.format}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase">Fechas</p>
            <p className="text-sm font-semibold text-gray-900">{tournament.startDate} a {tournament.endDate}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase">Horarios</p>
            <p className="text-sm font-semibold text-gray-900">{tournament.startTime} - {tournament.endTime}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase">Ubicación</p>
            <p className="text-sm font-semibold text-gray-900">{tournament.location}</p>
          </div>
        </div>
      </section>

      {/* Status Workflow */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
        <h3 className="font-display text-sm font-bold text-gray-900 mb-4">Estado del Torneo</h3>
        <div className="flex gap-2 flex-wrap">
          {statusFlow.map((status) => {
            const isCurrentStatus = tournament.status === status.value;
            return (
              <button
                key={status.value}
                onClick={() => handleStatusChange(status.value as 'draft' | 'active' | 'finished')}
                className={`flex flex-col gap-1 rounded-lg px-4 py-3 text-xs font-semibold transition-all ${
                  isCurrentStatus
                    ? 'bg-green-600 text-white ring-2 ring-green-300'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="font-bold">{status.label}</span>
                <span className={isCurrentStatus ? 'text-green-100' : 'text-gray-500'}>{status.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Matches Summary */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-sm font-bold text-gray-900">Partidos Generados</h3>
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-yellow-100 text-yellow-700 font-bold text-xs">
            {matches.length}
          </span>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No hay partidos generados aún.</p>
            <p className="text-xs text-gray-400 mt-1">Asegúrate de que el torneo tenga equipos asignados.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {matches.map((match) => (
              <div key={match.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-all">
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">{match.matchday}</p>
                  <p className="text-sm font-semibold text-gray-900">
                    <span>{match.teamAName}</span>
                    <span className="mx-2 text-gray-400">vs</span>
                    <span>{match.teamBName}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-bold uppercase tracking-wide px-2 py-1 rounded ${
                    match.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                    match.status === 'live' ? 'bg-red-100 text-red-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {match.status === 'scheduled' ? 'Programado' : match.status === 'live' ? 'En Vivo' : 'Finalizado'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
        <h3 className="font-display text-sm font-bold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/')}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            Ver Fixtures
          </button>
          <button
            onClick={() => navigate('/')}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            Ver Equipo
          </button>
        </div>
      </section>
    </div>
  );
}
