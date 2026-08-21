import React, { useState } from 'react';
import {
  Mic,
  Volume2,
  Gauge,
  Activity,
  Sliders,
  Sparkles,
  Play,
  Square,
  Check,
  Zap,
  Flame,
  Radio,
  SlidersHorizontal,
  Info,
  CheckCircle2,
} from 'lucide-react';
import {
  VoiceProfile,
  VoiceProfileId,
  VoiceEmotion,
  VoicePauseStyle,
  VoiceInterpretationConfig,
  ScriptVersion,
} from '../types';
import { VOICE_PROFILES, EMOTIONS, PAUSE_STYLES } from '../data/voices';
import { speakTextLive, stopLiveSpeech } from '../utils/audioEngine';

interface VoiceStudioProps {
  selectedScript: ScriptVersion | null;
  currentConfig: VoiceInterpretationConfig;
  onChangeConfig: (config: VoiceInterpretationConfig) => void;
  onGenerateAudio: () => void;
  isGeneratingAudio: boolean;
  audioGenerationStep: string;
  audioProgress: number;
}

export const VoiceStudio: React.FC<VoiceStudioProps> = ({
  selectedScript,
  currentConfig,
  onChangeConfig,
  onGenerateAudio,
  isGeneratingAudio,
  audioGenerationStep,
  audioProgress,
}) => {
  const [auditioningVoiceId, setAuditioningVoiceId] = useState<string | null>(null);

  const selectedProfile =
    VOICE_PROFILES.find((v) => v.id === currentConfig.voiceId) || VOICE_PROFILES[0];

  const handleSelectVoice = (voice: VoiceProfile) => {
    onChangeConfig({
      ...currentConfig,
      voiceId: voice.id,
      voiceName: voice.name,
    });
  };

  const handleAuditionSample = (voice: VoiceProfile) => {
    if (auditioningVoiceId === voice.id) {
      stopLiveSpeech();
      setAuditioningVoiceId(null);
      return;
    }

    stopLiveSpeech();
    setAuditioningVoiceId(voice.id);

    // Audition sample text with the profile's speed & pitch settings
    const pitch =
      voice.gender === 'Femenina'
        ? voice.id === 'valentina'
          ? 'Grave'
          : 'Agudo'
        : voice.id === 'max'
        ? 'Grave'
        : 'Normal';

    speakTextLive(
      voice.sampleText,
      `${voice.gender === 'Femenina' ? 'Voz femenina' : 'Voz masculina'} ${voice.name}`,
      currentConfig.speed as any,
      pitch as any,
      () => setAuditioningVoiceId(null)
    );
  };

  const femaleVoices = VOICE_PROFILES.filter((v) => v.gender === 'Femenina');
  const maleVoices = VOICE_PROFILES.filter((v) => v.gender === 'Masculina');

  return (
    <div id="estudio-de-voces" className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl my-8">
      {/* Background ambient lighting */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] relative z-10">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-500/30 text-fuchsia-400">
            <Mic className="w-6 h-6" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
                ESTUDIO DE VOCES
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                PRODUCER FX
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Elige y calibra la locución perfecta para tu cuña radial antes de generar el máster.
            </p>
          </div>
        </div>

        {/* Currently active voice summary badge */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl glass-card border border-white/10 self-start sm:self-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <div className="text-xs font-mono-studio">
            <span className="text-slate-400">Voz activa: </span>
            <strong className="text-white font-bold">{selectedProfile.name}</strong>
            <span className="text-cyan-300 ml-1">({selectedProfile.gender})</span>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-10 relative z-10">
        {/* ========================================================= */}
        {/* 1. SELECCIÓN DE PERFILES DE VOZ (FEMENINAS & MASCULINAS) */}
        {/* ========================================================= */}
        <div className="space-y-8">
          {/* FEMENINAS */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-pink-400" />
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-display">
                VOCES FEMENINAS
              </h3>
              <span className="text-xs text-slate-400 font-mono-studio">(4 perfiles)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {femaleVoices.map((voice) => {
                const isSelected = currentConfig.voiceId === voice.id;
                const isAuditioning = auditioningVoiceId === voice.id;

                return (
                  <div
                    key={voice.id}
                    onClick={() => handleSelectVoice(voice)}
                    className={`rounded-2xl p-5 transition-all cursor-pointer flex flex-col justify-between border relative overflow-hidden group ${
                      isSelected
                        ? 'glass-card bg-pink-500/[0.08] border-pink-400/80 shadow-lg shadow-pink-500/10 ring-1 ring-pink-400/40 -translate-y-0.5'
                        : 'glass-card-interactive hover:border-white/20'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 right-0 bg-pink-500 text-white text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-bl-lg font-mono-studio">
                        Seleccionada
                      </div>
                    )}

                    <div>
                      {/* Name & Avatar */}
                      <div className="flex items-start justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xl p-1.5 rounded-xl bg-black/40 border border-white/10">
                            {voice.avatarIcon || '🎙️'}
                          </span>
                          <div>
                            <h4 className="font-extrabold text-base text-white font-display">
                              {voice.name}
                            </h4>
                            <span className="text-[11px] font-mono-studio text-pink-300">
                              {voice.style}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Personality */}
                      <p className="text-xs text-slate-300 leading-relaxed mb-3">
                        {voice.personality}
                      </p>

                      {/* TTS Ready Badge */}
                      <div className="mb-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono-studio">
                          <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                          {voice.badge}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons: ▶️ Escuchar Muestra & SELECCIONAR */}
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAuditionSample(voice);
                        }}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                          isAuditioning
                            ? 'bg-pink-500 text-white border-pink-400 animate-pulse'
                            : 'glass-card text-slate-200 hover:text-white border-white/10'
                        }`}
                        title="Escuchar muestra"
                      >
                        {isAuditioning ? (
                          <>
                            <Square className="w-3 h-3 fill-current" />
                            <span>Parar</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-current" />
                            <span>Muestra</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectVoice(voice);
                        }}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30'
                            : 'glass-card hover:bg-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        {isSelected ? '✓ Activa' : 'Seleccionar'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MASCULINAS */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-display">
                VOCES MASCULINAS
              </h3>
              <span className="text-xs text-slate-400 font-mono-studio">(4 perfiles)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {maleVoices.map((voice) => {
                const isSelected = currentConfig.voiceId === voice.id;
                const isAuditioning = auditioningVoiceId === voice.id;

                return (
                  <div
                    key={voice.id}
                    onClick={() => handleSelectVoice(voice)}
                    className={`rounded-2xl p-5 transition-all cursor-pointer flex flex-col justify-between border relative overflow-hidden group ${
                      isSelected
                        ? 'glass-card bg-blue-500/[0.08] border-blue-400/80 shadow-lg shadow-blue-500/10 ring-1 ring-blue-400/40 -translate-y-0.5'
                        : 'glass-card-interactive hover:border-white/20'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-bl-lg font-mono-studio">
                        Seleccionada
                      </div>
                    )}

                    <div>
                      {/* Name & Avatar */}
                      <div className="flex items-start justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xl p-1.5 rounded-xl bg-black/40 border border-white/10">
                            {voice.avatarIcon || '🎙️'}
                          </span>
                          <div>
                            <h4 className="font-extrabold text-base text-white font-display">
                              {voice.name}
                            </h4>
                            <span className="text-[11px] font-mono-studio text-blue-300">
                              {voice.style}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Personality */}
                      <p className="text-xs text-slate-300 leading-relaxed mb-3">
                        {voice.personality}
                      </p>

                      {/* TTS Ready Badge */}
                      <div className="mb-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono-studio">
                          <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                          {voice.badge}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAuditionSample(voice);
                        }}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                          isAuditioning
                            ? 'bg-blue-600 text-white border-blue-400 animate-pulse'
                            : 'glass-card text-slate-200 hover:text-white border-white/10'
                        }`}
                        title="Escuchar muestra"
                      >
                        {isAuditioning ? (
                          <>
                            <Square className="w-3 h-3 fill-current" />
                            <span>Parar</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-current" />
                            <span>Muestra</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectVoice(voice);
                        }}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                            : 'glass-card hover:bg-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        {isSelected ? '✓ Activa' : 'Seleccionar'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. CONFIGURACIÓN DE INTERPRETACIÓN (SLIDERS & EMOCIONES) */}
        {/* ========================================================= */}
        <div className="p-6 rounded-3xl glass-card border border-white/[0.08] space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-display">
                CONFIGURACIÓN DE INTERPRETACIÓN
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono-studio">
              Control de locución y modulación
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* VELOCIDAD SLIDER (0.8x -> 1.2x, default 1.0x) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-cyan-400" />
                  VELOCIDAD DE LOCUCIÓN
                </label>
                <span className="text-sm font-extrabold text-cyan-400 font-mono-studio px-2.5 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  {Number(currentConfig.speed).toFixed(2)}x
                </span>
              </div>

              <input
                type="range"
                min="0.8"
                max="1.2"
                step="0.05"
                value={currentConfig.speed}
                onChange={(e) =>
                  onChangeConfig({
                    ...currentConfig,
                    speed: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
              />

              <div className="flex justify-between text-[11px] text-slate-400 font-mono-studio pt-1">
                <span>0.80x (Pausado)</span>
                <span className="text-cyan-300 font-bold">1.00x (Estándar Radio)</span>
                <span>1.20x (Enérgico)</span>
              </div>
            </div>

            {/* ENERGÍA SLIDER (0% -> 100%, default 70%) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-fuchsia-400" />
                  ENERGÍA Y PRESENCIA
                </label>
                <span className="text-sm font-extrabold text-fuchsia-400 font-mono-studio px-2.5 py-0.5 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20">
                  {Math.round(currentConfig.energy)}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={currentConfig.energy}
                onChange={(e) =>
                  onChangeConfig({
                    ...currentConfig,
                    energy: parseInt(e.target.value, 10),
                  })
                }
                className="w-full accent-fuchsia-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
              />

              <div className="flex justify-between text-[11px] text-slate-400 font-mono-studio pt-1">
                <span>0% (Íntima)</span>
                <span className="text-fuchsia-300 font-bold">70% (Comercial)</span>
                <span>100% (Máxima potencia)</span>
              </div>
            </div>
          </div>

          {/* EMOCIONES (8 opciones) */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              EMOCIÓN / INTENCIÓN DRAMÁTICA
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {EMOTIONS.map((emo) => {
                const isSelected = currentConfig.emotion === emo.id;
                return (
                  <button
                    key={emo.id}
                    type="button"
                    onClick={() =>
                      onChangeConfig({
                        ...currentConfig,
                        emotion: emo.id,
                      })
                    }
                    className={`p-2.5 rounded-xl transition-all flex flex-col items-center justify-center text-center gap-1 border ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-white ring-1 ring-amber-400/50 shadow-md shadow-amber-500/10 font-bold'
                        : 'glass-card text-slate-300 hover:text-white border-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="text-lg">{emo.icon}</span>
                    <span className="text-[11px] truncate w-full">{emo.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PAUSAS (3 opciones: Naturales, Dinámicas, Rápidas) */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-400" />
              CADENCIA Y PAUSAS RADIALES
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PAUSE_STYLES.map((ps) => {
                const isSelected = currentConfig.pauses === ps.id;
                return (
                  <button
                    key={ps.id}
                    type="button"
                    onClick={() =>
                      onChangeConfig({
                        ...currentConfig,
                        pauses: ps.id,
                      })
                    }
                    className={`p-3 rounded-2xl text-left transition-all border flex items-center justify-between ${
                      isSelected
                        ? 'bg-purple-500/20 border-purple-400 text-white ring-1 ring-purple-400/50 shadow-md shadow-purple-500/10'
                        : 'glass-card text-slate-300 hover:text-white border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">{ps.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{ps.desc}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-purple-400 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. PREVISUALIZACIÓN: TARJETA DE CONFIGURACIÓN & GENERACIÓN */}
        {/* ========================================================= */}
        <div className="p-6 sm:p-7 rounded-3xl glass-card bg-gradient-to-br from-fuchsia-500/[0.07] via-purple-900/[0.15] to-cyan-500/[0.07] neon-border space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-300" />
                <h3 className="text-lg font-extrabold text-white tracking-wide font-display">
                  CONFIGURACIÓN DE VOZ
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Resumen de locución listo para masterización radial.
              </p>
            </div>

            {selectedScript && (
              <div className="text-xs font-mono-studio text-slate-300 px-3 py-1.5 rounded-xl glass-card border border-white/10 self-start sm:self-auto">
                <span className="text-slate-400">Guion: </span>
                <strong className="text-cyan-300">{selectedScript.title}</strong> (~{selectedScript.estimatedSeconds}s)
              </div>
            )}
          </div>

          {/* Configuration Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-studio text-xs">
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Voz</span>
              <strong className="text-sm text-white font-bold">{selectedProfile.name}</strong>
              <span className="text-[10px] text-pink-300 block">{selectedProfile.gender}</span>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Estilo / Emoción</span>
              <strong className="text-sm text-amber-300 font-bold">{currentConfig.emotion}</strong>
              <span className="text-[10px] text-slate-400 block">{currentConfig.pauses}</span>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Velocidad</span>
              <strong className="text-sm text-cyan-300 font-bold">{Number(currentConfig.speed).toFixed(2)}x</strong>
              <span className="text-[10px] text-slate-400 block">Tempo natural</span>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Energía</span>
              <strong className="text-sm text-fuchsia-300 font-bold">{Math.round(currentConfig.energy)}%</strong>
              <span className="text-[10px] text-slate-400 block">Presencia radial</span>
            </div>
          </div>

          {/* Render progress / status messages */}
          {isGeneratingAudio && (
            <div className="p-4 rounded-2xl glass-card bg-cyan-500/10 neon-border space-y-2 animate-pulse">
              <div className="flex items-center justify-between text-xs font-mono-studio">
                <span className="text-cyan-300 font-bold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  {audioGenerationStep || 'Preparando voz…'}
                </span>
                <span className="text-cyan-400">{audioProgress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${audioProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* 🎙️ BOTÓN GENERAR AUDIO */}
          <div>
            <button
              type="button"
              onClick={onGenerateAudio}
              disabled={isGeneratingAudio}
              className={`w-full py-5 px-8 rounded-2xl font-extrabold text-lg sm:text-xl text-white tracking-wide transition-all flex items-center justify-center gap-3 shadow-2xl relative overflow-hidden group ${
                isGeneratingAudio
                  ? 'glass-card cursor-not-allowed text-slate-400 opacity-60'
                  : 'bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 hover:from-cyan-400 hover:via-fuchsia-400 hover:to-purple-500 glow-neon-blue active:scale-[0.99]'
              }`}
            >
              <Mic className={`w-6 h-6 ${isGeneratingAudio ? 'animate-spin' : 'animate-pulse'}`} />
              <span>
                {isGeneratingAudio ? 'GENERANDO AUDIO RADIAL...' : '🎙️ GENERAR AUDIO'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
