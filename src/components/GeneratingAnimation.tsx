import React, { useEffect, useState } from 'react';
import { Radio, Sparkles, Mic, Music } from 'lucide-react';

interface GeneratingAnimationProps {
  onComplete?: () => void;
}

const STEPS = [
  { text: 'Analizando información y perfil de radio...', icon: '🧠', detail: 'Detectando ganchos, conductores, horarios y estilo chileno' },
  { text: 'Escribiendo guion con lenguaje radial FM...', icon: '✍️', detail: 'Generando 3 versiones: Potente, Comercial y Creativa' },
  { text: 'Preparando producción y efectos sonoros...', icon: '🎛️', detail: 'Calculando ritmos, pausas y sugerencias de locución' },
];

export const GeneratingAnimation: React.FC<GeneratingAnimationProps> = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStepIndex(1), 1400);
    const timer2 = setTimeout(() => setCurrentStepIndex(2), 2800);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const currentStep = STEPS[currentStepIndex];

  return (
    <div className="glass-panel rounded-3xl p-8 sm:p-12 neon-border text-center relative overflow-hidden shadow-2xl my-8">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-fuchsia-500/10 to-transparent pointer-events-none" />

      {/* Equalizer Visualizer */}
      <div className="flex items-end justify-center gap-1.5 sm:gap-2 h-20 mb-8">
        {[40, 75, 95, 60, 85, 100, 70, 90, 50, 80, 65, 95, 45].map((height, i) => (
          <div
            key={i}
            className="w-1.5 sm:w-2 bg-gradient-to-t from-cyan-400 via-fuchsia-500 to-purple-400 rounded-full"
            style={{
              height: `${height}%`,
              animation: `equalizer 0.7s ease-in-out infinite alternate ${i * 0.08}s`,
            }}
          />
        ))}
      </div>

      {/* Main Spinner & Icon */}
      <div className="relative inline-flex items-center justify-center mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 via-fuchsia-500 to-purple-600 p-1 animate-spin duration-3000 neon-border">
          <div className="w-full h-full bg-[#0A0515]/90 rounded-[14px] backdrop-blur-md" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-3xl">
          {currentStep.icon}
        </div>
      </div>

      {/* Text Steps */}
      <div className="space-y-3 max-w-md mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card border-cyan-500/30 text-cyan-300 text-xs font-mono-studio">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          PASO {currentStepIndex + 1} DE 3
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-display transition-all">
          {currentStep.text}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400">
          {currentStep.detail}
        </p>
      </div>

      {/* Progress Bars */}
      <div className="flex justify-center gap-2 max-w-xs mx-auto mt-6">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i <= currentStepIndex
                ? 'bg-gradient-to-r from-cyan-400 to-fuchsia-500 shadow-sm shadow-cyan-500/50'
                : 'bg-white/10'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
