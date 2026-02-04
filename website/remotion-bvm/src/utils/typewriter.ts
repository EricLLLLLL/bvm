export function revealText(frame: number, startFrame: number, text: string, cps: number): string {
  const rel = Math.max(0, frame - startFrame);
  const chars = Math.floor((rel / 30) * cps);
  return text.slice(0, Math.min(text.length, chars));
}

export function isDone(frame: number, startFrame: number, text: string, cps: number): boolean {
  return revealText(frame, startFrame, text, cps).length === text.length;
}

