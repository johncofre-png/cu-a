export interface TTSVoiceProfileMapping {
  profileId: string;
  name: string;
  gender: 'Femenina' | 'Masculina';
  description: string;
  recommendedModel?: string;
  speakerId?: number;
}

export interface TTSStatusInfo {
  provider: 'piper' | string;
  engine: 'Piper TTS';
  available: boolean;
  message: string;
  instructions?: string;
  voice: string | null;
  modelName: string | null;
  modelPath: string | null;
  piperBinaryPath: string | null;
  ffmpegAvailable: boolean;
  mp3Status: 'Disponible' | 'Pendiente';
  supportedFormats: ('wav' | 'mp3')[];
  configuredVoices: {
    id: string;
    name: string;
    gender: string;
    description: string;
  }[];
}

export interface TTSSpeechSettings {
  speed?: number; // 0.8 to 1.2 (maps to length_scale in Piper)
  energy?: number | string;
  pitch?: string;
  emotion?: string;
  pauses?: string;
  outputFormat?: 'wav' | 'mp3';
}

export interface TTSSpeechResult {
  audioId: string;
  format: 'wav' | 'mp3';
  contentType: string;
  audioBuffer: Buffer;
  durationSecondsEstimate: number;
  wordCount: number;
  engineUsed: string;
  voiceUsed: string;
}

export interface ITTSService {
  checkPiperStatus(): Promise<TTSStatusInfo>;
  getStatus(): Promise<TTSStatusInfo>;
  generateSpeech(
    text: string,
    voiceProfileId: string,
    settings?: TTSSpeechSettings
  ): Promise<TTSSpeechResult>;
  testEngine(): Promise<{
    success: boolean;
    step?: string;
    audioId?: string;
    audioUrl?: string;
    durationSeconds?: number;
    message: string;
    technicalError?: string;
  }>;
}
