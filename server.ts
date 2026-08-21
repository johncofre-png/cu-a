import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { getTTSService, getPiperService } from './src/server/tts/ttsService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client lazily or with fallback
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper to get word count target range based on duration
function getWordRangeForDuration(duration: number): { min: number; max: number; target: number } {
  switch (Number(duration)) {
    case 10:
      return { min: 22, max: 27, target: 25 };
    case 15:
      return { min: 32, max: 40, target: 36 };
    case 20:
      return { min: 43, max: 53, target: 48 };
    case 30:
      return { min: 65, max: 80, target: 72 };
    case 45:
      return { min: 98, max: 120, target: 110 };
    case 60:
      return { min: 130, max: 160, target: 145 };
    default:
      const t = Math.round(Number(duration) * 2.4);
      return { min: Math.round(t * 0.85), max: Math.round(t * 1.15), target: t };
  }
}

// Helper to call Gemini with automatic fallback for high demand (503) or rate limits
async function callGeminiWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config: any;
  }
): Promise<{ text: string; modelUsed: string }> {
  // Try modern flash models in order of priority if temporary 503 demand spikes occur
  const models = ['gemini-3.7-flash', 'gemini-2.5-flash', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });

      if (response && response.text) {
        return { text: response.text, modelUsed: model };
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = String(err?.message || '');
      const isTransient =
        err?.status === 503 ||
        err?.code === 503 ||
        errMsg.includes('503') ||
        errMsg.includes('high demand') ||
        errMsg.includes('UNAVAILABLE') ||
        errMsg.includes('RESOURCE_EXHAUSTED') ||
        err?.status === 429;

      console.warn(`[CUÑA IA] Intento con modelo ${model} retornó: ${errMsg.slice(0, 120)}...`);
      if (isTransient && i < models.length - 1) {
        // Small delay before fallback attempt
        await new Promise((resolve) => setTimeout(resolve, 400));
        continue;
      }
    }
  }

  throw lastError || new Error('No se pudo obtener respuesta de los modelos de IA.');
}

