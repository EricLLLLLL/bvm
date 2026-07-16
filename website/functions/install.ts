interface InstallContext {
  request: Request;
}

interface DistTags {
  latest?: unknown;
}

const DIST_TAGS_URL = 'https://registry.npmjs.org/-/package/bvm-core/dist-tags';
const RELEASE_VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

function selectScript(request: Request): 'install.sh' | 'install.ps1' {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent')?.toLowerCase() ?? '';
  const isWindows = url.searchParams.has('win')
    || userAgent.includes('powershell')
    || userAgent.includes('windows');

  return isWindows ? 'install.ps1' : 'install.sh';
}

async function resolveLatestVersion(): Promise<string> {
  const response = await fetch(DIST_TAGS_URL, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`npm registry returned ${response.status}`);
  }

  const { latest } = await response.json() as DistTags;
  if (typeof latest !== 'string' || !RELEASE_VERSION_PATTERN.test(latest)) {
    throw new Error('npm registry returned an invalid latest version');
  }

  return latest;
}

export async function onRequest({ request }: InstallContext): Promise<Response> {
  try {
    const version = await resolveLatestVersion();
    const scriptName = selectScript(request);
    const scriptUrl = `https://raw.githubusercontent.com/EricLLLLLL/bvm/v${version}/${scriptName}`;
    const response = await fetch(scriptUrl);

    if (!response.ok) {
      throw new Error(`GitHub returned ${response.status}`);
    }

    return new Response(await response.text(), {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300',
        'Content-Type': scriptName === 'install.ps1'
          ? 'text/plain; charset=utf-8'
          : 'text/x-shellscript; charset=utf-8',
        'X-BVM-Version': version,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    return new Response(`Unable to fetch installer: ${message}`, { status: 502 });
  }
}
