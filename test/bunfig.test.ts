import { describe, expect, test, afterEach } from "bun:test";
import { BunfigManager } from "../src/utils/bunfig";
import { join } from "path";
import { unlinkSync, writeFileSync, readFileSync, existsSync } from "fs";

const TEMP_CONFIG = join(process.cwd(), "test-bunfig.toml");

describe("BunfigManager", () => {
  afterEach(() => {
    if (existsSync(TEMP_CONFIG)) unlinkSync(TEMP_CONFIG);
  });

  test("should read registry from existing config", () => {
    writeFileSync(TEMP_CONFIG, '[install]\nregistry = "https://example.com"');
    const manager = new BunfigManager(TEMP_CONFIG);
    expect(manager.getRegistry()).toBe("https://example.com");
  });

  test("should return null if no registry set", () => {
    writeFileSync(TEMP_CONFIG, '[foo]\nbar = "baz"');
    const manager = new BunfigManager(TEMP_CONFIG);
    expect(manager.getRegistry()).toBeNull();
  });

  test("should set registry in new config", () => {
    const manager = new BunfigManager(TEMP_CONFIG);
    manager.setRegistry("https://new.com");
    
    const content = readFileSync(TEMP_CONFIG, "utf-8");
    expect(content).toContain('[install]');
    expect(content).toContain('registry = "https://new.com"');
  });

  test("should update existing registry", () => {
    writeFileSync(TEMP_CONFIG, '[install]\nregistry = "https://old.com"');
    const manager = new BunfigManager(TEMP_CONFIG);
    manager.setRegistry("https://new.com");
    
    const content = readFileSync(TEMP_CONFIG, "utf-8");
    expect(content).toContain('registry = "https://new.com"');
    expect(content).not.toContain('https://old.com');
  });

  test("should preserve other settings", () => {
    writeFileSync(TEMP_CONFIG, '[install]\nlogLevel = "debug"\nregistry = "old"');
    const manager = new BunfigManager(TEMP_CONFIG);
    manager.setRegistry("new");
    
    const content = readFileSync(TEMP_CONFIG, "utf-8");
    expect(content).toContain('logLevel = "debug"');
    expect(content).toContain('registry = "new"');
  });
});
