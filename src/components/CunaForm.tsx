import React, { useState, useEffect } from 'react';
import {
  Mic,
  Radio,
  Clock,
  Sparkles,
  Volume2,
  Tag,
  FileText,
  Flame,
  AlertCircle,
  HelpCircle,
  Wand2,
  RadioTower,
  Globe,
  Settings,
  User,
} from 'lucide-react';
import {
  CunaType,
  CunaStyle,
  VoiceType,
  DurationOption,
  RadioIdentity,
} from '../types';

interface CunaFormProps {
  onGenerate: (formData: {
    radioName: string;
    programName: string;
    cunaType: CunaType;
    infoPrompt: string;
    duration: DurationOption;
    styles: CunaStyle[];
    voice: VoiceType;
    radioIdentity?: RadioIdentity;
  }) => void;
  isGenerating: boolean;
  activeRadioIdentity?: RadioIdentity;
  onOpenSettings?: () => void;
  initialValues?: {
    radioName?: string;
    programName?: string;
    cunaType?: CunaType;
    infoPrompt?: string;
    duration?: DurationOption;
    styles?: CunaStyle[];
    voice?: VoiceType;
  };
}

const CUNA_TYPES: { id: CunaType; label: string; icon: string; desc: string }[] = [
  { id: 'Promoción de programa', label: 'Promoción de programa', icon: '🎙️', desc: 'Destaca conductores, días y horarios' },
  { id: 'Identificación de radio', label: 'Identificación de radio', icon: '📻', desc: 'ID oficial de estación y señal' },
  { id: 'Separador', label: 'Separador / Sweeper', icon: '⚡', desc: 'Corte ágil entre canciones' },
  { id: 'Anuncio comercial', label: 'Anuncio comercial', icon: '🛍️', desc: 'Publicidad de marcas y negocios' },
  { id: 'Concurso', label: 'Concurso / Promo', icon: '🎁', desc: 'Premios, sorteos y llamados a participar' },
  { id: 'Evento', label: 'Evento / Concierto', icon: '🎟️', desc: 'Fiestas, recitales y festivales' },
  { id: 'Especial musical', label: 'Especial musical', icon: '🎵', desc: 'Maratón de artistas o décadas' },
  { id: 'Saludo', label: 'Saludo de estación', icon: '👋', desc: 'Cálido contacto con la audiencia' },
  { id: 'Horario', label: 'Pauta / Horario', icon: '⏰', desc: 'Mención de hora y temperatura' },
  { id: 'Lanzamiento', label: 'Lanzamiento', icon: '🚀', desc: 'Novedades y estrenos exclusivos' },
  { id: 'Redes sociales', label: 'Redes sociales', icon: '📱', desc: 'WhatsApp, Instagram y web' },
  { id: 'Cuña personalizada', label: 'Cuña personalizada', icon: '✨', desc: 'Estructura libre para cualquier idea' },
];

const STYLES_LIST: { id: CunaStyle; label: string; bg: string }[] = [
  { id: '🔥 Potente', label: '🔥 Potente', bg: 'hover:border-red-500/50' },
  { id: '⚡ Energético', label: '⚡ Energético', bg: 'hover:border-amber-500/50' },
  { id: '😎 Juvenil', label: '😎 Juvenil', bg: 'hover:border-cyan-500/50' },
  { id: '🎉 Alegre', label: '🎉 Alegre', bg: 'hover:border-yellow-500/50' },
  { id: '💋 Sexy', label: '💋 Sexy', bg: 'hover:border-pink-500/50' },
  { id: '🎧 Urbano', label: '🎧 Urbano', bg: 'hover:border-emerald-500/50' },
  { id: '✨ Elegante', label: '✨ Elegante', bg: 'hover:border-purple-500/50' },
  { id: '🌙 Nocturno', label: '🌙 Nocturno', bg: 'hover:border-indigo-500/50' },
  { id: '📻 FM clásica', label: '📻 FM clásica', bg: 'hover:border-blue-500/50' },
  { id: '❤️ Emocional', label: '❤️ Emocional', bg: 'hover:border-rose-500/50' },
  { id: '😂 Divertido', label: '😂 Divertido', bg: 'hover:border-lime-500/50' },
  { id: '🚀 Futurista', label: '🚀 Futurista', bg: 'hover:border-teal-500/50' },
];

