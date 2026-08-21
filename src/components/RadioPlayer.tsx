import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  RotateCcw,
  Edit3,
  CheckCircle,
  Radio,
  Sparkles,
  Share2,
  Activity,
  Disc,
} from 'lucide-react';
import { ScriptVersion, AudioProductionConfig } from '../types';
import { getAnalyser, setMasterVolume, speakTextLive, stopLiveSpeech } from '../utils/audioEngine';

interface RadioPlayerProps {
  radioName: string;
  programName?: string;
  version: ScriptVersion;
  productionConfig: AudioProductionConfig;
  audioBlobUrl?: string;
  audioDurationSeconds?: number;
  onEditScript: () => void;
  onRegenerateOther: () => void;
}

export const RadioPlayer: React.FC<RadioPlayerProps> = ({
  radioName,
  programName,
  version,
  productionConfig,
  audioBlobUrl,
  audioDurationSeconds = 18,
  onEditScript,
  onRegenerateOther,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<'wav' | 'mp3' | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const totalDuration = audioDurationSeconds || version.estimatedSeconds || 15;

  // Handle audio playback
  useEffect(() => {
    let timer: number | null = null;

    if (isPlaying) {
      // If we have an actual audio element with blob
      if (audioElementRef.current && audioBlobUrl) {
        audioElementRef.current.play().catch(() => {});
      } else {
        // Live speech synthesis fallback
        speakTextLive(
          version.scriptText,
          version.voiceProfile || 'Voz enérgica',
          productionConfig.speed,
          productionConfig.pitch,
          () => {
            setIsPlaying(false);
            setCurrentTime(0);
          }
        );
      }

      // Progress ticker
      timer = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return Math.min(totalDuration, prev + 0.1);
        });
      }, 100);
    } else {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      stopLiveSpeech();
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, audioBlobUrl, totalDuration, version, productionConfig]);

  // Canvas visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const renderWave = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const analyser = getAnalyser();
      let dataArray: Uint8Array = new Uint8Array(64);

      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);
      }

      const barCount = 48;
      const barWidth = width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        let barHeight = 4;

        if (isPlaying) {
          const freqVal = dataArray[i % dataArray.length] || 0;
          const sineWave = Math.sin(phase + i * 0.25) * 15;
          barHeight = Math.max(6, (freqVal / 255) * height * 0.85 + sineWave);
        } else {
          barHeight = Math.sin(phase * 0.5 + i * 0.2) * 3 + 5;
        }

        const x = i * (barWidth + 2);
        const y = (height - barHeight) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#00f0ff');
        gradient.addColorStop(0.5, '#ec4899');
        gradient.addColorStop(1, '#a855f7');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 3, 3]);
        ctx.fill();
      }

      phase += isPlaying ? 0.15 : 0.03;
      animationFrameRef.current = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = val;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    setMasterVolume(val);
    if (audioElementRef.current) {
      audioElementRef.current.volume = val;
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setMasterVolume(volume || 0.8);
    } else {
      setIsMuted(true);
      setMasterVolume(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const downloadFile = (format: 'wav' | 'mp3') => {
    const filename = `CUNA_IA_${(radioName || 'RADIO').replace(/\s+/g, '_')}_${version.versionType}_${Date.now()}.${format}`;

    if (audioBlobUrl) {
      const a = document.createElement('a');
      a.href = audioBlobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Generate text/wav fallback download
      const textBlob = new Blob([`CUÑA IA - RADIO STUDIO\nRadio: ${radioName}\nPrograma: ${programName || 'N/A'}\nVersión: ${version.title}\n\nGUION RADIAL:\n${version.scriptText}`], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(textBlob);
      a.download = `${filename}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    setDownloadSuccess(format);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 neon-border shadow-2xl relative overflow-hidden my-8 glow-neon-blue">
      {/* Hidden audio element if blob exists */}
      {audioBlobUrl && (
        <audio
          ref={audioElementRef}
          src={audioBlobUrl}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
        />
      )}

      {/* Top Banner: CUÑA TERMINADA + ON AIR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-300 font-extrabold uppercase font-mono-studio border border-emerald-500/40">
                CUÑA TERMINADA
              </span>
              <span className="text-xs text-slate-400 font-mono-studio">
                Master 44.1 kHz • Estéreo
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white font-display mt-0.5">
              {radioName} {programName ? `— ${programName}` : ''}
            </h3>
          </div>
        </div>

        {/* ON AIR Indicator */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all ${
              isPlaying
                ? 'bg-rose-600/30 border-rose-500 text-rose-300 glow-on-air animate-pulse'
                : 'glass-card text-slate-500'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isPlaying ? 'bg-red-500 animate-ping' : 'bg-slate-600'
              }`}
            />
            <span className="font-extrabold text-xs tracking-widest font-mono-studio">
              ON AIR
            </span>
          </div>

          <span className="text-xs px-3 py-1.5 rounded-xl glass-card text-cyan-300 font-mono-studio font-semibold border-cyan-500/30">
            {version.versionType}
          </span>
        </div>
      </div>

      {/* Center Waveform Display */}
      <div className="my-6 p-4 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          width={700}
          height={90}
          className="w-full h-20 sm:h-24 block"
        />

        {/* Script Overlay Preview */}
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <span className="truncate max-w-[80%] italic">
            "{version.scriptText.slice(0, 100)}..."
          </span>
          <span className="font-mono-studio text-cyan-400 shrink-0">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </span>
        </div>
      </div>

      {/* Player Controls Bar */}
      <div className="space-y-4">
        {/* Progress scrub bar */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono-studio text-slate-400 w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={totalDuration}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
          />
          <span className="text-xs font-mono-studio text-slate-400 w-10">
            {formatTime(totalDuration)}
          </span>
        </div>

        {/* Main Action Buttons & Volume */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          {/* Play/Pause & Volume */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={togglePlay}
              className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-fuchsia-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95 glow-neon-blue"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 sm:w-28 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-fuchsia-400"
              />
            </div>
          </div>

          {/* Download & Version Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* DOWNLOAD WAV */}
            <button
              type="button"
              onClick={() => downloadFile('wav')}
              className="px-4 py-2.5 rounded-xl glass-card hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 hover:border-cyan-500/40 text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>{downloadSuccess === 'wav' ? '¡Descargado!' : 'Descargar WAV'}</span>
            </button>

            {/* DOWNLOAD MP3 */}
            <button
              type="button"
              onClick={() => downloadFile('mp3')}
              className="px-4 py-2.5 rounded-xl glass-card hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 hover:border-fuchsia-500/40 text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4 text-fuchsia-400" />
              <span>{downloadSuccess === 'mp3' ? '¡Descargado!' : 'Descargar MP3'}</span>
            </button>

            {/* EDIT SCRIPT */}
            <button
              type="button"
              onClick={onEditScript}
              className="p-2.5 rounded-xl glass-card hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all text-xs font-semibold flex items-center gap-1.5"
              title="Editar guion"
            >
              <Edit3 className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Editar guion</span>
            </button>

            {/* GENERATE ANOTHER */}
            <button
              type="button"
              onClick={onRegenerateOther}
              className="p-2.5 rounded-xl glass-card hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all text-xs font-semibold flex items-center gap-1.5"
              title="Generar otra versión"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Otra versión</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
