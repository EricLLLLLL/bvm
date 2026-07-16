export function getBunNpmPackage(platform: string, arch: string, hasAvx2 = true): string | null {
  const baseline = arch === "x64" && !hasAvx2 ? "-baseline" : "";
  if (platform === "darwin") {
    if (arch === "arm64") return "@oven/bun-darwin-aarch64";
    if (arch === "x64") return `@oven/bun-darwin-x64${baseline}`;
  }
  if (platform === "linux") {
    if (arch === "arm64") return "@oven/bun-linux-aarch64";
    if (arch === "x64") return `@oven/bun-linux-x64${baseline}`;
  }
  if (platform === "win32") {
    if (arch === "x64") return `@oven/bun-windows-x64${baseline}`;
  }
  return null;
}

export function getBunDownloadUrl(packageName: string, version: string, registry: string): string {

  let finalRegistry = registry;

  if (!finalRegistry.endsWith("/")) {

    finalRegistry += "/";

  }



  const isScoped = packageName.startsWith("@");

  let filenameBase = packageName;

  if (isScoped) {

    const parts = packageName.split("/");

    if (parts.length === 2) {

      filenameBase = parts[1];

    }

  }



  const filename = `${filenameBase}-${version}.tgz`;

  return `${finalRegistry}${packageName}/-/${filename}`;

}
