import { CunaItem, StudioSettings, RadioIdentity } from '../types';

const STORAGE_KEY_CUNAS = 'cuna_ia_radio_studio_items_v1';
const STORAGE_KEY_SETTINGS = 'cuna_ia_radio_studio_settings_v1';

export const DEFAULT_RADIO_IDENTITY: RadioIdentity = {
  id: 'radio-me-gusta-default',
  radioName: 'Radio Me Gusta',
  stationType: 'Radio Online',
  frequency: '',
  slogan: '',
  website: '',
  instagram: '',
  facebook: '',
  tiktok: '',
  whatsapp: '',
  mainHost: 'John',
  mainProgram: 'Modo Random',
  isDefault: true,
};

export const DEFAULT_SETTINGS: StudioSettings = {
  defaultRadioName: 'Radio Me Gusta',
  defaultSlogan: 'Radio Online',
  defaultVoice: 'Voz energética',
  defaultStyle: '🔥 Potente',
  defaultDuration: 20,
  ttsProvider: 'gemini',
  activeRadioIdentity: DEFAULT_RADIO_IDENTITY,
  radioIdentities: [DEFAULT_RADIO_IDENTITY],
};

const SAMPLE_CUNAS: CunaItem[] = [
  {
    id: 'sample-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    radioName: 'Radio Me Gusta',
    programName: 'Modo Random',
    cunaType: 'Promoción de programa',
    infoPrompt: 'Programa musical con éxitos de los 80, 90 y 2000. Todos los viernes a las 21:00. Conduce John.',
    duration: 20,
    styles: ['🔥 Potente', '🎉 Alegre'],
    voice: 'Voz masculina profunda',
    selectedVersion: {
      id: 'v1-sample-1',
      versionType: 'Comercial',
      title: 'Versión 1 — Comercial',
      tagline: 'Cuña profesional y vendedora',
      scriptText: 'Tus viernes se viven con los mejores recuerdos. Llega Modo Random junto a John con tres décadas de éxitos: 80s, 90s y 2000. Viernes a las 21:00 horas, solo por Radio Me Gusta.',
      targetDurationSeconds: 20,
      wordCount: 36,
      estimatedSeconds: 16,
      fxSuggestions: ['Sweep', 'Spark'],
      voiceProfile: 'Voz comercial',
    },
    allVersions: [
      {
        id: 'v1-sample-1',
        versionType: 'Comercial',
        title: 'Versión 1 — Comercial',
        tagline: 'Cuña profesional y vendedora',
        scriptText: 'Tus viernes se viven con los mejores recuerdos. Llega Modo Random junto a John con tres décadas de éxitos: 80s, 90s y 2000. Viernes a las 21:00 horas, solo por Radio Me Gusta.',
        targetDurationSeconds: 20,
        wordCount: 36,
        estimatedSeconds: 16,
        fxSuggestions: ['Sweep', 'Spark'],
        voiceProfile: 'Voz comercial',
      },
      {
        id: 'v2-sample-1',
        versionType: 'Impacto',
        title: 'Versión 2 — Impacto',
        tagline: 'Apertura de alto impacto y energía',
        scriptText: '¡Sube el volumen y prepárate para cantar! Los himnos que marcaron tu vida regresan en Modo Random con John. Este viernes a las 21:00 horas en Radio Me Gusta.',
        targetDurationSeconds: 20,
        wordCount: 30,
        estimatedSeconds: 14,
        fxSuggestions: ['Impact', 'Whoosh', 'Bass Drop'],
        voiceProfile: 'Voz energética',
      },
      {
        id: 'v3-sample-1',
        versionType: 'Creativa',
        title: 'Versión 3 — Creativa',
        tagline: 'Concepto fresco y memorable',
        scriptText: 'Imagina volver a escuchar esa canción que te hacía sonreír... En Modo Random tenemos las tres décadas que definieron tu historia. Conéctate los viernes a las 21 con John por Radio Me Gusta.',
        targetDurationSeconds: 20,
        wordCount: 34,
        estimatedSeconds: 15,
        fxSuggestions: ['Radio Sweep', 'Bass Drop'],
        voiceProfile: 'Voz cálida',
      },
    ],
    productionConfig: {
      speed: 1.0,
      energy: 'Muy alta',
      pitch: 'Grave',
      musicGenre: 'Pop',
      soundFx: ['Impact', 'Whoosh'],
      musicVolume: 0.25,
      voiceVolume: 0.9,
    },
    isFavorite: true,
    hasAudio: false,
  },
  {
    id: 'sample-2',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    radioName: 'Radio Me Gusta',
    programName: '',
    cunaType: 'Identificación de radio',
    infoPrompt: 'Radio Me Gusta — Radio Online. La mejor música y entretenimiento digital para acompañar tu día.',
    duration: 15,
    styles: ['✨ Elegante', '🎧 Urbano'],
    voice: 'Voz femenina sensual',
    selectedVersion: {
      id: 'v1-sample-2',
      versionType: 'Comercial',
      title: 'Versión 1 — Comercial',
      tagline: 'Identificación oficial de estación online',
      scriptText: 'Radio Me Gusta — Radio Online. La mejor música, las mejores canciones y entretenimiento digital para acompañar cada instante de tu día.',
      targetDurationSeconds: 15,
      wordCount: 21,
      estimatedSeconds: 10,
      fxSuggestions: ['Sweep', 'Spark'],
      voiceProfile: 'Voz femenina sensual',
    },
    allVersions: [],
    productionConfig: {
      speed: 1.0,
      energy: 'Media',
      pitch: 'Normal',
      musicGenre: 'Sexy',
      soundFx: ['Sweep', 'Spark'],
      musicVolume: 0.2,
      voiceVolume: 0.85,
    },
    isFavorite: false,
    hasAudio: false,
  },
];

