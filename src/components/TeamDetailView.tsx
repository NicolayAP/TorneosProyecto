/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTeams, getPlayersByTeam, addPlayer, updatePlayer, deletePlayer } from '../utils/storage';
import { ArrowLeft, Users, Plus, Trash2, Edit2 } from 'lucide-react';
import { Player, Team } from '../types';

export function TeamDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Mover getTeams() AL useEffect, no al scope del componente
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    position: 'Delantero'
  });

  const positions = [
    'Portero',
    'Defensa Central',
    'Defensa Lateral',
    'Mediocampista',
    'Mediocampista Defensivo',
    'Extremo',
    'Delantero',
    'Delantero Centro'
  ];

  // Carga inicial del equipo y jugadores
  useEffect(() => {
    if (id) {
      const teams = getTeams();
      const foundTeam = teams.find(t => t.id === id);
      setTeam(foundTeam || null);
      if (foundTeam) {
        setPlayers(getPlayersByTeam(foundTeam.id));
      }
    }
  }, [id]);

  // Escuchar cambios en los datos globales
  useEffect(() => {
    const handleDataUpdate = () => {
      if (team) {
        setPlayers(getPlayersByTeam(team.id));
      }
    };
    
    window.addEventListener('torneoapp_data_updated', handleDataUpdate);
    return () => window.removeEventListener('torneoapp_data_updated', handleDataUpdate);
  }, [team]);

  const resetForm = () => {
    setFormData({ name: '', number: '', position: 'Delantero' });
    setEditingPlayerId(null);
  };



  const handleAddClick = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditClick = (player: Player) => {
    setFormData({
      name: player.name,
      number: String(player.number),
      position: player.position
    });
    setEditingPlayerId(player.id);
    setShowForm(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.number) return;

    if (editingPlayerId) {
      // Update existing player
      const playerToUpdate = players.find(p => p.id === editingPlayerId);
      if (playerToUpdate) {
        const updated: Player = {
          ...playerToUpdate,
          name: formData.name,
          number: Number(formData.number),
          position: formData.position
        };
        updatePlayer(updated);
        setPlayers(getPlayersByTeam(team!.id));
      }
    } else {
      // Add new player
      const newPlayer: Player = {
        id: `p_${team!.id}_${Date.now()}`,
        teamId: team!.id,
        name: formData.name,
        number: Number(formData.number),
        position: formData.position
      };
      addPlayer(newPlayer);
      setPlayers(getPlayersByTeam(team!.id));
    }

    resetForm();
    setShowForm(false);
  };

  const handleDelete = (playerId: string) => {
    if (confirm('¿Está seguro de que desea eliminar este jugador?')) {
      deletePlayer(playerId);
      setPlayers(getPlayersByTeam(team!.id));
    }
  };

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#fcf9f8]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Equipo no encontrado</h1>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft size={18} />
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf9f8] flex flex-col">
      {/* Header with back button */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-blue-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#1c1b1b]">{team.name}</h1>
            <p className="text-sm text-gray-600">{team.division}</p>
          </div>
          <div
            className="w-16 h-16 rounded-full border-4 border-gray-200 shadow-sm"
            style={{ backgroundColor: team.color }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Team Info Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-[#1c1b1b] mb-4">Información del equipo</h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Categoría</p>
                <p className="text-lg font-bold text-[#1c1b1b] mt-1">{team.category}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Estado</p>
                <p className={`text-lg font-bold mt-1 ${team.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                  {team.status === 'active' ? 'Activo' : 'Suspendido'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Jugadores</p>
                <p className="text-lg font-bold text-[#1c1b1b] mt-1">{players.length}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Color</p>
                <div className="w-10 h-10 rounded-lg border-2 border-gray-300 mt-1" style={{ backgroundColor: team.color }} />
              </div>
            </div>
          </div>

          {/* Players Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Users size={20} className="text-blue-600" />
                <h2 className="text-lg font-bold text-[#1c1b1b]">Plantilla ({players.length})</h2>
              </div>
              <button
                onClick={handleAddClick}
                className="flex items-center gap-1.5 rounded-lg bg-[#0b1f18] px-4 py-2 text-xs font-semibold text-white hover:bg-black active:scale-95 transition-all"
              >
                <Plus size={16} />
                Agregar Jugador
              </button>
            </div>
            
            {players.length === 0 ? (
              <div className="text-center py-12">
                <Users size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 mb-4">No hay jugadores registrados en este equipo</p>
                <button
                  onClick={handleAddClick}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={18} />
                  Agregar primer jugador
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">#</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Nombre</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Posición</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player) => (
                      <tr key={player.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                            {player.number}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-[#1c1b1b]">{player.name}</td>
                        <td className="py-3 px-4 text-gray-600">{player.position}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditClick(player)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar jugador"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(player.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar jugador"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Player Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-xs sm:items-center">
          <div className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl animate-in slide-in-from-bottom duration-300 sm:slide-in-from-center">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {editingPlayerId ? 'Editar jugador' : 'Agregar jugador'}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{team.name}</p>
              </div>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Carlos Méndez"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700">Número</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    placeholder="Ej. 10"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700">Posición</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
                  >
                    {positions.map((pos) => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 rounded-lg text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  {editingPlayerId ? 'Guardar cambios' : 'Agregar jugador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