const VOICES_LIST: { id: VoiceType; label: string; desc: string; icon: string }[] = [
  { id: 'Voz energética', label: 'Voz energética', desc: 'Dinámica, radial, alta proyección', icon: '⚡' },
  { id: 'Voz masculina profunda', label: 'Voz masculina profunda', desc: 'Grave, autoritaria, estilo tráiler', icon: '🎙️' },
  { id: 'Voz femenina sensual', label: 'Voz femenina sensual', desc: 'Suave, seductora, elegante', icon: '💋' },
  { id: 'Voz femenina', label: 'Voz femenina estándar', desc: 'Clara, neutra y profesional', icon: '👩' },
  { id: 'Voz masculina', label: 'Voz masculina estándar', desc: 'Institucional, sólida y confiable', icon: '👨' },
  { id: 'Voz juvenil femenina', label: 'Voz juvenil femenina', desc: 'Fresca, pop, desenfadada', icon: '✨' },
  { id: 'Voz juvenil masculina', label: 'Voz juvenil masculina', desc: 'Cercana, urbana, informal', icon: '🎧' },
  { id: 'Voz comercial', label: 'Voz comercial', desc: 'Vendedora, articulada y persuasiva', icon: '🛍️' },
  { id: 'Voz cálida', label: 'Voz cálida', desc: 'Emocional, amigable y acogedora', icon: '❤️' },
];

const DURATION_OPTIONS: DurationOption[] = [10, 15, 20, 30, 45, 60];

