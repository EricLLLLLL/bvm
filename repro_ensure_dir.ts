import { mkdir, stat } from 'fs/promises';

const dir = './temp_repro_dir';

console.log('1. Creating dir...');
await mkdir(dir, { recursive: true });

console.log('2. Creating dir again (should be fine)...');
try {
  await mkdir(dir, { recursive: true });
  console.log('Success (no error)');
} catch (e: any) {
  console.log('Error:', e.code, e.message);
}

const file = './temp_repro_file';
await Bun.write(file, 'test');

console.log('3. Try mkdir on file...');
try {
  await mkdir(file, { recursive: true });
} catch (e: any) {
  console.log('Error (expected):', e.code);
}

// Clean up
import { rm } from 'fs/promises';
await rm(dir, { recursive: true, force: true });
await rm(file, { force: true });