// Fallback high-quality Radio scripts generator
function generateLocalRadioScripts(data: {
  radioName: string;
  stationType?: string;
  frequency?: string;
  slogan?: string;
  website?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  mainHost?: string;
  programName?: string;
  cunaType: string;
  infoPrompt: string;
  duration: number;
  styles: string[];
  voice: string;
  targetVersionType?: 'Comercial' | 'Impacto' | 'Creativa';
}) {
  const {
    radioName,
    stationType = 'Radio Online',
    frequency,
    slogan,
    website,
    whatsapp,
    instagram,
    mainHost,
    programName,
    cunaType,
    infoPrompt,
    duration,
    styles,
    voice,
    targetVersionType,
  } = data;
  const styleClean = (styles[0] || 'Potente').replace(/^[^\w\s]+/, '').trim();
  const radio = radioName && radioName.trim() ? radioName.trim() : 'Radio Me Gusta';
  const program = programName && programName.trim() ? `"${programName.trim()}"` : '';
  const range = getWordRangeForDuration(duration);

  const officialSlogan = slogan && slogan.trim() ? ` — ${slogan.trim()}` : '';
  const stationDial = frequency && frequency.trim() && stationType !== 'Radio Online' ? ` en el ${frequency.trim()}` : '';
  const webMention = website && website.trim() ? ` Visítanos en ${website.trim().replace(/^https?:\/\//, '')}.` : '';

  // Helper to construct a single script conforming to radio rules without brackets or invented info
  const buildScript = (type: 'Comercial' | 'Impacto' | 'Creativa'): {
    versionType: 'Comercial' | 'Impacto' | 'Creativa';
    title: string;
    tagline: string;
    scriptText: string;
    estimatedSeconds: number;
    wordCount: number;
    fxSuggestions: string[];
    voiceProfile: string;
    styleUsed: string;
    cunaTypeUsed: string;
  } => {
    let script = '';
    let title = '';
    let tagline = '';

    if (type === 'Comercial') {
      title = 'Versión 1 — Comercial';
      tagline = 'Cuña profesional y vendedora.';
      if (duration <= 10) {
        script = `Lo que buscas está en ${radio}${stationDial}. ${infoPrompt}.${webMention}`;
      } else if (duration <= 15) {
        script = `Descubre una experiencia diferente en ${radio}${officialSlogan}. ${infoPrompt}. Conéctate y disfruta lo mejor.${webMention}`;
      } else if (duration <= 20) {
        script = `Tu día suena mejor con ${radio}${stationDial}. ${infoPrompt}. ${program ? `Acompáñanos en ${program}. ` : ''}Súmate a nuestra señal y vive la mejor música.${webMention}`;
      } else if (duration <= 30) {
        script = `La radio que te acompaña tiene todo listo para ti. ${infoPrompt}. ${program ? `Cada momento cobra vida en ${program}, por ${radio}. ` : `Disfrútalo cada instante por ${radio}${officialSlogan}. `}Conéctate hoy mismo y siente la diferencia.${webMention}`;
      } else {
        script = `En ${radio}${stationDial} sabemos lo que buscas cuando quieres buena música. Por eso te traemos una propuesta pensada especialmente para ti. ${infoPrompt}. ${program ? `Disfrútalo en ${program}, ` : ''}con la mejor compañía, sonido de alta calidad y la energía que mereces. Conéctate a ${radio}${officialSlogan} y sé parte de nuestra comunidad.${webMention}`;
      }
    } else if (type === 'Impacto') {
      title = 'Versión 2 — Impacto';
      tagline = 'Hook auditivo potente que atrapa al oyente al instante.';
      if (duration <= 10) {
        script = `¡Sube el volumen! ${infoPrompt}. Esto es ${radio}${stationDial}.`;
      } else if (duration <= 15) {
        script = `¡Atención! Porque lo bueno no espera: ${infoPrompt}. Escucha ${radio}${officialSlogan} ahora.${webMention}`;
      } else if (duration <= 20) {
        script = `¡Sube el volumen! ${infoPrompt}. ${program ? `Esto es ${program} en ${radio}. ` : `Solo por ${radio}${stationDial}. `}¡No te lo pierdas!${webMention}`;
      } else if (duration <= 30) {
        script = `¡Atención a todos los oyentes! Prepárate para lo que viene: ${infoPrompt}. ${program ? `La cita es en ${program}, por ${radio}. ` : `Vívelo al máximo junto a ${radio}${officialSlogan}. `}Sube los parlantes, corre la voz y disfruta la mejor música.${webMention}`;
      } else {
        script = `¡Detén todo lo que estás haciendo y escucha esto! Porque la verdadera energía no se detiene: ${infoPrompt}. Si buscas calidad y emoción sin rodeos, este es tu momento. ${program ? `Conéctate a ${program} por ${radio} ` : `Conéctate ahora a ${radio}${stationDial} `}y prepárate para una transmisión con ritmo, potencia y actitud.${webMention}`;
      }
    } else {
      title = 'Versión 3 — Creativa';
      tagline = 'Propuesta original, fresca, entretenida y memorable.';
      if (duration <= 10) {
        script = `Cambia el ritmo. ${infoPrompt}. ${radio}... tu espacio.${webMention}`;
      } else if (duration <= 15) {
        script = `Hay cosas que simplemente no se pueden dejar pasar... ${infoPrompt}. Escúchalo en ${radio}${officialSlogan}.${webMention}`;
      } else if (duration <= 20) {
        script = `Esta noche... cambia el ritmo. ${infoPrompt}. ${program ? `Encuéntralo en ${program} por ${radio}. ` : `Déjate llevar por ${radio}${stationDial}. `}Porque esto... recién comienza.${webMention}`;
      } else if (duration <= 30) {
        script = `Hay momentos que transforman tu día por completo... y este es uno de ellos. ${infoPrompt}. ${program ? `Déjate sorprender en ${program} junto a ${radio}. ` : `Disfruta cada segundo con ${radio}${officialSlogan}. `}Dale play a tus sentidos y conéctate con la señal que siempre va un paso adelante.${webMention}`;
      } else {
        script = `Imagina darle play y encontrar exactamente lo que estabas esperando. Sin vueltas... directo a lo bueno. ${infoPrompt}. ${program ? `Todo esto te espera en ${program}, solo por ${radio}. ` : `Una experiencia única pensada para ti por ${radio}${stationDial}. `}Haz una pausa, respira y conéctate con la señal que le da ritmo a tus días. ${radio}... donde las cosas buenas suceden.${webMention}`;
      }
    }

    const words = script.split(/\s+/).filter(Boolean).length;
    const estimated = Math.max(8, Math.round(words / 2.4));

    return {
      versionType: type,
      title,
      tagline,
      scriptText: script,
      estimatedSeconds: estimated,
      wordCount: words,
      fxSuggestions: type === 'Impacto' ? ['Impact', 'Whoosh'] : type === 'Comercial' ? ['Sweep', 'Hit'] : ['Radio Sweep', 'Glitch'],
      voiceProfile: voice || 'Locutor profesional',
      styleUsed: styleClean,
      cunaTypeUsed: cunaType,
    };
  };

  if (targetVersionType) {
    const single = buildScript(targetVersionType);
    return [{ ...single, id: `v-single-${Date.now()}`, targetDurationSeconds: duration }];
  }

  return [
    { ...buildScript('Comercial'), id: 'v1-' + Date.now(), targetDurationSeconds: duration },
    { ...buildScript('Impacto'), id: 'v2-' + Date.now(), targetDurationSeconds: duration },
    { ...buildScript('Creativa'), id: 'v3-' + Date.now(), targetDurationSeconds: duration },
  ];
}

