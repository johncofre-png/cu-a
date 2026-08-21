export type CunaType =
  | 'Identificación de radio'
  | 'Promoción de programa'
  | 'Separador'
  | 'Concurso'
  | 'Evento'
  | 'Anuncio comercial'
  | 'Saludo'
  | 'Horario'
  | 'Especial musical'
  | 'Lanzamiento'
  | 'Redes sociales'
  | 'Cuña personalizada';

export type CunaStyle =
  | '🔥 Potente'
  | '💋 Sexy'
  | '😎 Juvenil'
  | '🎉 Alegre'
  | '⚡ Energético'
  | '❤️ Emocional'
  | '😂 Divertido'
  | '🎧 Urbano'
  | '✨ Elegante'
  | '🌙 Nocturno'
  | '📻 FM clásica'
  | '🚀 Futurista';

export type VoiceType =
  | 'Voz femenina'
  | 'Voz masculina'
  | 'Voz juvenil femenina'
  | 'Voz juvenil masculina'
  | 'Voz femenina sensual'
  | 'Voz masculina profunda'
  | 'Voz energética'
  | 'Voz cálida'
  | 'Voz comercial';

export type VoiceProfileId =
  | 'luna'
  | 'valentina'
  | 'sofia'
  | 'mia'
  | 'alex'
  | 'sebastian'
  | 'diego'
  | 'max';

export type VoiceEmotion =
  | '🔥 Energética'
  | '😎 Relajada'
  | '💋 Sensual'
  | '❤️ Emocional'
  | '😂 Divertida'
  | '📢 Comercial'
  | '🎧 Urbana'
  | '✨ Elegante';

export type VoicePauseStyle = 'Naturales' | 'Dinámicas' | 'Rápidas';

export interface VoiceProfile {
  id: VoiceProfileId;
  name: string;
  gender: 'Femenina' | 'Masculina';
  personality: string;
  style: string;
  sampleText: string;
  badge: string;
  ttsReady: boolean;
  color: string;
  avatarIcon?: string;
}

export interface VoiceInterpretationConfig {
  voiceId: VoiceProfileId;
  voiceName: string;
  speed: number; // 0.8 - 1.2
  energy: number; // 0% - 100%
  emotion: VoiceEmotion;
  pauses: VoicePauseStyle;
}

export type DurationOption = 10 | 15 | 20 | 30 | 45 | 60;

export type VoiceSpeed = 0.8 | 0.9 | 1.0 | 1.1 | 1.2;
export type VoiceEnergy = 'Baja' | 'Media' | 'Alta' | 'Muy alta';
export type VoicePitch = 'Grave' | 'Normal' | 'Agudo';

export type MusicGenre =
  | 'Sin música'
  | 'Pop'
  | 'Dance'
  | 'Urbano'
  | 'Electrónico'
  | 'Sexy'
  | 'Nocturno'
  | 'Alegre'
  | 'Corporativo'
  | 'Cinemático';

export type SoundEffectType =
  | 'Whoosh'
  | 'Impact'
  | 'Riser'
  | 'Sweep'
  | 'Bass Drop'
  | 'Radio Sweep'
  | 'Hit'
  | 'Glitch'
  | 'Spark'
  | 'Transición';

export interface ScriptVersion {
  id: string;
  versionType: 'Comercial' | 'Impacto' | 'Creativa' | 'Potente' | 'Personalizada';
  title: string;
  tagline: string;
  scriptText: string;
  targetDurationSeconds: number;
  wordCount: number;
  estimatedSeconds: number;
  fxSuggestions?: string[];
  voiceProfile?: string;
  styleUsed?: string;
  cunaTypeUsed?: string;
  isFavorite?: boolean;
}

export interface AudioProductionConfig {
  speed: VoiceSpeed | number;
  energy: VoiceEnergy | number;
  pitch: VoicePitch;
  emotion?: VoiceEmotion;
  pauses?: VoicePauseStyle;
  voiceProfileId?: VoiceProfileId;
  musicGenre: MusicGenre;
  soundFx: SoundEffectType[];
  musicVolume: number;
  voiceVolume: number;
}


export interface CunaItem {
  id: string;
  createdAt: string;
  radioName: string;
  programName: string;
  cunaType: CunaType;
  infoPrompt: string;
  duration: DurationOption;
  styles: CunaStyle[];
  voice: VoiceType;
  selectedVersion: ScriptVersion;
  allVersions: ScriptVersion[];
  productionConfig: AudioProductionConfig;
  isFavorite: boolean;
  hasAudio: boolean;
  audioBlobUrl?: string;
  audioDurationSeconds?: number;
  mp3BlobUrl?: string;
}

export interface TTSStatusInfo {
  provider: string;
  available: boolean;
  message: string;
  instructions?: string;
  piperBinaryPath: string | null;
  voiceModelPath: string | null;
  voiceModelName: string | null;
  ffmpegAvailable: boolean;
  supportedFormats: ('wav' | 'mp3')[];
  configuredVoices: {
    id: string;
    name: string;
    gender: string;
    description: string;
  }[];
}

export interface RadioIdentity {
  id: string;
  radioName: string;
  stationType: RadioStationType;
  frequency?: string;
  slogan?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  whatsapp?: string;
  mainHost?: string;
  mainProgram?: string;
  isDefault?: boolean;
}

export type RadioStationType =
  | 'Radio Online'
  | 'Radio FM'
  | 'Radio AM'
  | 'Radio Online + FM'
  | 'Radio Online + AM';

export interface StudioSettings {
  defaultRadioName: string;
  defaultSlogan: string;
  defaultVoice: VoiceType;
  defaultStyle: CunaStyle;
  defaultDuration: DurationOption;
  ttsProvider: 'piper' | 'gemini' | 'browser' | 'custom';
  activeRadioIdentity?: RadioIdentity;
  radioIdentities?: RadioIdentity[];
}