export function loadCunasFromStorage(): CunaItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUNAS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CUNAS, JSON.stringify(SAMPLE_CUNAS));
      return SAMPLE_CUNAS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SAMPLE_CUNAS;
  } catch (e) {
    console.error('Error loading cunas from storage', e);
    return SAMPLE_CUNAS;
  }
}

export function saveCunaToStorage(item: CunaItem): CunaItem[] {
  try {
    const current = loadCunasFromStorage();
    const updated = [item, ...current.filter((c) => c.id !== item.id)];
    localStorage.setItem(STORAGE_KEY_CUNAS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving cuna to storage', e);
    return [];
  }
}

export function updateCunaInStorage(item: CunaItem): CunaItem[] {
  try {
    const current = loadCunasFromStorage();
    const updated = current.map((c) => (c.id === item.id ? item : c));
    localStorage.setItem(STORAGE_KEY_CUNAS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error updating cuna', e);
    return [];
  }
}

export function deleteCunaFromStorage(id: string): CunaItem[] {
  try {
    const current = loadCunasFromStorage();
    const updated = current.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY_CUNAS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error deleting cuna', e);
    return [];
  }
}

export function toggleFavoriteInStorage(id: string): CunaItem[] {
  try {
    const current = loadCunasFromStorage();
    const updated = current.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c));
    localStorage.setItem(STORAGE_KEY_CUNAS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error toggling favorite', e);
    return [];
  }
}

export function loadSettings(): StudioSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    const radioIdentities: RadioIdentity[] =
      Array.isArray(parsed.radioIdentities) && parsed.radioIdentities.length > 0
        ? parsed.radioIdentities
        : [DEFAULT_RADIO_IDENTITY];
    const activeRadioIdentity: RadioIdentity =
      parsed.activeRadioIdentity ||
      radioIdentities.find((r) => r.isDefault) ||
      radioIdentities[0] ||
      DEFAULT_RADIO_IDENTITY;

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      activeRadioIdentity,
      radioIdentities,
    };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: StudioSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings', e);
  }
}
