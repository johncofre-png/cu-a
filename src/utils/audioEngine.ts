import { SoundEffectType, MusicGenre, VoiceSpeed, VoicePitch, VoiceEnergy, VoiceInterpretationConfig } from '../types';
import { generatePiperSpeech } from './ttsClient';

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let analyserNode: AnalyserNode | null = null;
let currentAmbientNode: { stop: () => void } | null = null;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioCtxClass();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.9;
    analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 256;
    analyserNode.smoothingTimeConstant = 0.8;
    masterGain.connect(analyserNode);
    analyserNode.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function getAnalyser(): AnalyserNode | null {
  getAudioContext();
  return analyserNode;
}

export function setMasterVolume(val: number) {
  if (masterGain) {
    masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), audioCtx ? audioCtx.currentTime : 0);
  }
}

// -------------------------------------------------------------
// Real-time Procedural Radio FX Synthesizer (Studio Quality)
// -------------------------------------------------------------
export function playRadioSoundFx(fxType: SoundEffectType, volume = 0.8) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const fxGain = ctx.createGain();
    fxGain.gain.value = volume;
    fxGain.connect(masterGain || ctx.destination);

    switch (fxType) {
      case 'Whoosh': {
        // Filtered white noise with exponential sweep
        const bufferSize = ctx.sampleRate * 0.7;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 3.0;
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(3200, now + 0.35);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.7);

        const env = ctx.createGain();
        env.gain.setValueAtTime(0.001, now);
        env.gain.linearRampToValueAtTime(0.8, now + 0.3);
        env.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

        whiteNoise.connect(filter);
        filter.connect(env);
        env.connect(fxGain);

        whiteNoise.start(now);
        whiteNoise.stop(now + 0.75);
        break;
      }

      case 'Impact': {
        // Deep sub bass drop + punch noise
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(38, now + 0.5);

        oscGain.gain.setValueAtTime(1.0, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.connect(oscGain);
        oscGain.connect(fxGain);
        osc.start(now);
        osc.stop(now + 0.65);

        // Noise transient
        const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
        const data = noiseBuf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuf;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(1200, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(100, now + 0.15);

        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(0.7, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        noise.connect(noiseFilter);
        noiseFilter.connect(nGain);
        nGain.connect(fxGain);
        noise.start(now);
        noise.stop(now + 0.16);
        break;
      }

      case 'Bass Drop': {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.9);

        g.gain.setValueAtTime(0.9, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

        osc.connect(g);
        g.connect(fxGain);
        osc.start(now);
        osc.stop(now + 1.0);
        break;
      }

      case 'Radio Sweep': {
        // FM radio tuning whistle and noise
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.linearRampToValueAtTime(2400, now + 0.2);
        osc.frequency.linearRampToValueAtTime(600, now + 0.45);

        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(0.5, now + 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(g);
        g.connect(fxGain);
        osc.start(now);
        osc.stop(now + 0.55);
        break;
      }

      case 'Riser': {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(1600, now + 0.8);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.exponentialRampToValueAtTime(4000, now + 0.8);

        g.gain.setValueAtTime(0.01, now);
        g.gain.linearRampToValueAtTime(0.6, now + 0.7);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

        osc.connect(filter);
        filter.connect(g);
        g.connect(fxGain);
        osc.start(now);
        osc.stop(now + 0.9);
        break;
      }

      case 'Sweep': {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2000, now);
        osc.frequency.exponentialRampToValueAtTime(350, now + 0.4);

        g.gain.setValueAtTime(0.5, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(g);
        g.connect(fxGain);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
      }

      case 'Hit': {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.18);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.18);

        g.gain.setValueAtTime(0.8, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(filter);
        filter.connect(g);
        g.connect(fxGain);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }

      case 'Glitch': {
        // Stuttering digital pulses
        for (let i = 0; i < 4; i++) {
          const t = now + i * 0.06;
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = i % 2 === 0 ? 'sawtooth' : 'square';
          osc.frequency.setValueAtTime(400 + i * 220, t);

          g.gain.setValueAtTime(0.4, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

          osc.connect(g);
          g.connect(fxGain);
          osc.start(t);
          osc.stop(t + 0.05);
        }
        break;
      }

      case 'Spark': {
        // High harmonic chime
        [1200, 1800, 2400, 3200].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.04);

          g.gain.setValueAtTime(0.2, now + idx * 0.04);
          g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.4);

          osc.connect(g);
          g.connect(fxGain);
          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 0.45);
        });
        break;
      }

      case 'Transición': {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const g = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(250, now);
        osc1.frequency.exponentialRampToValueAtTime(800, now + 0.25);
        osc1.frequency.exponentialRampToValueAtTime(150, now + 0.5);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(400, now);
        osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.25);
        osc2.frequency.exponentialRampToValueAtTime(200, now + 0.5);

        g.gain.setValueAtTime(0.01, now);
        g.gain.linearRampToValueAtTime(0.6, now + 0.2);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

        osc1.connect(g);
        osc2.connect(g);
        g.connect(fxGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.6);
        osc2.stop(now + 0.6);
        break;
      }
    }
  } catch (e) {
    console.error('Error playing sound FX', e);
  }
}

