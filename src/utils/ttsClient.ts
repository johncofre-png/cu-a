import { TTSStatusInfo } from '../types';

export interface GenerateSpeechResponse {
  success: boolean;
  audioId: string;
  format: 'wav' | 'mp3';
  audioUrl: string;
  mp3Url?: string | null;
  durationSeconds: number;
  wordCount: number;
  engineUsed: string;
  voiceUsed: string;
}

export interface TTSClientError {
  isPiperNotInstalled: boolean;
  message: string;
  instructions?: string;
  statusInfo?: TTSStatusInfo;
}

// Fetch current status of Piper TTS engine on backend
export async function checkTTSStatus(): Promise<TTSStatusInfo> {
  try {
    const res = await fetch('/api/tts/status');
    const data = await res.json();
    if (data.success && data.status) {
      return data.status;
    }
    return {
      provider: 'piper',
      available: false,
      message: 'Piper TTS necesita ser instalado en el servidor para generar audio.',
      instructions: 'Configura Piper TTS en el servidor para activar la generación gratuita de voces.',
      piperBinaryPath: null,
      voiceModelPath: null,
      voiceModelName: null,
      ffmpegAvailable: false,
      supportedFormats: ['wav'],
      configuredVoices: [],
    };
  } catch (err) {
    return {
      provider: 'piper',
      available: false,
      message: 'No se pudo conectar con el servicio de voz en el servidor.',
      instructions: 'Verifica la conexión con el servidor backend.',
      piperBinaryPath: null,
      voiceModelPath: null,
      voiceModelName: null,
      ffmpegAvailable: false,
      supportedFormats: ['wav'],
      configuredVoices: [],
    };
  }
}

// Request audio synthesis from Piper TTS backend
export async function generatePiperSpeech(params: {
  text: string;
  voice: string;
  settings?: {
    speed?: number;
    pitch?: string;
    energy?: number | string;
    emotion?: string;
    pauses?: string;
    outputFormat?: 'wav' | 'mp3';
  };
  onProgress?: (percent: number, stepText: string) => void;
}): Promise<GenerateSpeechResponse> {
  const { text, voice, settings, onProgress } = params;

  onProgress?.(15, 'Preparando guion…');
  await new Promise((r) => setTimeout(r, 200));

  onProgress?.(35, 'Preparando voz…');
  await new Promise((r) => setTimeout(r, 250));

  onProgress?.(65, 'Generando audio…');

  const response = await fetch('/api/tts/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      voice,
      settings,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    const isNotInstalled =
      response.status === 503 ||
      data.error === 'PIPER_NOT_INSTALLED' ||
      String(data.message || '').includes('no está instalado');

    const clientError: TTSClientError = {
      isPiperNotInstalled: isNotInstalled,
      message: isNotInstalled
        ? '🎙️ El motor de voz todavía no está instalado en este servidor.'
        : data.message || 'No fue posible generar el audio. Revisa la configuración del proveedor de voz.',
      instructions: isNotInstalled
        ? 'Configura Piper TTS en el servidor para activar la generación gratuita de voces.'
        : data.details,
    };

    throw clientError;
  }

  onProgress?.(85, 'Procesando audio…');
  await new Promise((r) => setTimeout(r, 200));

  onProgress?.(100, 'Audio listo.');

  return {
    success: true,
    audioId: data.audioId,
    format: data.format || 'wav',
    audioUrl: data.audioUrl,
    mp3Url: data.mp3Url,
    durationSeconds: data.durationSeconds || 15,
    wordCount: data.wordCount || 0,
    engineUsed: data.engineUsed || 'Piper TTS',
    voiceUsed: data.voiceUsed || voice,
  };
}