// API Health / Status
app.get('/api/health', (req, res) => {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    geminiOnline: hasGemini,
    service: 'CUÑA IA – Radio Studio API',
    version: '2.5.0',
  });
});

// Master Radio Producer System Instruction Generator
function getProducerSystemInstruction(options: {
  radioName: string;
  stationType?: string;
  frequency?: string;
  slogan?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  whatsapp?: string;
  mainHost?: string;
  mainProgram?: string;
  programName?: string;
  cunaType: string;
  duration: number;
  styles: string[];
  voice: string;
}) {
  const {
    radioName,
    stationType = 'Radio Online',
    frequency,
    slogan,
    website,
    instagram,
    facebook,
    tiktok,
    whatsapp,
    mainHost,
    mainProgram,
    programName,
    cunaType,
    duration,
    styles,
    voice,
  } = options;

  const wordRange = getWordRangeForDuration(duration);
  const effectiveRadioName = radioName && radioName.trim() ? radioName.trim() : 'Radio Me Gusta';
  const effectiveProgram = programName && programName.trim() ? programName.trim() : mainProgram || '';
  const isOnlineOnly = stationType === 'Radio Online';

  return `Eres un PRODUCTOR CREATIVO Y GUIONISTA MASTER DE RADIO PROFESIONAL de primer nivel para "${effectiveRadioName}".
Tu misión es redactar guiones de cuñas radiales de altísima factura sonora, ritmo impecable y efectividad comunicativa.

REGLA FUNDAMENTAL DE LA IA (OBLIGATORIA Y ESTRICTA):
"Utiliza exclusivamente los datos proporcionados por el usuario.
Nunca inventes una frecuencia.
Nunca inventes un slogan.
Nunca inventes una dirección.
Nunca inventes un teléfono.
Nunca inventes una página web.
Nunca inventes redes sociales.
Nunca inventes horarios.
Nunca inventes nombres de programas.
Nunca inventes nombres de locutores.
Si un dato está vacío, simplemente no lo utilices."

IDENTIDAD CONFIGURADA POR EL USUARIO:
- Nombre de la radio: "${effectiveRadioName}"
- Tipo de emisora: "${stationType}"
${frequency && !isOnlineOnly ? `- Frecuencia configurada: "${frequency}"` : `- Frecuencia: NO TIENE / NO CONFIGURADA (PROHIBIDO inventar o mencionar cualquier frecuencia o número de dial).`}
${slogan ? `- Slogan oficial: "${slogan}"` : `- Slogan: NO CONFIGURADO (No inventes slogans no provistos).`}
${mainHost ? `- Locutor principal: "${mainHost}"` : `- Locutor principal: No especificado.`}
${effectiveProgram ? `- Programa: "${effectiveProgram}"` : `- Programa: No especificado (No inventes nombres de programas).`}
${website ? `- Sitio web oficial: "${website}"` : `- Sitio web: No especificado (No inventes URLs).`}
${whatsapp ? `- WhatsApp oficial: "${whatsapp}"` : `- WhatsApp: No especificado (No inventes teléfonos).`}
${instagram ? `- Instagram oficial: "${instagram}"` : `- Instagram: No especificado.`}
${facebook ? `- Facebook oficial: "${facebook}"` : `- Facebook: No especificado.`}
${tiktok ? `- TikTok oficial: "${tiktok}"` : `- TikTok: No especificado.`}

TRATAMIENTO DE LA SEÑAL Y TIPO DE RADIO:
${
  isOnlineOnly
    ? `Esta emisora es exclusivamente una RADIO ONLINE.
Utiliza expresiones naturales de transmisión digital y streaming como:
- "Estás escuchando ${effectiveRadioName}"
- "${effectiveRadioName} Online"
- "Conéctate a ${effectiveRadioName}"
- "Sigue nuestra transmisión online"
cuando sean apropiadas para la cuña.
ESTRICTAMENTE PROHIBIDO utilizar expresiones de radio tradicional como:
- "sintoniza el..."
- "en el dial"
- "en nuestra frecuencia"
- "FM" o "AM" o números de frecuencia
a menos que esos datos hayan sido configurados explícitamente por el usuario.`
    : `Esta emisora transmite como "${stationType}". ${
        frequency ? `Puedes mencionar su frecuencia oficial "${frequency}" si es oportuno.` : `NO inventes frecuencias si no fue configurada.`
      }`
}

REGLAS DE ORO DEL GUIONISTA:

1. ESTRUCTURA DE 3 VERSIONES COMPLETAMENTE DIFERENTES:
   - VERSIÓN 1 — COMERCIAL: Cuña profesional directa, vendedora, persuasiva, con foco en el mensaje central, beneficios y llamado a la acción.
   - VERSIÓN 2 — IMPACTO: Comienza con una frase hook de apertura que capte inmediatamente la atención del oyente con alta energía y sorpresa.
   - VERSIÓN 3 — CREATIVA: Idea original, fresca, entretenida y memorable, con un ángulo o concepto creativo diferente.
   Las 3 versiones deben ser REALMENTE distintas en concepto y redacción.

2. LENGUAJE RADIAL HABLADO Y NATURAL:
   - Los guiones deben sonar 100% naturales al ser hablados por un locutor profesional.
   - PROHIBIDO utilizar lenguaje académico, corporativo aburrido o frases robóticas.
   - PROHIBIDO comenzar con clichés trillados como "¿Sabías que...?", "En esta ocasión...", "Te presentamos...", "En un mundo donde...".
   - Utiliza frases ágiles, pausas naturales y cadencia rítmica.

3. ADAPTACIÓN AL ESTILO:
   - POTENTE: Frases contundentes, energía e impacto.
   - SEXY: Elegante, sugerente, cálido y seductor.
   - JUVENIL: Fresco, dinámico y actual.
   - ALEGRE: Entusiasta, positivo y vibrante.
   - EMOCIONAL: Cálido, cercano, humano y sentimental.
   - URBANO: Moderno, rítmico y actual.
   - ELEGANTE: Premium, distinguido y sobrio.
   - NOCTURNO: Íntimo, relajado y envolvente.

4. DURACIÓN REAL Y LÍMITE ESTRICTO DE PALABRAS:
   - Velocidad de locución natural de 130 a 160 palabras por minuto.
   - Para ${duration} segundos, el guion DEBE contener exactamente entre ${wordRange.min} y ${wordRange.max} palabras (objetivo ideal: ~${wordRange.target} palabras).

5. TEXTO 100% LIMPIO (SIN CORCHETES NI ETIQUETAS):
   - NO incluyas corchetes ni etiquetas como [IMPACTO], [FX], [PAUSA], [VOZ], [CIERRE].
   - El resultado en scriptText debe ser texto puro y limpio listo para lectura directa o TTS.

6. PAUSAS Y PUNTUACIÓN RADIAL:
   - Utiliza puntos suspensivos ("..."), comas y puntos para marcar respiraciones naturales del locutor.`;
}

