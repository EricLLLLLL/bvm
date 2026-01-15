// @bun
var _6=Object.create;var{getPrototypeOf:E6,defineProperty:j$,getOwnPropertyNames:v6}=Object;var u6=Object.prototype.hasOwnProperty;var z$=($,q,Q)=>{Q=$!=null?_6(E6($)):{};let Y=q||!$||!$.__esModule?j$(Q,"default",{value:$,enumerable:!0}):Q;for(let Z of v6($))if(!u6.call(Y,Z))j$(Y,Z,{get:()=>$[Z],enumerable:!0});return Y};var V$=($,q)=>{for(var Q in q)j$($,Q,{get:q[Q],enumerable:!0,configurable:!0,set:(Y)=>q[Q]=()=>Y})};var X$=($,q)=>()=>($&&(q=$($=0)),q);var H$=import.meta.require;var m$={};V$(m$,{getBvmDir:()=>h$,getBunAssetName:()=>N$,USER_AGENT:()=>Q$,TEST_REMOTE_VERSIONS:()=>Z$,REPO_FOR_BVM_CLI:()=>o,OS_PLATFORM:()=>B,IS_TEST_MODE:()=>M,EXECUTABLE_NAME:()=>k,CPU_ARCH:()=>y$,BVM_VERSIONS_DIR:()=>L,BVM_SRC_DIR:()=>F$,BVM_SHIMS_DIR:()=>I,BVM_DIR:()=>T,BVM_CURRENT_DIR:()=>G$,BVM_CACHE_DIR:()=>R,BVM_BIN_DIR:()=>m,BVM_ALIAS_DIR:()=>O,BUN_GITHUB_RELEASES_API:()=>V6,ASSET_NAME_FOR_BVM:()=>C$});import{homedir as d6}from"os";import{join as i}from"path";function h$(){let $=process.env.HOME||d6();return i($,".bvm")}function N$($){return`bun-${B==="win32"?"windows":B}-${y$==="arm64"?"aarch64":"x64"}.zip`}var B,y$,M,Z$,T,F$,L,m,I,G$,O,R,k,V6="https://api.github.com/repos/oven-sh/bun/releases",o="EricLLLLLL/bvm",C$,Q$="bvm (Bun Version Manager)";var j=X$(()=>{B=process.platform,y$=process.arch,M=process.env.BVM_TEST_MODE==="true",Z$=["v1.3.4","v1.2.23","v1.0.0","bun-v1.4.0-canary"];T=h$(),F$=i(T,"src"),L=i(T,"versions"),m=i(T,"bin"),I=i(T,"shims"),G$=i(T,"current"),O=i(T,"aliases"),R=i(T,"cache"),k=B==="win32"?"bun.exe":"bun",C$=B==="win32"?"bvm.exe":"bvm"});function _($){if(!$)return null;return $.match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/)?$:null}function c$($){let q=_($);return q?q.replace(/^v/,""):null}function Y$($){if(!$)return null;let q=$.replace(/^v/,""),Y=q.split(/[-+]/)[0].split(".").map(Number);if(Y.length===0||Y.some((K)=>isNaN(K)))return null;let Z=q.includes("-")?q.split("-")[1].split("+")[0]:void 0;return{major:Y[0],minor:Y[1],patch:Y[2],pre:Z}}function A$($,q){if(!$||!q)return 0;if($.major!==q.major)return $.major-q.major;if($.minor!==q.minor)return $.minor-q.minor;if($.patch!==q.patch)return $.patch-q.patch;if($.pre&&!q.pre)return-1;if(!$.pre&&q.pre)return 1;if($.pre&&q.pre)return $.pre.localeCompare(q.pre);return 0}function p$($,q){let Q=Y$($),Y=Y$(q);return A$(Q,Y)}function K$($,q){return p$(q,$)}function U$($,q){return p$($,q)>0}function l$($,q){if(q==="*"||q===""||q==="latest")return!0;let Q=Y$($);if(!Q)return!1;let Y=q;if(q.startsWith("v"))Y=q.substring(1);if(c$($)===c$(q))return!0;let Z=Y.split(".");if(Z.length===1){let K=Number(Z[0]);if(Q.major===K)return!0}else if(Z.length===2){let K=Number(Z[0]),J=Number(Z[1]);if(Q.major===K&&Q.minor===J)return!0}if(q.startsWith("~")){let K=Y$(q.substring(1));if(!K)return!1;let J=K.patch??0;return Q.major===K.major&&Q.minor===K.minor&&Q.patch>=J}if(q.startsWith("^")){let K=Y$(q.substring(1));if(!K)return!1;let J=K.patch??0,W=K.minor??0;if(K.major===0){if(Q.major!==0)return!1;if(Q.minor!==W)return!1;return Q.patch>=J}if(Q.major!==K.major)return!1;if(Q.minor<W)return!1;if(Q.minor===W&&Q.patch<J)return!1;return!0}return!1}import{readdir as m6,mkdir as c6,stat as p6,symlink as l6,unlink as t6,rm as t$,readlink as n6}from"fs/promises";import{join as b$,basename as i6}from"path";async function N($){await c6($,{recursive:!0})}async function X($){try{return await p6($),!0}catch(q){if(q.code==="ENOENT")return!1;throw q}}async function n$($,q){try{await t6(q)}catch(Y){try{await t$(q,{recursive:!0,force:!0})}catch(Z){}}let Q=process.platform==="win32"?"junction":"dir";await l6($,q,Q)}async function i$($){try{return await n6($)}catch(q){if(q.code==="ENOENT"||q.code==="EINVAL")return null;throw q}}async function a($){await t$($,{recursive:!0,force:!0})}async function d($){try{return await m6($)}catch(q){if(q.code==="ENOENT")return[];throw q}}async function E($){return await Bun.file($).text()}async function J$($,q){await Bun.write($,q)}function U($){let q=$.trim();if(q.startsWith("bun-v"))q=q.substring(4);if(!q.startsWith("v")&&/^\d/.test(q))q=`v${q}`;return q}async function P(){return await N(L),(await d(L)).filter((q)=>_(U(q))).sort(K$)}async function c(){if(process.env.BVM_ACTIVE_VERSION)return{version:U(process.env.BVM_ACTIVE_VERSION),source:"env"};let $=b$(process.cwd(),".bvmrc");if(await X($)){let J=(await E($)).trim();return{version:U(J),source:".bvmrc"}}let{getBvmDir:q}=await Promise.resolve().then(() => (j(),m$)),Q=q(),Y=b$(Q,"current"),Z=b$(Q,"aliases");if(await X(Y)){let{realpath:J}=await import("fs/promises");try{let W=await J(Y);return{version:U(i6(W)),source:"current"}}catch(W){}}let K=b$(Z,"default");if(await X(K)){let J=(await E(K)).trim();return{version:U(J),source:"default"}}return{version:null,source:null}}function s($,q){if(!$||q.length===0)return null;let Q=U($);if(q.includes(Q))return Q;if($.toLowerCase()==="latest")return q[0];if(/^\d+\.\d+\.\d+$/.test($.replace(/^v/,"")))return null;if(!/^[v\d]/.test($))return null;let Z=$.startsWith("v")?`~${$.substring(1)}`:`~${$}`,K=q.filter((J)=>l$(J,Z));if(K.length>0)return K.sort(K$)[0];return null}var x=X$(()=>{j()});import{createInterface as o6}from"readline";class T${timer=null;frames=process.platform==="win32"?["-","\\","|","/"]:["\u280B","\u2819","\u2839","\u2838","\u283C","\u2834","\u2826","\u2827","\u2807","\u280F"];frameIndex=0;text;constructor($){this.text=$}start($){if($)this.text=$;if(this.timer)return;this.timer=setInterval(()=>{process.stdout.write(`\r\x1B[K${G.cyan(this.frames[this.frameIndex])} ${this.text}`),this.frameIndex=(this.frameIndex+1)%this.frames.length},80)}stop(){if(this.timer)clearInterval(this.timer),this.timer=null,process.stdout.write("\r\x1B[K");process.stdout.write("\x1B[?25h")}succeed($){this.stop(),console.log(`${G.green("\u2713")} ${$||this.text}`)}fail($){this.stop(),console.log(`${G.red("\u2716")} ${$||this.text}`)}info($){this.stop(),console.log(`${G.blue("\u2139")} ${$||this.text}`)}update($){this.text=$}}class D${total;current=0;width=20;constructor($){this.total=$}start(){process.stdout.write("\x1B[?25l"),this.render()}update($,q){this.current=$,this.render(q)}stop(){process.stdout.write(`\x1B[?25h
`)}render($){let q=Math.min(1,this.current/this.total),Q=Math.round(this.width*q),Y=this.width-Q,Z=process.platform==="win32",K=Z?"=":"\u2588",J=Z?"-":"\u2591",W=G.green(K.repeat(Q))+G.gray(J.repeat(Y)),H=(q*100).toFixed(0).padStart(3," "),y=(this.current/1048576).toFixed(1),w=(this.total/1048576).toFixed(1),z=$?` ${$.speed}KB/s`:"";process.stdout.write(`\r\x1B[2K ${W} ${H}% | ${y}/${w}MB${z}`)}}async function o$($){let q=o6({input:process.stdin,output:process.stdout});return new Promise((Q)=>{q.question(`${G.yellow("?")} ${$} (Y/n) `,(Y)=>{q.close(),Q(Y.toLowerCase()!=="n")})})}var a6,s6=($)=>$.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),l=($,q,Q=$)=>(Y)=>a6?$+Y.replace(new RegExp(s6(q),"g"),Q)+q:Y,G;var F=X$(()=>{a6=!process.env.NO_COLOR,G={red:l("\x1B[1;31m","\x1B[39m"),green:l("\x1B[1;32m","\x1B[39m"),yellow:l("\x1B[1;33m","\x1B[39m"),blue:l("\x1B[1;34m","\x1B[39m"),magenta:l("\x1B[1;35m","\x1B[39m"),cyan:l("\x1B[1;36m","\x1B[39m"),gray:l("\x1B[90m","\x1B[39m"),bold:l("\x1B[1m","\x1B[22m","\x1B[22m\x1B[1m"),dim:l("\x1B[2m","\x1B[22m","\x1B[22m\x1B[2m")}});async function b($,q,Q){if(process.platform==="win32"){console.log(G.cyan(`> ${$}`));let K={start:(J)=>{if(J)console.log(G.cyan(`> ${J}`))},stop:()=>{},succeed:(J)=>console.log(G.green(`  \u2713 ${J}`)),fail:(J)=>console.log(G.red(`  \u2716 ${J}`)),info:(J)=>console.log(G.cyan(`  \u2139 ${J}`)),update:(J)=>console.log(G.dim(`  ... ${J}`)),isSpinning:!1};try{return await q(K)}catch(J){let W=J6(J,Q?.failMessage);if(console.log(G.red(`  \u2716 ${W}`)),process.env.BVM_DEBUG,console.log(G.dim(`    Details: ${J.message}`)),J.code)console.log(G.dim(`    Code: ${J.code}`));throw J.reported=!0,J}}let Z=new T$($);Z.start();try{let K=await q(Z);return Z.stop(),K}catch(K){let J=J6(K,Q?.failMessage);throw Z.fail(G.red(J)),K.reported=!0,K}}function J6($,q){let Q=$ instanceof Error?$.message:String($);if(!q)return Q;if(typeof q==="function")return q($);return`${q}: ${Q}`}var A=X$(()=>{F()});var W6={};V$(W6,{resolveLocalVersion:()=>u,displayVersion:()=>M$});import{join as H4}from"path";async function u($){if($==="current"){let{version:Z}=await c();return Z}if($==="latest"){let Z=await P();if(Z.length>0)return Z[0];return null}let q=H4(O,$);if(await X(q))try{let Z=(await E(q)).trim();return U(Z)}catch{return null}let Q=U($),Y=await P();return s($,Y)}async function M$($){await b(`Resolving version '${$}'...`,async()=>{let q=await u($);if(q)console.log(q);else throw Error("N/A")},{failMessage:`Failed to resolve version '${$}'`})}var e=X$(()=>{j();x();A()});import{parseArgs as g4}from"util";var q$={name:"@bvm-cli/core",version:"1.0.6",description:"The native version manager for Bun. Cross-platform, shell-agnostic, and zero-dependency.",main:"src/index.ts",publishConfig:{access:"public"},scripts:{dev:"npx bun run src/index.ts",build:"npx bun build src/index.ts --target=bun --outfile dist/index.js --minify",test:"npx bun test test/*.ts",bvm:"npx bun run src/index.ts","bvm:sandbox":'mkdir -p "$PWD/.sandbox-home" && HOME="$PWD/.sandbox-home" npx bun run src/index.ts',release:"npx bun run scripts/release.ts","sync-runtime":"npx bun run scripts/sync-runtime.ts"},repository:{type:"git",url:"git+https://github.com/EricLLLLLL/bvm.git"},keywords:["bun","version-manager","cli","bvm","nvm","nvm-windows","fnm","nodenv","bun-nvm","version-switching"],files:["dist/index.js","README.md"],author:"EricLLLLLL",license:"MIT",private:!0,type:"commonjs",dependencies:{"@oven/bun-darwin-aarch64":"^1.3.5","cli-progress":"^3.12.0"},devDependencies:{"@types/bun":"^1.3.4","@types/cli-progress":"^3.11.6","@types/node":"^24.10.2",bun:"^1.3.5",esbuild:"^0.27.2",typescript:"^5"},peerDependencies:{typescript:"^5"}};j();x();import{join as p,basename as k4,dirname as L4}from"path";j();x();F();import{join as r6}from"path";function a$($,q){if($==="darwin"){if(q==="arm64")return"@oven/bun-darwin-aarch64";if(q==="x64")return"@oven/bun-darwin-x64"}if($==="linux"){if(q==="arm64")return"@oven/bun-linux-aarch64";if(q==="x64")return"@oven/bun-linux-x64"}if($==="win32"){if(q==="x64")return"@oven/bun-windows-x64"}return null}function s$($,q,Q){let Y=Q;if(!Y.endsWith("/"))Y+="/";let Z=$.startsWith("@"),K=$;if(Z){let W=$.split("/");if(W.length===2)K=W[1]}let J=`${K}-${q}.tgz`;return`${Y}${$}/-/${J}`}F();async function t($,q={}){let{cwd:Q,env:Y,prependPath:Z,stdin:K="inherit",stdout:J="inherit",stderr:W="inherit"}=q,H={...process.env,...Y};if(Z){let z=H.PATH||"",C=process.platform==="win32"?";":":";H.PATH=`${Z}${C}${z}`}let w=await Bun.spawn({cmd:$,cwd:Q,env:H,stdin:K,stdout:J,stderr:W}).exited;if((w??0)!==0)throw Error(`${G.red("Command failed")}: ${$.join(" ")} (code ${w})`);return w??0}function w$(){try{let $=Intl.DateTimeFormat().resolvedOptions().timeZone;return $==="Asia/Shanghai"||$==="Asia/Chongqing"||$==="Asia/Harbin"||$==="Asia/Urumqi"}catch($){return!1}}var e6="bun-versions.json",$4=3600000;async function q4(){if(M)return[...Z$];let $=r6(R,e6);try{if(await pathExists($)){let Z=await readTextFile($),K=JSON.parse(Z);if(Date.now()-K.timestamp<$4&&Array.isArray(K.versions))return K.versions}}catch(Z){}let Q=w$()?["https://registry.npmmirror.com/bun","https://registry.npmjs.org/bun"]:["https://registry.npmjs.org/bun","https://registry.npmmirror.com/bun"],Y=null;for(let Z of Q){let K=new AbortController,J=setTimeout(()=>K.abort(),1e4);try{let W=await fetch(Z,{headers:{"User-Agent":Q$,Accept:"application/vnd.npm.install-v1+json"},signal:K.signal});if(clearTimeout(J),!W.ok)throw Error(`Status ${W.status}`);let H=await W.json();if(!H.versions)throw Error("Invalid response (no versions)");let y=Object.keys(H.versions);try{await ensureDir(R),await writeTextFile($,JSON.stringify({timestamp:Date.now(),versions:y}))}catch(w){}return y}catch(W){clearTimeout(J),Y=W}}throw Y||Error("Failed to fetch versions from any registry.")}async function Q4(){if(M)return[...Z$];return new Promise(($,q)=>{let Q=[];try{let Y=Bun.spawn(["git","ls-remote","--tags","https://github.com/oven-sh/bun.git"],{stdout:"pipe",stderr:"pipe"}),Z=setTimeout(()=>{Y.kill(),q(Error("Git operation timed out"))},1e4);new Response(Y.stdout).text().then((J)=>{clearTimeout(Z);let W=J.split(`
`);for(let H of W){let y=H.match(/refs\/tags\/bun-v?(\d+\.\d+\.\d+.*)$/);if(y)Q.push(y[1])}$(Q)}).catch((J)=>{clearTimeout(Z),q(J)})}catch(Y){q(Error(`Failed to run git: ${Y.message}`))}})}async function r$(){if(M)return[...Z$];try{let q=(await q4()).filter((Q)=>_(Q)).map((Q)=>({v:Q,parsed:Y$(Q)}));return q.sort((Q,Y)=>A$(Y.parsed,Q.parsed)),q.map((Q)=>Q.v)}catch($){try{let q=await Q4();if(q.length>0)return Array.from(new Set(q.filter((Y)=>_(Y)))).sort(K$);throw Error("No versions found via Git")}catch(q){throw Error(`Failed to fetch versions. NPM: ${$.message}. Git: ${q.message}`)}}}async function e$($){if(M)return Z$.includes($)||$==="latest";let Q=w$()?"https://registry.npmmirror.com":"https://registry.npmjs.org",Y=$.replace(/^v/,""),Z=`${Q}/bun/${Y}`;try{return await t([B==="win32"?"curl.exe":"curl","-I","-f","-m","5","-s",Z],{stdout:"ignore",stderr:"ignore"}),!0}catch(K){return!1}}async function $6(){if(M)return{latest:"1.1.20"};let Q=`${w$()?"https://registry.npmmirror.com":"https://registry.npmjs.org"}/-/package/bun/dist-tags`;try{let Y=new AbortController,Z=setTimeout(()=>Y.abort(),5000),K=await fetch(Q,{headers:{"User-Agent":Q$},signal:Y.signal});if(clearTimeout(Z),K.ok)return await K.json()}catch(Y){}return{}}async function q6($){let q=U($);if(!_(q))return console.error(G.red(`Invalid version provided to findBunDownloadUrl: ${$}`)),null;if(M)return{url:`https://example.com/${N$(q)}`,foundVersion:q};let Z=a$(B==="win32"?"win32":B,y$==="arm64"?"arm64":"x64");if(!Z)throw Error(`Unsupported platform/arch for NPM download: ${B}-${y$}`);let K="https://registry.npmjs.org";if(process.env.BVM_REGISTRY)K=process.env.BVM_REGISTRY;else if(process.env.BVM_DOWNLOAD_MIRROR)K=process.env.BVM_DOWNLOAD_MIRROR;else if(w$())K="https://registry.npmmirror.com";let J=q.replace(/^v/,"");return{url:s$(Z,J,K),foundVersion:q}}async function B$(){let $=C$;try{let Y=new AbortController,Z=setTimeout(()=>Y.abort(),2000),K=await fetch(`https://cdn.jsdelivr.net/gh/${o}@latest/package.json`,{headers:{"User-Agent":Q$},signal:Y.signal});if(clearTimeout(Z),K.ok){let J=await K.json();if(J&&J.version){let W=`v${J.version}`;return{tagName:W,downloadUrl:`https://github.com/${o}/releases/download/${W}/${$}`}}}}catch(Y){}try{let Y=new AbortController,Z=setTimeout(()=>Y.abort(),2000),K=`https://github.com/${o}/releases/latest`,J=await fetch(K,{method:"HEAD",redirect:"manual",headers:{"User-Agent":Q$},signal:Y.signal});if(clearTimeout(Z),J.status===302||J.status===301){let W=J.headers.get("location");if(W){let H=W.split("/"),y=H[H.length-1];if(y&&_(y))return{tagName:y,downloadUrl:`https://github.com/${o}/releases/download/${y}/${$}`}}}}catch(Y){}let q={"User-Agent":Q$},Q=`https://api.github.com/repos/${o}/releases/latest`;try{let Y=new AbortController,Z=setTimeout(()=>Y.abort(),2000),K=await fetch(Q,{headers:q,signal:Y.signal});if(clearTimeout(Z),!K.ok)return null;let W=(await K.json()).tag_name,H=`https://github.com/${o}/releases/download/${W}/${$}`;return{tagName:W,downloadUrl:H}}catch(Y){return null}}F();j();import{spawn as Y4}from"child_process";async function Q6($,q){if($.endsWith(".zip"))if(B==="win32")await t(["powershell","-Command",`Expand-Archive -Path "${$}" -DestinationPath "${q}" -Force`],{stdout:"ignore",stderr:"inherit"});else await t(["unzip","-o","-q",$,"-d",q],{stdout:"ignore",stderr:"inherit"});else if($.endsWith(".tar.gz")||$.endsWith(".tgz"))await new Promise((Q,Y)=>{let Z=Y4("tar",["-xzf",$,"-C",q],{stdio:"inherit",shell:!1});Z.on("close",(K)=>{if(K===0)Q();else Y(Error(`tar exited with code ${K}`))}),Z.on("error",(K)=>Y(K))});else throw Error(`Unsupported archive format: ${$}`)}import{chmod as R$}from"fs/promises";x();j();F();import{join as v,dirname as K4,delimiter as Z4}from"path";import{homedir as r}from"os";import{chmod as Z6}from"fs/promises";var Y6=`#!/bin/bash

# bvm-init.sh: Initializes bvm default version on shell startup

# Check if BVM_DIR is set
if [ -z "\${BVM_DIR}" ]; then
  return
fi

# Try to switch to the 'default' version silently.
# We use the absolute path to ensure we are calling the correct binary.
# Errors are suppressed to prevent blocking shell startup if 'default' is missing.
"\${BVM_DIR}/bin/bvm" use default --silent >/dev/null 2>&1 || true
`,K6=`# bvm-init.fish: Initializes bvm default version on shell startup

# Check if BVM_DIR is set
if not set -q BVM_DIR
  return
end

# Try to switch to the 'default' version silently.
# Errors are suppressed to prevent blocking shell startup.
eval "$BVM_DIR/bin/bvm" use default --silent >/dev/null 2>&1 || true
`;async function k$($=!0){if(process.platform==="win32"){await G4($);return}if(!process.env.BVM_TEST_MODE)await G6();let q=process.env.SHELL||"",Q="",Y="";if(q.includes("zsh"))Y="zsh",Q=v(r(),".zshrc");else if(q.includes("bash"))if(Y="bash",process.platform==="darwin")if(await X(v(r(),".bashrc")))Q=v(r(),".bashrc");else Q=v(r(),".bash_profile");else Q=v(r(),".bashrc");else if(q.includes("fish"))Y="fish",Q=v(r(),".config","fish","config.fish");else{console.log(G.yellow(`Could not detect a supported shell (zsh, bash, fish). Please manually add ${m} to your PATH.`));return}await N(m);let Z=v(m,"bvm-init.sh");await Bun.write(Z,Y6),await Z6(Z,493);let K=v(m,"bvm-init.fish");await Bun.write(K,K6),await Z6(K,493);let J="";try{J=await Bun.file(Q).text()}catch(z){if(z.code==="ENOENT")await Bun.write(Q,""),J="";else throw z}let W="# >>> bvm initialize >>>",H="# <<< bvm initialize <<<",y=`${W}
# !! Contents within this block are managed by 'bvm setup' !!
export BVM_DIR="${T}"
export PATH="$BVM_DIR/shims:$BVM_DIR/bin:$PATH"
# Reset current version to default for new terminal sessions
[ -L "$BVM_DIR/current" ] && rm "$BVM_DIR/current"
${H}`,w=`# >>> bvm initialize >>>
# !! Contents within this block are managed by 'bvm setup' !!
set -Ux BVM_DIR "${T}"
fish_add_path "$BVM_DIR/shims"
fish_add_path "$BVM_DIR/bin"
# Reset current version to default
if test -L "$BVM_DIR/current"
    rm "$BVM_DIR/current"
end
# <<< bvm initialize <<<`;if($)console.log(G.cyan(`Configuring ${Y} environment in ${Q}...`));try{let z=J,C=new RegExp(`${W}[sS]*?${H}`,"g");if(J.includes(W))z=J.replace(C,Y==="fish"?w:y);else if(J.includes("export BVM_DIR=")||J.includes("set -Ux BVM_DIR"))z=J+`
`+(Y==="fish"?w:y);else z=J+`
`+(Y==="fish"?w:y);if(z!==J){if(await Bun.write(Q,z),$)console.log(G.green(`\u2713 Successfully updated BVM configuration in ${Q}`))}else if($)console.log(G.gray("\u2713 Configuration is already up to date."));if($)console.log(G.yellow(`Please restart your terminal or run "source ${Q}" to apply changes.`))}catch(z){console.error(G.red(`Failed to write to ${Q}: ${z.message}`))}}async function G4($=!0){await G6();let q="";try{q=Bun.spawnSync({cmd:["powershell","-NoProfile","-Command","echo $PROFILE.CurrentUserAllHosts"],stdout:"pipe"}).stdout.toString().trim()}catch(Y){q=v(r(),"Documents","WindowsPowerShell","Microsoft.PowerShell_profile.ps1")}if(!q)return;await N(K4(q));let Q=`
# BVM Configuration
$env:BVM_DIR = "${T}"
$env:PATH = "$env:BVM_DIR\\shims;$env:BVM_DIR\\bin;$env:PATH"
# Auto-activate default version
if (Test-Path "$env:BVM_DIR\\bin\\bvm.cmd") {
    & "$env:BVM_DIR\\bin\\bvm.cmd" use default --silent *>$null
}
`;try{let Y="";if(await X(q))Y=await Bun.file(q).text();else await Bun.write(q,"");if(Y.includes("$env:BVM_DIR"))return;if($)console.log(G.cyan(`Configuring PowerShell environment in ${q}...`));let K=Bun.file(q).writer();if(await Bun.write(q,Y+`\r
${Q}`),$)console.log(G.green(`\u2713 Successfully configured BVM path in ${q}`)),console.log(G.yellow("Please restart your terminal to apply changes."))}catch(Y){console.error(G.red(`Failed to write to ${q}: ${Y.message}`))}}async function G6(){if(process.env.BVM_TEST_MODE)return;if(process.env.BVM_SUPPRESS_CONFLICT_WARNING==="true")return;let $=(process.env.PATH||"").split(Z4),q=v(r(),".bun"),Q=v(q,"bin");for(let Y of $){if(!Y||Y===m||Y.includes(".bvm"))continue;let Z=v(Y,k);if(await X(Z)){if(Y.includes("node_modules"))continue;if(Y===Q||Y===q){console.log(),console.log(G.yellow(" CONFLICT DETECTED ")),console.log(G.yellow(`Found existing official Bun installation at: ${Z}`)),console.log(G.yellow("This will conflict with bvm as it is also in your PATH."));try{if(await o$("Do you want bvm to uninstall the official Bun version (~/.bun) to resolve this?"))await J4(q);else console.log(G.dim("Skipping uninstallation. Please ensure bvm path takes precedence."))}catch(K){}return}else{console.log(),console.log(G.red(" CONFLICT DETECTED ")),console.log(G.red(`Found another Bun installation at: ${Z}`)),console.log(G.yellow("This might be installed via npm, Homebrew, or another package manager.")),console.log(G.yellow("To avoid conflicts, please uninstall it manually (e.g., 'npm uninstall -g bun').")),console.log();return}}}}async function J4($){console.log(G.cyan(`Removing official Bun installation at ${$}...`));try{await a($),console.log(G.green("\u2713 Official Bun uninstalled.")),console.log(G.yellow("Note: You may still need to remove `.bun/bin` from your PATH manually if it was added in your rc file."))}catch(q){console.error(G.red(`Failed to remove official Bun: ${q.message}`))}}x();import{join as W4,dirname as X4}from"path";async function L$(){let $=process.cwd();while(!0){let q=W4($,".bvmrc");if(await X(q))try{return(await Bun.file(q).text()).trim()}catch(Y){return null}let Q=X4($);if(Q===$)break;$=Q}return null}F();j();x();e();A();import{join as X6}from"path";async function W$($,q,Q={}){let Y=async(Z)=>{let K=await u(q);if(!K){if(!Q.silent)console.log(G.blue(`Please install Bun ${q} first using: bvm install ${q}`));throw Error(`Bun version '${q}' is not installed. Cannot create alias.`)}let J=X6(L,K);if(!await X(J))throw Error(`Internal Error: Resolved Bun version ${K} not found.`);await N(O);let W=X6(O,$);if($!=="default"&&await X(W))throw Error(`Alias '${$}' already exists. Use 'bvm alias ${$} <new-version>' to update or 'bvm unalias ${$}' to remove.`);if(await J$(W,`${K}
`),Z)Z.succeed(G.green(`Alias '${$}' created for Bun ${K}.`))};if(Q.silent)await Y();else await b(`Creating alias '${$}' for Bun ${q}...`,(Z)=>Y(Z),{failMessage:`Failed to create alias '${$}'`})}A();j();x();F();import{join as H6}from"path";e();A();async function O$($,q={}){let Q=$;if(!Q)Q=await L$()||void 0;if(!Q){if(!q.silent)console.error(G.red("No version specified. Usage: bvm use <version>"));throw Error("No version specified.")}let Y=async(Z)=>{let K=null,J=await u(Q);if(J)K=J;else{let w=(await P()).map((z)=>U(z));K=s(Q,w)}if(!K)throw Error(`Bun version '${Q}' is not installed.`);let W=U(K),H=H6(L,W),y=H6(H,"bin",k);if(!await X(y))throw Error(`Version ${W} is not properly installed (binary missing).`);if(await n$(H,G$),Z)Z.succeed(G.green(`Now using Bun ${W} (immediate effect).`))};if(q.silent)await Y();else await b(`Switching to Bun ${Q}...`,(Z)=>Y(Z),{failMessage:()=>`Failed to switch to Bun ${Q}`})}j();x();import{join as V}from"path";import{chmod as y4,unlink as f$,symlink as z4}from"fs/promises";var U4=`#!/bin/bash
# Shim managed by BVM (Bun Version Manager)
# ... (Bash script content remains same) ...
BVM_DIR="\${BVM_DIR:-$HOME/.bvm}"
COMMAND=$(basename "$0")

# 1. Resolve Version
if [ -n "$BVM_ACTIVE_VERSION" ]; then
    VERSION="$BVM_ACTIVE_VERSION"
else
    # Project Context (.bvmrc)
    CUR_DIR="$PWD"
    while [ "$CUR_DIR" != "/" ]; do
        if [ -f "$CUR_DIR/.bvmrc" ]; then
            VERSION="v$(cat "$CUR_DIR/.bvmrc" | tr -d 'v' | tr -d '[:space:]')"
            break
        fi
        CUR_DIR=$(dirname "$CUR_DIR")
    done
    
    # Global Current Symlink
    if [ -z "$VERSION" ] && [ -L "$BVM_DIR/current" ]; then
        VERSION_PATH=$(readlink "$BVM_DIR/current")
        VERSION_TMP=$(basename "$VERSION_PATH")
        if [ -d "$BVM_DIR/versions/$VERSION_TMP" ]; then
            VERSION="$VERSION_TMP"
        fi
    fi

    # Global Default Alias
    if [ -z "$VERSION" ]; then
        if [ -f "$BVM_DIR/aliases/default" ]; then
            VERSION=$(cat "$BVM_DIR/aliases/default")
        fi
    fi
fi

# 2. Validate
if [ -z "$VERSION" ]; then
    echo "BVM Error: No Bun version is active or default is set." >&2
    exit 1
fi
[[ "$VERSION" != v* ]] && VERSION="v$VERSION"

VERSION_DIR="$BVM_DIR/versions/$VERSION"
if [ ! -d "$VERSION_DIR" ]; then
    echo "BVM Error: Bun version $VERSION is not installed." >&2
    exit 1
fi

REAL_EXECUTABLE="$VERSION_DIR/bin/$COMMAND"

# 3. Execution
if [ -x "$REAL_EXECUTABLE" ]; then
    export BUN_INSTALL="$VERSION_DIR"
    export PATH="$VERSION_DIR/bin:$PATH"
    
    "$REAL_EXECUTABLE" "$@"
    EXIT_CODE=$?
    
    # Smart Hook: Auto-rehash on global installs
    if [[ "$COMMAND" == "bun" ]] && [[ "$*" == *"-g"* ]] && ([[ "$*" == *"install"* ]] || [[ "$*" == *"add"* ]] || [[ "$*" == *"remove"* ]] || [[ "$*" == *"uninstall"* ]]); then
        "$BVM_DIR/bin/bvm" rehash >/dev/null 2>&1
    fi

    exit $EXIT_CODE
else
    echo "BVM Error: Command '$COMMAND' not found in Bun $VERSION." >&2
    exit 127
fi
`,b4=`
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

const BVM_DIR = process.env.BVM_DIR || path.join(os.homedir(), '.bvm');
// Argv: [bun_exe, shim_js, command_name, ...args]
const CMD = process.argv[2].replace(/\\.exe$/i, '').replace(/\\.cmd$/i, '');
const ARGS = process.argv.slice(3);

async function readFileSafe(filePath) {
    try {
        const file = Bun.file(filePath);
        if (await file.exists()) {
             const text = await file.text();
             return text.trim();
        }
        return null;
    } catch (e) {
        return null;
    }
}

async function resolveVersion() {
  // 1. Env Override
  if (process.env.BVM_ACTIVE_VERSION) return process.env.BVM_ACTIVE_VERSION;

  // 2. .bvmrc (Upward search)
  let dir = process.cwd();
  try {
    const { root } = path.parse(dir);
    while (true) {
        const rc = path.join(dir, '.bvmrc');
        const file = Bun.file(rc);
        if (await file.exists()) {
            const v = (await file.text()).trim();
            if (v) return v.startsWith('v') ? v : 'v' + v;
        }
        if (dir === root) break;
        dir = path.dirname(dir);
    }
  } catch(e) {}

  // 3. Current Symlink (Junction)
  const current = path.join(BVM_DIR, 'current');
  const fs = require('fs'); 
  if (fs.existsSync(current)) {
    try {
        const target = fs.realpathSync(current); 
        const v = path.basename(target);
        if (v && v.startsWith('v')) return v;
    } catch(e) {}
  }
  
  // 4. Default Alias
  const def = path.join(BVM_DIR, 'aliases', 'default');
  const defFile = Bun.file(def);
  if (await defFile.exists()) {
      const v = (await defFile.text()).trim();
      if (v) return v.startsWith('v') ? v : 'v' + v;
  }

  return '';
}

// Wrap in IIFE for async/await
(async () => {
    const version = await resolveVersion();

    if (!version) {
        console.error("BVM Error: No Bun version is active or default is set.");
        process.exit(1);
    }

    const versionDir = path.join(BVM_DIR, 'versions', version);
    // Use fs.existsSync for directory check is still fast/standard
    const fs = require('fs');
    if (!fs.existsSync(versionDir)) {
        console.error(\`BVM Error: Bun version \${version} is not installed.\`);
        process.exit(1);
    }

    const binDir = path.join(versionDir, 'bin');
    const realExecutable = path.join(binDir, CMD + '.exe');

    if (!fs.existsSync(realExecutable)) {
        console.error(\`BVM Error: Command '\${CMD}' not found in Bun \${version}.\`);
        process.exit(127);
    }

    // Set Environment Variables
    process.env.BUN_INSTALL = versionDir;
    // Prepend to PATH
    process.env.PATH = binDir + path.delimiter + process.env.PATH;

    // Auto-rehash hook
    if (CMD === 'bun' && ARGS.some(a => a === '-g') && ARGS.some(a => ['install', 'add', 'remove', 'uninstall'].includes(a))) {
        // Run rehash in background detached
        try {
            const bvmCmd = path.join(BVM_DIR, 'bin', 'bvm.cmd');
            // Using Bun.spawn is better if available, but require('child_process').spawn is standard here
            spawn(bvmCmd, ['rehash'], { detached: true, stdio: 'ignore' }).unref();
        } catch(e) {}
    }

    const child = spawn(realExecutable, ARGS, { stdio: 'inherit' });
    child.on('exit', (code) => process.exit(code ?? 0));
})();
`,w4=`@echo off
set "BVM_DIR=%USERPROFILE%\\.bvm"
"%BVM_DIR%\\runtime\\current\\bin\\bun.exe" "%BVM_DIR%\\bin\\shim.js" "%~n0" %*
`;async function $$(){await N(I);let $=B==="win32";if($){let Y=V(T,"bin","shim.js");await N(V(T,"bin")),await Bun.write(Y,b4)}let q=new Set;if(q.add("bun"),q.add("bunx"),await X(L)){let Y=await d(L);for(let Z of Y){if(Z.startsWith("."))continue;let K=V(L,Z,"bin");if(await X(K)){let J=V(K,k);if(await X(J)){let H=V(K,$?"bunx.exe":"bunx");if(!await X(H))try{if($)await Bun.write(Bun.file(H),Bun.file(J));else await z4(`./${k}`,H)}catch(w){}let y=["yarn","npm","pnpm"];for(let w of y){let z=V(K,w);try{let{lstat:C,readlink:h,unlink:S}=H$("fs/promises");if((await C(z)).isSymbolicLink()){let f=await h(z);if(f===`./${k}`||f.endsWith(`/${k}`)||f===k)await S(z)}}catch(C){}}}let W=await d(K);for(let H of W){let y=H.replace(/\.(exe|ps1|cmd)$/i,"");if(y)q.add(y)}}}}for(let Y of q)if($){let Z=V(I,Y+".cmd");await Bun.write(Z,w4)}else{let Z=V(I,Y);await Bun.write(Z,U4),await y4(Z,493)}let Q=await d(I);for(let Y of Q){let Z=Y.replace(/\.(ps1|cmd)$/i,"");if($){if(Y.endsWith(".ps1")){try{await f$(V(I,Y))}catch(K){}continue}if(Y.endsWith(".cmd")&&!q.has(Z))try{await f$(V(I,Y))}catch(K){}}else if(!q.has(Z))try{await f$(V(I,Y))}catch(K){}}}import{rename as O4,rm as z6}from"fs/promises";async function S$($,q){try{await O4($,q)}catch(Q){await Bun.write(Bun.file(q),Bun.file($)),await z6($,{force:!0})}}async function y6($,q,Q,Y){let Z=await fetch($);if(!Z.ok)throw Error(`Status ${Z.status}`);let K=+(Z.headers.get("Content-Length")||0),J=0,W=Z.body?.getReader();if(!W)throw Error("No response body");let H=Bun.file(q).writer(),y=B==="win32";Q.stop();let w=null,z=-1;if(!y)w=new D$(K||41943040),w.start();else console.log(`Downloading Bun ${Y}...`);try{let C=Date.now();while(!0){let{done:h,value:S}=await W.read();if(h)break;if(H.write(S),J+=S.length,!y&&w){let g=(Date.now()-C)/1000,f=g>0?(J/1024/g).toFixed(0):"0";w.update(J,{speed:f})}else if(y&&K){let g=Math.floor(J/K*10);if(g>z)console.log(`  > ${g*10}%`),z=g}}if(await H.end(),!y&&w)w.stop();else console.log("  > 100% [Done]")}catch(C){try{H.end()}catch(h){}if(!y&&w)w.stop();else console.log("  > Download Failed");throw Q.start(),C}Q.start()}async function P$($,q={}){let Q=$,Y=null,Z=!1;if(!Q)Q=await L$()||void 0;if(!Q){console.error(G.red("No version specified and no .bvmrc found. Usage: bvm install <version>"));return}try{await b(`Finding Bun ${Q} release...`,async(K)=>{let J=null,W=U(Q);if(/^v?\d+\.\d+\.\d+$/.test(Q)&&!Q.includes("canary"))if(K.update(`Checking if Bun ${W} exists...`),await e$(W))J=W;else throw K.fail(G.red(`Bun version ${W} not found on registry.`)),Error(`Bun version ${W} not found on registry.`);else if(Q==="latest"){K.update("Checking latest version...");let g=await $6();if(g.latest)J=U(g.latest);else throw Error('Could not resolve "latest" version.')}else throw K.fail(G.yellow('Fuzzy matching (e.g. "1.1") is disabled for stability.')),console.log(G.dim('  Please specify the exact version (e.g. "1.1.20") or "latest".')),console.log(G.dim("  To see available versions, run: bvm ls-remote")),Error("Fuzzy matching disabled");if(!J)throw K.fail(G.red(`Could not find a Bun release for '${Q}' compatible with your system.`)),Error(`Could not find a Bun release for '${Q}' compatible with your system.`);let H=await q6(J);if(!H)throw Error(`Could not find a Bun release for ${J} compatible with your system.`);let{url:y,mirrorUrl:w,foundVersion:z}=H,C=p(L,z),h=p(C,"bin"),S=p(h,k);if(await X(S))K.succeed(G.green(`Bun ${z} is already installed.`)),Y=z,Z=!0;else if(U(Bun.version)===z&&!M){K.info(G.cyan(`Requested version ${z} matches current BVM runtime. Creating symlink...`)),await N(h);let f=process.execPath;try{let{symlink:n}=await import("fs/promises");await n(f,S)}catch(n){await Bun.write(Bun.file(S),Bun.file(f)),await R$(S,493)}K.succeed(G.green(`Bun ${z} linked from local runtime.`)),Y=z,Z=!0}else if(M)await N(h),await x4(S,z),Y=z,Z=!0;else{K.update(`Downloading Bun ${z} to cache...`),await N(R);let f=p(R,`${z}-${k4(y)}`);if(await X(f))K.succeed(G.green(`Using cached Bun ${z} archive.`));else{let D=`${f}.${Date.now()}.tmp`;try{await y6(y,D,K,z),await S$(D,f)}catch(d$){try{await z6(D,{force:!0})}catch{}if(K.update("Download failed, trying mirror..."),console.log(G.dim(`
Debug: ${d$.message}`)),w){let I6=new URL(w).hostname;K.update(`Downloading from mirror (${I6})...`),await y6(w,D,K,z),await S$(D,f)}else throw d$}}K.update(`Extracting Bun ${z}...`),await N(C),await Q6(f,C);let n="",x$=[p(C,k),p(C,"bin",k),p(C,"package","bin",k)],P6=await d(C);for(let D of P6)if(D.startsWith("bun-"))x$.push(p(C,D,k)),x$.push(p(C,D,"bin",k));for(let D of x$)if(await X(D)){n=D;break}if(!n)throw Error(`Could not find bun executable in ${C}`);if(await N(h),n!==S){await S$(n,S);let D=L4(n);if(D!==C&&D!==h)await a(D)}await R$(S,493),K.succeed(G.green(`Bun ${z} installed successfully.`)),Y=z,Z=!0}},{failMessage:`Failed to install Bun ${Q}`})}catch(K){throw Error(`Failed to install Bun: ${K.message}`)}if(Z)await k$(!1);if(Y)try{await O$(Y,{silent:!0});let K=p(O,"default");if(!await X(K))await W$("default",Y,{silent:!0})}catch(K){}if(await $$(),Y)console.log(G.cyan(`
\u2713 Bun ${Y} installed and active.`)),console.log(G.dim("  To verify, run: bun --version or bvm ls"))}async function x4($,q){let Q=q.replace(/^v/,""),Y=`#!/usr/bin/env bash
set -euo pipefail
if [[ $# -gt 0 && "$1" == "--version" ]]; then echo "${Q}"; exit 0; fi
echo "Bun ${Q} stub invoked with: $@"
exit 0
`;await Bun.write($,Y),await R$($,493)}F();x();A();async function U6(){await b("Fetching remote Bun versions...",async($)=>{let Q=(await r$()).filter((Y)=>_(Y)).filter((Y)=>!Y.includes("canary")).sort(K$);if(Q.length===0)throw Error("No remote Bun versions found.");$.succeed(G.green("Available remote Bun versions:")),Q.forEach((Y)=>{console.log(`  ${U(Y)}`)})},{failMessage:"Failed to fetch remote Bun versions"})}F();x();j();A();import{join as j4}from"path";async function b6(){await b("Fetching locally installed Bun versions...",async($)=>{let q=await P(),Y=(await c()).version;if($.succeed(G.green("Locally installed Bun versions:")),q.length===0)console.log("  (No versions installed yet)");else q.forEach((K)=>{if(K===Y)console.log(`* ${G.green(K)} ${G.dim("(current)")}`);else console.log(`  ${K}`)});if(await X(O)){let K=await d(O);if(K.length>0){console.log(G.green(`
Aliases:`));for(let J of K)try{let W=(await E(j4(O,J))).trim(),H=U(W),y=`-> ${G.cyan(H)}`;if(H===Y)y+=` ${G.dim("(current)")}`;console.log(`  ${J} ${G.gray(y)}`)}catch(W){}}}},{failMessage:"Failed to list local Bun versions"})}F();x();A();async function w6(){await b("Checking current Bun version...",async($)=>{let{version:q,source:Q}=await c();if(q)$.stop(),console.log(`${G.green("\u2713")} Current Bun version: ${G.green(q)} ${G.dim(`(${Q})`)}`);else $.info(G.blue("No Bun version is currently active.")),console.log(G.yellow("Use 'bvm install <version>' to set a default, or create a .bvmrc file."))},{failMessage:"Failed to determine current Bun version"})}F();j();x();A();import{join as I$,basename as F4}from"path";import{unlink as C4}from"fs/promises";async function k6($){await b(`Attempting to uninstall Bun ${$}...`,async(q)=>{let Q=U($),Y=I$(L,Q),Z=I$(Y,"bin",k);if(!await X(Z))throw Error(`Bun ${$} is not installed.`);let K=!1;try{let J=I$(O,"default");if(await X(J)){let W=(await E(J)).trim();if(U(W)===Q)K=!0}}catch(J){}if(K)throw console.log(G.yellow("Hint: Set a new default using 'bvm default <new_version>'")),Error(`Bun ${$} is currently set as default. Please set another default before uninstalling.`);try{let J=await i$(G$);if(J){if(U(F4(J))===Q)await C4(G$)}}catch(J){}await a(Y),q.succeed(G.green(`Bun ${Q} uninstalled successfully.`)),await $$()},{failMessage:`Failed to uninstall Bun ${$}`})}F();j();x();A();import{join as N4}from"path";import{unlink as A4}from"fs/promises";async function L6($){await b(`Removing alias '${$}'...`,async(q)=>{let Q=N4(O,$);if(!await X(Q))throw Error(`Alias '${$}' does not exist.`);await A4(Q),q.succeed(G.green(`Alias '${$}' removed successfully.`))},{failMessage:`Failed to remove alias '${$}'`})}F();j();x();e();A();import{join as _$}from"path";async function O6($,q){await b(`Preparing to run with Bun ${$}...`,async(Q)=>{let Y=await u($);if(!Y)Y=U($);let Z=_$(L,Y),K=_$(Z,"bin"),J=_$(K,k);if(!await X(J)){Q.fail(G.red(`Bun ${$} (resolved: ${Y}) is not installed.`)),console.log(G.yellow(`You can install it using: bvm install ${$}`));return}Q.stop();try{await t([J,...q],{cwd:process.cwd(),prependPath:K}),process.exit(0)}catch(W){console.error(W.message),process.exit(1)}},{failMessage:`Failed to run command with Bun ${$}`})}F();j();x();e();A();import{join as E$}from"path";async function x6($,q,Q){await b(`Preparing environment for Bun ${$} to execute '${q}'...`,async(Y)=>{let Z=await u($);if(!Z)Z=U($);let K=E$(L,Z),J=E$(K,"bin"),W=E$(J,k);if(!await X(W)){Y.fail(G.red(`Bun ${$} (resolved: ${Z}) is not installed.`)),console.log(G.yellow(`You can install it using: bvm install ${$}`));return}Y.stop();try{await t([q,...Q],{cwd:process.cwd(),prependPath:J}),process.exit(0)}catch(H){console.error(H.message),process.exit(1)}},{failMessage:`Failed to execute command with Bun ${$}'s environment`})}j();x();A();import{join as T4}from"path";async function j6($){await b("Resolving path...",async()=>{let q=null,Q="bun",{version:Y}=await c();if(!$||$==="current"){if(q=Y,!q)throw Error("No active Bun version found.")}else{let{resolveLocalVersion:K}=await Promise.resolve().then(() => (e(),W6));if(q=await K($),!q)if(Y)q=Y,Q=$;else throw Error(`Bun version or command '${$}' not found.`)}let Z=T4(L,q,"bin",Q==="bun"?k:Q);if(await X(Z))console.log(Z);else throw Error(`Command '${Q}' not found in Bun ${q}.`)},{failMessage:"Failed to resolve path"})}F();x();A();e();async function F6($){await b(`Resolving session version for Bun ${$}...`,async(q)=>{let Q=null,Y=await u($);if(Y)Q=Y;else{let K=(await P()).map((J)=>U(J));Q=s($,K)}if(!Q)throw Error(`Bun version '${$}' is not installed or cannot be resolved.`);let Z=U(Q);q.succeed(G.green(`Bun ${Z} will be active in this session.`)),console.log(`export BVM_ACTIVE_VERSION=${Z}`),console.log(G.dim("Run `eval $(bvm shell <version>)` or `export BVM_ACTIVE_VERSION=...` to activate."))},{failMessage:`Failed to set session version for Bun ${$}`})}F();j();x();A();import{join as D4}from"path";async function C6($){let q=D4(O,"default");if(!$)await b("Checking current default Bun version...",async(Q)=>{if(await X(q)){let Y=await E(q);Q.succeed(G.green(`Default Bun version: ${U(Y.trim())}`))}else Q.info(G.blue("No global default Bun version is set.")),console.log(G.yellow("Use 'bvm default <version>' to set one."))},{failMessage:"Failed to retrieve default Bun version"});else await b(`Setting global default to Bun ${$}...`,async(Q)=>{let Y=(await P()).map((K)=>U(K)),Z=s($,Y);if(!Z)throw Error(`Bun version '${$}' is not installed.`);await W$("default",Z,{silent:!0}),Q.succeed(G.green(`\u2713 Default set to ${Z}. New terminals will now start with this version.`))},{failMessage:`Failed to set global default to Bun ${$}`})}j();x();F();A();import{unlink as B4}from"fs/promises";import{join as M4}from"path";async function N6(){await b("Deactivating current Bun version...",async($)=>{let q=M4(O,"default");if(await X(q))await B4(q),$.succeed(G.green("Default Bun version deactivated.")),console.log(G.gray("Run `bvm use <version>` to reactivate.")),await $$();else $.info("No default Bun version is currently active.")},{failMessage:"Failed to deactivate"})}e();j();x();F();A();async function A6($){if($==="dir"){console.log(R);return}if($==="clear"){await b("Clearing cache...",async(q)=>{await a(R),await N(R),q.succeed(G.green("Cache cleared."))},{failMessage:"Failed to clear cache"});return}console.error(G.red(`Unknown cache command: ${$}`)),console.log("Usage: bvm cache dir | bvm cache clear")}F();j();A();x();import{join as T6}from"path";var v$=q$.version,f4="EricLLLLLL",S4="bvm";async function D6(){try{await b("Checking for BVM updates...",async($)=>{let q=M?{tagName:process.env.BVM_TEST_LATEST_VERSION||`v${v$}`,downloadUrl:"https://example.com/bvm-test"}:await B$();if(!q)throw Error("Unable to determine the latest BVM version.");let Q=q.tagName.startsWith("v")?q.tagName.slice(1):q.tagName;if(!_(Q))throw Error(`Unrecognized version received: ${q.tagName}`);if(!U$(Q,v$)){$.succeed(G.green(`BVM is already up to date (v${v$}).`)),console.log(G.blue("You are using the latest version."));return}if($.text=`Updating BVM to v${Q}...`,M&&!process.env.BVM_TEST_REAL_UPGRADE){$.succeed(G.green("BVM updated successfully (test mode)."));return}let Y=`https://cdn.jsdelivr.net/gh/${f4}/${S4}@${q.tagName}/dist/index.js`,Z=await fetch(Y);if(!Z.ok)throw Error(`Failed to download BVM source from CDN: ${Z.statusText} (${Z.status})`);let K=await Z.text();if(!K||K.length<100)throw Error("Downloaded BVM source seems invalid or empty.");let J=F$,W=T6(J,"index.js"),H=T6(J,`index.js.new-${Date.now()}`);await N(J),await J$(H,K);try{let{rename:y}=await import("fs/promises");await y(H,W)}catch(y){await J$(W,K);let{unlink:w}=await import("fs/promises");await w(H).catch(()=>{})}$.succeed(G.green(`BVM updated to v${Q} successfully.`)),console.log(G.yellow("Please restart your terminal to apply changes."))},{failMessage:"Failed to upgrade BVM"})}catch($){throw Error(`Failed to upgrade BVM: ${$.message}`)}}F();j();x();A();import{homedir as R4}from"os";import{join as P4}from"path";async function B6(){await b("Gathering BVM diagnostics...",async()=>{let $={currentVersion:(await c()).version,installedVersions:await P(),aliases:await I4(),env:{BVM_DIR:T,BVM_BIN_DIR:m,BVM_SHIMS_DIR:I,BVM_VERSIONS_DIR:L,BVM_TEST_MODE:process.env.BVM_TEST_MODE,HOME:process.env.HOME||R4()}};_4($)})}async function I4(){if(!await X(O))return[];let $=await d(O),q=[];for(let Q of $){let Y=P4(O,Q);if(await X(Y)){let Z=await Bun.file(Y).text();q.push({name:Q,target:U(Z.trim())})}}return q}function _4($){if(console.log(G.bold(`
Directories`)),console.log(`  BVM_DIR: ${G.cyan($.env.BVM_DIR||"")}`),console.log(`  BIN_DIR: ${G.cyan(m)}`),console.log(`  SHIMS_DIR: ${G.cyan(I)}`),console.log(`  VERSIONS_DIR: ${G.cyan(L)}`),console.log(G.bold(`
Environment`)),console.log(`  HOME: ${$.env.HOME||"n/a"}`),console.log(`  BVM_TEST_MODE: ${$.env.BVM_TEST_MODE||"false"}`),console.log(G.bold(`
Installed Versions`)),$.installedVersions.length===0)console.log("  (none installed)");else $.installedVersions.forEach((q)=>{let Q=q===$.currentVersion,Y=Q?G.green("*"):" ",Z=Q?G.green(q):q,K=Q?G.green(" (current)"):"";console.log(`  ${Y} ${Z}${K}`)});if(console.log(G.bold(`
Aliases`)),$.aliases.length===0)console.log("  (no aliases configured)");else $.aliases.forEach((q)=>{console.log(`  ${q.name} ${G.gray("->")} ${G.cyan(q.target)}`)});console.log(`
`+G.green("Diagnostics complete."))}var u$=["install","uninstall","use","ls","ls-remote","current","alias","unalias","run","exec","which","cache","setup","upgrade","doctor","completion","deactivate","help"],M6={bash:`#!/usr/bin/env bash
_bvm_completions() {
  COMPREPLY=( $(compgen -W "${u$.join(" ")}" -- "\${COMP_WORDS[COMP_CWORD]}") )
}
complete -F _bvm_completions bvm
`,zsh:`#compdef bvm
_bvm() {
  local -a commands
  commands=( ${u$.join(" ")} )
  _describe 'command' commands
}
compdef _bvm bvm
`,fish:`complete -c bvm -f -a "${u$.join(" ")}"
`};function f6($){let q=M6[$];if(!q)throw Error(`Unsupported shell '${$}'. Supported shells: ${Object.keys(M6).join(", ")}`);console.log(q)}F();x();j();import{join as E4}from"path";F();var v4="update-check.json";async function S6(){if(M)return;let $=E4(R,v4);try{if(await X($)){let q=JSON.parse(await E($));if(q.latestVersion&&U$(q.latestVersion,q$.version))u4(q$.version,q.latestVersion)}}catch(q){}}function u4($,q){let Q=`Update available! ${G.dim($)} -> ${G.green(q)}`,Y=`Run ${G.cyan("bvm upgrade")} to update`,Z=Math.max(g$(Q).length,g$(Y).length)+4,K="\u256D"+"\u2500".repeat(Z)+"\u256E",J="\u2570"+"\u2500".repeat(Z)+"\u256F",W=(H)=>{let y=g$(H).length,w=Z-2-y;return"\u2502 "+H+" ".repeat(w)+" \u2502"};console.log(`
`+G.yellow(K)),console.log(G.yellow(W(Q))),console.log(G.yellow(W(Y))),console.log(G.yellow(J)+`
`)}function g$($){return $.replace(/[\u001B\u009B][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,"")}class R6{commands={};helpEntries=[];name;versionStr;constructor($){this.name=$,this.versionStr=q$.version}command($,q,Q={}){let Y=$.split(" ")[0],Z={description:q,usage:`${this.name} ${$}`,action:async()=>{},aliases:Q.aliases};if(this.commands[Y]=Z,this.helpEntries.push(`  ${$.padEnd(35)} ${q}`),Q.aliases)Q.aliases.forEach((J)=>{this.commands[J]=Z});let K={action:(J)=>{return Z.action=J,K},option:(J,W)=>K};return K}async run(){let{values:$,positionals:q}=g4({args:Bun.argv.slice(2),strict:!1,allowPositionals:!0,options:{help:{type:"boolean",short:"h"},version:{type:"boolean",short:"v"},silent:{type:"boolean",short:"s"}}}),Q=q[0],Y=!!($.silent||$.s),Z=!!($.version||$.v||$.help||$.h);if(!Q){if($.version||$.v)console.log(this.versionStr),process.exit(0);if($.help||$.h)this.showHelp(),process.exit(0);this.showHelp(),process.exit(1)}if(!Z&&!Y&&!["rehash","completion"].includes(Q))await S6();if($.help||$.h)this.showHelp(),process.exit(0);let K=this.commands[Q];if(!K)console.error(G.yellow(`Unknown command '${Q}'`)),this.showHelp(),process.exit(0);try{await K.action(q.slice(1),$)}catch(J){if(!J.reported)console.error(G.red(`\u2716 ${J.message}`));process.exit(1)}}showHelp(){console.log(`Bun Version Manager (bvm) v${this.versionStr}`),console.log(`Built with Bun \xB7 Runs with Bun \xB7 Tested on Bun
`),console.log("Usage:"),console.log(`  ${this.name} <command> [flags]
`),console.log("Commands:"),console.log(this.helpEntries.join(`
`)),console.log(`
Global Flags:`),console.log("  --help, -h                     Show this help message"),console.log("  --version, -v                  Show version number"),console.log(`
Examples:`),console.log("  bvm install 1.0.0"),console.log("  bvm use 1.0.0"),console.log("  bvm run 1.0.0 index.ts")}}async function d4(){let $=new R6("bvm");$.command("rehash","Regenerate shims for all installed binaries").action(async()=>{await $$()}),$.command("install [version]","Install a Bun version and set as current").option("--global, -g","Install as a global tool (not just default)").action(async(q,Q)=>{await P$(q[0],{global:Q.global||Q.g})}),$.command("i [version]","Alias for install").action(async(q,Q)=>{await P$(q[0],{global:Q.global||Q.g})}),$.command("ls","List installed Bun versions",{aliases:["list"]}).action(async()=>{await b6()}),$.command("ls-remote","List all available remote Bun versions").action(async()=>{await U6()}),$.command("use <version>","Switch the active Bun version immediately (all terminals)").action(async(q)=>{if(!q[0])throw Error("Version is required");await O$(q[0])}),$.command("shell <version>","Switch Bun version for the current shell session").action(async(q)=>{if(!q[0])throw Error("Version is required");await F6(q[0])}),$.command("default [version]","Display or set the global default Bun version").action(async(q)=>{await C6(q[0])}),$.command("current","Display the currently active Bun version").action(async()=>{await w6()}),$.command("uninstall <version>","Uninstall a Bun version").action(async(q)=>{if(!q[0])throw Error("Version is required");await k6(q[0])}),$.command("alias <name> <version>","Create an alias for a Bun version").action(async(q)=>{if(!q[0]||!q[1])throw Error("Name and version are required");await W$(q[0],q[1])}),$.command("unalias <name>","Remove an existing alias").action(async(q)=>{if(!q[0])throw Error("Alias name is required");await L6(q[0])}),$.command("run <version> [...args]","Run a command with a specific Bun version").action(async(q)=>{let Q=q[0];if(!Q)throw Error("Version is required");let Y=process.argv.indexOf("run"),Z=Y!==-1?process.argv.slice(Y+2):[];await O6(Q,Z)}),$.command("exec <version> <cmd> [...args]","Execute a command with a specific Bun version's environment").action(async(q)=>{let Q=q[0],Y=q[1];if(!Q||!Y)throw Error("Version and command are required");let Z=process.argv.indexOf("exec"),K=Z!==-1?process.argv.slice(Z+3):[];await x6(Q,Y,K)}),$.command("which [version]","Display path to installed bun version").action(async(q)=>{await j6(q[0])}),$.command("deactivate","Undo effects of bvm on current shell").action(async()=>{await N6()}),$.command("version <spec>","Resolve the given description to a single local version").action(async(q)=>{if(!q[0])throw Error("Version specifier is required");await M$(q[0])}),$.command("cache <action>","Manage bvm cache").action(async(q)=>{if(!q[0])throw Error("Action is required");await A6(q[0])}),$.command("setup","Configure shell environment automatically").option("--silent, -s","Suppress output").action(async(q,Q)=>{await k$(!(Q.silent||Q.s))}),$.command("upgrade","Upgrade bvm to the latest version",{aliases:["self-update"]}).action(async()=>{await D6()}),$.command("doctor","Show diagnostics for Bun/BVM setup").action(async()=>{await B6()}),$.command("completion <shell>","Generate shell completion script (bash|zsh|fish)").action(async(q)=>{if(!q[0])throw Error("Shell name is required");f6(q[0])}),await $.run(),process.exit(0)}d4().catch(($)=>{console.error(G.red(`
[FATAL ERROR] Unexpected Crash:`)),console.error($),process.exit(1)});
