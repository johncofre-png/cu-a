import { ITTSService } from './types';
import { PiperTTSService } from './PiperTTSService';

// Singleton instance of the active TTS service
let activeTTSService: ITTSService | null = null;
const piperServiceInstance = new PiperTTSService();

export function getTTSService(): ITTSService {
  if (!activeTTSService) {
    const provider = (process.env.TTS_PROVIDER || 'piper').toLowerCase();
    if (provider === 'piper') {
      activeTTSService = piperServiceInstance;
    } else {
      // Default to Piper service
      activeTTSService = piperServiceInstance;
    }
  }
  return activeTTSService;
}

export function getPiperService(): PiperTTSService {
  return piperServiceInstance;
}