// API: Generación de Guiones con Gemini
app.post('/api/generate-scripts', async (req, res) => {
  const {
    radioName,
    programName,
    cunaType,
    infoPrompt,
    duration,
    styles,
    voice,
    radioIdentity,
  } = req.body;

  if (!infoPrompt || !duration || !cunaType) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios: información de la cuña, duración y tipo de cuña.',
    });
  }

  const durationNum = Number(duration) || 20;
  const stylesList = Array.isArray(styles) ? styles : [styles || '🔥 Potente'];
  const styleClean = stylesList.map((s) => String(s).replace(/^[^\w\s]+/, '').trim()).join(', ');
  const wordRange = getWordRangeForDuration(durationNum);

  const effectiveRadioName = radioName || radioIdentity?.radioName || 'Radio Me Gusta';
  const effectiveStationType = radioIdentity?.stationType || 'Radio Online';
  const effectiveFrequency = radioIdentity?.frequency || '';
  const effectiveSlogan = radioIdentity?.slogan || '';
  const effectiveHost = radioIdentity?.mainHost || '';
  const effectiveMainProgram = radioIdentity?.mainProgram || '';

  const ai = getGeminiClient();

  if (!ai) {
    console.log('[CUÑA IA] Modo fallback local activo.');
    const fallbackVersions = generateLocalRadioScripts({
      radioName: effectiveRadioName,
      programName,
      cunaType,
      infoPrompt,
      duration: durationNum,
      styles: stylesList,
      voice,
    });
    return res.json({
      success: true,
      source: 'local-engine',
      versions: fallbackVersions,
    });
  }

  try {
    const systemInstruction = getProducerSystemInstruction({
      radioName: effectiveRadioName,
      stationType: effectiveStationType,
      frequency: effectiveFrequency,
      slogan: effectiveSlogan,
      website: radioIdentity?.website,
      instagram: radioIdentity?.instagram,
      facebook: radioIdentity?.facebook,
      tiktok: radioIdentity?.tiktok,
      whatsapp: radioIdentity?.whatsapp,
      mainHost: effectiveHost,
      mainProgram: effectiveMainProgram,
      programName,
      cunaType,
      duration: durationNum,
      styles: stylesList,
      voice: voice || 'Voz comercial',
    });

    const userPrompt = `PRODUCCIÓN DE CUÑA RADIAL:
- Nombre de la radio: ${effectiveRadioName}
- Tipo de emisora: ${effectiveStationType}
${effectiveFrequency ? `- Frecuencia configurada: ${effectiveFrequency}` : ''}
${effectiveSlogan ? `- Slogan oficial: ${effectiveSlogan}` : ''}
${effectiveHost ? `- Locutor principal: ${effectiveHost}` : ''}
- Nombre del programa para esta cuña: ${programName || effectiveMainProgram || 'No especificado'}
- Tipo de cuña: ${cunaType}
- Duración solicitada: ${durationNum} segundos (Rango estricto: entre ${wordRange.min} y ${wordRange.max} palabras)
- Estilo musical / radial: ${styleClean}
- Locución preferida: ${voice}
- Información y contenido a comunicar: "${infoPrompt}"

Genera exactamente las 3 versiones solicitadas:
1. "Comercial" (Versión 1 — Comercial: Profesional, vendedora y persuasiva)
2. "Impacto" (Versión 2 — Impacto: Hook de alto impacto auditivo de apertura)
3. "Creativa" (Versión 3 — Creativa: Concepto original, fresco y memorable)

Recuerda la REGLA FUNDAMENTAL: Texto 100% limpio sin etiquetas ni corchetes, respetando estrictamente el número de palabras (${wordRange.min} a ${wordRange.max} palabras) y utilizando EXCLUSIVAMENTE los datos provistos sin inventar frecuencias, direcciones, teléfonos, redes o datos falsos.`;

    const { text: responseText, modelUsed } = await callGeminiWithFallback(ai, {
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.75,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            versions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  versionType: {
                    type: Type.STRING,
                    description: 'Debe ser Comercial, Impacto o Creativa',
                  },
                  title: {
                    type: Type.STRING,
                    description: 'Título descriptivo (ej: Versión 1 — Comercial, Versión 2 — Impacto, Versión 3 — Creativa)',
                  },
                  tagline: {
                    type: Type.STRING,
                    description: 'Subtítulo o enfoque creativo del guion',
                  },
                  scriptText: {
                    type: Type.STRING,
                    description: 'Texto limpio del guion para locución o TTS, sin corchetes ni etiquetas [FX]',
                  },
                  estimatedSeconds: {
                    type: Type.INTEGER,
                    description: 'Duración estimada en segundos al leerse a ritmo radial (130-160 palabras por minuto)',
                  },
                  wordCount: {
                    type: Type.INTEGER,
                    description: 'Cantidad exacta de palabras del guion',
                  },
                  fxSuggestions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Lista de 2 a 3 efectos recomendados (ej: Impact, Whoosh, Sweep)',
                  },
                  voiceProfile: {
                    type: Type.STRING,
                    description: 'Recomendación de tono de locución',
                  },
                },
                required: ['versionType', 'title', 'tagline', 'scriptText', 'estimatedSeconds', 'wordCount'],
              },
            },
          },
          required: ['versions'],
        },
      },
    });

    const parsed = JSON.parse(responseText || '{}');
    if (parsed.versions && Array.isArray(parsed.versions) && parsed.versions.length > 0) {
      const versionsWithIds = parsed.versions.map((v: any, index: number) => {
        // Clean up any accidental bracket cues just in case
        const cleanScript = String(v.scriptText || '').replace(/\[.*?\]/g, ' ').replace(/\s+/g, ' ').trim();
        const actualWords = cleanScript.split(/\s+/).filter(Boolean).length;
        const actualSeconds = Math.max(8, Math.round(actualWords / 2.4));

        let normType: 'Comercial' | 'Impacto' | 'Creativa' = 'Comercial';
        if (v.versionType?.toLowerCase().includes('impact') || index === 1) normType = 'Impacto';
        else if (v.versionType?.toLowerCase().includes('creat') || index === 2) normType = 'Creativa';
        else normType = 'Comercial';

        return {
          id: `v-${normType.toLowerCase()}-${Date.now()}-${index}`,
          versionType: normType,
          title: v.title || (normType === 'Comercial' ? 'Versión 1 — Comercial' : normType === 'Impacto' ? 'Versión 2 — Impacto' : 'Versión 3 — Creativa'),
          tagline: v.tagline || (normType === 'Comercial' ? 'Cuña profesional y vendedora' : normType === 'Impacto' ? 'Hook auditivo potente' : 'Propuesta original y memorable'),
          scriptText: cleanScript,
          targetDurationSeconds: durationNum,
          wordCount: actualWords,
          estimatedSeconds: actualSeconds,
          fxSuggestions: v.fxSuggestions || ['Impact', 'Whoosh'],
          voiceProfile: v.voiceProfile || voice || 'Locutor profesional',
          styleUsed: styleClean,
          cunaTypeUsed: cunaType,
        };
      });

      return res.json({
        success: true,
        source: modelUsed,
        versions: versionsWithIds,
      });
    }

    throw new Error('Respuesta de Gemini no contiene las versiones esperadas');
  } catch (error: any) {
    console.error('[CUÑA IA Error en Gemini / Activando Motor Radial de Respaldo]:', error?.message || error);
    const fallbackVersions = generateLocalRadioScripts({
      radioName: effectiveRadioName,
      stationType: effectiveStationType,
      frequency: effectiveFrequency,
      slogan: effectiveSlogan,
      website: radioIdentity?.website,
      whatsapp: radioIdentity?.whatsapp,
      instagram: radioIdentity?.instagram,
      facebook: radioIdentity?.facebook,
      tiktok: radioIdentity?.tiktok,
      mainHost: effectiveHost,
      programName,
      cunaType,
      infoPrompt,
      duration: durationNum,
      styles: stylesList,
      voice,
    });
    return res.json({
      success: true,
      source: 'local-engine-fallback',
      versions: fallbackVersions,
      note: 'Generado con el motor de producción radial.',
    });
  }
});

