import fs from 'fs';
import path from 'path';
import { spawn, execFile } from 'child_process';
import { promisify } from 'util';
import crypto from 'crypto';
import {
  ITTSService,
  TTSStatusInfo,
  TTSSpeechSettings,
  TTSSpeechResult,
  TTSVoiceProfileMapping,
} from './types';

const execFileAsync = promisify(execFile);

// Audio cache in memory with automatic expiration to prevent storage leaks
interface CachedAudioItem {
  id: string;
  wavBuffer: Buffer;
  mp3Buffer?: Buffer;
  createdAt: number;
  voiceUsed: string;
  durationSeconds: number;
}

const audioCache = new Map<string, CachedAudioItem>();

// Clean expired cache items older than 30 mins
setInterval(() => {
  const now = Date.now();
  for (const [id, item] of audioCache.entries()) {
    if (now - item.createdAt > 30 * 60 * 1000) {
      audioCache.delete(id);
    }
  }
}, 5 * 60 * 1000);

// Configured Spanish voice profiles
export const SPANISH_VOICE_PROFILES: TTSVoiceProfileMapping[] = [
  {
    profileId: 'luna',
    name: 'Luna',
    gender: 'Femenina',
    description: 'Voz femenina, cálida y comercial.',
    recommendedModel: 'es_ES-davefx-medium.onnx',
    speakerId: 0,
  },
  {
    profileId: 'valentina',
    name: 'Valentina',
    gender: 'Femenina',
    description: 'Voz femenina, elegante y sensual.',
    recommendedModel: 'es_ES-sharvard-medium.onnx',
    speakerId: 1,
  },
  {
    profileId: 'sofia',
    name: 'Sofía',
    gender: 'Femenina',
    description: 'Voz femenina, natural y cercana.',
    recommendedModel: 'es_ES-carlfm-x_low.onnx',
    speakerId: 2,
  },
  {
    profileId: 'mia',
    name: 'Mía',
    gender: 'Femenina',
    description: 'Voz femenina, juvenil y dinámica.',
    recommendedModel: 'es_MX-ald-medium.onnx',
    speakerId: 3,
  },
  {
    profileId: 'alex',
    name: 'Alex',
    gender: 'Masculina',
    description: 'Voz masculina, moderna y energética.',
    recommendedModel: 'es_ES-davefx-medium.onnx',
    speakerId: 4,
  },
  {
    profileId: 'sebastian',
    name: 'Sebastián',
    gender: 'Masculina',
    description: 'Voz masculina, profunda y comercial.',
    recommendedModel: 'es_ES-sharvard-medium.onnx',
    speakerId: 5,
  },
  {
    profileId: 'diego',
    name: 'Diego',
    gender: 'Masculina',
    description: 'Voz masculina, cálida y cercana.',
    recommendedModel: 'es_ES-carlfm-x_low.onnx',
    speakerId: 6,
  },
  {
    profileId: 'max',
    name: 'Max',
    gender: 'Masculina',
    description: 'Voz masculina, potente y grave.',
    recommendedModel: 'es_MX-ald-medium.onnx',
    speakerId: 7,
  },
];

export class PiperTTSService implements ITTSService {
  private piperRunnerCache: { command: string; baseArgs: string[] } | null = null;
  private ffmpegBinaryCache: string | null = null;
  private lastBinaryCheck = 0;

  // Locate the Piper executable or Python piper-tts runner safely
  private async findPiperRunner(): Promise<{ command: string; baseArgs: string[] } | null> {
    const now = Date.now();
    if (this.piperRunnerCache && now - this.lastBinaryCheck < 30000) {
      return this.piperRunnerCache;
    }

    // 1. Check explicit PIPER_EXECUTABLE_PATH or PIPER_PATH env
    const envExecPath = process.env.PIPER_EXECUTABLE_PATH || process.env.PIPER_PATH;
    if (envExecPath && fs.existsSync(envExecPath)) {
      try {
        fs.accessSync(envExecPath, fs.constants.X_OK);
        this.piperRunnerCache = { command: envExecPath, baseArgs: [] };
        this.lastBinaryCheck = now;
        return this.piperRunnerCache;
      } catch {
        // Not executable
      }
    }

    // 2. Check standard system binary paths
    const candidatePaths = [
      '/usr/local/bin/piper',
      '/usr/bin/piper',
      '/opt/piper/piper',
      path.join(process.cwd(), 'bin', 'piper'),
      path.join(process.cwd(), 'piper', 'piper'),
    ];

    for (const candidate of candidatePaths) {
      if (fs.existsSync(candidate)) {
        try {
          fs.accessSync(candidate, fs.constants.X_OK);
          this.piperRunnerCache = { command: candidate, baseArgs: [] };
          this.lastBinaryCheck = now;
          return this.piperRunnerCache;
        } catch {
          // Continue searching
        }
      }
    }

    // 3. Check system PATH via 'which'
    try {
      const { stdout } = await execFileAsync('which', ['piper']);
      const trimmed = stdout.trim();
      if (trimmed && fs.existsSync(trimmed)) {
        this.piperRunnerCache = { command: trimmed, baseArgs: [] };
        this.lastBinaryCheck = now;
        return this.piperRunnerCache;
      }
    } catch {
      // not in system PATH
    }

    // 4. Check if python3 piper-tts module is installed
    try {
      await execFileAsync('python3', ['-c', 'import piper']);
      this.piperRunnerCache = { command: 'python3', baseArgs: ['-m', 'piper'] };
      this.lastBinaryCheck = now;
      return this.piperRunnerCache;
    } catch {
      // Python piper module not installed
    }

    this.piperRunnerCache = null;
    this.lastBinaryCheck = now;
    return null;
  }

