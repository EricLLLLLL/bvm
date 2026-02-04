import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { Terminal, TerminalTheme } from '../ui/terminal';
import { isDone, revealText } from '../utils/typewriter';

type Line = { kind: 'cmd' | 'out' | 'err'; text: string };

type Step = {
  kind: 'cmd' | 'out' | 'err';
  text: string;
  start: number;
  cps: number;
};

const fps = 30;

function buildSteps(startAt: number, steps: Array<Omit<Step, 'start'> & { gapFrames?: number }>): Step[] {
  let t = startAt;
  return steps.map((s) => {
    const step: Step = { kind: s.kind, text: s.text, start: t, cps: s.cps };
    const dur = Math.ceil((s.text.length / s.cps) * fps);
    t += Math.max(10, dur) + (s.gapFrames ?? 12);
    return step;
  });
}

function renderLines(frame: number, steps: Step[]): Line[] {
  const lines: Line[] = [];
  for (const s of steps) {
    if (frame < s.start) break;
    const done = isDone(frame, s.start, s.text, s.cps);
    lines.push({ kind: s.kind, text: done ? s.text : revealText(frame, s.start, s.text, s.cps) });
    if (!done) break;
  }
  return lines;
}

function sceneTheme(kind: 'npm' | 'sh' | 'ps1'): { bg: string; theme: Partial<TerminalTheme> } {
  if (kind === 'npm') {
    return {
      bg: 'radial-gradient(1200px 800px at 15% 15%, #133a2b 0%, #070a0c 55%, #070a0c 100%)',
      theme: {
        frameBg: '#07140f',
        headerBg: 'rgba(88, 255, 175, 0.06)',
        borderColor: 'rgba(88, 255, 175, 0.22)',
        headerBorderColor: 'rgba(88, 255, 175, 0.14)',
        titleColor: 'rgba(200,255,230,0.78)',
        cmdPrefix: '$ ',
      },
    };
  }
  if (kind === 'sh') {
    return {
      bg: 'radial-gradient(1200px 800px at 20% 20%, #173055 0%, #05070c 58%, #05070c 100%)',
      theme: {
        frameBg: '#0b1220',
        headerBg: 'rgba(120, 180, 255, 0.06)',
        borderColor: 'rgba(120, 180, 255, 0.20)',
        headerBorderColor: 'rgba(120, 180, 255, 0.12)',
        titleColor: 'rgba(210,230,255,0.78)',
        cmdPrefix: '$ ',
      },
    };
  }
  return {
    bg: 'radial-gradient(1200px 800px at 18% 18%, #2c1b44 0%, #06070c 58%, #06070c 100%)',
    theme: {
      frameBg: '#140b1f',
      headerBg: 'rgba(200, 150, 255, 0.06)',
      borderColor: 'rgba(200, 150, 255, 0.20)',
      headerBorderColor: 'rgba(200, 150, 255, 0.12)',
      titleColor: 'rgba(235,215,255,0.78)',
      cmdPrefix: 'PS> ',
    },
  };
}

function Chapter(props: {
  title: string;
  subtitle: string;
  kind: 'npm' | 'sh' | 'ps1';
  frame: number;
  fromFrame: number;
  duration: number;
  steps: Step[];
}) {
  const { title, subtitle, kind, frame, fromFrame, duration, steps } = props;
  const local = frame - fromFrame;

  const appear = interpolate(local, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  const vanish = interpolate(local, [duration - 18, duration], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(appear, vanish);
  const translateY = interpolate(local, [0, 18], [18, 0], { extrapolateRight: 'clamp' });

  const { bg, theme } = sceneTheme(kind);
  const lines = renderLines(local, steps);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
      }}
    >
      <div style={{ width: 1040, transform: `translateY(${translateY}px)` }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ color: 'rgba(255,255,255,0.92)', fontSize: 30, fontWeight: 700 }}>{title}</div>
          <div style={{ color: 'rgba(255,255,255,0.70)', fontSize: 16 }}>{subtitle}</div>
        </div>
        <Terminal title={subtitle} lines={lines} theme={theme} />
      </div>
    </div>
  );
}