// API: Regenerar una Sola Versión manteniendo el resto
app.post('/api/regenerate-single-version', async (req, res) => {
  const {
    radioName,
    programName,
    cunaType,
    infoPrompt,
    duration,
    styles,
    voice,
    versionType,
    currentScriptText,
    radioIdentity,
  } = req.body;

  if (!infoPrompt || !duration || !cunaType || !versionType) {
    return res.status(400).json({
      error: 'Faltan campos para regenerar la versión.',
    });
  }

  const durationNum = Number(duration) || 20;
  const stylesList = Array.isArray(styles) ? styles : [styles || '🔥 Potente'];
  const styleClean = stylesList.map((s) => String(s).replace(/^[^\w\s]+/, '').trim()).join(', ');
  const wordRange = getWordRangeForDuration(durationNum);

  const effectiveRadioName = radioName || radioIdentity?.radioName || 'Radio Me Gusta';
  const effectiveStationType = radioIdentity?.stationType || 'Radio Online';
  const effectiveFrequency = radioIdentity?.frequency || '';
  const effectiveSlogan = radioIdentity?.slogan || '';
  const effectiveHost = radioIdentity?.mainHost || '';
  const effectiveMainProgram = radioIdentity?.mainProgram || '';

  const ai = getGeminiClient();

  if (!ai) {
    const fallback = generateLocalRadioScripts({
      radioName: effectiveRadioName,
      programName,
      cunaType,
      infoPrompt,
      duration: durationNum,
      styles: stylesList,
      voice,
      targetVersionType: versionType as any,
    });
    return res.json({
      success: true,
      source: 'local-engine',
      version: fallback[0],
    });
  }

  try {
    const systemInstruction = getProducerSystemInstruction({
      radioName: effectiveRadioName,
      stationType: effectiveStationType,
      frequency: effectiveFrequency,
      slogan: effectiveSlogan,
      website: radioIdentity?.website,
      instagram: radioIdentity?.instagram,
      facebook: radioIdentity?.facebook,
      tiktok: radioIdentity?.tiktok,
      whatsapp: radioIdentity?.whatsapp,
      mainHost: effectiveHost,
      mainProgram: effectiveMainProgram,
      programName,
      cunaType,
      duration: durationNum,
      styles: stylesList,
      voice: voice || 'Voz comercial',
    });

    const userPrompt = `REGENERACIÓN DE UNA SOLA VERSIÓN DE CUÑA RADIAL:
- Tipo de versión a generar: "${versionType}" (${
      versionType === 'Comercial'
        ? 'VERSIÓN 1 — COMERCIAL: Cuña profesional, vendedora y persuasiva'
        : versionType === 'Impacto'
        ? 'VERSIÓN 2 — IMPACTO: Comienza con frase hook de alto impacto auditivo inmediato'
        : 'VERSIÓN 3 — CREATIVA: Propuesta original, diferente y memorable con un ángulo fresco'
    })
- Nombre de la radio: ${effectiveRadioName}
- Tipo de emisora: ${effectiveStationType}
${effectiveFrequency ? `- Frecuencia: ${effectiveFrequency}` : ''}
${effectiveSlogan ? `- Slogan oficial: ${effectiveSlogan}` : ''}
${effectiveHost ? `- Locutor principal: ${effectiveHost}` : ''}
- Nombre del programa: ${programName || effectiveMainProgram || 'No especificado'}
- Tipo de cuña: ${cunaType}
- Duración solicitada: ${durationNum} segundos (${wordRange.min} a ${wordRange.max} palabras)
- Estilo: ${styleClean}
- Locución preferida: ${voice}
- Información factual: "${infoPrompt}"
${currentScriptText ? `- Guion anterior a reemplazar (desarrolla una idea y enfoque creativo DISTINTO a este): "${currentScriptText}"` : ''}

Genera UNA SOLA versión con un concepto creativo nuevo y fresco, respetando estrictamente la duración y la REGLA FUNDAMENTAL de no inventar datos ni frecuencias no provistas.`;

    const { text: responseText, modelUsed } = await callGeminiWithFallback(ai, {
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.85,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            version: {
              type: Type.OBJECT,
              properties: {
                versionType: { type: Type.STRING },
                title: { type: Type.STRING },
                tagline: { type: Type.STRING },
                scriptText: { type: Type.STRING },
                estimatedSeconds: { type: Type.INTEGER },
                wordCount: { type: Type.INTEGER },
                fxSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                voiceProfile: { type: Type.STRING },
              },
              required: ['versionType', 'title', 'tagline', 'scriptText', 'estimatedSeconds', 'wordCount'],
            },
          },
          required: ['version'],
        },
      },
    });

    const parsed = JSON.parse(responseText || '{}');
    if (parsed.version) {
      const v = parsed.version;
      const cleanScript = String(v.scriptText || '').replace(/\[.*?\]/g, ' ').replace(/\s+/g, ' ').trim();
      const actualWords = cleanScript.split(/\s+/).filter(Boolean).length;
      const actualSeconds = Math.max(8, Math.round(actualWords / 2.4));

      const newVersion = {
        id: `v-${versionType.toLowerCase()}-${Date.now()}`,
        versionType: versionType,
        title: v.title || (versionType === 'Comercial' ? 'Versión 1 — Comercial' : versionType === 'Impacto' ? 'Versión 2 — Impacto' : 'Versión 3 — Creativa'),
        tagline: v.tagline || 'Nueva propuesta creativa',
        scriptText: cleanScript,
        targetDurationSeconds: durationNum,
        wordCount: actualWords,
        estimatedSeconds: actualSeconds,
        fxSuggestions: v.fxSuggestions || ['Impact', 'Whoosh'],
        voiceProfile: v.voiceProfile || voice,
        styleUsed: styleClean,
        cunaTypeUsed: cunaType,
      };

      return res.json({
        success: true,
        source: modelUsed,
        version: newVersion,
      });
    }

    throw new Error('Error al parsear la versión regenerada');
  } catch (error: any) {
    console.error('[CUÑA IA Error regenerando versión / Activando Motor de Respaldo]:', error?.message || error);
    const fallback = generateLocalRadioScripts({
      radioName: effectiveRadioName,
      stationType: effectiveStationType,
      frequency: effectiveFrequency,
      slogan: effectiveSlogan,
      website: radioIdentity?.website,
      whatsapp: radioIdentity?.whatsapp,
      instagram: radioIdentity?.instagram,
      facebook: radioIdentity?.facebook,
      tiktok: radioIdentity?.tiktok,
      mainHost: effectiveHost,
      programName,
      cunaType,
      infoPrompt,
      duration: durationNum,
      styles: stylesList,
      voice,
      targetVersionType: versionType as any,
    });
    return res.json({
      success: true,
      source: 'local-engine-fallback',
      version: fallback[0],
    });
  }
});

