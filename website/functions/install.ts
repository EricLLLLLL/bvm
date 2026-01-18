interface Env {
  // Add any environment variables here if needed
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const url = new URL(request.url);
  const userAgent = request.headers.get("user-agent") || "";
  const country = request.cf?.country || "US";

  // Determine platform based on User-Agent or query param
  const isWindows = 
    userAgent.toLowerCase().includes("powershell") || 
    userAgent.toLowerCase().includes("win") || 
    url.searchParams.has("win");

  const isCurlOrWget = 
    userAgent.toLowerCase().includes("curl") || 
    userAgent.toLowerCase().includes("wget");

  // Determine Registry based on Country
  const registry = country === "CN" ? "registry.npmmirror.com" : "registry.npmjs.org";
  
  // Base URL for raw scripts on GitHub
  const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/EricLLLLLL/bvm/main";
  
  const scriptName = isWindows ? "install.ps1" : "install.sh";
  const scriptUrl = `${GITHUB_RAW_BASE}/${scriptName}`;

  try {
    const response = await fetch(scriptUrl);
    if (!response.ok) {
        return new Response(`Error fetching script: ${response.statusText}`, { status: 500 });
    }

    let content = await response.text();

    // Smart Injection: Automatically switch registry based on GeoIP
    if (country === "CN") {
        // For .sh
        content = content.replace(/REGISTRY="registry\.npmjs\.org"/g, `REGISTRY="${registry}"`);
        // For .ps1
        content = content.replace(/\$REGISTRY = "registry\.npmjs\.org"/g, `$REGISTRY = "${registry}"`);
        
        // Also update mirror URLs in comments/logs if necessary
        content = content.replace(/registry\.npmjs\.org/g, registry);
    }

    // Return the script content
    return new Response(content, {
      headers: {
        "Content-Type": isWindows ? "text/plain; charset=utf-8" : "text/x-shellscript; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache"
      },
    });

  } catch (err) {
    return new Response(`Internal Server Error: ${err.message}`, { status: 500 });
  }
};
