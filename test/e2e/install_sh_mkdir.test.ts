import { describe, expect, test } from 'bun:test';

const installer = await Bun.file(new URL('../../install.sh', import.meta.url)).text();

describe('install.sh directory creation contract', () => {
  test('creates the complete BVM directory tree idempotently', () => {
    expect(installer).toContain(
      'mkdir -p "$BVM_DIR" "$BVM_SRC_DIR" "$BVM_RUNTIME_DIR" "$BVM_BIN_DIR" "$BVM_SHIMS_DIR" "$BVM_ALIAS_DIR" "$BVM_VERSIONS_DIR"',
    );
  });

  test('uses idempotent creation for version-specific runtime directories', () => {
    expect(installer).toContain('mkdir -p "${SYS_RUNTIME_DIR}/bin"');
    expect(installer).toContain('mkdir -p "$BVM_VERSIONS_DIR"');
  });
});