// -------------------------------------------------------------
// Procedural Ambient Music Background Generator
// -------------------------------------------------------------
export function playAmbientMusicBed(genre: MusicGenre, volume = 0.3): { stop: () => void } {
  if (currentAmbientNode) {
    currentAmbientNode.stop();
    currentAmbientNode = null;
  }

  if (genre === 'Sin música') {
    return { stop: () => {} };
  }

  try {
    const ctx = getAudioContext();
    const bedGain = ctx.createGain();
    bedGain.gain.setValueAtTime(volume * 0.35, ctx.currentTime);
    bedGain.connect(masterGain || ctx.destination);

    let isRunning = true;
    const intervalIds: number[] = [];

    // Chords and BPM per genre
    const configByGenre: Record<string, { bpm: number; root: number; chords: number[][] }> = {
      Pop: { bpm: 120, root: 261.63, chords: [[0, 4, 7], [5, 9, 12], [7, 11, 14], [5, 9, 12]] },
      Dance: { bpm: 128, root: 220, chords: [[0, 3, 7], [-2, 2, 5], [0, 3, 7], [3, 7, 10]] },
      Urbano: { bpm: 96, root: 196, chords: [[0, 3, 7], [-2, 2, 5], [0, 3, 7], [-4, 0, 3]] },
      Electrónico: { bpm: 124, root: 164.81, chords: [[0, 7, 12], [3, 10, 15], [-2, 5, 10], [0, 7, 12]] },
      Sexy: { bpm: 85, root: 246.94, chords: [[0, 3, 7, 10], [5, 8, 12, 15], [3, 7, 10, 14], [0, 3, 7, 10]] },
      Nocturno: { bpm: 75, root: 174.61, chords: [[0, 7, 14], [5, 12, 17], [3, 10, 15], [0, 7, 14]] },
      Alegre: { bpm: 122, root: 293.66, chords: [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]] },
      Corporativo: { bpm: 110, root: 261.63, chords: [[0, 4, 7], [2, 5, 9], [5, 9, 12], [7, 11, 14]] },
      Cinemático: { bpm: 70, root: 130.81, chords: [[0, 7, 12], [-3, 4, 9], [-5, 2, 7], [0, 7, 12]] },
    };

    const cfg = configByGenre[genre] || configByGenre.Pop;
    const beatDuration = 60 / cfg.bpm;
    let chordIndex = 0;

    const playChordStep = () => {
      if (!isRunning) return;
      const now = ctx.currentTime;
      const currentChordNotes = cfg.chords[chordIndex % cfg.chords.length];
      chordIndex++;

      // Synth pad notes
      currentChordNotes.forEach((semitone, i) => {
        const freq = cfg.root * Math.pow(2, semitone / 12);
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = genre === 'Electrónico' || genre === 'Dance' ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(genre === 'Nocturno' || genre === 'Sexy' ? 600 : 1800, now);

        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(0.08 / (i + 1), now + beatDuration * 0.5);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + beatDuration * 3.8);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(bedGain);

        osc.start(now);
        osc.stop(now + beatDuration * 4);
      });

      // Subtle rhythm click / pulse for pop/dance/urbano
      if (['Pop', 'Dance', 'Urbano', 'Electrónico'].includes(genre)) {
        const kick = ctx.createOscillator();
        const kGain = ctx.createGain();
        kick.type = 'sine';
        kick.frequency.setValueAtTime(90, now);
        kick.frequency.exponentialRampToValueAtTime(35, now + 0.12);
        kGain.gain.setValueAtTime(0.2, now);
        kGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        kick.connect(kGain);
        kGain.connect(bedGain);
        kick.start(now);
        kick.stop(now + 0.16);
      }
    };

    playChordStep();
    const interval = window.setInterval(playChordStep, beatDuration * 4000);
    intervalIds.push(interval);

    const controller = {
      stop: () => {
        isRunning = false;
        intervalIds.forEach((id) => clearInterval(id));
        try {
          bedGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
        } catch (e) {}
      },
    };

    currentAmbientNode = controller;
    return controller;
  } catch (err) {
    console.error('Ambient music error', err);
    return { stop: () => {} };
  }
}

