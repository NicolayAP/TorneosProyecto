/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { FixturesView } from './components/FixturesView';
import { TeamsView } from './components/TeamsView';
import { RefereePortal } from './components/RefereePortal';
import { CreateTournamentForm } from './components/CreateTournamentForm';
import { TeamDetailView } from './components/TeamDetailView';
import { RefereesView } from './components/RefereesView';
import { StatisticsView } from './components/StatisticsView';

import { 
  getOfflineSimState, 
  getOfflineChanges, 
  initializeDatabase,
  getTournaments
} from './utils/storage';
import { TournamentDetailView } from './components/TournamentDetailView';

import { Sparkles, WifiOff } from 'lucide-react';

export default function App() {
  // Initialize standard datasets locally inside browser storage
  useEffect(() => {
    initializeDatabase();
  }, []);

  // Screen layout router
  const [currentTab, setCurrentTab] = useState<string>('home'); // 'home' | 'fixtures' | 'teams' | 'leagues'
  const [activeProfile, setActiveProfile] = useState<'admin' | 'referee'>('admin');
  
  // Custom screen overrides
  const [overrideScreen, setOverrideScreen] = useState<'create_tournament' | 'referee_portal' | null>(null);
  const [activeMatchId, setActiveMatchId] = useState<string>('');

  // Interactive Toast states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info'>('success');
  const [syncChangesCount, setSyncChangesCount] = useState(getOfflineChanges().length);

  // Sync listener setup
  useEffect(() => {
    const handleChangesUpdate = () => {
      setSyncChangesCount(getOfflineChanges().length);
    };

    window.addEventListener('torneoapp_changes_count_updated', handleChangesUpdate);
    window.addEventListener('torneoapp_data_updated', handleChangesUpdate);

    return () => {
      window.removeEventListener('torneoapp_changes_count_updated', handleChangesUpdate);
      window.removeEventListener('torneoapp_data_updated', handleChangesUpdate);
    };
  }, []);

  const triggerToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSyncClearedSuccess = () => {
    triggerToast("Cola de sincronización enviada con éxito al servidor técnico", "success");
  };

  return (
    <Routes>
      <Route path="/equipo/:id" element={<TeamDetailView />} />
      <Route path="/torneo/:id" element={<TournamentDetailView />} />
      <Route 
        path="/" 
        element={
          <div className="min-h-screen bg-[#fcf9f8] flex flex-col font-sans text-[#1c1b1b]">
            
            {/* 1. Header component containing connection simulators */}
            <Header 
              currentProfile={activeProfile} 
              setCurrentProfile={(p) => {
                setActiveProfile(p);
                triggerToast(`Perfil cambiado a: ${p === 'admin' ? 'Coordinador Administrativo' : 'Árbitro de Campo'}`, 'info');
              }}
              onSyncComplete={handleSyncClearedSuccess}
            />

            {/* Main split-pane content coordinator */}
            <div className="flex flex-1 w-full max-w-7xl mx-auto">
              
              {/* 2. Responsive Side Navigation sidebar */}
              <Navigation 
                currentTab={currentTab} 
                setCurrentTab={(tab) => {
                  setOverrideScreen(null);
                  setCurrentTab(tab);
                }} 
                currentProfile={activeProfile}
              />

              {/* 3. Global Content canvas */}
              <main className="flex-1 px-4 py-6 md:px-8 overflow-y-auto pb-28 md:pb-12">
                
                {/* Active offline sync indicators overlay banner */}
                <div className="no-print">
                  {syncChangesCount > 0 && (
                    <div className="mb-6 rounded-xl border border-yellow-300 bg-yellow-50 p-3.5 flex items-center justify-between shadow-2xs animate-in slide-in-from-top duration-300">
                      <div className="flex items-center gap-2.5 text-xs text-yellow-800">
                        <WifiOff size={16} className="text-yellow-600 animate-bounce" />
                        <div>
                          <span className="font-bold">Offline Sync En Espera:</span> Hay{' '}
                          <strong className="underline">{syncChangesCount} acciones en cola</strong> registrados en cancha.
                        </div>
                      </div>
                      <p className="text-[10px] font-black text-[#6e5c00] tracking-wider uppercase bg-yellow-200/50 px-2 py-0.5 rounded">
                        IndexedDB activo
                      </p>
                    </div>
                  )}
                </div>

                {/* Active Screen Overrides */}
                {overrideScreen === 'create_tournament' ? (
                  <CreateTournamentForm 
                    onBackToLeagues={() => setOverrideScreen(null)}
                    onSuccess={() => {
                      setOverrideScreen(null);
                      setCurrentTab('home');
                      triggerToast("¡Torneo creado e indexado con éxito!", "success");
                    }}
                  />
                ) : overrideScreen === 'referee_portal' ? (
                  <RefereePortal 
                    matchId={activeMatchId}
                    onBackToFixtures={() => setOverrideScreen(null)}
                    onMatchFinalized={() => {
                      setOverrideScreen(null);
                      setCurrentTab('fixtures');
                      triggerToast("¡Partido finalizado y planilla homologada!", "success");
                    }}
                  />
                ) : (
                  // Core standard tabs router
                  <>
                    {currentTab === 'home' && (
                      <DashboardView 
                        onNavigateToTab={(tab) => setCurrentTab(tab)}
                        onOpenCreateTournament={() => setOverrideScreen('create_tournament')}
                        onOpenCreateTeam={() => setCurrentTab('teams')}
                      />
                    )}

                    {currentTab === 'fixtures' && (
                      <FixturesView 
                        onManageMatch={(id) => {
                          setActiveMatchId(id);
                          setOverrideScreen('referee_portal');
                        }}
                        onOpenCreateTournament={() => setOverrideScreen('create_tournament')}
                      />
                    )}

                    {currentTab === 'teams' && (
                      <TeamsView 
                        onAddTeamSuccess={() => {
                          triggerToast("Roster y datos del club guardados con éxito", "success");
                        }}
                      />
                    )}

                    {currentTab === 'referees' && (
                      <RefereesView />
                    )}

                    {currentTab === 'statistics' && (
                      <StatisticsView />
                    )}

                    {currentTab === 'leagues' && (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <h2 className="font-display text-xl font-bold text-gray-900 md:text-2xl">Torneos Programados</h2>
                            <p className="text-xs text-gray-500">Listado general de competiciones dadas de alta</p>
                          </div>
                          <button
                            onClick={() => setOverrideScreen('create_tournament')}
                            className="rounded-lg bg-[#0b1f18] text-white px-4 py-2 text-xs font-semibold hover:bg-black transition-all"
                          >
                            Nuevo Torneo
                          </button>
                        </div>

                        {/* List of active tournaments */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {getTournaments().map((t) => (
                            <div key={t.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs relative overflow-hidden group">
                              <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-[#fcd400]" />
                              <div className="flex justify-between items-start">
                                <span className="text-[10px] uppercase font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                                  {t.sport}
                                </span>
                                <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                                  {t.format.toUpperCase()}
                                </span>
                              </div>
                              <h3 className="font-display text-base font-bold text-[#0b1f18] mt-3 group-hover:text-[#705d00] transition-colors">
                                {t.name}
                              </h3>
                              <p className="text-xs text-gray-400 mt-1 font-semibold flex items-center gap-1">
                                Sede: {t.location}
                              </p>
                              
                              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-gray-50 pt-4 text-xs">
                                <div>
                                  <p className="text-[9px] font-bold text-gray-400 uppercase">Equipos</p>
                                  <p className="font-bold text-gray-800">{t.numTeams}</p>
                                </div>
                                <div>
                                  <p className="text-[9px] font-bold text-gray-400 uppercase">Días</p>
                                  <p className="font-bold text-gray-800">{t.preferredDays.join(', ')}</p>
                                </div>
                                <div>
                                  <p className="text-[9px] font-bold text-gray-400 uppercase">Inicio</p>
                                  <p className="font-bold text-gray-800">{t.startDate}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

              </main>
            </div>

            {/* 4. Global Action Success/Info Toast Alert */}
            {toastMessage && (
              <div className="no-print fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50 flex items-center gap-2.5 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3.5 text-white shadow-xl animate-in slide-in-from-bottom duration-200">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-zinc-950 font-black text-xs shrink-0">
                  ✓
                </div>
                <span className="text-xs font-semibold leading-normal">{toastMessage}</span>
              </div>
            )}

            {/* Visual background decorations keeping brand style guide clean */}
            <div className="fixed bottom-0 right-0 -z-10 opacity-3 pointer-events-none font-black text-slate-800 hidden lg:block">
              <Sparkles size={500} />
            </div>
          </div>
        }
      />
    </Routes>
  );
}