  // Locate FFmpeg binary for WAV -> MP3 conversion
  private async findFFmpegBinary(): Promise<string | null> {
    if (this.ffmpegBinaryCache) return this.ffmpegBinaryCache;

    const envPath = process.env.FFMPEG_PATH;
    if (envPath && fs.existsSync(envPath)) {
      this.ffmpegBinaryCache = envPath;
      return envPath;
    }

    const candidatePaths = ['/usr/bin/ffmpeg', '/usr/local/bin/ffmpeg'];
    for (const candidate of candidatePaths) {
      if (fs.existsSync(candidate)) {
        this.ffmpegBinaryCache = candidate;
        return candidate;
      }
    }

    try {
      const { stdout } = await execFileAsync('which', ['ffmpeg']);
      const trimmed = stdout.trim();
      if (trimmed && fs.existsSync(trimmed)) {
        this.ffmpegBinaryCache = trimmed;
        return trimmed;
      }
    } catch {
      // not found
    }

    return null;
  }

  // Locate Spanish voice model (.onnx)
  private findVoiceModel(voiceProfileId?: string): {
    modelPath: string | null;
    modelName: string | null;
    speakerId?: number;
  } {
    // 1. Check explicit PIPER_MODEL_PATH or PIPER_VOICE_PATH
    const envVoicePath = process.env.PIPER_MODEL_PATH || process.env.PIPER_VOICE_PATH;
    if (envVoicePath && fs.existsSync(envVoicePath)) {
      return {
        modelPath: envVoicePath,
        modelName: path.basename(envVoicePath),
      };
    }

    // 2. Look in local models/ or voices/ directories
    const profile = SPANISH_VOICE_PROFILES.find((p) => p.profileId === voiceProfileId);
    const searchDirs = [
      path.join(process.cwd(), 'models'),
      path.join(process.cwd(), 'voices'),
      '/app/models',
      '/app/voices',
      '/usr/local/share/piper/voices',
    ];

    for (const dir of searchDirs) {
      if (fs.existsSync(dir)) {
        // If a specific voice model for this profile exists
        if (profile?.recommendedModel) {
          const specificPath = path.join(dir, profile.recommendedModel);
          if (fs.existsSync(specificPath)) {
            return {
              modelPath: specificPath,
              modelName: profile.recommendedModel,
              speakerId: profile.speakerId,
            };
          }
        }

        // Check for any Spanish es_ES or es_MX onnx model
        try {
          const files = fs.readdirSync(dir);
          const spanishModel = files.find(
            (f) => (f.startsWith('es_ES') || f.startsWith('es_MX') || f.startsWith('es_')) && f.endsWith('.onnx')
          );
          if (spanishModel) {
            return {
              modelPath: path.join(dir, spanishModel),
              modelName: spanishModel,
              speakerId: profile?.speakerId,
            };
          }

          const anyOnnx = files.find((f) => f.endsWith('.onnx'));
          if (anyOnnx) {
            return {
              modelPath: path.join(dir, anyOnnx),
              modelName: anyOnnx,
              speakerId: profile?.speakerId,
            };
          }
        } catch {
          // ignore read errors
        }
      }
    }

    return { modelPath: null, modelName: null };
  }

