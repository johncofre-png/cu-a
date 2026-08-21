import React, { useEffect, useState } from 'react';
import { Radio, Mic, History, Star, Settings, Music, Volume2, Sparkles, RadioTower } from 'lucide-react';
import { RadioIdentity } from '../types';

interface HeaderProps {
  activeTab: 'create' | 'voces' | 'history' | 'favorites' | 'fx' | 'settings';
  setActiveTab: (tab: 'create' | 'voces' | 'history' | 'favorites' | 'fx' | 'settings') => void;
  favoritesCount: number;
  isPlaying?: boolean;
  activeRadioIdentity?: RadioIdentity;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  favoritesCount,
  isPlaying = false,
  activeRadioIdentity,
}) => {
  const [vuLeft, setVuLeft] = useState(30);
  const [vuRight, setVuRight] = useState(25);

  useEffect(() => {
    if (!isPlaying) {
      setVuLeft(8);
      setVuRight(6);
      return;
    }
    const interval = setInterval(() => {
      setVuLeft(Math.floor(Math.random() * 65) + 35);
      setVuRight(Math.floor(Math.random() * 70) + 30);
    }, 120);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const radioDisplayName = activeRadioIdentity?.radioName || 'Radio Me Gusta';
  const stationType = activeRadioIdentity?.stationType || 'Radio Online';
  const fullStationLabel = `${radioDisplayName} — ${stationType}`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#0A0515]/75 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('create')}
              className="flex items-center gap-3.5 text-left group transition-all"
            >
              <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/80 via-fuchsia-500/80 to-purple-600/80 p-[1.5px] neon-border group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#0A0515]/90 rounded-[14px] flex items-center justify-center backdrop-blur-md">
                  <Radio className="w-6 h-6 text-cyan-400 group-hover:text-fuchsia-400 transition-colors" />
                </div>
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0A0515] animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-cyan-200 to-fuchsia-400 bg-clip-text text-transparent font-display">
                    CUÑA IA
                  </span>
                  <span className="text-xs uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono-studio font-bold">
                    Radio Studio
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Emisora Activa: <span className="text-cyan-300 font-medium">{fullStationLabel}</span>
                </p>
              </div>
            </button>
          </div>

          {/* Center: Live Studio Indicators */}
          <div className="hidden lg:flex items-center gap-5 px-4 py-2 rounded-2xl glass-card">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono-studio">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block mr-0.5" />
                🟢 IA ONLINE
              </span>
            </div>

            {/* Mini VU Meter */}
            <div className="flex items-center gap-2 border-l border-white/10 pl-4">
              <span className="text-[10px] uppercase font-mono-studio text-slate-400">VU L/R</span>
              <div className="flex flex-col gap-1 w-16">
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-fuchsia-500 transition-all duration-100"
                    style={{ width: `${vuLeft}%` }}
                  />
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-fuchsia-500 transition-all duration-100"
                    style={{ width: `${vuRight}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-slate-300 border-l border-white/10 pl-4">
              <RadioTower className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-medium text-cyan-200">{fullStationLabel}</span>
            </div>
          </div>

          {/* Right Navigation */}
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'create'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white neon-border'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span className="hidden md:inline">Crear Cuña</span>
            </button>

            <button
              onClick={() => setActiveTab('voces')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'voces'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white neon-border-pink'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Volume2 className="w-4 h-4 text-pink-400" />
              <span className="hidden md:inline">Estudio de Voces</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white neon-border-pink'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="hidden md:inline">Mis Cuñas</span>
            </button>

            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'favorites'
                  ? 'glass-card text-amber-300 border-amber-500/50 bg-amber-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
              }`}
              title="Cuñas favoritas"
            >
              <Star className={`w-4 h-4 ${favoritesCount > 0 ? 'text-amber-400 fill-amber-400' : ''}`} />
              <span className="hidden sm:inline">Favoritas</span>
              {favoritesCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-xs bg-amber-500/30 text-amber-300 font-mono-studio">
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('fx')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'fx'
                  ? 'glass-card text-purple-300 border-purple-500/50 bg-purple-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
              }`}
              title="Banco de Efectos y Sonidos"
            >
              <Music className="w-4 h-4 text-purple-400" />
              <span className="hidden lg:inline">FX Banco</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all ${
                activeTab === 'settings' ? 'text-cyan-400 glass-card border-cyan-500/30' : ''
              }`}
              title="Identidad de Mi Radio & Ajustes"
            >
              <Settings className="w-4 h-4" />
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
