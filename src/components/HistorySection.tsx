import React, { useState } from 'react';
import {
  History,
  Search,
  Star,
  Play,
  Pause,
  Edit3,
  Trash2,
  Download,
  Calendar,
  Clock,
  Radio,
  Tag,
  Flame,
  Volume2,
  Copy,
  Check,
} from 'lucide-react';
import { CunaItem } from '../types';
import { speakTextLive, stopLiveSpeech } from '../utils/audioEngine';

interface HistorySectionProps {
  cunas: CunaItem[];
  onSelectCuna: (cuna: CunaItem) => void;
  onEditCuna: (cuna: CunaItem) => void;
  onDeleteCuna: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onlyFavorites?: boolean;
}

type FilterCategory = 'Todas' | 'Programas' | 'Comerciales' | 'Identificaciones' | 'Eventos' | 'Concursos' | 'Favoritas';

export const HistorySection: React.FC<HistorySectionProps> = ({
  cunas,
  onSelectCuna,
  onEditCuna,
  onDeleteCuna,
  onToggleFavorite,
  onlyFavorites = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>(onlyFavorites ? 'Favoritas' : 'Todas');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filters: FilterCategory[] = [
    'Todas',
    'Programas',
    'Comerciales',
    'Identificaciones',
    'Eventos',
    'Concursos',
    'Favoritas',
  ];

  const handlePlayToggle = (cuna: CunaItem) => {
    if (playingId === cuna.id) {
      stopLiveSpeech();
      setPlayingId(null);
      return;
    }

    setPlayingId(cuna.id);
    speakTextLive(
      cuna.selectedVersion.scriptText,
      cuna.voice,
      cuna.productionConfig.speed as any,
      cuna.productionConfig.pitch,
      () => setPlayingId(null)
    );
  };

  const handleCopyScript = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (cuna: CunaItem) => {
    const textContent = `==============================\nCUÑA IA – RADIO STUDIO MASTER\n==============================\nRadio: ${cuna.radioName}\nPrograma: ${cuna.programName || 'General'}\nTipo: ${cuna.cunaType}\nDuración: ${cuna.duration} segundos\nEstilos: ${cuna.styles.join(', ')}\nVoz: ${cuna.voice}\nFecha: ${new Date(cuna.createdAt).toLocaleString()}\n\nGUION FINAL:\n${cuna.selectedVersion.scriptText}\n\n==============================\nTu radio. Tu voz. Tus cuñas.\n==============================`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `CUNA_${cuna.radioName.replace(/\s+/g, '_')}_${cuna.duration}s.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Filtering & Search
  const filteredCunas = cunas.filter((item) => {
    // Search match
    const searchMatch =
      item.radioName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.programName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cunaType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.selectedVersion.scriptText.toLowerCase().includes(searchTerm.toLowerCase());

    if (!searchMatch) return false;

    // Filter match
    if (activeFilter === 'Favoritas' || onlyFavorites) return item.isFavorite;
    if (activeFilter === 'Programas') return item.cunaType.includes('programa');
    if (activeFilter === 'Comerciales') return item.cunaType.includes('comercial');
    if (activeFilter === 'Identificaciones') return item.cunaType.includes('Identificación');
    if (activeFilter === 'Eventos') return item.cunaType.includes('Evento');
    if (activeFilter === 'Concursos') return item.cunaType.includes('Concurso');

    return true;
  });

  return (
    <div className="space-y-6 my-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-500/30 text-fuchsia-400">
            {onlyFavorites ? <Star className="w-6 h-6 fill-amber-400 text-amber-400" /> : <History className="w-6 h-6" />}
          </span>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              {onlyFavorites ? 'CUÑAS FAVORITAS' : 'MIS CUÑAS'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {filteredCunas.length} cuña{filteredCunas.length !== 1 ? 's' : ''} encontrada{filteredCunas.length !== 1 ? 's' : ''} en el archivo de producción.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por radio, programa, guion..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl frosted-input text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-400 text-sm"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      {!onlyFavorites && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {filters.map((filter) => {
            const isSelected = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-fuchsia-500 to-purple-600 neon-border-pink text-white'
                    : 'glass-card text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                {filter === 'Favoritas' ? '⭐ Favoritas' : filter}
              </button>
            );
          })}
        </div>
      )}

      {/* Cunas List */}
      {filteredCunas.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center">
          <Radio className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300">No hay cuñas guardadas</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? 'No se encontraron resultados con ese término de búsqueda.'
              : 'Comienza creando tu primera cuña con el formulario de producción radial.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCunas.map((cuna) => {
            const isPlaying = playingId === cuna.id;

            return (
              <div
                key={cuna.id}
                className="glass-card-interactive rounded-2xl p-5 border border-white/[0.08] hover:border-cyan-500/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top metadata */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-white font-display">
                          {cuna.radioName}
                        </span>
                        {cuna.programName && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30">
                            {cuna.programName}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Tag className="w-3 h-3 text-cyan-400" />
                        {cuna.cunaType}
                      </span>
                    </div>

                    {/* Favorite Star */}
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(cuna.id)}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      title={cuna.isFavorite ? 'Quitar de favoritos' : 'Marcar favorita'}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          cuna.isFavorite
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-500 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Script preview */}
                  <div className="p-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/5 text-xs text-slate-300 leading-relaxed font-sans line-clamp-3 mb-3">
                    {cuna.selectedVersion.scriptText}
                  </div>

                  {/* Metadata pills */}
                  <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono-studio text-slate-400 mb-4">
                    <span className="px-2 py-0.5 rounded-lg glass-card flex items-center gap-1 text-amber-300">
                      <Clock className="w-3 h-3" />
                      {cuna.duration}s
                    </span>
                    <span className="px-2 py-0.5 rounded-lg glass-card flex items-center gap-1 text-cyan-300">
                      <Volume2 className="w-3 h-3" />
                      {cuna.voice}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg glass-card text-slate-300">
                      {new Date(cuna.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions bottom bar */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10 gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* PLAY */}
                    <button
                      type="button"
                      onClick={() => handlePlayToggle(cuna)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
                        isPlaying
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                          : 'glass-card hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isPlaying ? 'Pausa' : 'Escuchar'}</span>
                    </button>

                    {/* SELECT TO MASTER */}
                    <button
                      type="button"
                      onClick={() => onSelectCuna(cuna)}
                      className="px-3 py-1.5 rounded-lg glass-card hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10"
                    >
                      Cargar en Estudio
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* COPY */}
                    <button
                      type="button"
                      onClick={() => handleCopyScript(cuna.selectedVersion.scriptText, cuna.id)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      title="Copiar guion"
                    >
                      {copiedId === cuna.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    {/* DOWNLOAD */}
                    <button
                      type="button"
                      onClick={() => handleDownload(cuna)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      title="Descargar guion"
                    >
                      <Download className="w-4 h-4 text-cyan-400" />
                    </button>

                    {/* EDIT */}
                    <button
                      type="button"
                      onClick={() => onEditCuna(cuna)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      title="Editar"
                    >
                      <Edit3 className="w-4 h-4 text-amber-400" />
                    </button>

                    {/* DELETE */}
                    <button
                      type="button"
                      onClick={() => onDeleteCuna(cuna.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
