import React, { useState } from 'react';
import {
  Sparkles,
  Edit3,
  Mic,
  Copy,
  Check,
  Clock,
  FileText,
  Volume2,
  Flame,
  ShoppingBag,
  Lightbulb,
  RotateCw,
  Star,
  Layers,
  Radio,
} from 'lucide-react';
import { ScriptVersion } from '../types';
import { speakTextLive, stopLiveSpeech } from '../utils/audioEngine';

interface ScriptVersionsListProps {
  versions: ScriptVersion[];
  selectedVersionId: string;
  onSelectVersion: (version: ScriptVersion) => void;
  onEditVersion: (version: ScriptVersion) => void;
  onProceedToProduction: (version: ScriptVersion) => void;
  onRegenerateSingle: (version: ScriptVersion, index: number) => Promise<void> | void;
  onRegenerateAll: () => Promise<void> | void;
  onToggleFavoriteVersion?: (version: ScriptVersion) => void;
  isRegeneratingAll?: boolean;
  regeneratingIndex?: number | null;
  voiceName: string;
  currentStyleName?: string;
  currentCunaTypeName?: string;
}

export const ScriptVersionsList: React.FC<ScriptVersionsListProps> = ({
  versions,
  selectedVersionId,
  onSelectVersion,
  onEditVersion,
  onProceedToProduction,
  onRegenerateSingle,
  onRegenerateAll,
  onToggleFavoriteVersion,
  isRegeneratingAll = false,
  regeneratingIndex = null,
  voiceName,
  currentStyleName,
  currentCunaTypeName,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingVersionId, setSpeakingVersionId] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Record<string, boolean>>({});

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleFavorite = (ver: ScriptVersion) => {
    setFavoriteIds((prev) => ({
      ...prev,
      [ver.id]: !prev[ver.id],
    }));
    if (onToggleFavoriteVersion) {
      onToggleFavoriteVersion({
        ...ver,
        isFavorite: !favoriteIds[ver.id],
      });
    }
  };

  const handleQuickListen = (version: ScriptVersion) => {
    if (speakingVersionId === version.id) {
      stopLiveSpeech();
      setSpeakingVersionId(null);
      return;
    }

    setSpeakingVersionId(version.id);
    speakTextLive(
      version.scriptText,
      voiceName,
      1.0,
      'Normal',
      () => setSpeakingVersionId(null)
    );
  };

  const getVersionBadge = (type: string, index: number) => {
    const norm = (type || '').toLowerCase();
    if (norm.includes('comercial') || index === 0) {
      return {
        icon: <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />,
        badgeColor: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-300',
        title: 'VERSIÓN 1 — COMERCIAL',
        tagline: 'Sonido profesional de radio FM, directa y vendedora.',
      };
    }
    if (norm.includes('impact') || index === 1) {
      return {
        icon: <Flame className="w-3.5 h-3.5 text-amber-400" />,
        badgeColor: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300',
        title: 'VERSIÓN 2 — IMPACTO',
        tagline: 'Hook inicial potente que atrapa al oyente al instante.',
      };
    }
    return {
      icon: <Lightbulb className="w-3.5 h-3.5 text-fuchsia-400" />,
      badgeColor: 'from-fuchsia-500/20 to-purple-500/20 border-fuchsia-500/40 text-fuchsia-300',
      title: 'VERSIÓN 3 — CREATIVA',
      tagline: 'Idea original, entretenida y memorable.',
    };
  };

  return (
    <div className="space-y-6 my-10 animate-fadeIn">
      {/* Header with Regenerate All 3 Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
                GUIONES DE PRODUCCIÓN RADIAL
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                3 versiones profesionales adaptadas a cadencia de radio FM y listas para locución.
              </p>
            </div>
          </div>
        </div>

        {/* 🔄 BOTÓN GENERAR 3 NUEVAS */}
        <button
          type="button"
          onClick={onRegenerateAll}
          disabled={isRegeneratingAll}
          className="self-start sm:self-auto py-2.5 px-4 rounded-xl glass-card hover:bg-white/10 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 hover:border-cyan-400/50 text-xs font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50"
        >
          <RotateCw className={`w-4 h-4 text-cyan-400 ${isRegeneratingAll ? 'animate-spin' : ''}`} />
          <span>{isRegeneratingAll ? 'Generando 3 nuevas...' : '🔄 GENERAR 3 NUEVAS'}</span>
        </button>
      </div>

      {/* 3 Versions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {versions.map((ver, idx) => {
          const badge = getVersionBadge(ver.versionType, idx);
          const isSelected = selectedVersionId === ver.id;
          const isPlaying = speakingVersionId === ver.id;
          const isCardRegenerating = regeneratingIndex === idx;
          const isFav = favoriteIds[ver.id] || ver.isFavorite;
          const styleDisplay = ver.styleUsed || currentStyleName || 'Potente';
          const cunaTypeDisplay = ver.cunaTypeUsed || currentCunaTypeName || 'Promoción';

          return (
            <div
              key={ver.id || idx}
              onClick={() => onSelectVersion(ver)}
              className={`rounded-3xl p-6 transition-all flex flex-col justify-between cursor-pointer border relative overflow-hidden group ${
                isSelected
                  ? 'glass-card bg-cyan-500/[0.08] neon-border -translate-y-1'
                  : 'glass-card-interactive hover:border-white/20'
              }`}
            >
              {/* Selected highlight pill */}
              {isSelected && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-cyan-500 to-blue-600 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-bl-xl font-mono-studio shadow-md z-10">
                  Seleccionada
                </div>
              )}

              {/* Card Loading Overlay during single regeneration */}
              {isCardRegenerating && (
                <div className="absolute inset-0 bg-[#080314]/85 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-3 p-4 text-center">
                  <RotateCw className="w-8 h-8 text-cyan-400 animate-spin" />
                  <p className="text-xs font-bold text-white font-mono-studio">
                    Productor recreando esta versión...
                  </p>
                </div>
              )}

              <div>
                {/* Card Header & Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border bg-gradient-to-r ${badge.badgeColor} tracking-wide`}
                  >
                    {badge.icon}
                    <span>{badge.title}</span>
                  </span>

                  {/* ⭐ FAVORITA Toggle */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(ver);
                    }}
                    title={isFav ? 'Quitar de favoritas' : 'Marcar como favorita'}
                    className={`p-1.5 rounded-lg transition-all border ${
                      isFav
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                        : 'glass-card border-white/10 text-slate-400 hover:text-amber-300'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                </div>

                <p className="text-xs text-slate-400 mb-3 italic">
                  {ver.tagline || badge.tagline}
                </p>

                {/* Script Box */}
                <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/5 min-h-[145px] flex flex-col justify-between mb-4">
                  <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-sans whitespace-pre-line font-normal">
                    {ver.scriptText}
                  </p>
                </div>

                {/* 10. INFORMACIÓN DE PRODUCCIÓN DEBAJO DE CADA VERSIÓN */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.07] space-y-2 mb-4 text-xs font-mono-studio">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      Duración estimada: {ver.estimatedSeconds || Math.round(ver.wordCount / 2.4)}s
                    </span>
                    <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      {ver.wordCount} palabras
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Radio className="w-3 h-3 text-purple-400" />
                      <strong className="text-slate-300">Estilo:</strong> {styleDisplay}
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-fuchsia-400" />
                      <strong className="text-slate-300">Tipo:</strong> {cunaTypeDisplay}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: ✏️ EDITAR, 📋 COPIAR, 🔄 REGENERAR ESTA VERSIÓN, 🎙️ GENERAR VOZ, ▶️ ESCUCHAR */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                {/* Row 1: ✏️ EDITAR, ▶️ ESCUCHAR */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditVersion(ver);
                    }}
                    className="py-2.5 px-3 rounded-xl glass-card hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 hover:border-white/25 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>✏️ EDITAR</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickListen(ver);
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      isPlaying
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                        : 'glass-card hover:bg-white/10 text-slate-200 hover:text-white border-white/10'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>{isPlaying ? '⏹️ Detener' : '▶️ Escuchar'}</span>
                  </button>
                </div>

                {/* Row 2: 📋 COPIAR & 🔄 REGENERAR ESTA VERSIÓN */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(ver.scriptText, ver.id);
                    }}
                    className="py-2.5 px-3 rounded-xl glass-card hover:bg-white/10 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 border border-white/10 transition-all"
                  >
                    {copiedId === ver.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300 font-semibold">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>📋 COPIAR</span>
                      </>
                    )}
                  </button>

                  {/* 🔄 REGENERAR ESTA VERSIÓN */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRegenerateSingle(ver, idx);
                    }}
                    disabled={isCardRegenerating}
                    className="py-2.5 px-2 rounded-xl glass-card hover:bg-white/10 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-[11px] font-semibold flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                  >
                    <RotateCw className={`w-3 h-3 text-amber-400 ${isCardRegenerating ? 'animate-spin' : ''}`} />
                    <span>🔄 REGENERAR</span>
                  </button>
                </div>

                {/* Row 3: 🎙️ GENERAR VOZ (PROCEED TO PRODUCTION) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onProceedToProduction(ver);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all glow-neon-blue active:scale-[0.98]"
                >
                  <Mic className="w-4 h-4" />
                  <span>🎙️ GENERAR VOZ & PRODUCCIÓN</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