// API: TTS Status & Diagnostic endpoint (Piper TTS engine)
app.get('/api/tts/status', async (req, res) => {
  try {
    const ttsService = getTTSService();
    const status = await ttsService.checkPiperStatus();
    return res.json({
      success: true,
      status,
    });
  } catch (error: any) {
    console.error('[CUÑA IA TTS Status Error]:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Error al verificar el estado del motor de voz',
    });
  }
});

// API: Generate Voice via Piper TTS
app.post('/api/tts/generate', async (req, res) => {
  const { text, voice, speed, settings } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_TEXT',
      message: 'Se requiere el texto del guion para generar la voz.',
    });
  }

  const voiceId = String(voice || 'luna').toLowerCase();
  const mergedSettings = {
    ...settings,
    speed: typeof speed === 'number' ? speed : settings?.speed || 1.0,
  };

  try {
    const ttsService = getTTSService();
    const result = await ttsService.generateSpeech(text, voiceId, mergedSettings);

    return res.json({
      success: true,
      audioId: result.audioId,
      format: result.format,
      contentType: result.contentType,
      audioUrl: `/api/tts/audio/${result.audioId}.wav`,
      mp3Url: result.format === 'mp3' ? `/api/tts/audio/${result.audioId}.mp3` : null,
      durationSeconds: result.durationSecondsEstimate,
      wordCount: result.wordCount,
      engineUsed: result.engineUsed,
      voiceUsed: result.voiceUsed,
    });
  } catch (error: any) {
    const errMsg = error?.message || '';
    console.warn('[CUÑA IA TTS Generation Error]:', errMsg);

    if (errMsg.includes('PIPER_NOT_INSTALLED')) {
      return res.status(503).json({
        success: false,
        error: 'PIPER_NOT_INSTALLED',
        message: '🎙️ El motor de voz todavía no está instalado en este servidor.',
        instructions: 'Configura Piper TTS en el servidor para activar la generación gratuita de voces.',
      });
    }

    if (errMsg.includes('MODEL_NOT_FOUND')) {
      return res.status(503).json({
        success: false,
        error: 'MODEL_NOT_FOUND',
        message: 'Modelo de voz español pendiente de instalación.',
        instructions: 'Descarga un modelo de voz en español (.onnx) y define PIPER_MODEL_PATH.',
      });
    }

    return res.status(500).json({
      success: false,
      error: 'TTS_GENERATION_FAILED',
      message: 'No fue posible generar el audio. Revisa la configuración del proveedor de voz.',
      details: errMsg,
    });
  }
});

