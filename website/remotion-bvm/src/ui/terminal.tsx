import React from 'react';

export type TerminalTheme = {
  frameBg: string;
  borderColor: string;
  headerBg: string;
  headerBorderColor: string;
  titleColor: string;
  cmdPrefix: string;
  cmdColor: string;
  outColor: string;
  errColor: string;
};

const defaultTheme: TerminalTheme = {
  frameBg: '#0b1220',
  borderColor: 'rgba(255,255,255,0.10)',
  headerBg: 'rgba(255,255,255,0.03)',
  headerBorderColor: 'rgba(255,255,255,0.08)',
  titleColor: 'rgba(255,255,255,0.65)',
  cmdPrefix: '$ ',
  cmdColor: 'rgba(255,255,255,0.92)',
  outColor: 'rgba(255,255,255,0.80)',
  errColor: '#ff6b6b',
};

export function Terminal(props: {
  title?: string;
  lines: Array<{ kind: 'cmd' | 'out' | 'err'; text: string }>;
  theme?: Partial<TerminalTheme>;
}) {
  const { title = 'bvm demo', lines } = props;
  const theme: TerminalTheme = { ...defaultTheme, ...(props.theme ?? {}) };

  return (
    <div
      style={{
        width: 980,
        borderRadius: 14,
        background: theme.frameBg,
        border: `1px solid ${theme.borderColor}`,
        boxShadow: '0 18px 60px rgba(0,0,0,0.45)',
        overflow: 'hidden',
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      }}
    >
      <div
        style={{
          height: 44,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 14px',
          borderBottom: `1px solid ${theme.headerBorderColor}`,
          background: theme.headerBg,
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: 999, background: '#ff5f57' }} />
          <div style={{ width: 10, height: 10, borderRadius: 999, background: '#febc2e' }} />
          <div style={{ width: 10, height: 10, borderRadius: 999, background: '#28c840' }} />
        </div>
        <div style={{ color: theme.titleColor, fontSize: 13 }}>{title}</div>
      </div>

      <div style={{ padding: 18, fontSize: 18, lineHeight: 1.45 }}>
        {lines.map((l, idx) => {
          const color = l.kind === 'cmd' ? theme.cmdColor : l.kind === 'err' ? theme.errColor : theme.outColor;
          const prefix = l.kind === 'cmd' ? theme.cmdPrefix : '';
          return (
            <div key={idx} style={{ color, whiteSpace: 'pre-wrap' }}>
              {prefix}
              {l.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}
