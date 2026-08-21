import React, { useState } from 'react';
import { Music, Zap, Volume2, Sparkles, Radio, Play, Pause } from 'lucide-react';
import { SoundEffectType, MusicGenre } from '../types';
import { playRadioSoundFx, playAmbientMusicBed } from '../utils/audioEngine';

const FX_LIST: { id: SoundEffectType; label: string; desc: string; icon: string; color: string }[] = [
  { id: 'Whoosh', label: 'Whoosh', desc: 'Ráfaga de aire rápida para transición de secciones', icon: '💨', color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-300' },
  { id: 'Impact', label: 'Impact', desc: 'Golpe profundo sub-grave para aperturas con fuerza', icon: '💥', color: 'from-red-500/20 to-orange-500/20 border-red-500/40 text-red-300' },
  { id: 'Bass Drop', label: 'Bass Drop', desc: 'Sub-bass 808 para remates de marcas y canciones', icon: '🔊', color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/40 text-purple-300' },
  { id: 'Radio Sweep', label: 'Radio Sweep', desc: 'Efecto de barrido modulado y transición de señal', icon: '📻', color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/40 text-amber-300' },
  { id: 'Riser', label: 'Riser', desc: 'Subida progresiva en tensión antes de dar una noticia o promo', icon: '📈', color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300' },
  { id: 'Sweep', label: 'Sweep', desc: 'Filtro resonante de alta velocidad para sweeps', icon: '🌊', color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/40 text-blue-300' },
  { id: 'Hit', label: 'Hit', desc: 'Impacto metálico corto para acentuar nombres y fechas', icon: '⚡', color: 'from-pink-500/20 to-rose-500/20 border-pink-500/40 text-pink-300' },
  { id: 'Glitch', label: 'Glitch', desc: 'Efecto digital entrecortado estilo radio moderna', icon: '👾', color: 'from-fuchsia-500/20 to-purple-500/20 border-fuchsia-500/40 text-fuchsia-300' },
  { id: 'Spark', label: 'Spark', desc: 'Brillo agudo de campanas para cuñas elegantes o navideñas', icon: '✨', color: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/40 text-yellow-300' },
  { id: 'Transición', label: 'Transición', desc: 'Paso estéreo panorámico dinámico', icon: '🔄', color: 'from-indigo-500/20 to-cyan-500/20 border-indigo-500/40 text-indigo-300' },
];

const AMBIENT_BEDS: { id: MusicGenre; label: string; desc: string; icon: string }[] = [
  { id: 'Pop', label: 'Pop Radio', desc: 'Arpegios alegres y brillantes', icon: '🎸' },
  { id: 'Dance', label: 'Dance / EDM', desc: 'Pulso de club y bajos potentes', icon: '🪩' },
  { id: 'Urbano', label: 'Urbano / Reggaetón', desc: 'Ritmo sincopado de calle', icon: '🎧' },
  { id: 'Electrónico', label: 'Electrónico', desc: 'Sintetizadores análogos', icon: '⚡' },
  { id: 'Sexy', label: 'Sexy / Lounge', desc: 'Jazz suave y acordes seductores', icon: '💋' },
  { id: 'Nocturno', label: 'Nocturno', desc: 'Ambiente profundo y cálido', icon: '🌙' },
  { id: 'Alegre', label: 'Alegre', desc: 'Vibra positiva matinal', icon: '🎉' },
  { id: 'Corporativo', label: 'Corporativo', desc: 'Institucional y claro', icon: '💼' },
  { id: 'Cinemático', label: 'Cinemático', desc: 'Suspenso y orquesta épica', icon: '🎬' },
];

export const FxSoundboard: React.FC = () => {
  const [activeFx, setActiveFx] = useState<string | null>(null);
  const [currentAmbient, setCurrentAmbient] = useState<MusicGenre | null>(null);
  const [musicController, setMusicController] = useState<{ stop: () => void } | null>(null);

  const triggerFx = (fx: SoundEffectType) => {
    setActiveFx(fx);
    playRadioSoundFx(fx, 0.9);
    setTimeout(() => setActiveFx(null), 700);
  };

  const toggleAmbient = (genre: MusicGenre) => {
    if (currentAmbient === genre) {
      if (musicController) {
        musicController.stop();
        setMusicController(null);
      }
      setCurrentAmbient(null);
      return;
    }

    if (musicController) {
      musicController.stop();
    }

    setCurrentAmbient(genre);
    const ctrl = playAmbientMusicBed(genre, 0.5);
    setMusicController(ctrl);
  };

  return (
    <div className="space-y-8 my-8">
      {/* Header */}
      <div className="pb-6 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-400">
            <Zap className="w-6 h-6" />
          </span>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              BANCO DE EFECTOS RADIALES & CAMAS
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Prueba en vivo los sonidos y música procedural sintetizados por el motor de audio.
            </p>
          </div>
        </div>
      </div>

      {/* Radio FX Trigger Pads */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            PADS DE EFECTOS DE LOCUCIÓN (SOUND FX)
          </h3>
          <span className="text-xs text-slate-400">Toca para disparar</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {FX_LIST.map((fx) => {
            const isFired = activeFx === fx.id;
            return (
              <button
                key={fx.id}
                type="button"
                onClick={() => triggerFx(fx.id)}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between group active:scale-95 ${
                  isFired
                    ? 'bg-cyan-400 text-black border-cyan-300 scale-105 shadow-xl shadow-cyan-500/40 glow-neon-blue'
                    : `glass-card-interactive border-white/[0.08] hover:border-cyan-500/40`
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{fx.icon}</span>
                  <span className={`text-[10px] font-mono-studio px-2 py-0.5 rounded ${isFired ? 'bg-black/20 text-black' : 'glass-card text-white'}`}>
                    PLAY
                  </span>
                </div>
                <div className="mt-3">
                  <p className={`font-extrabold text-sm font-display truncate ${isFired ? 'text-black' : 'text-white group-hover:text-cyan-300'}`}>
                    {fx.label}
                  </p>
                  <p className={`text-[10px] line-clamp-2 mt-1 ${isFired ? 'text-black/80' : 'text-slate-400'}`}>
                    {fx.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ambient Music Beds */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Music className="w-4 h-4 text-fuchsia-400" />
            CAMAS MUSICALES PROCEDURALES (RADIO BEDS)
          </h3>
          {currentAmbient && (
            <button
              onClick={() => {
                if (musicController) musicController.stop();
                setCurrentAmbient(null);
              }}
              className="text-xs px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30"
            >
              ⏹️ Detener música activa
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {AMBIENT_BEDS.map((bed) => {
            const isPlaying = currentAmbient === bed.id;
            return (
              <div
                key={bed.id}
                onClick={() => toggleAmbient(bed.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                  isPlaying
                    ? 'bg-gradient-to-r from-fuchsia-950/60 to-purple-950/60 neon-border-pink shadow-lg shadow-fuchsia-500/20 glow-neon-pink'
                    : 'glass-card-interactive border-white/[0.08] hover:border-fuchsia-500/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-2 rounded-xl bg-white/5">{bed.icon}</span>
                  <div>
                    <h4 className="font-bold text-sm text-white group-hover:text-fuchsia-300 font-display">
                      {bed.label}
                    </h4>
                    <p className="text-[11px] text-slate-400">{bed.desc}</p>
                  </div>
                </div>

                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                    isPlaying
                      ? 'bg-fuchsia-500 text-white border-fuchsia-400 animate-pulse'
                      : 'glass-card text-slate-400 border-white/10 group-hover:text-white'
                  }`}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