  // Real status checker: checks if Piper and Spanish voice model are actually installed
  public async checkPiperStatus(): Promise<TTSStatusInfo> {
    const runner = await this.findPiperRunner();
    const ffmpegPath = await this.findFFmpegBinary();
    const voiceInfo = this.findVoiceModel();

    const hasPiper = Boolean(runner);
    const hasModel = Boolean(voiceInfo.modelPath);
    const isAvailable = hasPiper && hasModel;

    let message = '🟢 Piper TTS está configurado y listo para generar locuciones locales.';
    let instructions = '';

    if (!hasPiper) {
      message = 'Piper TTS necesita ser instalado en el servidor para generar audio.';
      instructions =
        'Para activar la generación gratuita de voces, instala piper-tts (pip install piper-tts) o el ejecutable de Piper en el servidor y define PIPER_EXECUTABLE_PATH.';
    } else if (!hasModel) {
      message = 'Modelo de voz español pendiente de instalación.';
      instructions =
        'Descarga un modelo de voz en español (ej. es_ES-davefx-medium.onnx) y define PIPER_MODEL_PATH con su ruta.';
    }

    return {
      provider: 'piper',
      engine: 'Piper TTS',
      available: isAvailable,
      message,
      instructions,
      voice: voiceInfo.modelName,
      modelName: voiceInfo.modelName || 'Modelo de voz español pendiente de instalación.',
      modelPath: voiceInfo.modelPath,
      piperBinaryPath: runner ? runner.command : null,
      ffmpegAvailable: Boolean(ffmpegPath),
      mp3Status: ffmpegPath ? 'Disponible' : 'Pendiente',
      supportedFormats: ffmpegPath ? ['wav', 'mp3'] : ['wav'],
      configuredVoices: SPANISH_VOICE_PROFILES.map((v) => ({
        id: v.profileId,
        name: v.name,
        gender: v.gender,
        description: v.description,
      })),
    };
  }

  // Alias for getStatus()
  public async getStatus(): Promise<TTSStatusInfo> {
    return this.checkPiperStatus();
  }

  // Convert raw WAV buffer to MP3 using FFmpeg if available
  private async convertWavToMp3(wavBuffer: Buffer, ffmpegPath: string): Promise<Buffer | null> {
    return new Promise((resolve) => {
      try {
        const proc = spawn(ffmpegPath, [
          '-i',
          'pipe:0',
          '-f',
          'mp3',
          '-b:a',
          '192k',
          'pipe:1',
        ]);

        const chunks: Buffer[] = [];
        proc.stdout.on('data', (d) => chunks.push(d));
        proc.on('close', (code) => {
          if (code === 0 && chunks.length > 0) {
            resolve(Buffer.concat(chunks));
          } else {
            resolve(null);
          }
        });
        proc.on('error', () => resolve(null));

        proc.stdin.write(wavBuffer);
        proc.stdin.end();
      } catch {
        resolve(null);
      }
    });
  }

