import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const root = join(here, '..');
const publicDir = join(root, 'docs', 'public');

const svg = join(publicDir, 'favicon.svg');

mkdirSync(publicDir, { recursive: true });

function magick(args) {
  execFileSync('magick', args, { stdio: 'inherit' });
}

// PNG + ICO from favicon.svg
magick([svg, '-resize', '16x16', join(publicDir, 'favicon-16.png')]);
magick([svg, '-resize', '32x32', join(publicDir, 'favicon-32.png')]);
magick([svg, '-define', 'icon:auto-resize=16,32,48', join(publicDir, 'favicon.ico')]);

// Apple touch icon: MUST be non-transparent (iOS)
magick([
  svg,
  '-resize',
  '180x180',
  '-background',
  '#f472b6',
  '-alpha',
  'remove',
  '-alpha',
  'off',
  join(publicDir, 'apple-touch-icon.png'),
]);

// PWA icons
magick([svg, '-resize', '192x192', join(publicDir, 'icon-192.png')]);
magick([svg, '-resize', '512x512', join(publicDir, 'icon-512.png')]);

console.log('✅ Favicons generated in website/docs/public/');

