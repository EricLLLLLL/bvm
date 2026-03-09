import { describe, expect, test } from 'bun:test';
import { buildDoctorChecks } from '../src/commands/doctor';

function getCheck(key: string, checks: ReturnType<typeof buildDoctorChecks>) {
  const match = checks.find((item) => item.key === key);
  if (!match) throw new Error(`Missing check: ${key}`);
  return match;
}

describe('doctor checks', () => {
  test('happy path: all checks pass', () => {
    const checks = buildDoctorChecks({
      bvmDir: '/tmp/.bvm',
      bvmDirExists: true,
      pathHasShims: true,
      pathHasBin: true,
      shellType: 'zsh',
      shellRaw: '/bin/zsh',
      directoryWritable: true,
      networkReachable: true,
      osPlatform: 'linux',
    });

    checks.forEach((item) => expect(item.status).toBe('pass'));
  });

  test('error path: PATH missing bvm entries', () => {
    const checks = buildDoctorChecks({
      bvmDir: '/tmp/.bvm',
      bvmDirExists: true,
      pathHasShims: false,
      pathHasBin: false,
      shellType: 'bash',
      shellRaw: '/bin/bash',
      directoryWritable: true,
      networkReachable: true,
      osPlatform: 'linux',
    });

    const pathCheck = getCheck('path', checks);
    expect(pathCheck.status).toBe('fail');
    expect(pathCheck.fixCommand).toContain('bvm setup');
  });

  test('error path: bvm directory is not writable', () => {
    const checks = buildDoctorChecks({
      bvmDir: '/tmp/.bvm',
      bvmDirExists: true,
      pathHasShims: true,
      pathHasBin: true,
      shellType: 'fish',
      shellRaw: '/usr/bin/fish',
      directoryWritable: false,
      networkReachable: true,
      osPlatform: 'linux',
    });

    const permissionCheck = getCheck('permission', checks);
    expect(permissionCheck.status).toBe('fail');
    expect(permissionCheck.fixCommand).toContain('chmod');
  });
});
