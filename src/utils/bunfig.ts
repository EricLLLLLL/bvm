import { existsSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

export class BunfigManager {
  private configPath: string;

  constructor(customPath?: string) {
    this.configPath = customPath || join(homedir(), '.bunfig.toml');
  }

  getPath(): string {
    return this.configPath;
  }

  getRegistry(): string | null {
    if (!existsSync(this.configPath)) return null;
    const content = readFileSync(this.configPath, 'utf-8');
    
    // Find [install] section
    const installIndex = content.indexOf('[install]');
    if (installIndex === -1) return null;

    // Find end of section (next [ or EOF)
    const nextSectionIndex = content.indexOf('[', installIndex + 1);
    const sectionBody = content.substring(
      installIndex, 
      nextSectionIndex === -1 ? undefined : nextSectionIndex
    );

    const match = sectionBody.match(/registry\s*=\s*\"(.*?)\"/);
    return match ? match[1] : null;
  }

  setRegistry(url: string): void {
    let content = '';
    if (existsSync(this.configPath)) {
      content = readFileSync(this.configPath, 'utf-8');
    }

    const installHeader = '[install]';
    const installIndex = content.indexOf(installHeader);

    if (installIndex === -1) {
      // Append new section
      const prefix = content.length > 0 && !content.endsWith('\n') ? '\n' : '';
      content += `${prefix}${installHeader}\nregistry = \"${url}\"\n`;
    } else {
      // Section exists
      const nextSectionIndex = content.indexOf('[', installIndex + 1);
      const endOfSection = nextSectionIndex === -1 ? content.length : nextSectionIndex;
      
      const preSection = content.substring(0, installIndex);
      const sectionBody = content.substring(installIndex, endOfSection);
      const postSection = content.substring(endOfSection);

      if (sectionBody.match(/registry\s*=/)) {
        // Replace existing key
        const newBody = sectionBody.replace(/registry\s*=\s*".*?"/, `registry = \"${url}\"`);
        content = preSection + newBody + postSection;
      } else {
        // Append key to section
        // We insert after [install] line
        const newBody = sectionBody.replace(installHeader, `${installHeader}\nregistry = \"${url}\"`);
        content = preSection + newBody + postSection;
      }
    }

    writeFileSync(this.configPath, content, 'utf-8');
  }
}
