/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, Info } from 'lucide-react';
import { getOfflineSimState, setOfflineSimState, getOfflineChanges, uploadOfflineQueueToServer } from '../utils/storage';

interface HeaderProps {
  currentProfile: 'admin' | 'referee';
  setCurrentProfile: (role: 'admin' | 'referee') => void;
  onSyncComplete: () => void;
  onLogout: () => void;
}

export function Header({ currentProfile, onSyncComplete, onLogout }: HeaderProps) {
  const [offline, setOffline] = useState(getOfflineSimState());
  const [changesCount, setChangesCount] = useState(getOfflineChanges().length);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    const handleConnectionUpdate = () => setOffline(getOfflineSimState());
    const handleChangesUpdate = () => setChangesCount(getOfflineChanges().length);

    window.addEventListener('torneoapp_connection_change', handleConnectionUpdate);
    window.addEventListener('torneoapp_changes_count_updated', handleChangesUpdate);
    window.addEventListener('torneoapp_data_updated', handleChangesUpdate);

    return () => {
      window.removeEventListener('torneoapp_connection_change', handleConnectionUpdate);
      window.removeEventListener('torneoapp_changes_count_updated', handleChangesUpdate);
      window.removeEventListener('torneoapp_data_updated', handleChangesUpdate);
    };
  }, []);

  const toggleOfflineMode = () => {
    const nextState = !offline;
    setOffline(nextState);
    setOfflineSimState(nextState);
  };

  const syncQueue = () => {
    if (changesCount === 0) return;
    setIsSyncing(true);
    uploadOfflineQueueToServer(() => {
      setIsSyncing(false);
      onSyncComplete();
    });
  };

  return (
    <>
      <header className="no-print sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-gray-100 bg-[#fbf9f8]/90 px-4 md:px-8 backdrop-blur-md">
        {/* Branding */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b1f18] text-white">
            <span className="font-display font-extrabold text-lg text-yellow-400">T</span>
          </div>
          <div>
            <span className="font-display text-xl font-bold tracking-tight text-[#0b1f18]">TorneoApp</span>
            <span className="ml-1.5 hidden rounded-md bg-yellow-400/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-[#705d00] uppercase sm:inline-block">PWA</span>
          </div>
        </div>

        {/* Controles derecha */}
        <div className="flex items-center gap-3">

          {/* Indicador online/offline */}
          <button
            onClick={() => setShowStatusModal(true)}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition-all ${
              offline
                ? 'bg-red-50 text-red-600 border border-red-100'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            }`}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${offline ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
            <span className="hidden sm:inline">
              {offline ? 'Offline (Simulado)' : 'Online • Sincronizado'}
            </span>
            <span className="sm:hidden">{offline ? 'Offline' : 'Online'}</span>
            {changesCount > 0 && (
              <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] text-white animate-bounce">
                {changesCount}
              </span>
            )}
          </button>

          {/* Rol actual */}
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
            {currentProfile === 'admin' ? '🛡️ Administrador' : '🟨 Árbitro'}
          </span>

          {/* Cerrar sesión */}
          <button
            onClick={onLogout}
            className="rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-semibold px-3 py-1.5 hover:bg-red-100 transition-all"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Modal estado de conectividad */}
      {showStatusModal && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <h3 className="font-display text-lg font-bold text-gray-900">Estado de Conectividad PWA</h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-sm leading-relaxed text-gray-500">
                TorneoApp se comporta de manera <strong className="text-[#0b1f18]">offline-first</strong>. Puedes cambiar entre los modos Online y Offline para poner a prueba la cola de sincronización de IndexedDB.
              </p>

              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Estado Actual:</span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                    offline ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {offline ? <CloudOff size={14} /> : <Cloud size={14} />}
                    {offline ? 'MODO OFFLINE (ACTIVO)' : 'SISTEMA ONLINE'}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-xs text-gray-500">Acciones pendientes de sync:</span>
                  <span className="font-mono text-sm font-bold text-gray-900">{changesCount} cambios en espera</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={toggleOfflineMode}
                  className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
                    offline
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  Cambiar a {offline ? 'Modo Online' : 'Modo Offline'}
                </button>

                {changesCount > 0 && (
                  <button
                    onClick={syncQueue}
                    disabled={isSyncing || offline}
                    className={`flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 ${
                      offline ? 'cursor-not-allowed text-gray-400' : 'text-gray-900'
                    }`}
                  >
                    <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                    Sincronizar
                  </button>
                )}
              </div>

              {offline && (
                <div className="rounded-lg bg-amber-50 p-3 flex gap-2 border border-amber-200 text-xs text-amber-800">
                  <Info size={16} className="shrink-0 text-amber-600" />
                  <span>
                    El Modo Offline simula la pérdida total de conexión en la cancha. Todas las modificaciones se encolarán localmente y se sincronizarán al volver a activar el modo Online.
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowStatusModal(false)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200"
              >
                Cerrar Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}