export const CunaForm: React.FC<CunaFormProps> = ({
  onGenerate,
  isGenerating,
  activeRadioIdentity,
  onOpenSettings,
  initialValues,
}) => {
  const [radioName, setRadioName] = useState(
    initialValues?.radioName || activeRadioIdentity?.radioName || 'Radio Me Gusta'
  );
  const [programName, setProgramName] = useState(
    initialValues?.programName || activeRadioIdentity?.mainProgram || 'Modo Random'
  );
  const [cunaType, setCunaType] = useState<CunaType>(initialValues?.cunaType || 'Promoción de programa');
  const [infoPrompt, setInfoPrompt] = useState(
    initialValues?.infoPrompt ||
      `Programa musical con éxitos de los 80, 90 y 2000. Todos los viernes a las 21:00. Conduce ${activeRadioIdentity?.mainHost || 'John'}.`
  );
  const [duration, setDuration] = useState<DurationOption>(initialValues?.duration || 20);
  const [styles, setStyles] = useState<CunaStyle[]>(initialValues?.styles || ['🔥 Potente', '⚡ Energético']);
  const [voice, setVoice] = useState<VoiceType>(initialValues?.voice || 'Voz energética');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync with activeRadioIdentity when it changes
  useEffect(() => {
    if (activeRadioIdentity) {
      if (!initialValues?.radioName) {
        setRadioName(activeRadioIdentity.radioName || 'Radio Me Gusta');
      }
      if (!initialValues?.programName && activeRadioIdentity.mainProgram) {
        setProgramName(activeRadioIdentity.mainProgram);
      }
    }
  }, [activeRadioIdentity, initialValues]);

  const inspirationPrompts = [
    {
      title: 'Programa 80s y 90s',
      radio: activeRadioIdentity?.radioName || 'Radio Me Gusta',
      prog: activeRadioIdentity?.mainProgram || 'Modo Random',
      type: 'Promoción de programa' as CunaType,
      dur: 20 as DurationOption,
      styles: ['🔥 Potente', '🎉 Alegre'] as CunaStyle[],
      voice: 'Voz masculina profunda' as VoiceType,
      text: `Programa musical con éxitos de los 80, 90 y 2000. Todos los viernes a las 21:00. Conduce ${activeRadioIdentity?.mainHost || 'John'}.`,
    },
    {
      title: 'Identificación de Radio',
      radio: activeRadioIdentity?.radioName || 'Radio Me Gusta',
      prog: '',
      type: 'Identificación de radio' as CunaType,
      dur: 15 as DurationOption,
      styles: ['😎 Juvenil', '🎧 Urbano'] as CunaStyle[],
      voice: 'Voz energética' as VoiceType,
      text: `${activeRadioIdentity?.radioName || 'Radio Me Gusta'} — ${activeRadioIdentity?.stationType || 'Radio Online'}. La mejor música y entretenimiento para acompañar tu día.`,
    },
    {
      title: 'Concurso Entradas',
      radio: activeRadioIdentity?.radioName || 'Radio Me Gusta',
      prog: '',
      type: 'Concurso' as CunaType,
      dur: 30 as DurationOption,
      styles: ['🔥 Potente', '⚡ Energético'] as CunaStyle[],
      voice: 'Voz masculina profunda' as VoiceType,
      text: `Gana entradas dobles para el gran evento musical. Sigue la transmisión de ${activeRadioIdentity?.radioName || 'Radio Me Gusta'} y participa.`,
    },
    {
      title: 'Comercial Pizzería',
      radio: activeRadioIdentity?.radioName || 'Radio Me Gusta',
      prog: '',
      type: 'Anuncio comercial' as CunaType,
      dur: 20 as DurationOption,
      styles: ['🎉 Alegre', '⚡ Energético'] as CunaStyle[],
      voice: 'Voz comercial' as VoiceType,
      text: 'Gran inauguración de Pizzería Don Giovanni. 2x1 en pizzas familiares masa a la piedra todos los martes y jueves.',
    },
  ];

  const toggleStyle = (styleId: CunaStyle) => {
    if (styles.includes(styleId)) {
      if (styles.length > 1) {
        setStyles(styles.filter((s) => s !== styleId));
      }
    } else {
      setStyles([...styles, styleId]);
    }
  };

  const handleApplyInspiration = (item: (typeof inspirationPrompts)[0]) => {
    setRadioName(item.radio);
    setProgramName(item.prog);
    setCunaType(item.type);
    setDuration(item.dur);
    setStyles(item.styles);
    setVoice(item.voice);
    setInfoPrompt(item.text);
    setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!infoPrompt.trim()) {
      setValidationError('Cuéntame primero qué quieres anunciar y yo hago el resto 😉');
      return;
    }
    if (!duration) {
      setValidationError('Por favor selecciona una duración para la cuña.');
      return;
    }
    if (!cunaType) {
      setValidationError('Por favor selecciona el tipo de cuña.');
      return;
    }

    setValidationError(null);
    onGenerate({
      radioName: radioName.trim(),
      programName: programName.trim(),
      cunaType,
      infoPrompt: infoPrompt.trim(),
      duration,
      styles,
      voice,
      radioIdentity: activeRadioIdentity,
    });
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden">
      {/* Decorative neon ambient orbs */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 border border-cyan-500/30 text-cyan-400">
              <Mic className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
                CREAR NUEVA CUÑA
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Producción radial profesional impulsada por IA para {activeRadioIdentity?.radioName || 'Radio Me Gusta'} — {activeRadioIdentity?.stationType || 'Radio Online'}.
              </p>
            </div>
          </div>
        </div>

        {/* Quick prompt templates */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Wand2 className="w-3.5 h-3.5 text-fuchsia-400" />
            Ejemplos rápidos:
          </span>
          {inspirationPrompts.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleApplyInspiration(p)}
              className="text-xs px-2.5 py-1 rounded-lg glass-card hover:bg-white/10 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/40 transition-all"
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* ACTIVE IDENTITY PILL BANNER */}
      {activeRadioIdentity && (
        <div className="mt-5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
              <RadioTower className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-400">Identidad cargada:</span>
                <strong className="text-white font-bold text-sm">
                  {activeRadioIdentity.radioName}
                </strong>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono-studio text-[11px]">
                  {activeRadioIdentity.stationType}
                </span>
                {activeRadioIdentity.stationType !== 'Radio Online' && activeRadioIdentity.frequency && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono-studio text-[11px]">
                    {activeRadioIdentity.frequency}
                  </span>
                )}
              </div>
              {activeRadioIdentity.mainHost && (
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Locutor principal: <span className="text-cyan-200">{activeRadioIdentity.mainHost}</span>
                  {activeRadioIdentity.mainProgram ? ` • Programa: ${activeRadioIdentity.mainProgram}` : ''}
                </span>
              )}
            </div>
          </div>

          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="text-xs px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 transition-all self-end sm:self-auto"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configurar Identidad</span>
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-7">
        {/* ROW 1: RADIO & PROGRAMA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* RADIO */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              RADIO
            </label>
            <input
              type="text"
              value={radioName}
              onChange={(e) => setRadioName(e.target.value)}
              placeholder="Ej: Radio Me Gusta"
              className="w-full px-4 py-3 rounded-xl frosted-input text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all font-medium text-sm sm:text-base"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Nombre de la estación para esta cuña específica.
            </span>
          </div>

          {/* PROGRAMA */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-fuchsia-400" />
              PROGRAMA (Opcional)
            </label>
            <input
              type="text"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              placeholder="Ej: Modo Random"
              className="w-full px-4 py-3 rounded-xl frosted-input text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-400 transition-all font-medium text-sm sm:text-base"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Dejar vacío si es una cuña general de la radio.
            </span>
          </div>
        </div>

        {/* TIPO DE CUÑA */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5 flex items-center gap-2">
            <Tag className="w-4 h-4 text-purple-400" />
            TIPO DE CUÑA
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {CUNA_TYPES.map((t) => {
              const isSelected = cunaType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setCunaType(t.id)}
                  className={`p-3 rounded-2xl text-left transition-all relative overflow-hidden group ${
                    isSelected
                      ? 'glass-card bg-fuchsia-500/10 neon-border-pink text-white'
                      : 'glass-card-interactive text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{t.icon}</span>
                    <span className="font-semibold text-xs sm:text-sm truncate">{t.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{t.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* INFO PROMPT */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              INFORMACIÓN DE LA CUÑA
            </label>
            <span className="text-xs text-slate-400 font-mono-studio">
              {infoPrompt.length} caracteres
            </span>
          </div>
          <textarea
            rows={4}
            value={infoPrompt}
            onChange={(e) => setInfoPrompt(e.target.value)}
            placeholder="Escribe aquí toda la información: fechas, promociones, llamados a la acción, premios, etc..."
            className="w-full p-4 rounded-2xl frosted-input text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all font-medium text-sm sm:text-base resize-none"
          />
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>
              La IA respetará rigurosamente la veracidad de tus datos sin inventar información no provista.
            </span>
          </div>
        </div>

        {/* ROW 3: DURACIÓN & ESTILOS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* DURACIÓN */}
          <div className="lg:col-span-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              DURACIÓN ESTIMADA
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DURATION_OPTIONS.map((d) => {
                const isSelected = duration === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`py-3 px-2 rounded-2xl font-mono-studio font-bold text-center transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 scale-[1.02]'
                        : 'glass-card-interactive text-slate-300'
                    }`}
                  >
                    <span className="text-base sm:text-lg block">{d}s</span>
                    <span className="text-[10px] text-slate-400 font-normal block">
                      {d <= 15 ? 'Corta' : d <= 30 ? 'Estándar' : 'Larga'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ESTILOS */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                ESTILO / ENERGÍA (Puedes elegir varios)
              </label>
              <span className="text-xs text-amber-400 font-mono-studio">
                {styles.length} seleccionado(s)
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {STYLES_LIST.map((st) => {
                const isSelected = styles.includes(st.id);
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => toggleStyle(st.id)}
                    className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 border border-amber-500/60 text-amber-200 shadow-md shadow-amber-500/10'
                        : 'glass-card text-slate-300 hover:text-white hover:bg-white/10'
                    } ${st.bg}`}
                  >
                    <span>{st.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* VOZ */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            VOZ PREFERIDA
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {VOICES_LIST.map((v) => {
              const isSelected = voice === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVoice(v.id)}
                  className={`p-3 rounded-2xl text-left transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'glass-card bg-cyan-500/10 neon-border text-white'
                      : 'glass-card-interactive text-slate-300'
                  }`}
                >
                  <span className="text-xl p-1.5 rounded-xl bg-white/5">{v.icon}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs sm:text-sm truncate">{v.label}</p>
                    <p className="text-[11px] text-slate-400 truncate">{v.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* VALIDATION MESSAGE */}
        {validationError && (
          <div className="p-4 rounded-2xl glass-card bg-amber-500/10 border-amber-500/40 text-amber-200 text-sm flex items-center gap-3 animate-bounce">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* BOTÓN PRINCIPAL */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isGenerating}
            className={`w-full py-5 px-8 rounded-2xl font-extrabold text-lg sm:text-xl text-white tracking-wide transition-all flex items-center justify-center gap-3 shadow-2xl relative overflow-hidden group ${
              isGenerating
                ? 'glass-card cursor-not-allowed text-slate-400'
                : 'bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 hover:from-cyan-400 hover:via-fuchsia-400 hover:to-purple-500 glow-neon-blue hover:glow-neon-pink hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
            }`}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Mic className="w-6 h-6 animate-pulse" />
            <span>{isGenerating ? 'PRODUCIENDO GUIONES...' : '🎙️ GENERAR CUÑA'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
