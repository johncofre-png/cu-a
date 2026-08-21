import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  RotateCcw,
  Clock,
  FileText,
  Sparkles,
  Zap,
  Volume2,
  Check,
} from 'lucide-react';
import { ScriptVersion } from '../types';

interface ScriptEditorModalProps {
  version: ScriptVersion | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedVersion: ScriptVersion) => void;
  onRegenerateRequest?: () => void;
}

const QUICK_CUES = [
  { label: '[FX IMPACT]', text: '[FX IMPACT] ' },
  { label: '[FX WHOOSH]', text: '[FX WHOOSH] ' },
  { label: '[FX BASS DROP]', text: '[FX BASS DROP] ' },
  { label: '[FX SWEEP]', text: '[FX SWEEP] ' },
  { label: '[PAUSA]', text: '[PAUSA] ' },
  { label: '[VOZ ENÉRGICA]', text: '[VOZ ENÉRGICA] ' },
  { label: '[VOZ CÁLIDA]', text: '[VOZ CÁLIDA] ' },
  { label: '[VOZ SENSUAL]', text: '[VOZ SENSUAL] ' },
];

export const ScriptEditorModal: React.FC<ScriptEditorModalProps> = ({
  version,
  isOpen,
  onClose,
  onSave,
  onRegenerateRequest,
}) => {
  const [scriptText, setScriptText] = useState('');
  const [title, setTitle] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [estimatedSeconds, setEstimatedSeconds] = useState(0);

  useEffect(() => {
    if (version) {
      setScriptText(version.scriptText);
      setTitle(version.title);
    }
  }, [version]);

  useEffect(() => {
    const cleanWords = scriptText
      .replace(/\[.*?\]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const count = cleanWords.length;
    setWordCount(count);
    // Standard radio locution rate: ~2.4 words per second
    const est = Math.max(1, Math.round(count / 2.4));
    setEstimatedSeconds(est);
  }, [scriptText]);

  if (!isOpen || !version) return null;

  const insertCue = (cueText: string) => {
    setScriptText((prev) => prev + cueText);
  };

  const handleSave = () => {
    onSave({
      ...version,
      title,
      scriptText,
      wordCount,
      estimatedSeconds,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-2xl rounded-3xl neon-border p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Background ambient glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white font-display">
                EDITOR DE GUION RADIAL
              </h3>
              <p className="text-xs text-slate-400">
                Ajusta el texto, pausas o acotaciones para una locución perfecta.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Version title input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Título de la versión
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl frosted-input text-white focus:outline-none focus:border-cyan-400 text-sm font-semibold"
            />
          </div>

          {/* Quick Insert Cues */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Insertar acotaciones de radio:
              </label>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_CUES.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => insertCue(c.text)}
                  className="text-xs px-2.5 py-1 rounded-lg glass-card hover:bg-white/10 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-all font-mono-studio"
                >
                  + {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Texto del guion
            </label>
            <textarea
              rows={7}
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              className="w-full p-4 rounded-2xl frosted-input text-white font-sans text-sm sm:text-base leading-relaxed focus:outline-none focus:border-cyan-400 transition-all"
              placeholder="Escribe o ajusta el guion radial..."
            />
          </div>

          {/* Real-time word count & dynamic duration metrics */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl glass-card">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-mono-studio">Palabras</p>
                <p className="text-lg font-extrabold text-white font-mono-studio">{wordCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-mono-studio">Duración estimada</p>
                <p className="text-lg font-extrabold text-amber-300 font-mono-studio">
                  ~{estimatedSeconds} segundos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/[0.08] shrink-0">
          <button
            type="button"
            onClick={() => {
              setScriptText(version.scriptText);
            }}
            className="px-4 py-2.5 rounded-xl glass-card hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>🔄 Restaurar</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl glass-card hover:bg-white/10 text-slate-300 text-xs font-semibold transition-all"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all glow-neon-blue"
            >
              <Save className="w-4 h-4" />
              <span>💾 Guardar cambios</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
