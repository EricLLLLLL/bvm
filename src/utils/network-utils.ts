import { join } from 'path';
import { homedir } from 'os';
export { fetchWithTimeout } from './http';
import { selectRegistries } from './registry-selector';

const BVM_DIR = process.env.BVM_DIR || join(homedir(), '.bvm');
const REGISTRY_CACHE_FILE = join(BVM_DIR, 'cache', 'registry-cache.json');
let cachedRegistry: string | null = null;

interface RegistrySelectionOptions {
    cacheFile?: string;
}

/**
 * Determines the highest-ranked registry from the shared health cache.
 */
export async function getFastestRegistry(options: RegistrySelectionOptions = {}): Promise<string> {
    if (!options.cacheFile && cachedRegistry) return cachedRegistry;

    const cacheFile = options.cacheFile || REGISTRY_CACHE_FILE;
    const selection = await selectRegistries({
        cacheFile,
        forceRefresh: false,
    });
    const winner = selection.candidates[0]?.url || 'https://registry.npmjs.org';
    if (!options.cacheFile) cachedRegistry = winner;
    return winner;
}