  // Generate speech via Piper TTS strictly in backend
  public async generateSpeech(
    text: string,
    voiceProfileId: string,
    settings?: TTSSpeechSettings
  ): Promise<TTSSpeechResult> {
    const runner = await this.findPiperRunner();
    const voiceInfo = this.findVoiceModel(voiceProfileId);

    if (!runner) {
      throw new Error(
        'PIPER_NOT_INSTALLED: 🎙️ El motor de voz todavía no está instalado en este servidor.'
      );
    }

    if (!voiceInfo.modelPath) {
      throw new Error(
        'MODEL_NOT_FOUND: Modelo de voz español pendiente de instalación.'
      );
    }

    // 1. Sanitize text: remove radio bracket directions, control chars, normalize whitespace
    const sanitizedText = text
      .replace(/\[.*?\]/g, ' ')
      .replace(/[\x00-\x1F\x7F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!sanitizedText) {
      throw new Error('El guion a procesar está vacío.');
    }

    // 2. Calculate length_scale from speed (Piper: length_scale = 1.0 / speed)
    const speed = settings?.speed ? Math.max(0.6, Math.min(1.6, Number(settings.speed))) : 1.0;
    const lengthScale = (1.0 / speed).toFixed(2);

    // 3. Build Piper execution arguments safely
    const args: string[] = [
      ...runner.baseArgs,
      '--model',
      voiceInfo.modelPath,
      '--output_stdout',
      '--length_scale',
      lengthScale,
    ];

    if (typeof voiceInfo.speakerId === 'number') {
      args.push('--speaker', String(voiceInfo.speakerId));
    }

    const configPath = `${voiceInfo.modelPath}.json`;
    if (fs.existsSync(configPath)) {
      args.push('--config', configPath);
    }

    // 4. Execute Piper with streaming stdin (100% safe from shell injection)
    const wavBuffer = await new Promise<Buffer>((resolve, reject) => {
      const proc = spawn(runner.command, args, {
        shell: false,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      const stdoutChunks: Buffer[] = [];
      const stderrChunks: Buffer[] = [];

      proc.stdout.on('data', (chunk) => stdoutChunks.push(chunk));
      proc.stderr.on('data', (chunk) => stderrChunks.push(chunk));

      proc.on('close', (code) => {
        if (code === 0 && stdoutChunks.length > 0) {
          resolve(Buffer.concat(stdoutChunks));
        } else {
          const stderr = Buffer.concat(stderrChunks).toString('utf-8');
          reject(new Error(`Piper TTS falló (código ${code}): ${stderr || 'Error desconocido'}`));
        }
      });

      proc.on('error', (err) => {
        reject(new Error(`No se pudo iniciar el proceso de Piper: ${err.message}`));
      });

      proc.stdin.write(sanitizedText, 'utf-8');
      proc.stdin.end();
    });

    const audioId = `audio-${crypto.randomBytes(8).toString('hex')}`;
    const wordCount = sanitizedText.split(/\s+/).filter(Boolean).length;
    const durationSecondsEstimate = Math.max(2, Math.round((wordCount / (2.4 * speed)) * 10) / 10);

    // Optional MP3 conversion via FFmpeg if requested and available
    const ffmpegPath = await this.findFFmpegBinary();
    let mp3Buffer: Buffer | undefined;

    if (ffmpegPath && settings?.outputFormat === 'mp3') {
      const converted = await this.convertWavToMp3(wavBuffer, ffmpegPath);
      if (converted) mp3Buffer = converted;
    }

    // Store in audio cache
    audioCache.set(audioId, {
      id: audioId,
      wavBuffer,
      mp3Buffer,
      createdAt: Date.now(),
      voiceUsed: voiceProfileId,
      durationSeconds: durationSecondsEstimate,
    });

    return {
      audioId,
      format: mp3Buffer ? 'mp3' : 'wav',
      contentType: mp3Buffer ? 'audio/mpeg' : 'audio/wav',
      audioBuffer: mp3Buffer || wavBuffer,
      durationSecondsEstimate,
      wordCount,
      engineUsed: 'Piper TTS',
      voiceUsed: voiceProfileId,
    };
  }

  // Dedicated test engine method: "🧪 PROBAR PIPER"
  public async testEngine(): Promise<{
    success: boolean;
    step?: string;
    audioId?: string;
    audioUrl?: string;
    durationSeconds?: number;
    message: string;
    technicalError?: string;
  }> {
    // 1. Check if Piper exists
    const runner = await this.findPiperRunner();
    if (!runner) {
      return {
        success: false,
        step: 'piper_binary',
        message: '🟠 Piper necesita configuración.',
        technicalError:
          'No se encontró el ejecutable de Piper ni el módulo piper-tts. Define PIPER_EXECUTABLE_PATH o instala piper-tts en el servidor.',
      };
    }

    // 2. Check if voice model exists
    const voiceInfo = this.findVoiceModel();
    if (!voiceInfo.modelPath) {
      return {
        success: false,
        step: 'piper_model',
        message: '🟠 Piper necesita configuración.',
        technicalError:
          'Modelo de voz español pendiente de instalación. Descarga un modelo .onnx y define PIPER_MODEL_PATH.',
      };
    }

    // 3 & 4. Generate test phrase & WAV
    try {
      const testPhrase = 'Esta es una prueba de voz de CUÑA IA.';
      const result = await this.generateSpeech(testPhrase, 'luna', { speed: 1.0 });

      return {
        success: true,
        step: 'completed',
        audioId: result.audioId,
        audioUrl: `/api/tts/audio/${result.audioId}.wav`,
        durationSeconds: result.durationSecondsEstimate,
        message: '🟢 Piper funciona correctamente.',
      };
    } catch (err: any) {
      return {
        success: false,
        step: 'generation_failed',
        message: '🟠 Piper necesita configuración.',
        technicalError: err?.message || String(err),
      };
    }
  }

  // Get cached audio file by ID and format
  public getCachedAudio(
    audioId: string,
    format: 'wav' | 'mp3' = 'wav'
  ): { buffer: Buffer; contentType: string } | null {
    const item = audioCache.get(audioId);
    if (!item) return null;

    if (format === 'mp3' && item.mp3Buffer) {
      return { buffer: item.mp3Buffer, contentType: 'audio/mpeg' };
    }

    return { buffer: item.wavBuffer, contentType: 'audio/wav' };
  }
}
