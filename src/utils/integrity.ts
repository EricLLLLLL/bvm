import { createHash, timingSafeEqual } from 'crypto';

export interface ParsedSri {
  algorithm: 'sha512';
  digest: string;
}

export function parseSri(integrity: string): ParsedSri {
  const match = /^sha512-([A-Za-z0-9+/]+={0,2})$/.exec(integrity.trim());
  if (!match) {
    throw new Error('A valid SHA-512 integrity value is required.');
  }

  const expected = Buffer.from(match[1], 'base64');
  if (expected.length !== 64) {
    throw new Error('A valid SHA-512 integrity value is required.');
  }

  return { algorithm: 'sha512', digest: match[1] };
}

export async function verifyFileIntegrity(filePath: string, integrity: string): Promise<void> {
  const parsed = parseSri(integrity);
  const expected = Buffer.from(parsed.digest, 'base64');
  const bytes = await Bun.file(filePath).arrayBuffer();
  const actual = createHash(parsed.algorithm).update(Buffer.from(bytes)).digest();

  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    throw new Error(`Integrity check failed for ${filePath}.`);
  }
}
