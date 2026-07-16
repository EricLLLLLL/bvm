import { dirname, resolve } from 'path';

const ALIAS_NAME_PATTERN = /^[A-Za-z0-9_-]+$/;

export function validateAliasName(name: string): string {
  if (!ALIAS_NAME_PATTERN.test(name)) {
    throw new Error(`Invalid alias name '${name}'. Use only letters, numbers, '_' or '-'.`);
  }
  return name;
}

export function resolveAliasPath(aliasDir: string, name: string): string {
  const safeName = validateAliasName(name);
  const base = resolve(aliasDir);
  const candidate = resolve(base, safeName);
  if (dirname(candidate) !== base) {
    throw new Error(`Invalid alias name '${name}'. Alias path escapes the alias directory.`);
  }
  return candidate;
}
