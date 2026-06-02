/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, Trophy, CalendarDays, Layers, ShieldAlert, BarChart3 } from 'lucide-react';

interface NavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentProfile: 'admin' | 'referee';
}

export function Navigation({ currentTab, setCurrentTab, currentProfile }: NavigationProps) {
  const navItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'leagues', label: 'Torneos', icon: Trophy },
    { id: 'fixtures', label: 'Partidos', icon: CalendarDays },
    { id: 'teams', label: 'Equipos', icon: Layers },
    { id: 'statistics', label: 'Estadisticas', icon: BarChart3 },
    { id: 'referees', label: 'Árbitros', icon: ShieldAlert },
  ];

  return (
    <>
      {/* 1. Desktop Sidebar (md:flex hidden) */}
      <aside className="no-print sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 border-r border-gray-100 bg-[#fefdfd] p-4 md:flex flex-col justify-between">
        <div className="space-y-6">
          <div className="px-2">
            <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Panel de Control</p>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#fcd400] text-[#6e5c00] font-bold shadow-xs'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info within Sidebar */}
        <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>Servidor Optimizado</span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500 leading-normal">
            La base de datos local está en caché. Listo para operar en campo o vestuario sin internet.
          </p>
        </div>
      </aside>

      {/* 2. Mobile Bottom Navigation Bar (md:hidden flex) */}
      <nav className="no-print fixed bottom-0 left-0 z-50 flex h-20 w-full items-center justify-around border-t border-gray-100 bg-white/95 pb-safe px-2 shadow-lg backdrop-blur-md md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className="group flex flex-col items-center justify-center py-2 px-3 focus:outline-none"
              style={{ minWidth: '4.5rem', minHeight: '3rem' }} // Touch safe target
            >
              <div
                className={`flex h-10 w-14 items-center justify-center rounded-2xl transition-all ${
                  isActive ? 'bg-[#fcd400] text-[#6e5c00]' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
              </div>
              <span
                className={`text-[10px] mt-1 tracking-wider uppercase font-bold transition-all ${
                  isActive ? 'text-[#0b1f18] font-black' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
