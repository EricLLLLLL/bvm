// @bun
var u4=Object.create;var{getPrototypeOf:g4,defineProperty:F$,getOwnPropertyNames:V4}=Object;var d4=Object.prototype.hasOwnProperty;var y$=($,q,Q)=>{Q=$!=null?u4(g4($)):{};let Y=q||!$||!$.__esModule?F$(Q,"default",{value:$,enumerable:!0}):Q;for(let G of V4($))if(!d4.call(Y,G))F$(Y,G,{get:()=>$[G],enumerable:!0});return Y};var d$=($,q)=>{for(var Q in q)F$($,Q,{get:q[Q],enumerable:!0,configurable:!0,set:(Y)=>q[Q]=()=>Y})};var X$=($,q)=>()=>($&&(q=$($=0)),q);var z$=import.meta.require;var m$={};d$(m$,{getBvmDir:()=>h$,getBunAssetName:()=>A$,USER_AGENT:()=>Q$,TEST_REMOTE_VERSIONS:()=>Z$,REPO_FOR_BVM_CLI:()=>i,OS_PLATFORM:()=>M,IS_TEST_MODE:()=>f,EXECUTABLE_NAME:()=>k,CPU_ARCH:()=>H$,BVM_VERSIONS_DIR:()=>L,BVM_SRC_DIR:()=>C$,BVM_SHIMS_DIR:()=>_,BVM_DIR:()=>T,BVM_CURRENT_DIR:()=>G$,BVM_CACHE_DIR:()=>P,BVM_BIN_DIR:()=>m,BVM_ALIAS_DIR:()=>x,BUN_GITHUB_RELEASES_API:()=>c4,ASSET_NAME_FOR_BVM:()=>N$});import{homedir as m4}from"os";import{join as o}from"path";function h$(){let $=process.env.HOME||m4();return o($,".bvm")}function A$($){return`bun-${M==="win32"?"windows":M}-${H$==="arm64"?"aarch64":"x64"}.zip`}var M,H$,f,Z$,T,C$,L,m,_,G$,x,P,k,c4="https://api.github.com/repos/oven-sh/bun/releases",i="EricLLLLLL/bvm",N$,Q$="bvm (Bun Version Manager)";var F=X$(()=>{M=process.platform,H$=process.arch,f=process.env.BVM_TEST_MODE==="true",Z$=["v1.3.4","v1.2.23","v1.0.0","bun-v1.4.0-canary"];T=h$(),C$=o(T,"src"),L=o(T,"versions"),m=o(T,"bin"),_=o(T,"shims"),G$=o(T,"current"),x=o(T,"aliases"),P=o(T,"cache"),k=M==="win32"?"bun.exe":"bun",N$=M==="win32"?"bvm.exe":"bvm"});function E($){if(!$)return null;return $.match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/)?$:null}function c$($){let q=E($);return q?q.replace(/^v/,""):null}function Y$($){if(!$)return null;let q=$.replace(/^v/,""),Y=q.split(/[-+]/)[0].split(".").map(Number);if(Y.length===0||Y.some((K)=>isNaN(K)))return null;let G=q.includes("-")?q.split("-")[1].split("+")[0]:void 0;return{major:Y[0],minor:Y[1],patch:Y[2],pre:G}}function T$($,q){if(!$||!q)return 0;if($.major!==q.major)return $.major-q.major;if($.minor!==q.minor)return $.minor-q.minor;if($.patch!==q.patch)return $.patch-q.patch;if($.pre&&!q.pre)return-1;if(!$.pre&&q.pre)return 1;if($.pre&&q.pre)return $.pre.localeCompare(q.pre);return 0}function p$($,q){let Q=Y$($),Y=Y$(q);return T$(Q,Y)}function K$($,q){return p$(q,$)}function b$($,q){return p$($,q)>0}function l$($,q){if(q==="*"||q===""||q==="latest")return!0;let Q=Y$($);if(!Q)return!1;let Y=q;if(q.startsWith("v"))Y=q.substring(1);if(c$($)===c$(q))return!0;let G=Y.split(".");if(G.length===1){let K=Number(G[0]);if(Q.major===K)return!0}else if(G.length===2){let K=Number(G[0]),J=Number(G[1]);if(Q.major===K&&Q.minor===J)return!0}if(q.startsWith("~")){let K=Y$(q.substring(1));if(!K)return!1;let J=K.patch??0;return Q.major===K.major&&Q.minor===K.minor&&Q.patch>=J}if(q.startsWith("^")){let K=Y$(q.substring(1));if(!K)return!1;let J=K.patch??0,W=K.minor??0;if(K.major===0){if(Q.major!==0)return!1;if(Q.minor!==W)return!1;return Q.patch>=J}if(Q.major!==K.major)return!1;if(Q.minor<W)return!1;if(Q.minor===W&&Q.patch<J)return!1;return!0}return!1}import{readdir as l4,mkdir as t4,stat as n4,symlink as o4,unlink as i4,rm as t$,readlink as a4}from"fs/promises";import{join as U$,basename as s4}from"path";async function N($){await t4($,{recursive:!0})}async function X($){try{return await n4($),!0}catch(q){if(q.code==="ENOENT")return!1;throw q}}async function n$($,q){try{await i4(q)}catch(Y){try{await t$(q,{recursive:!0,force:!0})}catch(G){}}let Q=process.platform==="win32"?"junction":"dir";await o4($,q,Q)}async function o$($){try{return await a4($)}catch(q){if(q.code==="ENOENT"||q.code==="EINVAL")return null;throw q}}async function a($){await t$($,{recursive:!0,force:!0})}async function d($){try{return await l4($)}catch(q){if(q.code==="ENOENT")return[];throw q}}async function v($){return await Bun.file($).text()}async function J$($,q){await Bun.write($,q)}function b($){let q=$.trim();if(q.startsWith("bun-v"))q=q.substring(4);if(!q.startsWith("v")&&/^\d/.test(q))q=`v${q}`;return q}async function I(){return await N(L),(await d(L)).filter((q)=>E(b(q))).sort(K$)}async function c(){if(process.env.BVM_ACTIVE_VERSION)return{version:b(process.env.BVM_ACTIVE_VERSION),source:"env"};let $=U$(process.cwd(),".bvmrc");if(await X($)){let J=(await v($)).trim();return{version:b(J),source:".bvmrc"}}let{getBvmDir:q}=await Promise.resolve().then(() => (F(),m$)),Q=q(),Y=U$(Q,"current"),G=U$(Q,"aliases");if(await X(Y)){let{realpath:J}=await import("fs/promises");try{let W=await J(Y);return{version:b(s4(W)),source:"current"}}catch(W){}}let K=U$(G,"default");if(await X(K)){let J=(await v(K)).trim();return{version:b(J),source:"default"}}return{version:null,source:null}}function s($,q){if(!$||q.length===0)return null;let Q=b($);if(q.includes(Q))return Q;if($.toLowerCase()==="latest")return q[0];if(/^\d+\.\d+\.\d+$/.test($.replace(/^v/,"")))return null;if(!/^[v\d]/.test($))return null;let G=$.startsWith("v")?`~${$.substring(1)}`:`~${$}`,K=q.filter((J)=>l$(J,G));if(K.length>0)return K.sort(K$)[0];return null}var j=X$(()=>{F()});import{createInterface as r4}from"readline";class D${timer=null;frames=process.platform==="win32"?["-","\\","|","/"]:["\u280B","\u2819","\u2839","\u2838","\u283C","\u2834","\u2826","\u2827","\u2807","\u280F"];frameIndex=0;text;constructor($){this.text=$}start($){if($)this.text=$;if(this.timer)return;this.timer=setInterval(()=>{process.stdout.write(`\r\x1B[K${Z.cyan(this.frames[this.frameIndex])} ${this.text}`),this.frameIndex=(this.frameIndex+1)%this.frames.length},80)}stop(){if(this.timer)clearInterval(this.timer),this.timer=null,process.stdout.write("\r\x1B[K");process.stdout.write("\x1B[?25h")}succeed($){this.stop(),console.log(`${Z.green("\u2713")} ${$||this.text}`)}fail($){this.stop(),console.log(`${Z.red("\u2716")} ${$||this.text}`)}info($){this.stop(),console.log(`${Z.blue("\u2139")} ${$||this.text}`)}update($){this.text=$}}class B${total;current=0;width=20;constructor($){this.total=$}start(){process.stdout.write("\x1B[?25l"),this.render()}update($,q){this.current=$,this.render(q)}stop(){process.stdout.write(`\x1B[?25h
`)}render($){let q=Math.min(1,this.current/this.total),Q=Math.round(this.width*q),Y=this.width-Q,G=process.platform==="win32",K=G?"=":"\u2588",J=G?"-":"\u2591",W=Z.green(K.repeat(Q))+Z.gray(J.repeat(Y)),H=(q*100).toFixed(0).padStart(3," "),z=(this.current/1048576).toFixed(1),w=(this.total/1048576).toFixed(1),y=$?` ${$.speed}KB/s`:"";process.stdout.write(`\r\x1B[2K ${W} ${H}% | ${z}/${w}MB${y}`)}}async function i$($){let q=r4({input:process.stdin,output:process.stdout});return new Promise((Q)=>{q.question(`${Z.yellow("?")} ${$} (Y/n) `,(Y)=>{q.close(),Q(Y.toLowerCase()!=="n")})})}var e4,$6=($)=>$.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),l=($,q,Q=$)=>(Y)=>e4?$+Y.replace(new RegExp($6(q),"g"),Q)+q:Y,Z;var C=X$(()=>{e4=!process.env.NO_COLOR,Z={red:l("\x1B[1;31m","\x1B[39m"),green:l("\x1B[1;32m","\x1B[39m"),yellow:l("\x1B[1;33m","\x1B[39m"),blue:l("\x1B[1;34m","\x1B[39m"),magenta:l("\x1B[1;35m","\x1B[39m"),cyan:l("\x1B[1;36m","\x1B[39m"),gray:l("\x1B[90m","\x1B[39m"),bold:l("\x1B[1m","\x1B[22m","\x1B[22m\x1B[1m"),dim:l("\x1B[2m","\x1B[22m","\x1B[22m\x1B[2m")}});async function U($,q,Q){if(process.platform==="win32"){console.log(Z.cyan(`> ${$}`));let K={start:(J)=>{if(J)console.log(Z.cyan(`> ${J}`))},stop:()=>{},succeed:(J)=>console.log(Z.green(`  \u2713 ${J}`)),fail:(J)=>console.log(Z.red(`  \u2716 ${J}`)),info:(J)=>console.log(Z.cyan(`  \u2139 ${J}`)),update:(J)=>console.log(Z.dim(`  ... ${J}`)),isSpinning:!1};try{return await q(K)}catch(J){let W=J4(J,Q?.failMessage);if(console.log(Z.red(`  \u2716 ${W}`)),process.env.BVM_DEBUG,console.log(Z.dim(`    Details: ${J.message}`)),J.code)console.log(Z.dim(`    Code: ${J.code}`));throw J.reported=!0,J}}let G=new D$($);G.start();try{let K=await q(G);return G.stop(),K}catch(K){let J=J4(K,Q?.failMessage);throw G.fail(Z.red(J)),K.reported=!0,K}}function J4($,q){let Q=$ instanceof Error?$.message:String($);if(!q)return Q;if(typeof q==="function")return q($);return`${q}: ${Q}`}var A=X$(()=>{C()});var W4={};d$(W4,{resolveLocalVersion:()=>g,displayVersion:()=>f$});import{join as b6}from"path";async function g($){if($==="current"){let{version:G}=await c();return G}if($==="latest"){let G=await I();if(G.length>0)return G[0];return null}let q=b6(x,$);if(await X(q))try{let G=(await v(q)).trim();return b(G)}catch{return null}let Q=b($),Y=await I();return s($,Y)}async function f$($){await U(`Resolving version '${$}'...`,async()=>{let q=await g($);if(q)console.log(q);else throw Error("N/A")},{failMessage:`Failed to resolve version '${$}'`})}var e=X$(()=>{F();j();A()});import{parseArgs as d6}from"util";var q$={name:"@bvm-cli/core",version:"1.0.5",description:"The native version manager for Bun. Cross-platform, shell-agnostic, and zero-dependency.",main:"src/index.ts",publishConfig:{access:"public"},scripts:{dev:"npx bun run src/index.ts",build:"npx bun build src/index.ts --target=bun --outfile dist/index.js --minify",test:"npx bun test test/*.ts",bvm:"npx bun run src/index.ts","bvm:sandbox":'mkdir -p "$PWD/.sandbox-home" && HOME="$PWD/.sandbox-home" npx bun run src/index.ts',release:"npx bun run scripts/release.ts","sync-runtime":"npx bun run scripts/sync-runtime.ts"},repository:{type:"git",url:"git+https://github.com/EricLLLLLL/bvm.git"},keywords:["bun","version-manager","cli","bvm","nvm","nvm-windows","fnm","nodenv","bun-nvm","version-switching"],files:["dist/index.js","README.md"],author:"EricLLLLLL",license:"MIT",private:!0,type:"commonjs",dependencies:{"@oven/bun-darwin-aarch64":"^1.3.5","cli-progress":"^3.12.0"},devDependencies:{"@types/bun":"^1.3.4","@types/cli-progress":"^3.11.6","@types/node":"^24.10.2",bun:"^1.3.5",esbuild:"^0.27.2",typescript:"^5"},peerDependencies:{typescript:"^5"}};F();j();import{join as p,basename as O6,dirname as x6}from"path";F();j();C();import{join as q6}from"path";function a$($,q){if($==="darwin"){if(q==="arm64")return"@oven/bun-darwin-aarch64";if(q==="x64")return"@oven/bun-darwin-x64"}if($==="linux"){if(q==="arm64")return"@oven/bun-linux-aarch64";if(q==="x64")return"@oven/bun-linux-x64"}if($==="win32"){if(q==="x64")return"@oven/bun-windows-x64"}return null}function s$($,q,Q){let Y=Q;if(!Y.endsWith("/"))Y+="/";let G=$.startsWith("@"),K=$;if(G){let W=$.split("/");if(W.length===2)K=W[1]}let J=`${K}-${q}.tgz`;return`${Y}${$}/-/${J}`}C();async function t($,q={}){let{cwd:Q,env:Y,prependPath:G,stdin:K="inherit",stdout:J="inherit",stderr:W="inherit"}=q,H={...process.env,...Y};if(G){let y=H.PATH||"",O=process.platform==="win32"?";":":";H.PATH=`${G}${O}${y}`}let w=await Bun.spawn({cmd:$,cwd:Q,env:H,stdin:K,stdout:J,stderr:W}).exited;if((w??0)!==0)throw Error(`${Z.red("Command failed")}: ${$.join(" ")} (code ${w})`);return w??0}function w$(){try{let $=Intl.DateTimeFormat().resolvedOptions().timeZone;return $==="Asia/Shanghai"||$==="Asia/Chongqing"||$==="Asia/Harbin"||$==="Asia/Urumqi"}catch($){return!1}}var Q6="bun-versions.json",Y6=3600000;async function K6(){if(f)return[...Z$];let $=q6(P,Q6);try{if(await pathExists($)){let G=await readTextFile($),K=JSON.parse(G);if(Date.now()-K.timestamp<Y6&&Array.isArray(K.versions))return K.versions}}catch(G){}let Q=w$()?["https://registry.npmmirror.com/bun","https://registry.npmjs.org/bun"]:["https://registry.npmjs.org/bun","https://registry.npmmirror.com/bun"],Y=null;for(let G of Q){let K=new AbortController,J=setTimeout(()=>K.abort(),1e4);try{let W=await fetch(G,{headers:{"User-Agent":Q$,Accept:"application/vnd.npm.install-v1+json"},signal:K.signal});if(clearTimeout(J),!W.ok)throw Error(`Status ${W.status}`);let H=await W.json();if(!H.versions)throw Error("Invalid response (no versions)");let z=Object.keys(H.versions);try{await ensureDir(P),await writeTextFile($,JSON.stringify({timestamp:Date.now(),versions:z}))}catch(w){}return z}catch(W){clearTimeout(J),Y=W}}throw Y||Error("Failed to fetch versions from any registry.")}async function Z6(){if(f)return[...Z$];return new Promise(($,q)=>{let Q=[];try{let Y=Bun.spawn(["git","ls-remote","--tags","https://github.com/oven-sh/bun.git"],{stdout:"pipe",stderr:"pipe"}),G=setTimeout(()=>{Y.kill(),q(Error("Git operation timed out"))},1e4);new Response(Y.stdout).text().then((J)=>{clearTimeout(G);let W=J.split(`
`);for(let H of W){let z=H.match(/refs\/tags\/bun-v?(\d+\.\d+\.\d+.*)$/);if(z)Q.push(z[1])}$(Q)}).catch((J)=>{clearTimeout(G),q(J)})}catch(Y){q(Error(`Failed to run git: ${Y.message}`))}})}async function r$(){if(f)return[...Z$];try{let q=(await K6()).filter((Q)=>E(Q)).map((Q)=>({v:Q,parsed:Y$(Q)}));return q.sort((Q,Y)=>T$(Y.parsed,Q.parsed)),q.map((Q)=>Q.v)}catch($){try{let q=await Z6();if(q.length>0)return Array.from(new Set(q.filter((Y)=>E(Y)))).sort(K$);throw Error("No versions found via Git")}catch(q){throw Error(`Failed to fetch versions. NPM: ${$.message}. Git: ${q.message}`)}}}async function e$($){if(f)return Z$.includes($)||$==="latest";let Q=w$()?"https://registry.npmmirror.com":"https://registry.npmjs.org",Y=$.replace(/^v/,""),G=`${Q}/bun/${Y}`;try{return await t([M==="win32"?"curl.exe":"curl","-I","-f","-m","5","-s",G],{stdout:"ignore",stderr:"ignore"}),!0}catch(K){return!1}}async function $4(){if(f)return{latest:"1.1.20"};let Q=`${w$()?"https://registry.npmmirror.com":"https://registry.npmjs.org"}/-/package/bun/dist-tags`;try{let Y=new AbortController,G=setTimeout(()=>Y.abort(),5000),K=await fetch(Q,{headers:{"User-Agent":Q$},signal:Y.signal});if(clearTimeout(G),K.ok)return await K.json()}catch(Y){}return{}}async function q4($){let q=b($);if(!E(q))return console.error(Z.red(`Invalid version provided to findBunDownloadUrl: ${$}`)),null;if(f)return{url:`https://example.com/${A$(q)}`,foundVersion:q};let G=a$(M==="win32"?"win32":M,H$==="arm64"?"arm64":"x64");if(!G)throw Error(`Unsupported platform/arch for NPM download: ${M}-${H$}`);let K="https://registry.npmjs.org";if(process.env.BVM_REGISTRY)K=process.env.BVM_REGISTRY;else if(process.env.BVM_DOWNLOAD_MIRROR)K=process.env.BVM_DOWNLOAD_MIRROR;else if(w$())K="https://registry.npmmirror.com";let J=q.replace(/^v/,"");return{url:s$(G,J,K),foundVersion:q}}async function M$(){let $=N$;try{let Y=new AbortController,G=setTimeout(()=>Y.abort(),2000),K=await fetch(`https://cdn.jsdelivr.net/gh/${i}@latest/package.json`,{headers:{"User-Agent":Q$},signal:Y.signal});if(clearTimeout(G),K.ok){let J=await K.json();if(J&&J.version){let W=`v${J.version}`;return{tagName:W,downloadUrl:`https://github.com/${i}/releases/download/${W}/${$}`}}}}catch(Y){}try{let Y=new AbortController,G=setTimeout(()=>Y.abort(),2000),K=`https://github.com/${i}/releases/latest`,J=await fetch(K,{method:"HEAD",redirect:"manual",headers:{"User-Agent":Q$},signal:Y.signal});if(clearTimeout(G),J.status===302||J.status===301){let W=J.headers.get("location");if(W){let H=W.split("/"),z=H[H.length-1];if(z&&E(z))return{tagName:z,downloadUrl:`https://github.com/${i}/releases/download/${z}/${$}`}}}}catch(Y){}let q={"User-Agent":Q$},Q=`https://api.github.com/repos/${i}/releases/latest`;try{let Y=new AbortController,G=setTimeout(()=>Y.abort(),2000),K=await fetch(Q,{headers:q,signal:Y.signal});if(clearTimeout(G),!K.ok)return null;let W=(await K.json()).tag_name,H=`https://github.com/${i}/releases/download/${W}/${$}`;return{tagName:W,downloadUrl:H}}catch(Y){return null}}C();F();import{spawn as G6}from"child_process";async function Q4($,q){if($.endsWith(".zip"))if(M==="win32")await t(["powershell","-Command",`Expand-Archive -Path "${$}" -DestinationPath "${q}" -Force`],{stdout:"ignore",stderr:"inherit"});else await t(["unzip","-o","-q",$,"-d",q],{stdout:"ignore",stderr:"inherit"});else if($.endsWith(".tar.gz")||$.endsWith(".tgz"))await new Promise((Q,Y)=>{let G=G6("tar",["-xzf",$,"-C",q],{stdio:"inherit",shell:!1});G.on("close",(K)=>{if(K===0)Q();else Y(Error(`tar exited with code ${K}`))}),G.on("error",(K)=>Y(K))});else throw Error(`Unsupported archive format: ${$}`)}import{chmod as S$}from"fs/promises";j();F();C();import{join as u,dirname as J6,delimiter as W6}from"path";import{homedir as r}from"os";import{chmod as Z4}from"fs/promises";var Y4=`#!/bin/bash

# bvm-init.sh: Initializes bvm default version on shell startup

# Check if BVM_DIR is set
if [ -z "\${BVM_DIR}" ]; then
  return
fi

# Try to switch to the 'default' version silently.
# We use the absolute path to ensure we are calling the correct binary.
# Errors are suppressed to prevent blocking shell startup if 'default' is missing.
"\${BVM_DIR}/bin/bvm" use default --silent >/dev/null 2>&1 || true
`,K4=`# bvm-init.fish: Initializes bvm default version on shell startup

# Check if BVM_DIR is set
if not set -q BVM_DIR
  return
end

# Try to switch to the 'default' version silently.
# Errors are suppressed to prevent blocking shell startup.
eval "$BVM_DIR/bin/bvm" use default --silent >/dev/null 2>&1 || true
`;async function k$($=!0){if(process.platform==="win32"){await X6($);return}if(!process.env.BVM_TEST_MODE)await G4();let q=process.env.SHELL||"",Q="",Y="";if(q.includes("zsh"))Y="zsh",Q=u(r(),".zshrc");else if(q.includes("bash"))if(Y="bash",process.platform==="darwin")if(await X(u(r(),".bashrc")))Q=u(r(),".bashrc");else Q=u(r(),".bash_profile");else Q=u(r(),".bashrc");else if(q.includes("fish"))Y="fish",Q=u(r(),".config","fish","config.fish");else{console.log(Z.yellow(`Could not detect a supported shell (zsh, bash, fish). Please manually add ${m} to your PATH.`));return}await N(m);let G=u(m,"bvm-init.sh");await Bun.write(G,Y4),await Z4(G,493);let K=u(m,"bvm-init.fish");await Bun.write(K,K4),await Z4(K,493);let J="";try{J=await Bun.file(Q).text()}catch(y){if(y.code==="ENOENT")await Bun.write(Q,""),J="";else throw y}let W="# >>> bvm initialize >>>",H="# <<< bvm initialize <<<",z=`${W}
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
# <<< bvm initialize <<<`;if($)console.log(Z.cyan(`Configuring ${Y} environment in ${Q}...`));try{let y=J,O=new RegExp(`${W}[sS]*?${H}`,"g");if(J.includes(W))y=J.replace(O,Y==="fish"?w:z);else if(J.includes("export BVM_DIR=")||J.includes("set -Ux BVM_DIR"))y=J+`
`+(Y==="fish"?w:z);else y=J+`
`+(Y==="fish"?w:z);if(y!==J){if(await Bun.write(Q,y),$)console.log(Z.green(`\u2713 Successfully updated BVM configuration in ${Q}`))}else if($)console.log(Z.gray("\u2713 Configuration is already up to date."));if($)console.log(Z.yellow(`Please restart your terminal or run "source ${Q}" to apply changes.`))}catch(y){console.error(Z.red(`Failed to write to ${Q}: ${y.message}`))}}async function X6($=!0){await G4();let q="";try{q=Bun.spawnSync({cmd:["powershell","-NoProfile","-Command","echo $PROFILE.CurrentUserAllHosts"],stdout:"pipe"}).stdout.toString().trim()}catch(Y){q=u(r(),"Documents","WindowsPowerShell","Microsoft.PowerShell_profile.ps1")}if(!q)return;await N(J6(q));let Q=`
# BVM Configuration
$env:BVM_DIR = "${T}"
$env:PATH = "$env:BVM_DIR\\shims;$env:BVM_DIR\\bin;$env:PATH"
# Auto-activate default version
if (Test-Path "$env:BVM_DIR\\bin\\bvm.cmd") {
    & "$env:BVM_DIR\\bin\\bvm.cmd" use default --silent *>$null
}
`;try{let Y="";if(await X(q))Y=await Bun.file(q).text();else await Bun.write(q,"");if(Y.includes("$env:BVM_DIR"))return;if($)console.log(Z.cyan(`Configuring PowerShell environment in ${q}...`));let K=Bun.file(q).writer();if(await Bun.write(q,Y+`\r
${Q}`),$)console.log(Z.green(`\u2713 Successfully configured BVM path in ${q}`)),console.log(Z.yellow("Please restart your terminal to apply changes."))}catch(Y){console.error(Z.red(`Failed to write to ${q}: ${Y.message}`))}}async function G4(){if(process.env.BVM_TEST_MODE)return;if(process.env.BVM_SUPPRESS_CONFLICT_WARNING==="true")return;let $=(process.env.PATH||"").split(W6),q=u(r(),".bun"),Q=u(q,"bin");for(let Y of $){if(!Y||Y===m||Y.includes(".bvm"))continue;let G=u(Y,k);if(await X(G)){if(Y.includes("node_modules"))continue;if(Y===Q||Y===q){console.log(),console.log(Z.yellow(" CONFLICT DETECTED ")),console.log(Z.yellow(`Found existing official Bun installation at: ${G}`)),console.log(Z.yellow("This will conflict with bvm as it is also in your PATH."));try{if(await i$("Do you want bvm to uninstall the official Bun version (~/.bun) to resolve this?"))await H6(q);else console.log(Z.dim("Skipping uninstallation. Please ensure bvm path takes precedence."))}catch(K){}return}else{console.log(),console.log(Z.red(" CONFLICT DETECTED ")),console.log(Z.red(`Found another Bun installation at: ${G}`)),console.log(Z.yellow("This might be installed via npm, Homebrew, or another package manager.")),console.log(Z.yellow("To avoid conflicts, please uninstall it manually (e.g., 'npm uninstall -g bun').")),console.log();return}}}}async function H6($){console.log(Z.cyan(`Removing official Bun installation at ${$}...`));try{await a($),console.log(Z.green("\u2713 Official Bun uninstalled.")),console.log(Z.yellow("Note: You may still need to remove `.bun/bin` from your PATH manually if it was added in your rc file."))}catch(q){console.error(Z.red(`Failed to remove official Bun: ${q.message}`))}}j();import{join as y6,dirname as z6}from"path";async function L$(){let $=process.cwd();while(!0){let q=y6($,".bvmrc");if(await X(q))try{return(await Bun.file(q).text()).trim()}catch(Y){return null}let Q=z6($);if(Q===$)break;$=Q}return null}C();F();j();e();A();import{join as X4}from"path";async function W$($,q,Q={}){let Y=async(G)=>{let K=await g(q);if(!K){if(!Q.silent)console.log(Z.blue(`Please install Bun ${q} first using: bvm install ${q}`));throw Error(`Bun version '${q}' is not installed. Cannot create alias.`)}let J=X4(L,K);if(!await X(J))throw Error(`Internal Error: Resolved Bun version ${K} not found.`);await N(x);let W=X4(x,$);if($!=="default"&&await X(W))throw Error(`Alias '${$}' already exists. Use 'bvm alias ${$} <new-version>' to update or 'bvm unalias ${$}' to remove.`);if(await J$(W,`${K}
`),G)G.succeed(Z.green(`Alias '${$}' created for Bun ${K}.`))};if(Q.silent)await Y();else await U(`Creating alias '${$}' for Bun ${q}...`,(G)=>Y(G),{failMessage:`Failed to create alias '${$}'`})}A();F();j();C();import{join as H4}from"path";e();A();async function O$($,q={}){let Q=$;if(!Q)Q=await L$()||void 0;if(!Q){if(!q.silent)console.error(Z.red("No version specified. Usage: bvm use <version>"));throw Error("No version specified.")}let Y=async(G)=>{let K=null,J=await g(Q);if(J)K=J;else{let w=(await I()).map((y)=>b(y));K=s(Q,w)}if(!K)throw Error(`Bun version '${Q}' is not installed.`);let W=b(K),H=H4(L,W),z=H4(H,"bin",k);if(!await X(z))throw Error(`Version ${W} is not properly installed (binary missing).`);if(await n$(H,G$),G)G.succeed(Z.green(`Now using Bun ${W} (immediate effect).`))};if(q.silent)await Y();else await U(`Switching to Bun ${Q}...`,(G)=>Y(G),{failMessage:()=>`Failed to switch to Bun ${Q}`})}F();j();import{join as V}from"path";import{chmod as y4,unlink as x$,symlink as U6,lstat as w6,readlink as k6}from"fs/promises";var z4=`#!/bin/bash
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
`,L6=`
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
  const root = path.parse(dir).root;
  while (true) {
    const rc = path.join(dir, '.bvmrc');
    // Note: Bun.file(path).exists() is async
    const file = Bun.file(rc);
    if (await file.exists()) {
        const v = await file.text();
        const trimmed = v.trim();
        if (trimmed) return trimmed.startsWith('v') ? trimmed : 'v' + trimmed;
    }
    if (dir === root) break;
    dir = path.dirname(dir);
  }

  // 3. Current Symlink (Junction)
  const current = path.join(BVM_DIR, 'current');
  // Check if it's a valid directory first (resolve junction)
  // Bun doesn't have native readlink/realpath exposed as simply yet for this context, 
  // so we might need to stick to node 'fs' for realpath or use Bun.file().name?
  // Actually, for resolving the junction target to get the version name, 
  // fs.realpathSync is the most reliable way in Node/Bun compatibility.
  // So let's keep 'fs' imported JUST for this specific realpath operation to be safe,
  // or use the assumption that 'current' is a dir.
  
  const fs = require('fs'); 
  if (fs.existsSync(current)) {
    try {
        const target = fs.realpathSync(current); 
        const v = path.basename(target);
        if (v.startsWith('v')) return v;
    } catch(e) {}
  }
  
  // 4. Default Alias
  const def = path.join(BVM_DIR, 'aliases', 'default');
  const defFile = Bun.file(def);
  if (await defFile.exists()) {
      const v = await defFile.text();
      const trimmed = v.trim();
      if (trimmed) return trimmed.startsWith('v') ? trimmed : 'v' + trimmed;
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
`,b4=`@echo off
set "BVM_DIR=%USERPROFILE%\\.bvm"
"%BVM_DIR%\\runtime\\current\\bin\\bun.exe" "%BVM_DIR%\\bin\\shim.js" "%~n0" %*
`;async function $$(){await N(_);let $=M==="win32",q=$?".cmd":"",Q=$?b4:z4;if($){let K=V(T,"bin","shim.js");await N(V(T,"bin")),await Bun.write(K,L6)}let Y=new Set;if(Y.add("bun"),Y.add("bunx"),await X(L)){let K=await d(L);for(let J of K){if(J.startsWith("."))continue;let W=V(L,J,"bin");if(await X(W)){let H=V(W,k);if(await X(H)){let w=["bunx"];for(let O of w){let D=V(W,$?O+".exe":O),R=V(W,k);if(!await X(D))try{if($)await Bun.write(Bun.file(D),Bun.file(R));else await U6(`./${k}`,D)}catch(S){}}let y=["yarn","npm","pnpm"];for(let O of y){let D=V(W,O);try{if((await w6(D)).isSymbolicLink()){let S=await k6(D);if(S===`./${k}`||S.endsWith(`/${k}`)||S===k)await x$(D)}}catch(R){}}}let z=await d(W);for(let w of z)Y.add(w.replace(/\.(exe|ps1|cmd)$/i,""))}}}for(let K of Y)if($){let J=V(_,K+".cmd");await Bun.write(J,b4),await y4(J,493)}else{let J=V(_,K);await Bun.write(J,z4),await y4(J,493)}let G=await d(_);for(let K of G){let J=K.replace(/\.(ps1|cmd)$/i,"");if($){if(K.endsWith(".ps1")){await x$(V(_,K));continue}if(K.endsWith(".cmd")&&!Y.has(J))await x$(V(_,K))}else if(!Y.has(J))await x$(V(_,K))}}import{rename as j6,rm as w4}from"fs/promises";async function R$($,q){try{await j6($,q)}catch(Q){await Bun.write(Bun.file(q),Bun.file($)),await w4($,{force:!0})}}async function U4($,q,Q,Y){let G=await fetch($);if(!G.ok)throw Error(`Status ${G.status}`);let K=+(G.headers.get("Content-Length")||0),J=0,W=G.body?.getReader();if(!W)throw Error("No response body");let H=Bun.file(q).writer(),z=M==="win32";Q.stop();let w=null,y=-1;if(!z)w=new B$(K||41943040),w.start();else console.log(`Downloading Bun ${Y}...`);try{let O=Date.now();while(!0){let{done:D,value:R}=await W.read();if(D)break;if(H.write(R),J+=R.length,!z&&w){let S=(Date.now()-O)/1000,h=S>0?(J/1024/S).toFixed(0):"0";w.update(J,{speed:h})}else if(z&&K){let S=Math.floor(J/K*10);if(S>y)console.log(`  > ${S*10}%`),y=S}}if(await H.end(),!z&&w)w.stop();else console.log("  > 100% [Done]")}catch(O){try{H.end()}catch(D){}if(!z&&w)w.stop();else console.log("  > Download Failed");throw Q.start(),O}Q.start()}async function P$($,q={}){let Q=$,Y=null,G=!1;if(!Q)Q=await L$()||void 0;if(!Q){console.error(Z.red("No version specified and no .bvmrc found. Usage: bvm install <version>"));return}try{await U(`Finding Bun ${Q} release...`,async(K)=>{let J=null,W=b(Q);if(/^v?\d+\.\d+\.\d+$/.test(Q)&&!Q.includes("canary"))if(K.update(`Checking if Bun ${W} exists...`),await e$(W))J=W;else throw K.fail(Z.red(`Bun version ${W} not found on registry.`)),Error(`Bun version ${W} not found on registry.`);else if(Q==="latest"){K.update("Checking latest version...");let S=await $4();if(S.latest)J=b(S.latest);else throw Error('Could not resolve "latest" version.')}else throw K.fail(Z.yellow('Fuzzy matching (e.g. "1.1") is disabled for stability.')),console.log(Z.dim('  Please specify the exact version (e.g. "1.1.20") or "latest".')),console.log(Z.dim("  To see available versions, run: bvm ls-remote")),Error("Fuzzy matching disabled");if(!J)throw K.fail(Z.red(`Could not find a Bun release for '${Q}' compatible with your system.`)),Error(`Could not find a Bun release for '${Q}' compatible with your system.`);let H=await q4(J);if(!H)throw Error(`Could not find a Bun release for ${J} compatible with your system.`);let{url:z,mirrorUrl:w,foundVersion:y}=H,O=p(L,y),D=p(O,"bin"),R=p(D,k);if(await X(R))K.succeed(Z.green(`Bun ${y} is already installed.`)),Y=y,G=!0;else if(b(Bun.version)===y&&!f){K.info(Z.cyan(`Requested version ${y} matches current BVM runtime. Creating symlink...`)),await N(D);let h=process.execPath;try{let{symlink:n}=await import("fs/promises");await n(h,R)}catch(n){await Bun.write(Bun.file(R),Bun.file(h)),await S$(R,493)}K.succeed(Z.green(`Bun ${y} linked from local runtime.`)),Y=y,G=!0}else if(f)await N(D),await F6(R,y),Y=y,G=!0;else{K.update(`Downloading Bun ${y} to cache...`),await N(P);let h=p(P,`${y}-${O6(z)}`);if(await X(h))K.succeed(Z.green(`Using cached Bun ${y} archive.`));else{let B=`${h}.${Date.now()}.tmp`;try{await U4(z,B,K,y),await R$(B,h)}catch(V$){try{await w4(B,{force:!0})}catch{}if(K.update("Download failed, trying mirror..."),console.log(Z.dim(`
Debug: ${V$.message}`)),w){let v4=new URL(w).hostname;K.update(`Downloading from mirror (${v4})...`),await U4(w,B,K,y),await R$(B,h)}else throw V$}}K.update(`Extracting Bun ${y}...`),await N(O),await Q4(h,O);let n="",j$=[p(O,k),p(O,"bin",k),p(O,"package","bin",k)],E4=await d(O);for(let B of E4)if(B.startsWith("bun-"))j$.push(p(O,B,k)),j$.push(p(O,B,"bin",k));for(let B of j$)if(await X(B)){n=B;break}if(!n)throw Error(`Could not find bun executable in ${O}`);if(await N(D),n!==R){await R$(n,R);let B=x6(n);if(B!==O&&B!==D)await a(B)}await S$(R,493),K.succeed(Z.green(`Bun ${y} installed successfully.`)),Y=y,G=!0}},{failMessage:`Failed to install Bun ${Q}`})}catch(K){throw Error(`Failed to install Bun: ${K.message}`)}if(G)await k$(!1);if(Y)try{await O$(Y,{silent:!0});let K=p(x,"default");if(!await X(K))await W$("default",Y,{silent:!0})}catch(K){}if(await $$(),Y)console.log(Z.cyan(`
\u2713 Bun ${Y} installed and active.`)),console.log(Z.dim("  To verify, run: bun --version or bvm ls"))}async function F6($,q){let Q=q.replace(/^v/,""),Y=`#!/usr/bin/env bash
set -euo pipefail
if [[ $# -gt 0 && "$1" == "--version" ]]; then echo "${Q}"; exit 0; fi
echo "Bun ${Q} stub invoked with: $@"
exit 0
`;await Bun.write($,Y),await S$($,493)}C();j();A();async function k4(){await U("Fetching remote Bun versions...",async($)=>{let Q=(await r$()).filter((Y)=>E(Y)).filter((Y)=>!Y.includes("canary")).sort(K$);if(Q.length===0)throw Error("No remote Bun versions found.");$.succeed(Z.green("Available remote Bun versions:")),Q.forEach((Y)=>{console.log(`  ${b(Y)}`)})},{failMessage:"Failed to fetch remote Bun versions"})}C();j();F();A();import{join as C6}from"path";async function L4(){await U("Fetching locally installed Bun versions...",async($)=>{let q=await I(),Y=(await c()).version;if($.succeed(Z.green("Locally installed Bun versions:")),q.length===0)console.log("  (No versions installed yet)");else q.forEach((K)=>{if(K===Y)console.log(`* ${Z.green(K)} ${Z.dim("(current)")}`);else console.log(`  ${K}`)});if(await X(x)){let K=await d(x);if(K.length>0){console.log(Z.green(`
Aliases:`));for(let J of K)try{let W=(await v(C6(x,J))).trim(),H=b(W),z=`-> ${Z.cyan(H)}`;if(H===Y)z+=` ${Z.dim("(current)")}`;console.log(`  ${J} ${Z.gray(z)}`)}catch(W){}}}},{failMessage:"Failed to list local Bun versions"})}C();j();A();async function O4(){await U("Checking current Bun version...",async($)=>{let{version:q,source:Q}=await c();if(q)$.stop(),console.log(`${Z.green("\u2713")} Current Bun version: ${Z.green(q)} ${Z.dim(`(${Q})`)}`);else $.info(Z.blue("No Bun version is currently active.")),console.log(Z.yellow("Use 'bvm install <version>' to set a default, or create a .bvmrc file."))},{failMessage:"Failed to determine current Bun version"})}C();F();j();A();import{join as I$,basename as N6}from"path";import{unlink as A6}from"fs/promises";async function x4($){await U(`Attempting to uninstall Bun ${$}...`,async(q)=>{let Q=b($),Y=I$(L,Q),G=I$(Y,"bin",k);if(!await X(G))throw Error(`Bun ${$} is not installed.`);let K=!1;try{let J=I$(x,"default");if(await X(J)){let W=(await v(J)).trim();if(b(W)===Q)K=!0}}catch(J){}if(K)throw console.log(Z.yellow("Hint: Set a new default using 'bvm default <new_version>'")),Error(`Bun ${$} is currently set as default. Please set another default before uninstalling.`);try{let J=await o$(G$);if(J){if(b(N6(J))===Q)await A6(G$)}}catch(J){}await a(Y),q.succeed(Z.green(`Bun ${Q} uninstalled successfully.`)),await $$()},{failMessage:`Failed to uninstall Bun ${$}`})}C();F();j();A();import{join as T6}from"path";import{unlink as D6}from"fs/promises";async function j4($){await U(`Removing alias '${$}'...`,async(q)=>{let Q=T6(x,$);if(!await X(Q))throw Error(`Alias '${$}' does not exist.`);await D6(Q),q.succeed(Z.green(`Alias '${$}' removed successfully.`))},{failMessage:`Failed to remove alias '${$}'`})}C();F();j();e();A();import{join as _$}from"path";async function F4($,q){await U(`Preparing to run with Bun ${$}...`,async(Q)=>{let Y=await g($);if(!Y)Y=b($);let G=_$(L,Y),K=_$(G,"bin"),J=_$(K,k);if(!await X(J)){Q.fail(Z.red(`Bun ${$} (resolved: ${Y}) is not installed.`)),console.log(Z.yellow(`You can install it using: bvm install ${$}`));return}Q.stop();try{await t([J,...q],{cwd:process.cwd(),prependPath:K}),process.exit(0)}catch(W){console.error(W.message),process.exit(1)}},{failMessage:`Failed to run command with Bun ${$}`})}C();F();j();e();A();import{join as E$}from"path";async function C4($,q,Q){await U(`Preparing environment for Bun ${$} to execute '${q}'...`,async(Y)=>{let G=await g($);if(!G)G=b($);let K=E$(L,G),J=E$(K,"bin"),W=E$(J,k);if(!await X(W)){Y.fail(Z.red(`Bun ${$} (resolved: ${G}) is not installed.`)),console.log(Z.yellow(`You can install it using: bvm install ${$}`));return}Y.stop();try{await t([q,...Q],{cwd:process.cwd(),prependPath:J}),process.exit(0)}catch(H){console.error(H.message),process.exit(1)}},{failMessage:`Failed to execute command with Bun ${$}'s environment`})}F();j();A();import{join as B6}from"path";async function N4($){await U("Resolving path...",async()=>{let q=null,Q="bun",{version:Y}=await c();if(!$||$==="current"){if(q=Y,!q)throw Error("No active Bun version found.")}else{let{resolveLocalVersion:K}=await Promise.resolve().then(() => (e(),W4));if(q=await K($),!q)if(Y)q=Y,Q=$;else throw Error(`Bun version or command '${$}' not found.`)}let G=B6(L,q,"bin",Q==="bun"?k:Q);if(await X(G))console.log(G);else throw Error(`Command '${Q}' not found in Bun ${q}.`)},{failMessage:"Failed to resolve path"})}C();j();A();e();async function A4($){await U(`Resolving session version for Bun ${$}...`,async(q)=>{let Q=null,Y=await g($);if(Y)Q=Y;else{let K=(await I()).map((J)=>b(J));Q=s($,K)}if(!Q)throw Error(`Bun version '${$}' is not installed or cannot be resolved.`);let G=b(Q);q.succeed(Z.green(`Bun ${G} will be active in this session.`)),console.log(`export BVM_ACTIVE_VERSION=${G}`),console.log(Z.dim("Run `eval $(bvm shell <version>)` or `export BVM_ACTIVE_VERSION=...` to activate."))},{failMessage:`Failed to set session version for Bun ${$}`})}C();F();j();A();import{join as M6}from"path";async function T4($){let q=M6(x,"default");if(!$)await U("Checking current default Bun version...",async(Q)=>{if(await X(q)){let Y=await v(q);Q.succeed(Z.green(`Default Bun version: ${b(Y.trim())}`))}else Q.info(Z.blue("No global default Bun version is set.")),console.log(Z.yellow("Use 'bvm default <version>' to set one."))},{failMessage:"Failed to retrieve default Bun version"});else await U(`Setting global default to Bun ${$}...`,async(Q)=>{let Y=(await I()).map((K)=>b(K)),G=s($,Y);if(!G)throw Error(`Bun version '${$}' is not installed.`);await W$("default",G,{silent:!0}),Q.succeed(Z.green(`\u2713 Default set to ${G}. New terminals will now start with this version.`))},{failMessage:`Failed to set global default to Bun ${$}`})}F();j();C();A();import{unlink as f6}from"fs/promises";import{join as R6}from"path";async function D4(){await U("Deactivating current Bun version...",async($)=>{let q=R6(x,"default");if(await X(q))await f6(q),$.succeed(Z.green("Default Bun version deactivated.")),console.log(Z.gray("Run `bvm use <version>` to reactivate.")),await $$();else $.info("No default Bun version is currently active.")},{failMessage:"Failed to deactivate"})}e();F();j();C();A();async function B4($){if($==="dir"){console.log(P);return}if($==="clear"){await U("Clearing cache...",async(q)=>{await a(P),await N(P),q.succeed(Z.green("Cache cleared."))},{failMessage:"Failed to clear cache"});return}console.error(Z.red(`Unknown cache command: ${$}`)),console.log("Usage: bvm cache dir | bvm cache clear")}C();F();A();j();import{join as M4}from"path";var v$=q$.version,S6="EricLLLLLL",P6="bvm";async function f4(){try{await U("Checking for BVM updates...",async($)=>{let q=f?{tagName:process.env.BVM_TEST_LATEST_VERSION||`v${v$}`,downloadUrl:"https://example.com/bvm-test"}:await M$();if(!q)throw Error("Unable to determine the latest BVM version.");let Q=q.tagName.startsWith("v")?q.tagName.slice(1):q.tagName;if(!E(Q))throw Error(`Unrecognized version received: ${q.tagName}`);if(!b$(Q,v$)){$.succeed(Z.green(`BVM is already up to date (v${v$}).`)),console.log(Z.blue("You are using the latest version."));return}if($.text=`Updating BVM to v${Q}...`,f&&!process.env.BVM_TEST_REAL_UPGRADE){$.succeed(Z.green("BVM updated successfully (test mode)."));return}let Y=`https://cdn.jsdelivr.net/gh/${S6}/${P6}@${q.tagName}/dist/index.js`,G=await fetch(Y);if(!G.ok)throw Error(`Failed to download BVM source from CDN: ${G.statusText} (${G.status})`);let K=await G.text();if(!K||K.length<100)throw Error("Downloaded BVM source seems invalid or empty.");let J=C$,W=M4(J,"index.js"),H=M4(J,`index.js.new-${Date.now()}`);await N(J),await J$(H,K);try{let{rename:z}=await import("fs/promises");await z(H,W)}catch(z){await J$(W,K);let{unlink:w}=await import("fs/promises");await w(H).catch(()=>{})}$.succeed(Z.green(`BVM updated to v${Q} successfully.`)),console.log(Z.yellow("Please restart your terminal to apply changes."))},{failMessage:"Failed to upgrade BVM"})}catch($){throw Error(`Failed to upgrade BVM: ${$.message}`)}}C();F();j();A();import{homedir as I6}from"os";import{join as _6}from"path";async function R4(){await U("Gathering BVM diagnostics...",async()=>{let $={currentVersion:(await c()).version,installedVersions:await I(),aliases:await E6(),env:{BVM_DIR:T,BVM_BIN_DIR:m,BVM_SHIMS_DIR:_,BVM_VERSIONS_DIR:L,BVM_TEST_MODE:process.env.BVM_TEST_MODE,HOME:process.env.HOME||I6()}};v6($)})}async function E6(){if(!await X(x))return[];let $=await d(x),q=[];for(let Q of $){let Y=_6(x,Q);if(await X(Y)){let G=await Bun.file(Y).text();q.push({name:Q,target:b(G.trim())})}}return q}function v6($){if(console.log(Z.bold(`
Directories`)),console.log(`  BVM_DIR: ${Z.cyan($.env.BVM_DIR||"")}`),console.log(`  BIN_DIR: ${Z.cyan(m)}`),console.log(`  SHIMS_DIR: ${Z.cyan(_)}`),console.log(`  VERSIONS_DIR: ${Z.cyan(L)}`),console.log(Z.bold(`
Environment`)),console.log(`  HOME: ${$.env.HOME||"n/a"}`),console.log(`  BVM_TEST_MODE: ${$.env.BVM_TEST_MODE||"false"}`),console.log(Z.bold(`
Installed Versions`)),$.installedVersions.length===0)console.log("  (none installed)");else $.installedVersions.forEach((q)=>{let Q=q===$.currentVersion,Y=Q?Z.green("*"):" ",G=Q?Z.green(q):q,K=Q?Z.green(" (current)"):"";console.log(`  ${Y} ${G}${K}`)});if(console.log(Z.bold(`
Aliases`)),$.aliases.length===0)console.log("  (no aliases configured)");else $.aliases.forEach((q)=>{console.log(`  ${q.name} ${Z.gray("->")} ${Z.cyan(q.target)}`)});console.log(`
`+Z.green("Diagnostics complete."))}var u$=["install","uninstall","use","ls","ls-remote","current","alias","unalias","run","exec","which","cache","setup","upgrade","doctor","completion","deactivate","help"],S4={bash:`#!/usr/bin/env bash
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
`};function P4($){let q=S4[$];if(!q)throw Error(`Unsupported shell '${$}'. Supported shells: ${Object.keys(S4).join(", ")}`);console.log(q)}C();j();F();import{join as u6}from"path";C();var g6="update-check.json";async function I4(){if(f)return;let $=u6(P,g6);try{if(await X($)){let q=JSON.parse(await v($));if(q.latestVersion&&b$(q.latestVersion,q$.version))V6(q$.version,q.latestVersion)}}catch(q){}}function V6($,q){let Q=`Update available! ${Z.dim($)} -> ${Z.green(q)}`,Y=`Run ${Z.cyan("bvm upgrade")} to update`,G=Math.max(g$(Q).length,g$(Y).length)+4,K="\u256D"+"\u2500".repeat(G)+"\u256E",J="\u2570"+"\u2500".repeat(G)+"\u256F",W=(H)=>{let z=g$(H).length,w=G-2-z;return"\u2502 "+H+" ".repeat(w)+" \u2502"};console.log(`
`+Z.yellow(K)),console.log(Z.yellow(W(Q))),console.log(Z.yellow(W(Y))),console.log(Z.yellow(J)+`
`)}function g$($){return $.replace(/[\u001B\u009B][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,"")}class _4{commands={};helpEntries=[];name;versionStr;constructor($){this.name=$,this.versionStr=q$.version}command($,q,Q={}){let Y=$.split(" ")[0],G={description:q,usage:`${this.name} ${$}`,action:async()=>{},aliases:Q.aliases};if(this.commands[Y]=G,this.helpEntries.push(`  ${$.padEnd(35)} ${q}`),Q.aliases)Q.aliases.forEach((J)=>{this.commands[J]=G});let K={action:(J)=>{return G.action=J,K},option:(J,W)=>K};return K}async run(){let{values:$,positionals:q}=d6({args:Bun.argv.slice(2),strict:!1,allowPositionals:!0,options:{help:{type:"boolean",short:"h"},version:{type:"boolean",short:"v"},silent:{type:"boolean",short:"s"}}}),Q=q[0],Y=!!($.silent||$.s),G=!!($.version||$.v||$.help||$.h);if(!Q){if($.version||$.v)console.log(this.versionStr),process.exit(0);if($.help||$.h)this.showHelp(),process.exit(0);this.showHelp(),process.exit(1)}if(!G&&!Y&&!["rehash","completion"].includes(Q))await I4();if($.help||$.h)this.showHelp(),process.exit(0);let K=this.commands[Q];if(!K)console.error(Z.yellow(`Unknown command '${Q}'`)),this.showHelp(),process.exit(0);try{await K.action(q.slice(1),$)}catch(J){if(!J.reported)console.error(Z.red(`\u2716 ${J.message}`));process.exit(1)}}showHelp(){console.log(`Bun Version Manager (bvm) v${this.versionStr}`),console.log(`Built with Bun \xB7 Runs with Bun \xB7 Tested on Bun
`),console.log("Usage:"),console.log(`  ${this.name} <command> [flags]
`),console.log("Commands:"),console.log(this.helpEntries.join(`
`)),console.log(`
Global Flags:`),console.log("  --help, -h                     Show this help message"),console.log("  --version, -v                  Show version number"),console.log(`
Examples:`),console.log("  bvm install 1.0.0"),console.log("  bvm use 1.0.0"),console.log("  bvm run 1.0.0 index.ts")}}async function h6(){let $=new _4("bvm");$.command("rehash","Regenerate shims for all installed binaries").action(async()=>{await $$()}),$.command("install [version]","Install a Bun version and set as current").option("--global, -g","Install as a global tool (not just default)").action(async(q,Q)=>{await P$(q[0],{global:Q.global||Q.g})}),$.command("i [version]","Alias for install").action(async(q,Q)=>{await P$(q[0],{global:Q.global||Q.g})}),$.command("ls","List installed Bun versions",{aliases:["list"]}).action(async()=>{await L4()}),$.command("ls-remote","List all available remote Bun versions").action(async()=>{await k4()}),$.command("use <version>","Switch the active Bun version immediately (all terminals)").action(async(q)=>{if(!q[0])throw Error("Version is required");await O$(q[0])}),$.command("shell <version>","Switch Bun version for the current shell session").action(async(q)=>{if(!q[0])throw Error("Version is required");await A4(q[0])}),$.command("default [version]","Display or set the global default Bun version").action(async(q)=>{await T4(q[0])}),$.command("current","Display the currently active Bun version").action(async()=>{await O4()}),$.command("uninstall <version>","Uninstall a Bun version").action(async(q)=>{if(!q[0])throw Error("Version is required");await x4(q[0])}),$.command("alias <name> <version>","Create an alias for a Bun version").action(async(q)=>{if(!q[0]||!q[1])throw Error("Name and version are required");await W$(q[0],q[1])}),$.command("unalias <name>","Remove an existing alias").action(async(q)=>{if(!q[0])throw Error("Alias name is required");await j4(q[0])}),$.command("run <version> [...args]","Run a command with a specific Bun version").action(async(q)=>{let Q=q[0];if(!Q)throw Error("Version is required");let Y=process.argv.indexOf("run"),G=Y!==-1?process.argv.slice(Y+2):[];await F4(Q,G)}),$.command("exec <version> <cmd> [...args]","Execute a command with a specific Bun version's environment").action(async(q)=>{let Q=q[0],Y=q[1];if(!Q||!Y)throw Error("Version and command are required");let G=process.argv.indexOf("exec"),K=G!==-1?process.argv.slice(G+3):[];await C4(Q,Y,K)}),$.command("which [version]","Display path to installed bun version").action(async(q)=>{await N4(q[0])}),$.command("deactivate","Undo effects of bvm on current shell").action(async()=>{await D4()}),$.command("version <spec>","Resolve the given description to a single local version").action(async(q)=>{if(!q[0])throw Error("Version specifier is required");await f$(q[0])}),$.command("cache <action>","Manage bvm cache").action(async(q)=>{if(!q[0])throw Error("Action is required");await B4(q[0])}),$.command("setup","Configure shell environment automatically").option("--silent, -s","Suppress output").action(async(q,Q)=>{await k$(!(Q.silent||Q.s))}),$.command("upgrade","Upgrade bvm to the latest version",{aliases:["self-update"]}).action(async()=>{await f4()}),$.command("doctor","Show diagnostics for Bun/BVM setup").action(async()=>{await R4()}),$.command("completion <shell>","Generate shell completion script (bash|zsh|fish)").action(async(q)=>{if(!q[0])throw Error("Shell name is required");P4(q[0])}),await $.run(),process.exit(0)}h6().catch(($)=>{console.error(Z.red(`
[FATAL ERROR] Unexpected Crash:`)),console.error($),process.exit(1)});