// -------------------------------------------------------------
// Voice Synthesis & WAV Master Exporter
// -------------------------------------------------------------
export interface RenderVoiceOptions {
  text: string;
  voice: string;
  speed: VoiceSpeed | number;
  pitch?: VoicePitch;
  energy?: VoiceEnergy | number;
  emotion?: string;
  pauses?: string;
  voiceProfileId?: string;
  voiceConfig?: VoiceInterpretationConfig;
  musicGenre?: MusicGenre;
  soundFx?: SoundEffectType[];
  onProgress?: (progress: number, stepText: string) => void;
}

// Helper: Convert clean radio text into Audio Buffer and WAV Blob via Piper TTS Backend
export async function renderRadioCuñaAudio(options: RenderVoiceOptions): Promise<{
  audioUrl: string;
  audioDuration: number;
  blob: Blob;
  mp3Url?: string;
}> {
  const {
    text,
    voice,
    speed,
    pitch,
    energy,
    emotion,
    pauses,
    voiceProfileId,
    voiceConfig,
    onProgress,
  } = options;

  // Clean script text from stage directions for speech
  const cleanSpokenText = text
    .replace(/\[.*?\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanSpokenText) {
    throw new Error('El guion a procesar está vacío.');
  }

  // Speed numeric mapping
  const speedRate =
    voiceConfig?.speed ??
    (typeof speed === 'number' ? speed : Number(speed) || 1.0);

  // Energy percentage
  const energyPercent =
    voiceConfig?.energy ??
    (typeof energy === 'number'
      ? energy
      : energy === 'Muy alta'
      ? 90
      : energy === 'Alta'
      ? 75
      : 60);

  const resolvedVoiceId =
    voiceConfig?.voiceId ||
    voiceProfileId ||
    (voice.toLowerCase().includes('valentina') || voice.toLowerCase().includes('sensual')
      ? 'valentina'
      : voice.toLowerCase().includes('sofia')
      ? 'sofia'
      : voice.toLowerCase().includes('mia') || voice.toLowerCase().includes('juvenil femenina')
      ? 'mia'
      : voice.toLowerCase().includes('alex') || voice.toLowerCase().includes('energética')
      ? 'alex'
      : voice.toLowerCase().includes('sebastian') || voice.toLowerCase().includes('profunda')
      ? 'sebastian'
      : voice.toLowerCase().includes('diego')
      ? 'diego'
      : voice.toLowerCase().includes('max')
      ? 'max'
      : 'luna');

  const resolvedEmotion = voiceConfig?.emotion || emotion || '📢 Comercial';
  const resolvedPauses = voiceConfig?.pauses || pauses || 'Naturales';

  // Call real Piper TTS Backend engine
  const ttsResult = await generatePiperSpeech({
    text: cleanSpokenText,
    voice: resolvedVoiceId,
    settings: {
      speed: speedRate,
      pitch: pitch,
      energy: `${energyPercent}%`,
      emotion: resolvedEmotion,
      pauses: resolvedPauses,
      outputFormat: 'wav',
    },
    onProgress,
  });

  // Fetch the synthesized audio blob from the server
  const response = await fetch(ttsResult.audioUrl);
  const audioBlob = await response.blob();
  const audioBlobUrl = URL.createObjectURL(audioBlob);

  return {
    audioUrl: audioBlobUrl,
    audioDuration: ttsResult.durationSeconds,
    blob: audioBlob,
    mp3Url: ttsResult.mp3Url || undefined,
  };
}


// -------------------------------------------------------------
// Helper: Convert AudioBuffer to Standard PCM WAV Blob
// -------------------------------------------------------------
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new ArrayBuffer(length);
  const view = new DataView(out);
  const channels: Float32Array[] = [];
  let sample = 0;
  let offset = 0;
  let pos = 0;

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit precision

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][pos]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(44 + offset, sample, true);
      offset += 2;
    }
    pos++;
  }

  return new Blob([out], { type: 'audio/wav' });

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}

