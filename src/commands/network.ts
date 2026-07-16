import {
  selectRegistries,
  type RegistrySelection,
  type SelectRegistriesOptions,
} from '../utils/registry-selector';

interface NetworkCommandDependencies {
  select?: (options: SelectRegistriesOptions) => Promise<RegistrySelection>;
  write?: (line: string) => void;
}

function formatLatency(latencyMs: number | null): string {
  return latencyMs === null ? '-' : `${latencyMs} ms`;
}

export async function networkCommand(
  action?: string,
  dependencies: NetworkCommandDependencies = {},
): Promise<void> {
  if (action && action !== 'test') {
    throw new Error('Usage: bvm network [test]');
  }

  const select = dependencies.select || selectRegistries;
  const write = dependencies.write || console.log;
  const forceRefresh = action === 'test';
  const selection = await select({ forceRefresh });
  const selectedUrl = selection.candidates[0]?.url;

  write(`Mode: ${selection.mode}`);
  write('Registry    Latency    Status');
  for (const candidate of selection.candidates) {
    const health = selection.health.find((item) => item.url === candidate.url);
    const status = health
      ? (health.reachable ? 'reachable' : `unreachable${health.error ? ` (${health.error})` : ''}`)
      : 'not tested';
    const selected = candidate.url === selectedUrl ? ' selected' : '';
    write(`${candidate.id.padEnd(11)} ${formatLatency(health?.latencyMs ?? null).padEnd(10)} ${status}${selected}`);
  }

  if (selection.cacheExpiresAt !== null && !forceRefresh) {
    write(`Cache expires: ${new Date(selection.cacheExpiresAt).toISOString()}`);
  }

  if (forceRefresh && !selection.health.some((item) => item.reachable)) {
    throw new Error('No reachable registry. Check your network or explicit BVM_REGISTRY setting.');
  }
}
