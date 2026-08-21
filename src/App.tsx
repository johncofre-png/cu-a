import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CunaType,
  CunaStyle,
  VoiceType,
  DurationOption,
  ScriptVersion,
  AudioProductionConfig,
  CunaItem,
  StudioSettings,
  RadioIdentity,
} from './types';
import { Header } from './components/Header';
import { CunaForm } from './components/CunaForm';
import { GeneratingAnimation } from './components/GeneratingAnimation';
import { ScriptVersionsList } from './components/ScriptVersionsList';
import { ScriptEditorModal } from './components/ScriptEditorModal';
import { AudioProductionPanel } from './components/AudioProductionPanel';
import { VoiceStudio } from './components/VoiceStudio';
import { RadioPlayer } from './components/RadioPlayer';
import { HistorySection } from './components/HistorySection';
import { FxSoundboard } from './components/FxSoundboard';
import { SettingsModal } from './components/SettingsModal';
import {
  loadCunasFromStorage,
  saveCunaToStorage,
  updateCunaInStorage,
  deleteCunaFromStorage,
  toggleFavoriteInStorage,
  loadSettings,
  saveSettings,
  DEFAULT_SETTINGS,
} from './utils/storage';
import { renderRadioCuñaAudio } from './utils/audioEngine';
import { Radio, Sparkles, AlertTriangle, ArrowUp } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'create' | 'voces' | 'history' | 'favorites' | 'fx' | 'settings'>('create');
  const [settings, setSettings] = useState<StudioSettings>(DEFAULT_SETTINGS);
  const [cunas, setCunas] = useState<CunaItem[]>([]);

  // Current session creation state
  const [currentRadioName, setCurrentRadioName] = useState('Radio Me Gusta');
  const [currentProgramName, setCurrentProgramName] = useState('Modo Random');
  const [currentCunaType, setCurrentCunaType] = useState<CunaType>('Promoción de programa');
  const [currentInfoPrompt, setCurrentInfoPrompt] = useState('Programa musical con éxitos de los 80, 90 y 2000. Todos los viernes a las 21:00. Conduce John.');
  const [currentDuration, setCurrentDuration] = useState<DurationOption>(20);
  const [currentStyles, setCurrentStyles] = useState<CunaStyle[]>(['🔥 Potente', '⚡ Energético']);
  const [currentVoice, setCurrentVoice] = useState<VoiceType>('Voz energética');

  // Script generation results
  const [isGeneratingScripts, setIsGeneratingScripts] = useState(false);
  const [isRegeneratingAll, setIsRegeneratingAll] = useState(false);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const [generatedVersions, setGeneratedVersions] = useState<ScriptVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<ScriptVersion | null>(null);

  // Script editor modal state
  const [editingVersion, setEditingVersion] = useState<ScriptVersion | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Audio production configuration state
  const [productionConfig, setProductionConfig] = useState<AudioProductionConfig>({
    speed: 1.0,
    energy: 'Muy alta',
    pitch: 'Normal',
    musicGenre: 'Pop',
    soundFx: ['Impact', 'Whoosh'],
    musicVolume: 0.3,
    voiceVolume: 0.9,
  });

  // Audio rendering state
  const [isRenderingAudio, setIsRenderingAudio] = useState(false);
  const [renderStepText, setRenderStepText] = useState('');
  const [renderProgress, setRenderProgress] = useState(0);
  const [completedAudioUrl, setCompletedAudioUrl] = useState<string | undefined>(undefined);
  const [completedDuration, setCompletedDuration] = useState<number>(18);
  const [currentMasterCuna, setCurrentMasterCuna] = useState<CunaItem | null>(null);

  // Error toast state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    const loadedSettings = loadSettings();
    setSettings(loadedSettings);
    const loadedCunas = loadCunasFromStorage();
    setCunas(loadedCunas);

    if (loadedSettings) {
      setCurrentRadioName(loadedSettings.defaultRadioName || 'Radio Me Gusta');
      setCurrentVoice(loadedSettings.defaultVoice || 'Voz energética');
      setCurrentStyles([loadedSettings.defaultStyle || '🔥 Potente']);
      setCurrentDuration(loadedSettings.defaultDuration || 20);
    }
  }, []);

  // Handle Generate Scripts Request
  const handleGenerateScripts = async (formData: {
    radioName: string;
    programName: string;
    cunaType: CunaType;
    infoPrompt: string;
    duration: DurationOption;
    styles: CunaStyle[];
    voice: VoiceType;
    radioIdentity?: RadioIdentity;
  }) => {
    setCurrentRadioName(formData.radioName);
    setCurrentProgramName(formData.programName);
    setCurrentCunaType(formData.cunaType);
    setCurrentInfoPrompt(formData.infoPrompt);
    setCurrentDuration(formData.duration);
    setCurrentStyles(formData.styles);
    setCurrentVoice(formData.voice);

    setIsGeneratingScripts(true);
    setErrorMessage(null);
    setCompletedAudioUrl(undefined);
    setCurrentMasterCuna(null);

    try {
      const response = await fetch('/api/generate-scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          radioName: formData.radioName,
          programName: formData.programName,
          cunaType: formData.cunaType,
          infoPrompt: formData.infoPrompt,
          duration: formData.duration,
          styles: formData.styles,
          voice: formData.voice,
          radioIdentity: formData.radioIdentity || settings.activeRadioIdentity,
        }),
      });

      const data = await response.json();

      if (data.success && Array.isArray(data.versions) && data.versions.length > 0) {
        setGeneratedVersions(data.versions);
        setSelectedVersion(data.versions[0]);
        // Scroll smoothly to results
        setTimeout(() => {
          window.scrollTo({ top: 680, behavior: 'smooth' });
        }, 150);
      } else {
        throw new Error(data.error || 'No se pudieron generar los guiones');
      }
    } catch (err: any) {
      console.error('[CUÑA IA Client Error]:', err);
      setErrorMessage('Ups, hubo un problema al generar la cuña. Inténtalo nuevamente.');
    } finally {
      setIsGeneratingScripts(false);
    }
  };

  // Open script editor
  const handleOpenEditor = (ver: ScriptVersion) => {
    setEditingVersion(ver);
    setIsEditorOpen(true);
  };

  // Regenerate only ONE specific version (Versión 1, 2, or 3) keeping the other 2 untouched
  const handleRegenerateSingleVersion = async (ver: ScriptVersion, index: number) => {
    setRegeneratingIndex(index);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/regenerate-single-version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          radioName: currentRadioName,
          programName: currentProgramName,
          cunaType: currentCunaType,
          infoPrompt: currentInfoPrompt,
          duration: currentDuration,
          styles: currentStyles,
          voice: currentVoice,
          versionType: ver.versionType,
          currentScriptText: ver.scriptText,
          radioIdentity: settings.activeRadioIdentity,
        }),
      });

      const data = await response.json();
      if (data.success && data.version) {
        const updatedList = [...generatedVersions];
        updatedList[index] = data.version;
        setGeneratedVersions(updatedList);

        if (selectedVersion?.id === ver.id) {
          setSelectedVersion(data.version);
        }
      } else {
        throw new Error(data.error || 'No se pudo regenerar la versión');
      }
    } catch (err: any) {
      console.error('[CUÑA IA Single Version Regen Error]:', err);
      setErrorMessage('No se pudo regenerar esta versión. Inténtalo de nuevo.');
    } finally {
      setRegeneratingIndex(null);
    }
  };

  // Regenerate ALL 3 versions from scratch with current form data
  const handleRegenerateAllVersions = async () => {
    setIsRegeneratingAll(true);
    await handleGenerateScripts({
      radioName: currentRadioName,
      programName: currentProgramName,
      cunaType: currentCunaType,
      infoPrompt: currentInfoPrompt,
      duration: currentDuration,
      styles: currentStyles,
      voice: currentVoice,
      radioIdentity: settings.activeRadioIdentity,
    });
    setIsRegeneratingAll(false);
  };

  // Save edited script
  const handleSaveEditedScript = (updated: ScriptVersion) => {
    const updatedList = generatedVersions.map((v) => (v.id === updated.id ? updated : v));
    setGeneratedVersions(updatedList);
    if (selectedVersion?.id === updated.id) {
      setSelectedVersion(updated);
    }
  };

  // Toggle favorite for a script version
  const handleToggleFavoriteVersion = (ver: ScriptVersion) => {
    const updatedList = generatedVersions.map((v) =>
      v.id === ver.id ? { ...v, isFavorite: !v.isFavorite } : v
    );
    setGeneratedVersions(updatedList);
  };

  // Proceed directly to audio production panel
  const handleProceedToProduction = (ver: ScriptVersion) => {
    setSelectedVersion(ver);
    const audioPanel = document.getElementById('seccion-produccion-audio');
    if (audioPanel) {
      audioPanel.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Generate Voice & Master Production
  const handleGenerateVoiceAndProduction = async () => {
    if (!selectedVersion) return;

    setIsRenderingAudio(true);
    setRenderProgress(10);
    setRenderStepText('Preparando voz…');

    try {
      const result = await renderRadioCuñaAudio({
        text: selectedVersion.scriptText,
        voice: currentVoice,
        speed: productionConfig.speed,
        pitch: productionConfig.pitch,
        energy: productionConfig.energy,
        musicGenre: productionConfig.musicGenre,
        soundFx: productionConfig.soundFx,
        voiceConfig: productionConfig.voiceConfig,
        onProgress: (prog, text) => {
          setRenderProgress(prog);
          setRenderStepText(text);
        },
      });

      setRenderProgress(100);
      setRenderStepText('Audio listo.');

      setCompletedAudioUrl(result.audioUrl);
      setCompletedDuration(result.audioDuration);

      // Create permanent Cuna item and save to history
      const newCunaItem: CunaItem = {
        id: 'cuna-' + Date.now(),
        createdAt: new Date().toISOString(),
        radioName: currentRadioName || 'Radio FM',
        programName: currentProgramName,
        cunaType: currentCunaType,
        infoPrompt: currentInfoPrompt,
        duration: currentDuration,
        styles: currentStyles,
        voice: currentVoice,
        selectedVersion: selectedVersion,
        allVersions: generatedVersions,
        productionConfig: productionConfig,
        isFavorite: false,
        hasAudio: true,
        audioBlobUrl: result.audioUrl,
        audioDurationSeconds: result.audioDuration,
      };

      const updatedCunas = saveCunaToStorage(newCunaItem);
      setCunas(updatedCunas);
      setCurrentMasterCuna(newCunaItem);

      // Trigger celebration confetti
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#00f0ff', '#ec4899', '#a855f7', '#fbbf24'],
      });

      // Scroll smoothly to player
      setTimeout(() => {
        const playerEl = document.getElementById('reproductor-master');
        if (playerEl) playerEl.scrollIntoView({ behavior: 'smooth' });
      }, 200);

    } catch (e: any) {
      console.error('Audio generation failed', e);
      if (e?.isPiperNotInstalled || String(e?.message || '').includes('no está instalado')) {
        setErrorMessage(
          '🎙️ El motor de voz todavía no está instalado en este servidor. Configura Piper TTS en el servidor para activar la generación gratuita de voces.'
        );
      } else {
        setErrorMessage(
          e?.message || 'No fue posible generar el audio. Revisa la configuración del proveedor de voz.'
        );
      }
    } finally {
      setIsRenderingAudio(false);
    }

  };

  // Load a historical cuna into the studio
  const handleSelectHistoricalCuna = (cuna: CunaItem) => {
    setCurrentRadioName(cuna.radioName);
    setCurrentProgramName(cuna.programName);
    setCurrentCunaType(cuna.cunaType);
    setCurrentInfoPrompt(cuna.infoPrompt);
    setCurrentDuration(cuna.duration);
    setCurrentStyles(cuna.styles);
    setCurrentVoice(cuna.voice);
    setSelectedVersion(cuna.selectedVersion);
    setGeneratedVersions(cuna.allVersions.length > 0 ? cuna.allVersions : [cuna.selectedVersion]);
    setProductionConfig(cuna.productionConfig);
    setCompletedAudioUrl(cuna.audioBlobUrl);
    setCompletedDuration(cuna.audioDurationSeconds || cuna.duration);
    setCurrentMasterCuna(cuna);
    setActiveTab('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFavorite = (id: string) => {
    const updated = toggleFavoriteInStorage(id);
    setCunas(updated);
  };

  const handleDeleteCuna = (id: string) => {
    const updated = deleteCunaFromStorage(id);
    setCunas(updated);
  };

  const handleSaveSettings = (newSettings: StudioSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    if (newSettings.activeRadioIdentity) {
      setCurrentRadioName(newSettings.activeRadioIdentity.radioName);
      if (newSettings.activeRadioIdentity.mainProgram) {
        setCurrentProgramName(newSettings.activeRadioIdentity.mainProgram);
      }
    }
  };

  const favoritesCount = cunas.filter((c) => c.isFavorite).length;

  return (
    <div className="min-h-screen bg-[#0A0515] text-slate-100 bg-studio-grid flex flex-col justify-between relative overflow-x-hidden">
      {/* Background Ambient Frosted Glass Glows */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/[0.08] rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-1/4 w-[700px] h-[700px] bg-fuchsia-600/[0.07] rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/[0.05] rounded-full blur-[180px] pointer-events-none -z-10" />

      {/* HEADER */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        favoritesCount={favoritesCount}
        isPlaying={Boolean(completedAudioUrl)}
        activeRadioIdentity={settings.activeRadioIdentity}
      />

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 relative z-10">
        {/* Friendly Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl glass-card bg-rose-500/10 border-rose-500/40 text-rose-200 text-sm flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-white transition-colors"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* TAB 1: CREAR CUÑA (MAIN STUDIO) */}
        {activeTab === 'create' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Form */}
            <CunaForm
              onGenerate={handleGenerateScripts}
              isGenerating={isGeneratingScripts}
              activeRadioIdentity={settings.activeRadioIdentity}
              onOpenSettings={() => setActiveTab('settings')}
              initialValues={{
                radioName: currentRadioName,
                programName: currentProgramName,
                cunaType: currentCunaType,
                infoPrompt: currentInfoPrompt,
                duration: currentDuration,
                styles: currentStyles,
                voice: currentVoice,
              }}
            />

            {/* Generating Progress Animation */}
            {isGeneratingScripts && <GeneratingAnimation />}

            {/* Script Versions Results */}
            {generatedVersions.length > 0 && !isGeneratingScripts && (
              <div id="seccion-resultados-guiones">
                <ScriptVersionsList
                  versions={generatedVersions}
                  selectedVersionId={selectedVersion?.id || ''}
                  onSelectVersion={(ver) => setSelectedVersion(ver)}
                  onEditVersion={handleOpenEditor}
                  onProceedToProduction={handleProceedToProduction}
                  onRegenerateSingle={handleRegenerateSingleVersion}
                  onRegenerateAll={handleRegenerateAllVersions}
                  onToggleFavoriteVersion={handleToggleFavoriteVersion}
                  isRegeneratingAll={isRegeneratingAll}
                  regeneratingIndex={regeneratingIndex}
                  voiceName={currentVoice}
                  currentStyleName={currentStyles[0] || 'Potente'}
                  currentCunaTypeName={currentCunaType || 'Promoción de programa'}
                />
              </div>
            )}

            {/* Audio Production Section */}
            {selectedVersion && !isGeneratingScripts && (
              <div id="seccion-produccion-audio">
                <AudioProductionPanel
                  selectedVoice={currentVoice}
                  config={productionConfig}
                  onChangeConfig={(cfg) => setProductionConfig(cfg)}
                  onGenerateAudio={handleGenerateVoiceAndProduction}
                  isRenderingAudio={isRenderingAudio}
                  renderStepText={renderStepText}
                  renderProgress={renderProgress}
                />
              </div>
            )}

            {/* Finished Player Section */}
            {selectedVersion && (completedAudioUrl || currentMasterCuna) && (
              <div id="reproductor-master">
                <RadioPlayer
                  radioName={currentRadioName}
                  programName={currentProgramName}
                  version={selectedVersion}
                  productionConfig={productionConfig}
                  audioBlobUrl={completedAudioUrl}
                  audioDurationSeconds={completedDuration}
                  onEditScript={() => handleOpenEditor(selectedVersion)}
                  onRegenerateOther={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB VOCES: ESTUDIO DE VOCES DEDICADO */}
        {activeTab === 'voces' && (
          <div className="animate-fadeIn">
            <VoiceStudio
              voiceConfig={
                productionConfig.voiceConfig || {
                  voiceId: 'luna',
                  voiceName: 'Luna',
                  speed: 1.0,
                  energy: 70,
                  emotion: '📢 Comercial',
                  pauses: 'Naturales',
                }
              }
              onChangeVoiceConfig={(vCfg) => {
                setProductionConfig({
                  ...productionConfig,
                  voiceConfig: vCfg,
                });
              }}
              onUseInStudio={() => {
                setActiveTab('create');
                setTimeout(() => {
                  const audioPanel = document.getElementById('seccion-produccion-audio');
                  if (audioPanel) {
                    audioPanel.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }, 100);
              }}
            />
          </div>
        )}

        {/* TAB 2: HISTORIAL (MIS CUÑAS) */}
        {activeTab === 'history' && (
          <div className="animate-fadeIn">
            <HistorySection
              cunas={cunas}
              onSelectCuna={handleSelectHistoricalCuna}
              onEditCuna={(c) => {
                handleSelectHistoricalCuna(c);
                handleOpenEditor(c.selectedVersion);
              }}
              onDeleteCuna={handleDeleteCuna}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        )}

        {/* TAB 3: FAVORITAS */}
        {activeTab === 'favorites' && (
          <div className="animate-fadeIn">
            <HistorySection
              cunas={cunas}
              onSelectCuna={handleSelectHistoricalCuna}
              onEditCuna={(c) => {
                handleSelectHistoricalCuna(c);
                handleOpenEditor(c.selectedVersion);
              }}
              onDeleteCuna={handleDeleteCuna}
              onToggleFavorite={handleToggleFavorite}
              onlyFavorites={true}
            />
          </div>
        )}

        {/* TAB 4: FX SOUNDBOARD */}
        {activeTab === 'fx' && (
          <div className="animate-fadeIn">
            <FxSoundboard />
          </div>
        )}

        {/* TAB 5: CONFIGURACIÓN */}
        {activeTab === 'settings' && (
          <div className="animate-fadeIn">
            <SettingsModal
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          </div>
        )}
      </main>

      {/* SCRIPT EDITOR MODAL */}
      <ScriptEditorModal
        version={editingVersion}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveEditedScript}
      />

      {/* FOOTER */}
      <footer className="border-t border-white/[0.08] glass-card py-6 mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-white font-display">CUÑA IA</span>
            <span>– Radio Studio</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400 font-mono-studio">Radio Me Gusta — Radio Online</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              Estudio de Producción Radial con IA
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
