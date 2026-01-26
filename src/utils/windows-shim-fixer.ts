/**
 * Fixes Windows Shim files by replacing relative paths with absolute paths.
 * This resolves the issue where Shims fail when executed via a Junction (e.g. .bvm/current).
 */
export function fixShimContent(content: string, absoluteVersionDir: string): string {
    // The pattern Bun uses: "%~dp0\.."
    // We want to replace it with the absolute path to the version directory.
    const searchPattern = "%~dp0\\..";
    
    // Simple string replacement (global)
    return content.split(searchPattern).join(absoluteVersionDir);
}