function createSilentWavBlob(durationSeconds: number): Blob {
  const sampleRate = 44100;
  const numSamples = Math.ceil(sampleRate * durationSeconds);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // Write RIFF header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  return new Blob([buffer], { type: 'audio/wav' });
}

// -------------------------------------------------------------
// Live Spoken Utterance with Web Speech API for preview
// -------------------------------------------------------------
export function speakTextLive(
  text: string,
  voiceName: string,
  speed: VoiceSpeed,
  pitch: VoicePitch,
  onEnd?: () => void
): SpeechSynthesisUtterance | null {
  if (!('speechSynthesis' in window)) return null;

  window.speechSynthesis.cancel();

  const cleanSpoken = text.replace(/\[.*?\]/g, ' ').replace(/\s+/g, ' ').trim();
  const utterance = new SpeechSynthesisUtterance(cleanSpoken);

  const pitchMap: Record<VoicePitch, number> = {
    Grave: 0.82,
    Normal: 1.0,
    Agudo: 1.18,
  };

  utterance.pitch = pitchMap[pitch] || 1.0;
  utterance.rate = Number(speed) || 1.0;
  utterance.lang = 'es-CL';

  const voices = window.speechSynthesis.getVoices();
  const isFemale = voiceName.toLowerCase().includes('femenina') || voiceName.toLowerCase().includes('sensual');
  const spanishVoices = voices.filter((v) => v.lang.startsWith('es'));

  if (spanishVoices.length > 0) {
    if (isFemale) {
      const match = spanishVoices.find(
        (v) =>
          v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('paulina') ||
          v.name.toLowerCase().includes('monica') ||
          v.name.toLowerCase().includes('helena') ||
          v.name.toLowerCase().includes('lucia')
      );
      utterance.voice = match || spanishVoices[0];
    } else {
      const match = spanishVoices.find(
        (v) =>
          v.name.toLowerCase().includes('male') ||
          v.name.toLowerCase().includes('jorge') ||
          v.name.toLowerCase().includes('diego') ||
          v.name.toLowerCase().includes('raul')
      );
      utterance.voice = match || (spanishVoices.length > 1 ? spanishVoices[1] : spanishVoices[0]);
    }
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopLiveSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
