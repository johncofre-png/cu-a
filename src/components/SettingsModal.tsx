import React, { useState, useEffect } from 'react';
import {
  Settings,
  Radio,
  Sparkles,
  Volume2,
  Clock,
  Flame,
  Shield,
  Server,
  Save,
  CheckCircle,
  Globe,
  Instagram,
  Facebook,
  Phone,
  Video,
  User,
  Mic,
  Plus,
  RadioTower,
  Sliders,
  Check,
  Cpu,
  AlertTriangle,
  RefreshCw,
  FileAudio,
  Layers,
  Terminal,
} from 'lucide-react';
import {
  StudioSettings,
  RadioIdentity,
  RadioStationType,
  VoiceType,
  CunaStyle,
  DurationOption,
  TTSStatusInfo,
} from '../types';
import { DEFAULT_RADIO_IDENTITY } from '../utils/storage';
import { checkTTSStatus } from '../utils/ttsClient';

interface SettingsModalProps {
  settings: StudioSettings;
  onSaveSettings: (newSettings: StudioSettings) => void;
}

const STATION_TYPES: { id: RadioStationType; label: string; desc: string; icon: string }[] = [
  { id: 'Radio Online', label: 'Radio Online', desc: 'Emisión digital por streaming web y apps', icon: '🌐' },
  { id: 'Radio FM', label: 'Radio FM', desc: 'Emisión por Frecuencia Modulada tradicional', icon: '📻' },
  { id: 'Radio AM', label: 'Radio AM', desc: 'Emisión por Amplitud Modulada tradicional', icon: '📡' },
  { id: 'Radio Online + FM', label: 'Radio Online + FM', desc: 'Emisión híbrida online y frecuencia FM', icon: '⚡' },
  { id: 'Radio Online + AM', label: 'Radio Online + AM', desc: 'Emisión híbrida online y frecuencia AM', icon: '🎙️' },
];

const VOICES: VoiceType[] = [
  'Voz energética',
  'Voz masculina profunda',
  'Voz femenina sensual',
  'Voz femenina',
  'Voz masculina',
  'Voz juvenil femenina',
  'Voz juvenil masculina',
  'Voz comercial',
  'Voz cálida',
];

const STYLES: CunaStyle[] = [
  '🔥 Potente',
  '⚡ Energético',
  '😎 Juvenil',
  '🎉 Alegre',
  '💋 Sexy',
  '🎧 Urbano',
  '✨ Elegante',
  '🌙 Nocturno',
  '📻 FM clásica',
  '❤️ Emocional',
  '😂 Divertido',
  '🚀 Futurista',
];

