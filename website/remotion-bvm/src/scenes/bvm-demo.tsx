import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { Terminal } from '../ui/terminal';
import { revealText, isDone } from '../utils/typewriter';

type Line = { kind: 'cmd' | 'out' | 'err'; text: string };

type Step = {
  kind: 'cmd' | 'out' | 'err';
  text: string;
  start: number;
  cps: number;
};

const fps = 30;

function buildTimeline(): Step[] {
  let t = 15;
  const cpsCmd = 26;
  const cpsOut = 60;

  const step = (kind: Step['kind'], text: string, cps: number, gapFrames = 12) => {
    const s: Step = { kind, text, start: t, cps };
    const dur = Math.ceil((text.length / cps) * fps);
    t += Math.max(10, dur) + gapFrames;
    return s;
  };

  return [
    step('cmd', 'npm install -g bvm-core@latest --foreground-scripts', cpsCmd),
    step('out', '+ bvm-core@latest\nadded 1 package in 1s', cpsOut),
    step('cmd', 'bvm --version', cpsCmd),
    step('out', '1.1.37', cpsOut),
    step('cmd', 'bvm install latest', cpsCmd),
    step('out', '✓ Bun v1.3.6 physically installed.\n✓ Managed 2 command proxies.', cpsOut),
    step('cmd', 'bun --version', cpsCmd),
    step('out', '1.3.6', cpsOut),
    step('cmd', 'bun i -g cowsay', cpsCmd),
    step(
      'out',
      'installed cowsay@1.6.0 with binaries:\n - cowsay\n - cowthink\n\n[bvm] Done! New commands are now available.',
      cpsOut,
    ),
    step('cmd', 'cowsay \"hello\"', cpsCmd),
    step('out', ' _______\n< hello >\n -------\n        \\\\   ^__^\n         \\\\  (oo)\\\\_______\n            (__)\\\\       )\\\\/\\\\\n                ||----w |\n                ||     ||', cpsOut),
    step('cmd', 'bvm install 1.2.3', cpsCmd),
    step('out', '✓ Bun v1.2.3 physically installed.', cpsOut),
    step('cmd', 'cowsay \"hello\"', cpsCmd),
    step('err', "BVM Error: Command 'cowsay' not found in Bun v1.2.3.", cpsOut, 0),
  ];
}

export const BvmDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const steps = React.useMemo(() => buildTimeline(), []);

  const lines: Line[] = [];
  for (const s of steps) {
    if (frame < s.start) break;
    const done = isDone(frame, s.start, s.text, s.cps);
    lines.push({
      kind: s.kind,
      text: done ? s.text : revealText(frame, s.start, s.text, s.cps),
    });
    if (!done) break;
  }

  const fade = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'radial-gradient(1200px 800px at 20% 20%, #1b2a4a 0%, #05070c 55%, #05070c 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fade,
      }}
    >
      <Terminal title="Bun Version Manager (bvm-core@latest) — global installs isolated" lines={lines} />
    </div>
  );
};