// API: Test Piper Engine (🧪 PROBAR PIPER)
app.post('/api/tts/test', async (req, res) => {
  try {
    const ttsService = getTTSService();
    const testResult = await ttsService.testEngine();
    return res.json(testResult);
  } catch (error: any) {
    console.error('[CUÑA IA TTS Test Error]:', error);
    return res.json({
      success: false,
      message: '🟠 Piper necesita configuración.',
      technicalError: error?.message || String(error),
    });
  }
});

// API: Stream / Download generated audio file (WAV or MP3)
app.get('/api/tts/audio/:filename', (req, res) => {
  const { filename } = req.params;
  const match = filename.match(/^(audio-[a-f0-9]+)\.(wav|mp3)$/i);

  if (!match) {
    return res.status(400).json({ error: 'Identificador de archivo inválido' });
  }

  const [, audioId, ext] = match;
  const format = ext.toLowerCase() as 'wav' | 'mp3';
  const piperService = getPiperService();
  const cached = piperService.getCachedAudio(audioId, format);

  if (!cached) {
    return res.status(404).json({ error: 'Archivo de audio no encontrado o expirado' });
  }

  res.setHeader('Content-Type', cached.contentType);
  res.setHeader('Content-Length', cached.buffer.length);
  res.setHeader(
    'Content-Disposition',
    req.query.download === 'true' ? `attachment; filename="${filename}"` : 'inline'
  );
  res.setHeader('Cache-Control', 'public, max-age=3600');

  return res.send(cached.buffer);
});

