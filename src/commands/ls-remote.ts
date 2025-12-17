import { colors } from '../utils/ui';
import { valid, rcompare } from '../utils/semver-lite';
import { normalizeVersion } from '../utils';
import { fetchBunVersions } from '../api';
import { withSpinner } from '../command-runner';

/**
 * Lists all available remote Bun versions.
 */
export async function listRemoteVersions(): Promise<void> {
  await withSpinner(
    'Fetching remote Bun versions...',
    async (spinner) => {
      const versions = await fetchBunVersions();
      
      // Sort versions in descending order
    // Filter for valid semver just in case
    const sortedVersions = versions
      .filter(v => valid(v))
      .filter(v => !v.includes('canary'))
      .sort(rcompare);

      if (sortedVersions.length === 0) {
        throw new Error('No remote Bun versions found.');
      }

      spinner.succeed(colors.green('Available remote Bun versions:'));
      sortedVersions.forEach(version => {
        console.log(`  ${normalizeVersion(version)}`);
      });
    },
    { failMessage: 'Failed to fetch remote Bun versions' },
  );
}
