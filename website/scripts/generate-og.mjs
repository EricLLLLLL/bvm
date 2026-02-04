import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const root = join(here, '..');
const publicDir = join(root, 'docs', 'public');

const out = join(publicDir, 'og.png');
const logo = join(publicDir, 'logo.svg');

mkdirSync(publicDir, { recursive: true });

// Note: Font availability differs across environments.
// Use generic fonts to avoid ImageMagick warnings.
execFileSync(
  'magick',
  [
    '-size',
    '1200x630',
    'xc:#0b1220',
    '(',
    '-size',
    '1200x630',
    'gradient:#0b1220-#1b2a4a',
    '-rotate',
    '90',
    ')',
    '-compose',
    'over',
    '-composite',
    '(',
    logo,
    '-resize',
    '320x320',
    ')',
    '-geometry',
    '+70+155',
    '-compose',
    'over',
    '-composite',
    '-fill',
    '#ffffff',
    '-font',
    'Helvetica',
    '-pointsize',
    '64',
    '-gravity',
    'northwest',
    '-annotate',
    '+420+170',
    'BVM',
    '-fill',
    '#cbd5e1',
    '-pointsize',
    '28',
    '-annotate',
    '+420+250',
    'Bun Version Manager · zero-dependency · cross-platform',
    '-fill',
    '#f472b6',
    '-pointsize',
    '30',
    '-annotate',
    '+420+330',
    'Install:',
    '-fill',
    '#e2e8f0',
    '-font',
    'Courier',
    '-pointsize',
    '24',
    '-annotate',
    '+420+380',
    'curl -fsSL https://bvm-core.pages.dev/install | bash',
    '-annotate',
    '+420+418',
    'irm https://bvm-core.pages.dev/install | iex',
    '-annotate',
    '+420+456',
    'npm install -g bvm-core@latest --foreground-scripts',
    out,
  ],
  { stdio: 'inherit' },
);

console.log(`✅ Wrote ${out}`);

