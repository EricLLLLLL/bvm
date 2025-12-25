export function getBunNpmPackage(platform: string, arch: string): string | null {
  if (platform === "darwin") {
    if (arch === "arm64") return "@oven/bun-darwin-aarch64";
    if (arch === "x64") return "@oven/bun-darwin-x64";
  }
  if (platform === "linux") {
    if (arch === "arm64") return "@oven/bun-linux-aarch64";
    if (arch === "x64") return "@oven/bun-linux-x64";
  }
  if (platform === "win32") {
    if (arch === "x64") return "@oven/bun-windows-x64";
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