export const BvmInstallMethods: React.FC = () => {
  const frame = useCurrentFrame();

  const chapterDuration = 8 * fps;
  const gap = 0;

  const npmStart = 0;
  const shStart = npmStart + chapterDuration + gap;
  const psStart = shStart + chapterDuration + gap;

  const npmSteps = React.useMemo(
    () =>
      buildSteps(18, [
        {
          kind: 'cmd',
          cps: 26,
          text: 'npm install -g bvm-core@latest --foreground-scripts',
        },
        {
          kind: 'out',
          cps: 80,
          text:
            '> bvm-core@latest postinstall\n' +
            '> node scripts/postinstall.js\n\n' +
            '[bvm] Starting BVM post-install setup...\n' +
            '[bvm] Racing registries for speed...\n' +
            '[bvm] Winner: npmjs (454ms)\n' +
            '[bvm] Attempting Bun latest...\n' +
            '[bvm] Downloading Bun v1.3.8...\n' +
            '[bvm] Extracting runtime...\n' +
            '[bvm] BVM initialized successfully.\n\n' +
            '[bvm] Next: reopen your terminal (or run: bvm setup)',
          gapFrames: 16,
        },
        { kind: 'cmd', cps: 26, text: 'bvm --version' },
        { kind: 'out', cps: 80, text: '1.1.x (latest)' },
      ]),
    [],
  );

  const shSteps = React.useMemo(
    () =>
      buildSteps(18, [
        { kind: 'cmd', cps: 26, text: 'curl -fsSL https://bvm-core.pages.dev/install | bash' },
        {
          kind: 'out',
          cps: 80,
          text:
            '[bvm] Installing via install.sh\n' +
            '[bvm] Detecting platform: darwin (arm64)\n' +
            '[bvm] Racing registries for speed...\n' +
            '[bvm] Winner: npmmirror (120ms)\n' +
            '[bvm] Downloading bvm-core@latest...\n' +
            '[bvm] Installing to ~/.bvm\n' +
            '[bvm] Running: bvm setup\n' +
            '[bvm] Done. Restart shell.',
        },
        { kind: 'cmd', cps: 26, text: 'bvm install 1.3.3' },
        { kind: 'out', cps: 80, text: '✓ Bun v1.3.3 physically installed.' },
      ]),
    [],
  );

  const psSteps = React.useMemo(
    () =>
      buildSteps(18, [
        { kind: 'cmd', cps: 28, text: 'irm https://bvm-core.pages.dev/install | iex' },
        {
          kind: 'out',
          cps: 85,
          text:
            '[bvm] Installing via install.ps1\n' +
            '[bvm] Windows detected. Checking PATH...\n' +
            '[bvm] Racing registries for speed...\n' +
            '[bvm] Winner: npmjs (454ms)\n' +
            'Downloading Bun v1.3.8...\n' +
            '> 0%\n' +
            '> 20%\n' +
            '> 40%\n' +
            '> 60%\n' +
            '> 80%\n' +
            '> 100%\n' +
            '[bvm] Done. Reopen PowerShell.',
        },
        { kind: 'cmd', cps: 28, text: 'bvm install 1.2.3' },
        { kind: 'out', cps: 85, text: '✓ Bun v1.2.3 physically installed.' },
      ]),
    [],
  );

  const total = psStart + chapterDuration;
  const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [total - 12, total], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <div style={{ width: '100%', height: '100%', opacity }}>
      <Chapter
        title="Install BVM"
        subtitle="1) npm global install (postinstall auto-setup + fastest registry)"
        kind="npm"
        frame={frame}
        fromFrame={npmStart}
        duration={chapterDuration}
        steps={npmSteps}
      />
      <Chapter
        title="Install BVM"
        subtitle="2) install.sh (curl | bash) — fast mirror + shell setup"
        kind="sh"
        frame={frame}
        fromFrame={shStart}
        duration={chapterDuration}
        steps={shSteps}
      />
      <Chapter
        title="Install BVM"
        subtitle="3) install.ps1 (PowerShell) — same flow on Windows"
        kind="ps1"
        frame={frame}
        fromFrame={psStart}
        duration={chapterDuration}
        steps={psSteps}
      />
    </div>
  );
};