const DURATIONS: DurationOption[] = [10, 15, 20, 30, 45, 60];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'identity' | 'audio' | 'tts'>('identity');
  const [ttsStatus, setTtsStatus] = useState<TTSStatusInfo | null>(null);
  const [isLoadingTTSStatus, setIsLoadingTTSStatus] = useState(false);

  // Multi-radio identities state
  const [radios, setRadios] = useState<RadioIdentity[]>(
    settings.radioIdentities && settings.radioIdentities.length > 0
      ? settings.radioIdentities
      : [settings.activeRadioIdentity || DEFAULT_RADIO_IDENTITY]
  );
  const [activeRadioId, setActiveRadioId] = useState<string>(
    settings.activeRadioIdentity?.id || radios[0]?.id || DEFAULT_RADIO_IDENTITY.id
  );

  // Active form fields for selected radio identity
  const currentIdentity = radios.find((r) => r.id === activeRadioId) || radios[0] || DEFAULT_RADIO_IDENTITY;

  const [radioName, setRadioName] = useState(currentIdentity.radioName || 'Radio Me Gusta');
  const [stationType, setStationType] = useState<RadioStationType>(currentIdentity.stationType || 'Radio Online');
  const [frequency, setFrequency] = useState(currentIdentity.frequency || '');
  const [slogan, setSlogan] = useState(currentIdentity.slogan || '');
  const [website, setWebsite] = useState(currentIdentity.website || '');
  const [instagram, setInstagram] = useState(currentIdentity.instagram || '');
  const [facebook, setFacebook] = useState(currentIdentity.facebook || '');
  const [tiktok, setTiktok] = useState(currentIdentity.tiktok || '');
  const [whatsapp, setWhatsapp] = useState(currentIdentity.whatsapp || '');
  const [mainHost, setMainHost] = useState(currentIdentity.mainHost || '');
  const [mainProgram, setMainProgram] = useState(currentIdentity.mainProgram || '');

  // Audio / studio defaults
  const [voice, setVoice] = useState<VoiceType>(settings.defaultVoice);
  const [style, setStyle] = useState<CunaStyle>(settings.defaultStyle);
  const [duration, setDuration] = useState<DurationOption>(settings.defaultDuration);
  const [ttsProvider, setTtsProvider] = useState<'piper' | 'gemini' | 'browser' | 'custom'>(
    settings.ttsProvider === 'piper' || !settings.ttsProvider ? 'piper' : (settings.ttsProvider as any)
  );

  // Toast / feedback message
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);

  // Load TTS diagnosis status
  const refreshTTSDiagnostic = async () => {
    setIsLoadingTTSStatus(true);
    try {
      const status = await checkTTSStatus();
      setTtsStatus(status);
    } catch (e) {
      console.error('Error fetching TTS status', e);
    } finally {
      setIsLoadingTTSStatus(false);
    }
  };

  useEffect(() => {
    refreshTTSDiagnostic();
  }, []);

  // Sync active radio when selection changes
  useEffect(() => {
    const r = radios.find((item) => item.id === activeRadioId);
    if (r) {
      setRadioName(r.radioName || '');
      setStationType(r.stationType || 'Radio Online');
      setFrequency(r.frequency || '');
      setSlogan(r.slogan || '');
      setWebsite(r.website || '');
      setInstagram(r.instagram || '');
      setFacebook(r.facebook || '');
      setTiktok(r.tiktok || '');
      setWhatsapp(r.whatsapp || '');
      setMainHost(r.mainHost || '');
      setMainProgram(r.mainProgram || '');
    }
  }, [activeRadioId, radios]);

  // Handle Create New Radio Profile (Multi-radio architecture)
  const handleAddNewRadio = () => {
    const newId = `radio-${Date.now()}`;
    const newRadio: RadioIdentity = {
      id: newId,
      radioName: 'Nueva Radio',
      stationType: 'Radio Online',
      frequency: '',
      slogan: '',
      website: '',
      instagram: '',
      facebook: '',
      tiktok: '',
      whatsapp: '',
      mainHost: '',
      mainProgram: '',
      isDefault: false,
    };
    const updatedRadios = [...radios, newRadio];
    setRadios(updatedRadios);
    setActiveRadioId(newId);
  };

  const handleSaveIdentity = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedIdentity: RadioIdentity = {
      id: activeRadioId,
      radioName: radioName.trim() || 'Radio Me Gusta',
      stationType,
      // If Radio Online, never keep frequency
      frequency: stationType === 'Radio Online' ? '' : frequency.trim(),
      slogan: slogan.trim(),
      website: website.trim(),
      instagram: instagram.trim(),
      facebook: facebook.trim(),
      tiktok: tiktok.trim(),
      whatsapp: whatsapp.trim(),
      mainHost: mainHost.trim(),
      mainProgram: mainProgram.trim(),
      isDefault: true,
    };

    const updatedRadios = radios.map((r) =>
      r.id === activeRadioId ? cleanedIdentity : { ...r, isDefault: false }
    );

    onSaveSettings({
      defaultRadioName: cleanedIdentity.radioName,
      defaultSlogan: cleanedIdentity.slogan || (cleanedIdentity.stationType === 'Radio Online' ? 'Radio Online' : ''),
      defaultVoice: voice,
      defaultStyle: style,
      defaultDuration: duration,
      ttsProvider,
      activeRadioIdentity: cleanedIdentity,
      radioIdentities: updatedRadios,
    });

    setSavedSuccessMessage('Identidad de radio guardada correctamente.');
    setTimeout(() => setSavedSuccessMessage(null), 3500);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 neon-border shadow-2xl my-8 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] relative z-10">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400">
            <Radio className="w-6 h-6" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
                CONFIGURACIÓN
              </h2>
              <span className="text-xs uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono-studio font-bold">
                Estudio
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Personaliza la identidad oficial de tu radio y los parámetros de producción con IA.
            </p>
          </div>
        </div>

        {savedSuccessMessage && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs sm:text-sm font-bold animate-bounce shadow-lg shadow-emerald-500/10">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{savedSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* Subtabs Selector */}
      <div className="flex flex-wrap items-center gap-2 mt-6 border-b border-white/[0.08] pb-4 relative z-10">
        <button
          type="button"
          onClick={() => setActiveSubTab('identity')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'identity'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          <RadioTower className="w-4 h-4" />
          <span>📻 IDENTIDAD DE MI RADIO</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('audio')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'audio'
              ? 'bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white shadow-md shadow-purple-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Ajustes de Producción</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSubTab('tts');
            refreshTTSDiagnostic();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'tts'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <div className="flex items-center gap-1.5">
            <span>🎙️ MOTOR DE VOZ</span>
            <span
              className={`w-2 h-2 rounded-full ${
                ttsStatus?.available ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
          </div>
        </button>
      </div>

      {/* SUBTAB 1: IDENTIDAD DE MI RADIO */}
      {activeSubTab === 'identity' && (
        <form onSubmit={handleSaveIdentity} className="mt-6 space-y-8 relative z-10">
          {/* Multi-radio Selector / Profiles Bar */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
              <span className="text-cyan-400">Emisora Activa:</span>
              <div className="flex flex-wrap gap-1.5">
                {radios.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setActiveRadioId(r.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      r.id === activeRadioId
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {r.id === activeRadioId && <Check className="w-3 h-3 text-cyan-400" />}
                    <span>{r.radioName || 'Radio'}</span>
                    <span className="text-[10px] opacity-75 font-mono-studio">({r.stationType})</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddNewRadio}
              className="text-xs px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 flex items-center gap-1.5 transition-all self-end sm:self-auto"
              title="Agregar perfil de otra radio"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Nueva Radio</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Fields Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Radio Name & Station Type */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    NOMBRE DE LA RADIO
                  </label>
                  <input
                    type="text"
                    required
                    value={radioName}
                    onChange={(e) => setRadioName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl frosted-input text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm font-semibold"
                    placeholder="Ej: Radio Me Gusta"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Nombre oficial con el que la IA identificará tu emisora en los guiones.
                  </span>
                </div>

                {/* Tipo de emisora */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-fuchsia-400" />
                    TIPO DE EMISORA
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {STATION_TYPES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setStationType(t.id);
                          if (t.id === 'Radio Online') {
                            setFrequency('');
                          }
                        }}
                        className={`p-3 rounded-xl text-left border transition-all flex items-start gap-2.5 ${
                          stationType === t.id
                            ? 'bg-fuchsia-500/15 border-fuchsia-500/50 text-white'
                            : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06]'
                        }`}
                      >
                        <span className="text-base">{t.icon}</span>
                        <div>
                          <strong className={`block text-xs ${stationType === t.id ? 'text-fuchsia-300' : 'text-slate-200'}`}>
                            {t.label}
                          </strong>
                          <span className="text-[10px] text-slate-400 block leading-tight">{t.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frecuencia (OPCIONAL y sólo visible si NO es Radio Online pura) */}
                {stationType !== 'Radio Online' && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 animate-fadeIn">
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-2 flex items-center gap-2">
                      <RadioTower className="w-4 h-4 text-amber-400" />
                      FRECUENCIA (OPCIONAL)
                    </label>
                    <input
                      type="text"
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl frosted-input text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm font-medium"
                      placeholder="Ej: 107.3 ó 107.3 FM"
                    />
                    <span className="text-[11px] text-amber-400/80 mt-1 block">
                      Solo se mencionará si la configuras aquí. Si la dejas vacía, la IA nunca inventará números de dial.
                    </span>
                  </div>
                )}

                {/* Slogan */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    SLOGAN (OPCIONAL)
                  </label>
                  <input
                    type="text"
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl frosted-input text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 text-sm font-medium"
                    placeholder="Ej: La música que te mueve"
                  />
                </div>
              </div>

              {/* INFORMACIÓN DEL LOCUTOR Y PROGRAMA */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  INFORMACIÓN DEL LOCUTOR & PROGRAMA
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      Nombre del locutor principal (Opcional)
                    </label>
                    <input
                      type="text"
                      value={mainHost}
                      onChange={(e) => setMainHost(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl frosted-input text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm font-medium"
                      placeholder="Ej: John"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-fuchsia-400" />
                      Nombre del programa (Opcional)
                    </label>
                    <input
                      type="text"
                      value={mainProgram}
                      onChange={(e) => setMainProgram(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl frosted-input text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-400 text-sm font-medium"
                      placeholder="Ej: Modo Random"
                    />
                  </div>
                </div>
              </div>

              {/* MEDIOS DE CONTACTO Y REDES SOCIALES */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-teal-400" />
                  CANALES DIGITALES & REDES (OPCIONALES)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      Sitio web
                    </label>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl frosted-input text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                      placeholder="Ej: radiomegusta.cl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      WhatsApp
                    </label>
                    <input
                      type="text"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl frosted-input text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 text-sm"
                      placeholder="Ej: +56 9 1234 5678"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <Instagram className="w-3.5 h-3.5 text-pink-400" />
                      Instagram
                    </label>
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl frosted-input text-white placeholder-slate-500 focus:outline-none focus:border-pink-400 text-sm"
                      placeholder="Ej: @radiomegusta"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <Facebook className="w-3.5 h-3.5 text-blue-400" />
                      Facebook
                    </label>
                    <input
                      type="text"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl frosted-input text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 text-sm"
                      placeholder="Ej: RadioMeGustaOficial"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-rose-400" />
                      TikTok
                    </label>
                    <input
                      type="text"
                      value={tiktok}
                      onChange={(e) => setTiktok(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl frosted-input text-white placeholder-slate-500 focus:outline-none focus:border-rose-400 text-sm"
                      placeholder="Ej: @radiomegusta"
                    />
                  </div>
                </div>
              </div>

              {/* Botón Guardar Identidad */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-extrabold text-base flex items-center justify-center gap-2.5 shadow-xl shadow-cyan-500/25 transition-all glow-neon-blue cursor-pointer"
                >
                  <Save className="w-5 h-5" />
                  <span>💾 GUARDAR IDENTIDAD</span>
                </button>
              </div>
            </div>

            {/* PREVISUALIZACIÓN DE IDENTIDAD ACTUAL */}
            <div className="lg:col-span-5 space-y-6">
              <div className="sticky top-24 space-y-6">
                <div className="p-6 rounded-3xl glass-card border border-cyan-500/30 neon-border relative overflow-hidden">
                  <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <RadioTower className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-xs font-extrabold uppercase tracking-widest text-cyan-300 font-mono-studio">
                        IDENTIDAD ACTUAL
                      </h3>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      Activa
                    </span>
                  </div>

                  {/* Dynamic Preview Card: ONLY shows fields with values */}
                  <div className="mt-5 space-y-4">
                    {/* Radio Name */}
                    <div className="flex items-start gap-3">
                      <span className="text-xl">📻</span>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono-studio block">Nombre de la emisora</span>
                        <strong className="text-lg text-white font-display tracking-tight block">
                          {radioName.trim() || 'Radio Me Gusta'}
                        </strong>
                      </div>
                    </div>

                    {/* Station Type */}
                    <div className="flex items-start gap-3">
                      <span className="text-xl">🌐</span>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono-studio block">Tipo de transmisión</span>
                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                          <span className="text-sm font-semibold text-fuchsia-300">
                            {stationType}
                          </span>
                          {stationType !== 'Radio Online' && frequency.trim() && (
                            <span className="text-xs px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono-studio font-bold">
                              {frequency.trim()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Slogan (Only if present) */}
                    {slogan.trim() && (
                      <div className="flex items-start gap-3 pt-2 border-t border-white/5 animate-fadeIn">
                        <span className="text-base">✨</span>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-mono-studio block">Slogan</span>
                          <p className="text-xs text-yellow-200 font-medium italic">
                            “{slogan.trim()}”
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Locutor principal (Only if present) */}
                    {mainHost.trim() && (
                      <div className="flex items-start gap-3 pt-2 border-t border-white/5 animate-fadeIn">
                        <span className="text-base">🎙️</span>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-mono-studio block">Locutor Principal</span>
                          <span className="text-xs text-cyan-200 font-semibold">
                            {mainHost.trim()}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Programa principal (Only if present) */}
                    {mainProgram.trim() && (
                      <div className="flex items-start gap-3 pt-2 border-t border-white/5 animate-fadeIn">
                        <span className="text-base">📻</span>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-mono-studio block">Programa Principal</span>
                          <span className="text-xs text-fuchsia-200 font-semibold">
                            {mainProgram.trim()}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Contact & Socials (Only showing configured items) */}
                    {(website.trim() || whatsapp.trim() || instagram.trim() || facebook.trim() || tiktok.trim()) && (
                      <div className="pt-2 border-t border-white/5 space-y-1.5 animate-fadeIn">
                        <span className="text-[10px] text-slate-400 uppercase font-mono-studio block">Canales Digitales</span>
                        <div className="flex flex-wrap gap-1.5">
                          {website.trim() && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-mono-studio">
                              <Globe className="w-3 h-3" />
                              {website.trim()}
                            </span>
                          )}
                          {whatsapp.trim() && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-mono-studio">
                              <Phone className="w-3 h-3" />
                              {whatsapp.trim()}
                            </span>
                          )}
                          {instagram.trim() && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-300 text-[11px] font-mono-studio">
                              <Instagram className="w-3 h-3" />
                              {instagram.trim()}
                            </span>
                          )}
                          {facebook.trim() && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-mono-studio">
                              <Facebook className="w-3 h-3" />
                              {facebook.trim()}
                            </span>
                          )}
                          {tiktok.trim() && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] font-mono-studio">
                              <Video className="w-3 h-3" />
                              {tiktok.trim()}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Strict Rule Notice */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <Shield className="w-4 h-4" />
                    <span>Regla Fundamental de la IA</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    La IA utilizará exclusivamente los datos que configures aquí y en cada cuña. Nunca inventará frecuencias, números de WhatsApp, slogans ni horarios falsos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* SUBTAB 2: AJUSTES DE PRODUCCIÓN & AUDIO */}
      {activeSubTab === 'audio' && (
        <form onSubmit={handleSaveIdentity} className="mt-6 space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Default Voice */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-purple-400" />
                VOZ PREDETERMINADA
              </label>
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value as VoiceType)}
                className="w-full px-4 py-3 rounded-xl frosted-input text-white focus:outline-none focus:border-purple-400 text-sm font-medium"
              >
                {VOICES.map((v) => (
                  <option key={v} value={v} className="bg-slate-900 text-white">
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {/* Default Style */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                ESTILO PREDETERMINADO
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as CunaStyle)}
                className="w-full px-4 py-3 rounded-xl frosted-input text-white focus:outline-none focus:border-amber-400 text-sm font-medium"
              >
                {STYLES.map((st) => (
                  <option key={st} value={st} className="bg-slate-900 text-white">
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Default Duration */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                DURACIÓN PREDETERMINADA
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value) as DurationOption)}
                className="w-full px-4 py-3 rounded-xl frosted-input text-white focus:outline-none focus:border-emerald-400 text-sm font-medium"
              >
                {DURATIONS.map((dur) => (
                  <option key={dur} value={dur} className="bg-slate-900 text-white">
                    {dur} segundos
                  </option>
                ))}
              </select>
            </div>

            {/* TTS Provider */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                PROVEEDOR DE VOZ (TTS)
              </label>
              <select
                value={ttsProvider}
                onChange={(e) => setTtsProvider(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl frosted-input text-white focus:outline-none focus:border-cyan-400 text-sm font-medium"
              >
                <option value="piper" className="bg-slate-900 text-white">
                  Piper TTS (Motor Local Backend - Gratuito)
                </option>
                <option value="gemini" className="bg-slate-900 text-white">
                  Gemini AI Studio (Nativo / Server-Side)
                </option>
                <option value="browser" className="bg-slate-900 text-white">
                  Motor de Estudio HD + Web Speech Synthesis
                </option>
              </select>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
              <Shield className="w-4 h-4" />
              <span>Seguridad y Motor de Voz</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              La arquitectura de Piper TTS procesa el audio localmente en el servidor sin requerir claves comerciales ni generar costos por locución.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono-studio text-slate-300 pt-1">
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <span className="text-slate-500">Motor TTS:</span> Piper TTS (Servidor)
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <span className="text-slate-500">Guiones IA:</span> Gemini 2.5 Flash
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all glow-neon-pink cursor-pointer"
            >
              <Save className="w-5 h-5" />
              <span>Guardar Ajustes de Producción</span>
            </button>
          </div>
        </form>
      )}

      {/* SUBTAB 3: MOTOR DE VOZ (PIPER TTS) */}
      {activeSubTab === 'tts' && (
        <div className="mt-6 space-y-6 relative z-10 animate-fadeIn">
          {/* Diagnostic Card Header */}
          <div className="p-6 rounded-3xl glass-card border border-white/15 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white font-display flex items-center gap-2">
                    MOTOR DE VOZ
                  </h3>
                  <p className="text-xs text-slate-400">
                    Diagnóstico en tiempo real del motor local Text-to-Speech (Piper TTS)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={refreshTTSDiagnostic}
                disabled={isLoadingTTSStatus}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTTSStatus ? 'animate-spin' : ''}`} />
                <span>Verificar Estado</span>
              </button>
            </div>

            {/* Diagnostic Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {/* Field 1: Motor */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono-studio block">
                  Motor
                </span>
                <div className="text-base font-extrabold text-white flex items-center gap-1.5">
                  <span>Piper TTS</span>
                </div>
                <span className="text-[11px] text-slate-400">Local / Open Source</span>
              </div>

              {/* Field 2: Estado */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono-studio block">
                  Estado
                </span>
                <div className="flex items-center gap-2">
                  {ttsStatus?.available ? (
                    <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                      🟢 Disponible
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-400 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30">
                      🟠 Pendiente de instalación
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 block truncate">
                  {ttsStatus?.available ? 'Listo para locuciones' : 'Requiere binario en servidor'}
                </span>
              </div>

              {/* Field 3: Modelo de voz */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono-studio block">
                  Modelo de voz
                </span>
                <div className="text-sm font-bold text-cyan-300 truncate">
                  {ttsStatus?.voiceModelName || 'es_ES-davefx-medium.onnx'}
                </div>
                <span className="text-[11px] text-slate-400 block truncate">
                  {ttsStatus?.voiceModelPath ? 'Modelo ONNX cargado' : 'Modelo sugerido (Español)'}
                </span>
              </div>

              {/* Field 4: Formato / MP3 */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono-studio block">
                  Formatos de Salida
                </span>
                <div className="flex items-center gap-2 text-xs font-mono-studio font-bold">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    WAV (Nativo)
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded border ${
                      ttsStatus?.ffmpegAvailable
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-800 text-slate-400 border-white/10'
                    }`}
                  >
                    MP3: {ttsStatus?.ffmpegAvailable ? 'Disponible' : 'Pendiente'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block truncate">
                  {ttsStatus?.ffmpegAvailable ? 'FFmpeg detectado' : 'WAV estándar habilitado'}
                </span>
              </div>
            </div>

            {/* Status Notice Box */}
            <div
              className={`mt-6 p-4 rounded-2xl border ${
                ttsStatus?.available
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                  : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
              } text-xs leading-relaxed space-y-1`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {ttsStatus?.available ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                )}
                <span>{ttsStatus?.available ? 'Motor Piper TTS Operativo' : 'Estado de Piper TTS'}</span>
              </div>
              <p className="text-slate-300 text-xs">
                {ttsStatus?.message ||
                  (ttsStatus?.available
                    ? '🟢 Piper TTS está configurado y listo para generar locuciones locales.'
                    : '🎙️ El motor de voz todavía no está instalado en este servidor.')}
              </p>
              {!ttsStatus?.available && (
                <p className="text-slate-400 text-[11px] pt-1">
                  Configura Piper TTS en el servidor para activar la generación gratuita de voces.
                </p>
              )}
            </div>
          </div>

          {/* Spanish Voice Profiles Preview */}
          <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-purple-400" />
                <h4 className="text-base font-bold text-white font-display">
                  Voces Configuradas en Español
                </h4>
              </div>
              <span className="text-xs text-slate-400 font-mono-studio">
                {ttsStatus?.configuredVoices?.length || 8} perfiles
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(ttsStatus?.configuredVoices || [
                { id: 'luna', name: 'Luna', gender: 'Femenina', description: 'Cálida y comercial' },
                { id: 'valentina', name: 'Valentina', gender: 'Femenina', description: 'Elegante y sensual' },
                { id: 'sofia', name: 'Sofía', gender: 'Femenina', description: 'Natural y cercana' },
                { id: 'mia', name: 'Mía', gender: 'Femenina', description: 'Juvenil y dinámica' },
                { id: 'alex', name: 'Alex', gender: 'Masculina', description: 'Moderna y energética' },
                { id: 'sebastian', name: 'Sebastián', gender: 'Masculina', description: 'Profunda y comercial' },
                { id: 'diego', name: 'Diego', gender: 'Masculina', description: 'Cálida y cercana' },
                { id: 'max', name: 'Max', gender: 'Masculina', description: 'Potente y grave' },
              ]).map((v) => (
                <div key={v.id} className="p-3 rounded-2xl bg-black/30 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{v.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono-studio">
                      {v.gender}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{v.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Installation & Technical Guide */}
          <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
              <Terminal className="w-4 h-4" />
              <span>Guía de Configuración en el Servidor</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Para desplegar Piper TTS en producción, añade el ejecutable y el modelo ONNX en tu entorno y define las variables en <code className="text-cyan-300">.env</code>:
            </p>
            <div className="p-3 rounded-xl bg-black/60 border border-white/10 font-mono-studio text-[11px] text-slate-300 space-y-1 overflow-x-auto">
              <div className="text-emerald-400"># Configuración de Piper TTS</div>
              <div>TTS_PROVIDER=&quot;piper&quot;</div>
              <div>PIPER_PATH=&quot;/usr/local/bin/piper&quot;</div>
              <div>PIPER_VOICE_PATH=&quot;/app/voices/es_ES-davefx-medium.onnx&quot;</div>
              <div>FFMPEG_PATH=&quot;/usr/bin/ffmpeg&quot;</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