// API: TTS Server proxy (Backward compatibility for existing client hooks)
app.post('/api/generate-tts', async (req, res) => {
  const { text, voiceId, voiceName, speed, energy, emotion, pauses } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Texto requerido para síntesis de voz' });
  }

  try {
    const ttsService = getTTSService();
    const result = await ttsService.generateSpeech(text, voiceId || 'luna', {
      speed,
      energy,
      emotion,
      pauses,
    });

    return res.json({
      success: true,
      provider: 'piper-tts',
      audioId: result.audioId,
      audioUrl: `/api/tts/audio/${result.audioId}.wav`,
      durationSeconds: result.durationSecondsEstimate,
      message: 'Audio listo generado con Piper TTS.',
    });
  } catch (error: any) {
    const errMsg = error?.message || '';
    if (errMsg.includes('PIPER_NOT_INSTALLED')) {
      return res.status(503).json({
        success: false,
        error: 'PIPER_NOT_INSTALLED',
        message: '🎙️ El motor de voz todavía no está instalado en este servidor.',
        instructions: 'Configura Piper TTS en el servidor para activar la generación gratuita de voces.',
      });
    }

    return res.status(500).json({
      success: false,
      error: 'No fue posible generar el audio. Revisa la configuración del proveedor de voz.',
    });
  }
});



async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CUÑA IA – Radio Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
