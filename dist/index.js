// @bun
var i1=Object.create;var{getPrototypeOf:o1,defineProperty:M$,getOwnPropertyNames:a1}=Object;var s1=Object.prototype.hasOwnProperty;var W$=($,q,Q)=>{Q=$!=null?i1(o1($)):{};let J=q||!$||!$.__esModule?M$(Q,"default",{value:$,enumerable:!0}):Q;for(let Z of a1($))if(!s1.call(J,Z))M$(J,Z,{get:()=>$[Z],enumerable:!0});return J};var s$=($,q)=>{for(var Q in q)M$($,Q,{get:q[Q],enumerable:!0,configurable:!0,set:(J)=>q[Q]=()=>J})};var y$=($,q)=>()=>($&&(q=$($=0)),q);var U$=import.meta.require;var e$={};s$(e$,{getBvmDir:()=>r$,getBunAssetName:()=>T$,USER_AGENT:()=>J$,TEST_REMOTE_VERSIONS:()=>X$,REPO_FOR_BVM_CLI:()=>s,OS_PLATFORM:()=>D,IS_TEST_MODE:()=>T,EXECUTABLE_NAME:()=>A,CPU_ARCH:()=>x$,BVM_VERSIONS_DIR:()=>L,BVM_SRC_DIR:()=>$4,BVM_SHIMS_DIR:()=>E,BVM_FINGERPRINTS_FILE:()=>z$,BVM_DIR:()=>k,BVM_CURRENT_DIR:()=>b$,BVM_COMPONENTS:()=>f$,BVM_CDN_ROOT:()=>w$,BVM_CACHE_DIR:()=>v,BVM_BIN_DIR:()=>M,BVM_ALIAS_DIR:()=>j,BUN_GITHUB_RELEASES_API:()=>q4,ASSET_NAME_FOR_BVM:()=>B$});import{homedir as e1}from"os";import{join as n}from"path";function r$(){let $=process.env.HOME||e1();return n($,".bvm")}function T$($){return`bun-${D==="win32"?"windows":D}-${x$==="arm64"?"aarch64":"x64"}.zip`}var D,x$,T,X$,k,$4,L,M,E,b$,j,v,z$,A,q4="https://api.github.com/repos/oven-sh/bun/releases",s="EricLLLLLL/bvm",B$,J$="bvm (Bun Version Manager)",w$,f$;var N=y$(()=>{D=process.platform,x$=process.arch,T=process.env.BVM_TEST_MODE==="true",X$=["v1.3.4","v1.2.23","v1.0.0","bun-v1.4.0-canary"];k=r$(),$4=n(k,"src"),L=n(k,"versions"),M=n(k,"bin"),E=n(k,"shims"),b$=n(k,"current"),j=n(k,"aliases"),v=n(k,"cache"),z$=n(k,"fingerprints.json"),A=D==="win32"?"bun.exe":"bun",B$=D==="win32"?"bvm.exe":"bvm",w$=process.env.BVM_CDN_URL||"https://cdn.jsdelivr.net/gh/EricLLLLLL/bvm",f$=[{name:"CLI Core",remotePath:"index.js",localPath:"src/index.js"},{name:"Windows Shim",remotePath:"bvm-shim.js",localPath:"bin/bvm-shim.js",platform:"win32"},{name:"Unix Shim",remotePath:"bvm-shim.sh",localPath:"bin/bvm-shim.sh",platform:"posix"}]});function V($){if(!$)return null;return $.match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/)?$:null}function $1($){let q=V($);return q?q.replace(/^v/,""):null}function Y$($){if(!$)return null;let q=$.replace(/^v/,""),J=q.split(/[-+]/)[0].split(".").map(Number);if(J.length===0||J.some((Y)=>isNaN(Y)))return null;let Z=q.includes("-")?q.split("-")[1].split("+")[0]:void 0;return{major:J[0],minor:J[1],patch:J[2],pre:Z}}function R$($,q){if(!$||!q)return 0;if($.major!==q.major)return $.major-q.major;if($.minor!==q.minor)return $.minor-q.minor;if($.patch!==q.patch)return $.patch-q.patch;if($.pre&&!q.pre)return-1;if(!$.pre&&q.pre)return 1;if($.pre&&q.pre)return $.pre.localeCompare(q.pre);return 0}function q1($,q){let Q=Y$($),J=Y$(q);return R$(Q,J)}function Z$($,q){return q1(q,$)}function C$($,q){return q1($,q)>0}function Q1($,q){if(q==="*"||q===""||q==="latest")return!0;let Q=Y$($);if(!Q)return!1;let J=q;if(q.startsWith("v"))J=q.substring(1);if($1($)===$1(q))return!0;let Z=J.split(".");if(Z.length===1){let Y=Number(Z[0]);if(Q.major===Y)return!0}else if(Z.length===2){let Y=Number(Z[0]),X=Number(Z[1]);if(Q.major===Y&&Q.minor===X)return!0}if(q.startsWith("~")){let Y=Y$(q.substring(1));if(!Y)return!1;let X=Y.patch??0;return Q.major===Y.major&&Q.minor===Y.minor&&Q.patch>=X}if(q.startsWith("^")){let Y=Y$(q.substring(1));if(!Y)return!1;let X=Y.patch??0,b=Y.minor??0;if(Y.major===0){if(Q.major!==0)return!1;if(Q.minor!==b)return!1;return Q.patch>=X}if(Q.major!==Y.major)return!1;if(Q.minor<b)return!1;if(Q.minor===b&&Q.patch<X)return!1;return!0}return!1}import{readdir as J4,mkdir as Y4,stat as Z4,symlink as K4,unlink as J1,rm as Y1,readlink as X4}from"fs/promises";import{join as j$,dirname as b4,basename as G4}from"path";async function O($){await Y4($,{recursive:!0})}async function G($){try{return await Z4($),!0}catch(q){if(q.code==="ENOENT")return!1;throw q}}async function Z1($,q){try{await J1(q)}catch(J){try{await Y1(q,{recursive:!0,force:!0})}catch(Z){}}let Q=process.platform==="win32"?"junction":"dir";await K4($,q,Q)}async function K1($){try{return await X4($)}catch(q){if(q.code==="ENOENT"||q.code==="EINVAL")return null;throw q}}async function r($){await Y1($,{recursive:!0,force:!0})}async function c($){try{return await J4($)}catch(q){if(q.code==="ENOENT")return[];throw q}}async function R($){return await Bun.file($).text()}async function i($,q){await Bun.write($,q)}async function X1($,q,Q={}){let{backup:J=!0}=Q,Z=b4($);await O(Z);let Y=`${$}.tmp-${Date.now()}`,X=`${$}.bak`;try{if(await i(Y,q),J&&await G($))try{let{rename:W,unlink:z}=await import("fs/promises");if(await G(X))await z(X).catch(()=>{});await W($,X)}catch(W){}let{rename:b}=await import("fs/promises");try{await b(Y,$)}catch(W){await Bun.write($,q),await J1(Y).catch(()=>{})}}catch(b){let{unlink:W}=await import("fs/promises");throw await W(Y).catch(()=>{}),b}}function y($){let q=$.trim();if(q.startsWith("bun-v"))q=q.substring(4);if(!q.startsWith("v")&&/^\d/.test(q))q=`v${q}`;return q}async function u(){return await O(L),(await c(L)).filter((q)=>V(y(q))).sort(Z$)}async function p(){if(process.env.BVM_ACTIVE_VERSION)return{version:y(process.env.BVM_ACTIVE_VERSION),source:"env"};let $=j$(process.cwd(),".bvmrc");if(await G($)){let X=(await R($)).trim();return{version:y(X),source:".bvmrc"}}let{getBvmDir:q}=await Promise.resolve().then(() => (N(),e$)),Q=q(),J=j$(Q,"current"),Z=j$(Q,"aliases");if(await G(J)){let{realpath:X}=await import("fs/promises");try{let b=await X(J);return{version:y(G4(b)),source:"current"}}catch(b){}}let Y=j$(Z,"default");if(await G(Y)){let X=(await R(Y)).trim();return{version:y(X),source:"default"}}return{version:null,source:null}}function e($,q){if(!$||q.length===0)return null;let Q=y($);if(q.includes(Q))return Q;if($.toLowerCase()==="latest")return q[0];if(/^\d+\.\d+\.\d+$/.test($.replace(/^v/,"")))return null;if(!/^[v\d]/.test($))return null;let Z=$.startsWith("v")?`~${$.substring(1)}`:`~${$}`,Y=q.filter((X)=>Q1(X,Z));if(Y.length>0)return Y.sort(Z$)[0];return null}var C=y$(()=>{N()});import{createInterface as H4}from"readline";class S${timer=null;frames=process.platform==="win32"?["-"]:["\u280B","\u2819","\u2839","\u2838","\u283C","\u2834","\u2826","\u2827","\u2807","\u280F"];frameIndex=0;text;isWindows=process.platform==="win32";constructor($){this.text=$}start($){if($)this.text=$;if(this.timer)return;if(this.isWindows){process.stdout.write(`${K.cyan(">")} ${this.text}
`);return}this.timer=setInterval(()=>{process.stdout.write(`\r\x1B[K${K.cyan(this.frames[this.frameIndex])} ${this.text}`),this.frameIndex=(this.frameIndex+1)%this.frames.length},80)}stop(){if(this.isWindows)return;if(this.timer)clearInterval(this.timer),this.timer=null,process.stdout.write("\r\x1B[K");process.stdout.write("\x1B[?25h")}succeed($){this.stop(),console.log(`${K.green("  \u2713")} ${$||this.text}`)}fail($){this.stop(),console.log(`${K.red("  \u2716")} ${$||this.text}`)}info($){this.stop(),console.log(`${K.blue("  \u2139")} ${$||this.text}`)}update($){if(this.text=$,this.isWindows)console.log(K.dim(`  ... ${this.text}`))}}class I${total;current=0;width=20;constructor($){this.total=$}start(){process.stdout.write("\x1B[?25l"),this.render()}update($,q){this.current=$,this.render(q)}stop(){process.stdout.write(`\x1B[?25h
`)}render($){let q=Math.min(1,this.current/this.total),Q=Math.round(this.width*q),J=this.width-Q,Z=process.platform==="win32",Y=Z?"=":"\u2588",X=Z?"-":"\u2591",b=K.green(Y.repeat(Q))+K.gray(X.repeat(J)),W=(q*100).toFixed(0).padStart(3," "),z=(this.current/1048576).toFixed(1),w=(this.total/1048576).toFixed(1),H=$?` ${$.speed}KB/s`:"";process.stdout.write(`\r\x1B[2K ${b} ${W}% | ${z}/${w}MB${H}`)}}async function b1($){let q=H4({input:process.stdin,output:process.stdout});return new Promise((Q)=>{q.question(`${K.yellow("?")} ${$} (Y/n) `,(J)=>{q.close(),Q(J.toLowerCase()!=="n")})})}var W4,y4=($)=>$.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),o=($,q,Q=$)=>(J)=>W4?$+J.replace(new RegExp(y4(q),"g"),Q)+q:J,K;var F=y$(()=>{W4=!process.env.NO_COLOR,K={red:o("\x1B[1;31m","\x1B[39m"),green:o("\x1B[1;32m","\x1B[39m"),yellow:o("\x1B[1;33m","\x1B[39m"),blue:o("\x1B[1;34m","\x1B[39m"),magenta:o("\x1B[1;35m","\x1B[39m"),cyan:o("\x1B[1;36m","\x1B[39m"),gray:o("\x1B[90m","\x1B[39m"),bold:o("\x1B[1m","\x1B[22m","\x1B[22m\x1B[1m"),dim:o("\x1B[2m","\x1B[22m","\x1B[22m\x1B[2m")}});async function U($,q,Q){if(process.platform==="win32"){console.log(K.cyan(`> ${$}`));let Y={start:(X)=>{if(X)console.log(K.cyan(`> ${X}`))},stop:()=>{},succeed:(X)=>console.log(K.green(`  \u2713 ${X}`)),fail:(X)=>console.log(K.red(`  \u2716 ${X}`)),info:(X)=>console.log(K.cyan(`  \u2139 ${X}`)),update:(X)=>console.log(K.dim(`  ... ${X}`)),isSpinning:!1};try{return await q(Y)}catch(X){let b=k1(X,Q?.failMessage);if(console.log(K.red(`  \u2716 ${b}`)),process.env.BVM_DEBUG,console.log(K.dim(`    Details: ${X.message}`)),X.code)console.log(K.dim(`    Code: ${X.code}`));throw X.reported=!0,X}}let Z=new S$($);Z.start();try{let Y=await q(Z);return Z.stop(),Y}catch(Y){let X=k1(Y,Q?.failMessage);throw Z.fail(K.red(X)),Y.reported=!0,Y}}function k1($,q){let Q=$ instanceof Error?$.message:String($);if(!q)return Q;if(typeof q==="function")return q($);return`${q}: ${Q}`}var f=y$(()=>{F()});var L1={};s$(L1,{resolveLocalVersion:()=>d,displayVersion:()=>h$});import{join as P4}from"path";async function d($){if($==="current"){let{version:Z}=await p();return Z}if($==="latest"){let Z=await u();if(Z.length>0)return Z[0];return null}let q=P4(j,$);if(await G(q))try{let Z=(await R(q)).trim();return y(Z)}catch{return null}let Q=y($),J=await u();return e($,J)}async function h$($){await U(`Resolving version '${$}'...`,async()=>{let q=await d($);if(q)console.log(q);else throw Error("N/A")},{failMessage:`Failed to resolve version '${$}'`})}var q$=y$(()=>{N();C();f()});import{parseArgs as K6}from"util";var K$={name:"bvm-core",version:"1.1.7",description:"The native version manager for Bun. Cross-platform, shell-agnostic, and zero-dependency.",main:"dist/index.js",bin:{bvm:"dist/index.js"},publishConfig:{access:"public"},scripts:{dev:"bun run src/index.ts",build:"bun build src/index.ts --target=bun --outfile dist/index.js --minify && bun run scripts/sync-runtime.ts",test:"bun test",bvm:"bun run src/index.ts","bvm:sandbox":'mkdir -p "$PWD/.sandbox-home" && HOME="$PWD/.sandbox-home" bun run src/index.ts',release:"bun run scripts/release.ts","sync-runtime":"bun run scripts/sync-runtime.ts"},repository:{type:"git",url:"git+https://github.com/EricLLLLLL/bvm.git"},keywords:["bun","version-manager","cli","bvm","nvm","nvm-windows","fnm","nodenv","bun-nvm","version-switching"],files:["dist/index.js","dist/bvm-shim.sh","dist/bvm-shim.js","install.sh","install.ps1","README.md"],author:"EricLLLLLL",license:"MIT",type:"commonjs",dependencies:{"@oven/bun-darwin-aarch64":"^1.3.5","cli-progress":"^3.12.0"},devDependencies:{"@types/bun":"^1.3.4","@types/cli-progress":"^3.11.6","@types/node":"^24.10.2",bun:"^1.3.5",esbuild:"^0.27.2",execa:"^9.6.1",typescript:"^5"},peerDependencies:{typescript:"^5"}};N();C();import{join as t,basename as g4,dirname as h4}from"path";N();C();F();import{join as z4}from"path";function G1($,q){if($==="darwin"){if(q==="arm64")return"@oven/bun-darwin-aarch64";if(q==="x64")return"@oven/bun-darwin-x64"}if($==="linux"){if(q==="arm64")return"@oven/bun-linux-aarch64";if(q==="x64")return"@oven/bun-linux-x64"}if($==="win32"){if(q==="x64")return"@oven/bun-windows-x64"}return null}function H1($,q,Q){let J=Q;if(!J.endsWith("/"))J+="/";let Z=$.startsWith("@"),Y=$;if(Z){let b=$.split("/");if(b.length===2)Y=b[1]}let X=`${Y}-${q}.tgz`;return`${J}${$}/-/${X}`}F();async function a($,q={}){let{cwd:Q,env:J,prependPath:Z,stdin:Y="inherit",stdout:X="inherit",stderr:b="inherit"}=q,W={...process.env,...J};if(Z){let H=W.PATH||"",x=process.platform==="win32"?";":":";W.PATH=`${Z}${x}${H}`}let w=await Bun.spawn({cmd:$,cwd:Q,env:W,stdin:Y,stdout:X,stderr:b}).exited;if((w??0)!==0)throw Error(`${K.red("Command failed")}: ${$.join(" ")} (code ${w})`);return w??0}async function g($,q={}){let{timeout:Q=5000,...J}=q,Z=new AbortController,Y=setTimeout(()=>Z.abort(),Q);try{let X=await fetch($,{...J,signal:Z.signal});return clearTimeout(Y),X}catch(X){if(clearTimeout(Y),X.name==="AbortError")throw Error(`Request to ${$} timed out after ${Q}ms`);throw X}}async function U4($,q=2000){if($.length===0)throw Error("No URLs to race");if($.length===1)return $[0];return new Promise((Q,J)=>{let Z=0,Y=!1;$.forEach((X)=>{g(X,{method:"HEAD",timeout:q}).then((b)=>{if(b.ok&&!Y)Y=!0,Q(X);else if(!Y){if(Z++,Z===$.length)J(Error("All requests failed"))}}).catch(()=>{if(!Y){if(Z++,Z===$.length)J(Error("All requests failed"))}})})})}async function x4(){try{let $=await g("https://1.1.1.1/cdn-cgi/trace",{timeout:500});if(!$.ok)return null;let Q=(await $.text()).match(/loc=([A-Z]{2})/);return Q?Q[1]:null}catch($){return null}}var E$=null,k$={NPM:"https://registry.npmjs.org",TAOBAO:"https://registry.npmmirror.com",TENCENT:"https://mirrors.cloud.tencent.com/npm/"};async function L$(){if(E$)return E$;let $=await x4(),q=[];if($==="CN")q=[k$.TAOBAO,k$.TENCENT,k$.NPM];else q=[k$.NPM,k$.TAOBAO];try{let Q=await U4(q,2000);return E$=Q,Q}catch(Q){return q[0]}}C();var w4="bun-versions.json",k4=3600000;async function L4(){if(T)return[...X$];let $=z4(v,w4);try{if(await G($)){let Z=await R($),Y=JSON.parse(Z);if(Date.now()-Y.timestamp<k4&&Array.isArray(Y.versions))return Y.versions}}catch(Z){}let q=await L$(),Q=[q];if(q!=="https://registry.npmjs.org")Q.push("https://registry.npmjs.org");let J=null;for(let Z of Q){let Y=`${Z.replace(/\/$/,"")}/bun`;try{let X=await g(Y,{headers:{"User-Agent":J$,Accept:"application/vnd.npm.install-v1+json"},timeout:1e4});if(!X.ok)throw Error(`Status ${X.status}`);let b=await X.json();if(!b.versions)throw Error("Invalid response (no versions)");let W=Object.keys(b.versions);try{await O(v),await i($,JSON.stringify({timestamp:Date.now(),versions:W}))}catch(z){}return W}catch(X){J=X}}throw J||Error("Failed to fetch versions from any registry.")}async function O4(){if(T)return[...X$];return new Promise(($,q)=>{let Q=[];try{let J=Bun.spawn(["git","ls-remote","--tags","https://github.com/oven-sh/bun.git"],{stdout:"pipe",stderr:"pipe"}),Z=setTimeout(()=>{J.kill(),q(Error("Git operation timed out"))},1e4);new Response(J.stdout).text().then((X)=>{clearTimeout(Z);let b=X.split(`
`);for(let W of b){let z=W.match(/refs\/tags\/bun-v?(\d+\.\d+\.\d+.*)$/);if(z)Q.push(z[1])}$(Q)}).catch((X)=>{clearTimeout(Z),q(X)})}catch(J){q(Error(`Failed to run git: ${J.message}`))}})}async function W1(){if(T)return[...X$];try{let q=(await L4()).filter((Q)=>V(Q)).map((Q)=>({v:Q,parsed:Y$(Q)}));return q.sort((Q,J)=>R$(J.parsed,Q.parsed)),q.map((Q)=>Q.v)}catch($){try{let q=await O4();if(q.length>0)return Array.from(new Set(q.filter((J)=>V(J)))).sort(Z$);throw Error("No versions found via Git")}catch(q){throw Error(`Failed to fetch versions. NPM: ${$.message}. Git: ${q.message}`)}}}async function y1($){if(T)return X$.includes($)||$==="latest";let q=await L$(),Q=$.replace(/^v/,""),J=`${q}/bun/${Q}`,Z=D==="win32"?"curl.exe":"curl",Y=async()=>{try{return await a([Z,"-I","-f","-m","5","-s",J],{stdout:"ignore",stderr:"ignore"}),!0}catch(b){return!1}},X=new Promise((b)=>setTimeout(()=>b(!1),1e4));return Promise.race([Y(),X])}async function U1(){if(T)return{latest:"1.1.20"};let q=`${await L$()}/-/package/bun/dist-tags`;try{let Q=await g(q,{headers:{"User-Agent":J$},timeout:5000});if(Q.ok)return await Q.json()}catch(Q){}return{}}async function x1($){let q=y($);if(!V(q))return console.error(K.red(`Invalid version provided to findBunDownloadUrl: ${$}`)),null;if(T)return{url:`https://example.com/${T$(q)}`,foundVersion:q};let Z=G1(D==="win32"?"win32":D,x$==="arm64"?"arm64":"x64");if(!Z)throw Error(`Unsupported platform/arch for NPM download: ${D}-${x$}`);let Y="";if(process.env.BVM_REGISTRY)Y=process.env.BVM_REGISTRY;else if(process.env.BVM_DOWNLOAD_MIRROR)Y=process.env.BVM_DOWNLOAD_MIRROR;else Y=await L$();let X=q.replace(/^v/,"");return{url:H1(Z,X,Y),foundVersion:q}}async function F$(){let $=B$;try{let J=await g(`https://cdn.jsdelivr.net/gh/${s}@latest/package.json`,{headers:{"User-Agent":J$},timeout:2000});if(J.ok){let Z=await J.json();if(Z&&Z.version){let Y=`v${Z.version}`;return{tagName:Y,downloadUrl:`https://github.com/${s}/releases/download/${Y}/${$}`}}}}catch(J){}try{let J=`https://github.com/${s}/releases/latest`,Z=await g(J,{method:"HEAD",redirect:"manual",headers:{"User-Agent":J$},timeout:2000});if(Z.status===302||Z.status===301){let Y=Z.headers.get("location");if(Y){let X=Y.split("/"),b=X[X.length-1];if(b&&V(b))return{tagName:b,downloadUrl:`https://github.com/${s}/releases/download/${b}/${$}`}}}}catch(J){}let q={"User-Agent":J$},Q=`https://api.github.com/repos/${s}/releases/latest`;try{let J=await g(Q,{headers:q,timeout:2000});if(!J.ok)return null;let Y=(await J.json()).tag_name,X=`https://github.com/${s}/releases/download/${Y}/${$}`;return{tagName:Y,downloadUrl:X}}catch(J){return null}}F();N();import{spawn as C4}from"child_process";async function z1($,q){if($.endsWith(".zip"))if(D==="win32")await a(["powershell","-Command",`Expand-Archive -Path "${$}" -DestinationPath "${q}" -Force`],{stdout:"ignore",stderr:"inherit"});else await a(["unzip","-o","-q",$,"-d",q],{stdout:"ignore",stderr:"inherit"});else if($.endsWith(".tar.gz")||$.endsWith(".tgz"))await new Promise((Q,J)=>{let Z=C4("tar",["-xzf",$,"-C",q],{stdio:"inherit",shell:!1});Z.on("close",(Y)=>{if(Y===0)Q();else J(Error(`tar exited with code ${Y}`))}),Z.on("error",(Y)=>J(Y))});else throw Error(`Unsupported archive format: ${$}`)}import{chmod as c$}from"fs/promises";C();N();F();import{join as B,dirname as f4,delimiter as T4}from"path";import{homedir as $$}from"os";import{chmod as O$}from"fs/promises";var v$=`#!/bin/bash

# bvm-init.sh: Initializes bvm default version on shell startup

# Check if BVM_DIR is set
if [ -z "\${BVM_DIR}" ]; then
  return
fi

# Try to switch to the 'default' version silently.
"\${BVM_DIR}/bin/bvm" use default --silent >/dev/null 2>&1 || true
`;var _$=`# bvm-init.fish: Initializes bvm default version on shell startup

# Check if BVM_DIR is set
if not set -q BVM_DIR
  return
end

# Try to switch to the 'default' version silently.
eval "$BVM_DIR/bin/bvm" use default --silent >/dev/null 2>&1 || true
`;var P$=`#!/bin/bash
# Shim managed by BVM (Bun Version Manager)
# Optimized for performance via Bash-native syntax.

BVM_DIR="\${BVM_DIR:-$HOME/.bvm}"
CMD_NAME="$1"
shift

if [ -z "$CMD_NAME" ]; then
    echo "BVM Error: No command specified." >&2
    exit 1
fi

# --- 1. Fast Path: Active Version or Local .bvmrc ---
if [ -n "$BVM_ACTIVE_VERSION" ]; then
    VERSION="$BVM_ACTIVE_VERSION"
elif [ -f ".bvmrc" ]; then
    # Read first line, strip whitespace and 'v' prefix using pure Bash
    read -r raw_ver < .bvmrc
    VERSION="v\${raw_ver//[v[:space:]]/}"
fi

# --- 2. Slow Path: Recursive .bvmrc Search or Default ---
if [ -z "$VERSION" ]; then
    CUR_DIR="$PWD"
    while [ "$CUR_DIR" != "/" ] && [ -n "$CUR_DIR" ]; do
        if [ -f "$CUR_DIR/.bvmrc" ]; then
            read -r raw_ver < "$CUR_DIR/.bvmrc"
            VERSION="v\${raw_ver//[v[:space:]]/}"
            break
        fi
        CUR_DIR=$(dirname "$CUR_DIR")
    done

    # Fallback to current symlink (most common production case)
    if [ -z "$VERSION" ] && [ -L "$BVM_DIR/current" ]; then
        VERSION_PATH=$(readlink "$BVM_DIR/current")
        VERSION="\${VERSION_PATH##*/}"
    fi

    # Fallback to default alias
    if [ -z "$VERSION" ] && [ -f "$BVM_DIR/aliases/default" ]; then
        read -r raw_ver < "$BVM_DIR/aliases/default"
        VERSION="\${raw_ver//[[:space:]]/}"
    fi
fi

if [ -z "$VERSION" ]; then
    echo "BVM Error: No Bun version active." >&2
    exit 1
fi

# Ensure 'v' prefix
[[ "$VERSION" != v* ]] && VERSION="v$VERSION"
VERSION_DIR="$BVM_DIR/versions/$VERSION"
REAL_EXECUTABLE="$VERSION_DIR/bin/$CMD_NAME"

if [ -x "$REAL_EXECUTABLE" ]; then
    export BUN_INSTALL="$VERSION_DIR"
    export PATH="$VERSION_DIR/bin:$PATH"
    exec "$REAL_EXECUTABLE" "$@"
else
    echo "BVM Error: Command '$CMD_NAME' not found in Bun $VERSION." >&2
    exit 127
fi
`;var u$=`const path = require('path');
const { spawn } = require('child_process');
const os = require('os');
const fs = require('fs');

/**
 * BVM Shim for Windows (JavaScript version)
 */

const BVM_DIR = process.env.BVM_DIR || path.join(os.homedir(), '.bvm');
const CMD = process.argv[2] ? process.argv[2].replace(/\\.exe$/i, '').replace(/\\.cmd$/i, '') : 'bun';
const ARGS = process.argv.slice(3);

function resolveVersion() {
  if (process.env.BVM_ACTIVE_VERSION) {
    const v = process.env.BVM_ACTIVE_VERSION.trim();
    return v.startsWith('v') ? v : 'v' + v;
  }

  let dir = process.cwd();
  try {
    const { root } = path.parse(dir);
    while (true) {
        const rc = path.join(dir, '.bvmrc');
        if (fs.existsSync(rc)) {
            const v = fs.readFileSync(rc, 'utf8').trim().replace(/^v/, '');
            if (v) return 'v' + v;
        }
        if (dir === root) break;
        dir = path.dirname(dir);
    }
  } catch(e) {}

  const current = path.join(BVM_DIR, 'current');
  if (fs.existsSync(current)) {
    try {
        const target = fs.realpathSync(current); 
        const v = path.basename(target); 
        if (v && v.startsWith('v')) return v;
    } catch(e) {}
  }
  
  const def = path.join(BVM_DIR, 'aliases', 'default');
  if (fs.existsSync(def)) {
      try {
          const v = fs.readFileSync(def, 'utf8').trim().replace(/^v/, '');
          if (v) return 'v' + v;
      } catch(e) {}
  }
  return '';
}

// Simple synchronous execution for performance
const version = resolveVersion();
if (!version) {
    console.error("BVM Error: No Bun version is active or default is set.");
    process.exit(1);
}

const versionDir = path.join(BVM_DIR, 'versions', version);
const binDir = path.join(versionDir, 'bin');
const realExecutable = path.join(binDir, CMD + '.exe');

if (!fs.existsSync(realExecutable)) {
    console.error("BVM Error: Command '" + CMD + "' not found in Bun " + version + " at " + realExecutable);
    process.exit(127);
}

process.env.BUN_INSTALL = versionDir;
process.env.PATH = binDir + path.delimiter + process.env.PATH;

const child = spawn(realExecutable, ARGS, { stdio: 'inherit', shell: false });
child.on('exit', (code) => process.exit(code ?? 0));
child.on('error', (err) => {
    console.error("BVM Error: Failed to start child process: " + err.message);
    process.exit(1);
});
`;var V$=`@echo off
set "BVM_DIR=%USERPROFILE%\\.bvm"

:: Fast-path: If no .bvmrc in current directory, run default directly
if not exist ".bvmrc" (
    "%BVM_DIR%\\runtime\\current\\bin\\bun.exe" %*
    exit /b %errorlevel%
)

:: Slow-path: Hand over to JS shim for version resolution
"%BVM_DIR%\\runtime\\current\\bin\\bun.exe" "%BVM_DIR%\\bin\\bvm-shim.js" "bun" %*

`;var d$=`@echo off
set "BVM_DIR=%USERPROFILE%\\.bvm"

if not exist ".bvmrc" (
    "%BVM_DIR%\\runtime\\current\\bin\\bun.exe" %*
    exit /b %errorlevel%
)

"%BVM_DIR%\\runtime\\current\\bin\\bun.exe" "%BVM_DIR%\\bin\\bvm-shim.js" "bunx" %*

`;var g$=`@echo off
set "BVM_DIR=%USERPROFILE%\\.bvm"
"%BVM_DIR%\\runtime\\current\\bin\\bun.exe" "%BVM_DIR%\\src\\index.js" %*
`;async function G$($=!0){if(await R4($),process.platform==="win32"){await S4($);return}if(!process.env.BVM_TEST_MODE)await w1();let q=process.env.SHELL||"",Q="",J="";if(q.includes("zsh"))J="zsh",Q=B($$(),".zshrc");else if(q.includes("bash"))if(J="bash",process.platform==="darwin")if(await G(B($$(),".bashrc")))Q=B($$(),".bashrc");else Q=B($$(),".bash_profile");else Q=B($$(),".bashrc");else if(q.includes("fish"))J="fish",Q=B($$(),".config","fish","config.fish");else{if($)console.log(K.yellow(`Could not detect a supported shell (zsh, bash, fish). Please manually add ${M} to your PATH.`));return}let Z=B(M,"bvm-init.sh");await Bun.write(Z,v$),await O$(Z,493);let Y=B(M,"bvm-init.fish");await Bun.write(Y,_$),await O$(Y,493);let X="";try{X=await Bun.file(Q).text()}catch(H){if(H.code==="ENOENT")await Bun.write(Q,""),X="";else throw H}let b="# >>> bvm initialize >>>",W="# <<< bvm initialize <<<",z=`${b}
# !! Contents within this block are managed by 'bvm setup' !!
export BVM_DIR="${k}"
export PATH="$BVM_DIR/shims:$BVM_DIR/bin:$PATH"
# Reset current version to default for new terminal sessions
[ -L "$BVM_DIR/current" ] && rm "$BVM_DIR/current"
${W}`,w=`# >>> bvm initialize >>>
# !! Contents within this block are managed by 'bvm setup' !!
set -Ux BVM_DIR "${k}"
fish_add_path "$BVM_DIR/shims"
fish_add_path "$BVM_DIR/bin"
# Reset current version to default
if test -L "$BVM_DIR/current"
    rm "$BVM_DIR/current"
end
# <<< bvm initialize <<<`;if($)console.log(K.cyan(`Configuring ${J} environment in ${Q}...`));try{let H=X,x=new RegExp(`${b}[sS]*?${W}`,"g");if(X.includes(b))H=X.replace(x,J==="fish"?w:z);else if(X.includes("export BVM_DIR=")||X.includes("set -Ux BVM_DIR"))H=X+`
`+(J==="fish"?w:z);else H=X+`
`+(J==="fish"?w:z);if(H!==X){if(await Bun.write(Q,H),$)console.log(K.green(`\u2713 Successfully updated BVM configuration in ${Q}`))}else if($)console.log(K.gray("\u2713 Configuration is already up to date."));if($)console.log(K.yellow(`Please restart your terminal or run "source ${Q}" to apply changes.`))}catch(H){console.error(K.red(`Failed to write to ${Q}: ${H.message}`))}}async function R4($){if($)console.log(K.cyan("Refreshing shims and wrappers..."));if(await O(M),await O(E),process.platform==="win32")await Bun.write(B(M,"bvm-shim.js"),u$),await Bun.write(B(M,"bvm.cmd"),g$),await Bun.write(B(E,"bun.cmd"),V$),await Bun.write(B(E,"bunx.cmd"),d$);else{let Q=B(M,"bvm-shim.sh");await Bun.write(Q,P$),await O$(Q,493);let J=`#!/bin/bash
export BVM_DIR="${k}"
exec "${k}/runtime/current/bin/bun" "${k}/src/index.js" "$@"`,Z=B(M,"bvm");await Bun.write(Z,J),await O$(Z,493);for(let Y of["bun","bunx"]){let X=`#!/bin/bash
export BVM_DIR="${k}"
exec "${k}/bin/bvm-shim.sh" "${Y}" "$@"`,b=B(E,Y);await Bun.write(b,X),await O$(b,493)}}}async function S4($=!0){await w1();let q="";try{q=Bun.spawnSync({cmd:["powershell","-NoProfile","-Command","echo $PROFILE.CurrentUserAllHosts"],stdout:"pipe"}).stdout.toString().trim()}catch(Q){q=B($$(),"Documents","WindowsPowerShell","Microsoft.PowerShell_profile.ps1")}if(!q)return;await O(f4(q)),await I4(q,$)}async function I4($,q=!0){let Q=`
# BVM Configuration
$env:BVM_DIR = "${k}"
$env:PATH = "$env:BVM_DIRshims;$env:BVM_DIR\bin;$env:PATH"
# Auto-activate default version
if (Test-Path "$env:BVM_DIR\bin\bvm.cmd") {
    & "$env:BVM_DIR\bin\bvm.cmd" use default --silent *>$null
}
`;try{let J="";if(await G($))J=await Bun.file($).text();else await Bun.write($,"");if(J.includes("$env:BVM_DIR")){if(q)console.log(K.gray("\u2713 Configuration is already up to date."));return}if(q)console.log(K.cyan(`Configuring PowerShell environment in ${$}...`));if(await Bun.write($,J+`\r
${Q}`),q)console.log(K.green(`\u2713 Successfully configured BVM path in ${$}`)),console.log(K.yellow("Please restart your terminal to apply changes."))}catch(J){console.error(K.red(`Failed to write to ${$}: ${J.message}`))}}async function w1(){if(process.env.BVM_TEST_MODE)return;if(process.env.BVM_SUPPRESS_CONFLICT_WARNING==="true")return;let $=(process.env.PATH||"").split(T4),q=B($$(),".bun"),Q=B(q,"bin");for(let J of $){if(!J||J===M||J.includes(".bvm"))continue;let Z=B(J,A);if(await G(Z)){if(J.includes("node_modules"))continue;if(J===Q||J===q){console.log(),console.log(K.yellow(" CONFLICT DETECTED ")),console.log(K.yellow(`Found existing official Bun installation at: ${Z}`)),console.log(K.yellow("This will conflict with bvm as it is also in your PATH."));try{if(await b1("Do you want bvm to uninstall the official Bun version (~/.bun) to resolve this?"))await E4(q);else console.log(K.dim("Skipping uninstallation. Please ensure bvm path takes precedence."))}catch(Y){}return}else{console.log(),console.log(K.red(" CONFLICT DETECTED ")),console.log(K.red(`Found another Bun installation at: ${Z}`)),console.log(K.yellow("This might be installed via npm, Homebrew, or another package manager.")),console.log(K.yellow("To avoid conflicts, please uninstall it manually (e.g., 'npm uninstall -g bun').")),console.log();return}}}}async function E4($){console.log(K.cyan(`Removing official Bun installation at ${$}...`));try{await r($),console.log(K.green("\u2713 Official Bun uninstalled.")),console.log(K.yellow("Note: You may still need to remove `.bun/bin` from your PATH manually if it was added in your rc file."))}catch(q){console.error(K.red(`Failed to remove official Bun: ${q.message}`))}}C();import{join as v4,dirname as _4}from"path";async function N$(){let $=process.cwd();while(!0){let q=v4($,".bvmrc");if(await G(q))try{return(await Bun.file(q).text()).trim()}catch(J){return null}let Q=_4($);if(Q===$)break;$=Q}return null}F();N();C();q$();f();import{join as O1}from"path";async function H$($,q,Q={}){let J=async(Z)=>{let Y=await d(q);if(!Y){if(!Q.silent)console.log(K.blue(`Please install Bun ${q} first using: bvm install ${q}`));throw Error(`Bun version '${q}' is not installed. Cannot create alias.`)}let X=O1(L,Y);if(!await G(X))throw Error(`Internal Error: Resolved Bun version ${Y} not found.`);await O(j);let b=O1(j,$);if($!=="default"&&await G(b))throw Error(`Alias '${$}' already exists. Use 'bvm alias ${$} <new-version>' to update or 'bvm unalias ${$}' to remove.`);if(await i(b,`${Y}
`),Z)Z.succeed(K.green(`Alias '${$}' created for Bun ${Y}.`))};if(Q.silent)await J();else await U(`Creating alias '${$}' for Bun ${q}...`,(Z)=>J(Z),{failMessage:`Failed to create alias '${$}'`})}f();N();C();F();import{join as C1}from"path";q$();f();async function A$($,q={}){let Q=$;if(!Q)Q=await N$()||void 0;if(!Q){if(!q.silent)console.error(K.red("No version specified. Usage: bvm use <version>"));throw Error("No version specified.")}let J=async(Z)=>{let Y=null,X=await d(Q);if(X)Y=X;else{let w=(await u()).map((H)=>y(H));Y=e(Q,w)}if(!Y)throw Error(`Bun version '${Q}' is not installed.`);let b=y(Y),W=C1(L,b),z=C1(W,"bin",A);if(!await G(z))throw Error(`Version ${b} is not properly installed (binary missing).`);if(await Z1(W,b$),Z)Z.succeed(K.green(`Now using Bun ${b} (immediate effect).`))};if(q.silent)await J();else await U(`Switching to Bun ${Q}...`,(Z)=>J(Z),{failMessage:()=>`Failed to switch to Bun ${Q}`})}N();C();F();import{join as l,dirname as j1}from"path";import{chmod as F1,unlink as u4}from"fs/promises";var __dirname="/home/runner/work/bvm/bvm/src/commands",V4=($)=>`@echo off
set "BVM_DIR=%USERPROFILE%.bvm"
if exist "%BVM_DIR%\runtimecurrent\bin\bun.exe" (
    "%BVM_DIR%\runtimecurrent\bin\bun.exe" "%BVM_DIR%\bin\bvm-shim.js" "${$}" %*
) else (
    echo BVM Error: Bun runtime not found.
    exit /b 1
)`,d4=($)=>`#!/bin/bash
export BVM_DIR="${k}"
exec "${l(M,"bvm-shim.sh")}" "${$}" "$@"`;async function Q$(){await O(E),await O(M);let $=D==="win32";try{let Q=l(j1(j1(__dirname)),"src","templates");if($){let J=await Bun.file(l(Q,"bvm-shim.js")).text();await Bun.write(l(M,"bvm-shim.js"),J)}else{let J=await Bun.file(l(Q,"bvm-shim.sh")).text(),Z=l(M,"bvm-shim.sh");await Bun.write(Z,J),await F1(Z,493)}}catch(Q){}let q=new Set(["bun","bunx"]);if(await G(L)){let Q=await c(L);for(let J of Q){if(J.startsWith("."))continue;let Z=l(L,J,"bin");if(await G(Z)){let Y=await c(Z);for(let X of Y){let b=X.replace(/\.(exe|ps1|cmd)$/i,"");if(b)q.add(b)}}}}for(let Q of q)if($){await Bun.write(l(E,`${Q}.cmd`),V4(Q));let J=l(E,`${Q}.ps1`);if(await G(J))await u4(J)}else{let J=l(E,Q);await Bun.write(J,d4(Q)),await F1(J,493)}console.log(K.green(`\u2713 Regenerated ${q.size} shims in ${E}`))}import{rename as m4,rm as A1}from"fs/promises";async function m$($,q){try{await m4($,q)}catch(Q){await Bun.write(Bun.file(q),Bun.file($)),await A1($,{force:!0})}}async function N1($,q,Q,J){let Z=await fetch($);if(!Z.ok)throw Error(`Status ${Z.status}`);let Y=+(Z.headers.get("Content-Length")||0),X=0,b=Z.body?.getReader();if(!b)throw Error("No response body");let W=Bun.file(q).writer(),z=D==="win32";Q.stop();let w=null,H=-1;if(!z)w=new I$(Y||41943040),w.start();else console.log(`Downloading Bun ${J}...`);try{let x=Date.now();while(!0){let{done:h,value:_}=await b.read();if(h)break;if(W.write(_),X+=_.length,!z&&w){let P=(Date.now()-x)/1000,I=P>0?(X/1024/P).toFixed(0):"0";w.update(X,{speed:I})}else if(z&&Y){let P=Math.floor(X/Y*10);if(P>H)console.log(`  > ${P*10}%`),H=P}}if(await W.end(),!z&&w)w.stop();else console.log("  > 100% [Done]")}catch(x){try{W.end()}catch(h){}if(!z&&w)w.stop();else console.log("  > Download Failed");throw Q.start(),x}Q.start()}async function p$($,q={}){let Q=$,J=null,Z=!1;if(!Q)Q=await N$()||void 0;if(!Q){console.error(K.red("No version specified and no .bvmrc found. Usage: bvm install <version>"));return}try{await U(`Finding Bun ${Q} release...`,async(Y)=>{let X=null,b=y(Q);if(/^v?\d+\.\d+\.\d+$/.test(Q)&&!Q.includes("canary"))if(Y.update(`Checking if Bun ${b} exists...`),await y1(b))X=b;else throw Y.fail(K.red(`Bun version ${b} not found on registry.`)),Error(`Bun version ${b} not found on registry.`);else if(Q==="latest"){Y.update("Checking latest version...");let P=await U1();if(P.latest)X=y(P.latest);else throw Error('Could not resolve "latest" version.')}else throw Y.fail(K.yellow('Fuzzy matching (e.g. "1.1") is disabled for stability.')),console.log(K.dim('  Please specify the exact version (e.g. "1.1.20") or "latest".')),console.log(K.dim("  To see available versions, run: bvm ls-remote")),Error("Fuzzy matching disabled");if(!X)throw Y.fail(K.red(`Could not find a Bun release for '${Q}' compatible with your system.`)),Error(`Could not find a Bun release for '${Q}' compatible with your system.`);let W=await x1(X);if(!W)throw Error(`Could not find a Bun release for ${X} compatible with your system.`);let{url:z,mirrorUrl:w,foundVersion:H}=W,x=t(L,H),h=t(x,"bin"),_=t(h,A);if(await G(_))Y.succeed(K.green(`Bun ${H} is already installed.`)),J=H,Z=!0;else if(y(Bun.version)===H&&!T){Y.info(K.cyan(`Requested version ${H} matches current BVM runtime. Creating symlink...`)),await O(h);let I=process.execPath;try{let{symlink:m}=await import("fs/promises");await m(I,_)}catch(m){await Bun.write(Bun.file(_),Bun.file(I)),await c$(_,493)}Y.succeed(K.green(`Bun ${H} linked from local runtime.`)),J=H,Z=!0}else if(T)await O(h),await c4(_,H),J=H,Z=!0;else{Y.update(`Downloading Bun ${H} to cache...`),await O(v);let I=t(v,`${H}-${g4(z)}`);if(await G(I))Y.succeed(K.green(`Using cached Bun ${H} archive.`));else{let S=`${I}.${Date.now()}.tmp`;try{await N1(z,S,Y,H),await m$(S,I)}catch(a$){try{await A1(S,{force:!0})}catch{}if(Y.update("Download failed, trying mirror..."),console.log(K.dim(`
Debug: ${a$.message}`)),w){let n1=new URL(w).hostname;Y.update(`Downloading from mirror (${n1})...`),await N1(w,S,Y,H),await m$(S,I)}else throw a$}}Y.update(`Extracting Bun ${H}...`),await O(x),await z1(I,x);let m="",D$=[t(x,A),t(x,"bin",A),t(x,"package","bin",A)],t1=await c(x);for(let S of t1)if(S.startsWith("bun-"))D$.push(t(x,S,A)),D$.push(t(x,S,"bin",A));for(let S of D$)if(await G(S)){m=S;break}if(!m)throw Error(`Could not find bun executable in ${x}`);if(await O(h),m!==_){await m$(m,_);let S=h4(m);if(S!==x&&S!==h)await r(S)}await c$(_,493),Y.succeed(K.green(`Bun ${H} installed successfully.`)),J=H,Z=!0}},{failMessage:`Failed to install Bun ${Q}`})}catch(Y){throw Error(`Failed to install Bun: ${Y.message}`)}if(Z)await G$(!1);if(J)try{await A$(J,{silent:!0});let Y=t(j,"default");if(!await G(Y))await H$("default",J,{silent:!0})}catch(Y){}if(await Q$(),J)console.log(K.cyan(`
\u2713 Bun ${J} installed and active.`)),console.log(K.dim("  To verify, run: bun --version or bvm ls"))}async function c4($,q){let Q=q.replace(/^v/,""),J=`#!/usr/bin/env bash
set -euo pipefail
if [[ $# -gt 0 && "$1" == "--version" ]]; then echo "${Q}"; exit 0; fi
echo "Bun ${Q} stub invoked with: $@"
exit 0
`;await Bun.write($,J),await c$($,493)}F();C();f();async function D1(){await U("Fetching remote Bun versions...",async($)=>{let Q=(await W1()).filter((J)=>V(J)).filter((J)=>!J.includes("canary")).sort(Z$);if(Q.length===0)throw Error("No remote Bun versions found.");$.succeed(K.green("Available remote Bun versions:")),Q.forEach((J)=>{console.log(`  ${y(J)}`)})},{failMessage:"Failed to fetch remote Bun versions"})}F();C();N();f();import{join as p4}from"path";async function M1(){await U("Fetching locally installed Bun versions...",async($)=>{let q=await u(),J=(await p()).version;if($.succeed(K.green("Locally installed Bun versions:")),q.length===0)console.log("  (No versions installed yet)");else q.forEach((Y)=>{if(Y===J)console.log(`* ${K.green(Y)} ${K.dim("(current)")}`);else console.log(`  ${Y}`)});if(await G(j)){let Y=await c(j);if(Y.length>0){console.log(K.green(`
Aliases:`));for(let X of Y)try{let b=(await R(p4(j,X))).trim(),W=y(b),z=`-> ${K.cyan(W)}`;if(W===J)z+=` ${K.dim("(current)")}`;console.log(`  ${X} ${K.gray(z)}`)}catch(b){}}}},{failMessage:"Failed to list local Bun versions"})}F();C();f();async function B1(){await U("Checking current Bun version...",async($)=>{let{version:q,source:Q}=await p();if(q)$.stop(),console.log(`${K.green("\u2713")} Current Bun version: ${K.green(q)} ${K.dim(`(${Q})`)}`);else $.info(K.blue("No Bun version is currently active.")),console.log(K.yellow("Use 'bvm install <version>' to set a default, or create a .bvmrc file."))},{failMessage:"Failed to determine current Bun version"})}F();N();C();f();import{join as l$,basename as l4}from"path";import{unlink as t4}from"fs/promises";async function f1($){await U(`Attempting to uninstall Bun ${$}...`,async(q)=>{let Q=y($),J=l$(L,Q),Z=l$(J,"bin",A);if(!await G(Z))throw Error(`Bun ${$} is not installed.`);let Y=!1;try{let X=l$(j,"default");if(await G(X)){let b=(await R(X)).trim();if(y(b)===Q)Y=!0}}catch(X){}if(Y)throw console.log(K.yellow("Hint: Set a new default using 'bvm default <new_version>'")),Error(`Bun ${$} is currently set as default. Please set another default before uninstalling.`);try{let X=await K1(b$);if(X){if(y(l4(X))===Q)await t4(b$)}}catch(X){}await r(J),q.succeed(K.green(`Bun ${Q} uninstalled successfully.`)),await Q$()},{failMessage:`Failed to uninstall Bun ${$}`})}F();N();C();f();import{join as n4}from"path";import{unlink as i4}from"fs/promises";async function T1($){await U(`Removing alias '${$}'...`,async(q)=>{let Q=n4(j,$);if(!await G(Q))throw Error(`Alias '${$}' does not exist.`);await i4(Q),q.succeed(K.green(`Alias '${$}' removed successfully.`))},{failMessage:`Failed to remove alias '${$}'`})}F();N();C();q$();f();import{join as t$}from"path";async function R1($,q){await U(`Preparing to run with Bun ${$}...`,async(Q)=>{let J=await d($);if(!J)J=y($);let Z=t$(L,J),Y=t$(Z,"bin"),X=t$(Y,A);if(!await G(X)){Q.fail(K.red(`Bun ${$} (resolved: ${J}) is not installed.`)),console.log(K.yellow(`You can install it using: bvm install ${$}`));return}Q.stop();try{await a([X,...q],{cwd:process.cwd(),prependPath:Y}),process.exit(0)}catch(b){console.error(b.message),process.exit(1)}},{failMessage:`Failed to run command with Bun ${$}`})}F();N();C();q$();f();import{join as n$}from"path";async function S1($,q,Q){await U(`Preparing environment for Bun ${$} to execute '${q}'...`,async(J)=>{let Z=await d($);if(!Z)Z=y($);let Y=n$(L,Z),X=n$(Y,"bin"),b=n$(X,A);if(!await G(b)){J.fail(K.red(`Bun ${$} (resolved: ${Z}) is not installed.`)),console.log(K.yellow(`You can install it using: bvm install ${$}`));return}J.stop();try{await a([q,...Q],{cwd:process.cwd(),prependPath:X}),process.exit(0)}catch(W){console.error(W.message),process.exit(1)}},{failMessage:`Failed to execute command with Bun ${$}'s environment`})}N();C();f();import{join as o4}from"path";async function I1($){await U("Resolving path...",async()=>{let q=null,Q="bun",{version:J}=await p();if(!$||$==="current"){if(q=J,!q)throw Error("No active Bun version found.")}else{let{resolveLocalVersion:Y}=await Promise.resolve().then(() => (q$(),L1));if(q=await Y($),!q)if(J)q=J,Q=$;else throw Error(`Bun version or command '${$}' not found.`)}let Z=o4(L,q,"bin",Q==="bun"?A:Q);if(await G(Z))console.log(Z);else throw Error(`Command '${Q}' not found in Bun ${q}.`)},{failMessage:"Failed to resolve path"})}F();C();f();q$();async function E1($){await U(`Resolving session version for Bun ${$}...`,async(q)=>{let Q=null,J=await d($);if(J)Q=J;else{let Y=(await u()).map((X)=>y(X));Q=e($,Y)}if(!Q)throw Error(`Bun version '${$}' is not installed or cannot be resolved.`);let Z=y(Q);q.succeed(K.green(`Bun ${Z} will be active in this session.`)),console.log(`export BVM_ACTIVE_VERSION=${Z}`),console.log(K.dim("Run `eval $(bvm shell <version>)` or `export BVM_ACTIVE_VERSION=...` to activate."))},{failMessage:`Failed to set session version for Bun ${$}`})}F();N();C();f();import{join as a4}from"path";async function v1($){let q=a4(j,"default");if(!$)await U("Checking current default Bun version...",async(Q)=>{if(await G(q)){let J=await R(q);Q.succeed(K.green(`Default Bun version: ${y(J.trim())}`))}else Q.info(K.blue("No global default Bun version is set.")),console.log(K.yellow("Use 'bvm default <version>' to set one."))},{failMessage:"Failed to retrieve default Bun version"});else await U(`Setting global default to Bun ${$}...`,async(Q)=>{let J=(await u()).map((Y)=>y(Y)),Z=e($,J);if(!Z)throw Error(`Bun version '${$}' is not installed.`);await H$("default",Z,{silent:!0}),Q.succeed(K.green(`\u2713 Default set to ${Z}. New terminals will now start with this version.`))},{failMessage:`Failed to set global default to Bun ${$}`})}N();C();F();f();import{unlink as s4}from"fs/promises";import{join as r4}from"path";async function _1(){await U("Deactivating current Bun version...",async($)=>{let q=r4(j,"default");if(await G(q))await s4(q),$.succeed(K.green("Default Bun version deactivated.")),console.log(K.gray("Run `bvm use <version>` to reactivate.")),await Q$();else $.info("No default Bun version is currently active.")},{failMessage:"Failed to deactivate"})}q$();N();C();F();f();async function P1($){if($==="dir"){console.log(v);return}if($==="clear"){await U("Clearing cache...",async(q)=>{await r(v),await O(v),q.succeed(K.green("Cache cleared."))},{failMessage:"Failed to clear cache"});return}console.error(K.red(`Unknown cache command: ${$}`)),console.log("Usage: bvm cache dir | bvm cache clear")}F();N();f();C();import{join as e4}from"path";var i$=K$.version;async function u1(){try{await U("Checking for BVM updates...",async($)=>{let q=T?{tagName:process.env.BVM_TEST_LATEST_VERSION||`v${i$}`,downloadUrl:"https://example.com/bvm-test"}:await F$();if(!q)throw Error("Unable to determine the latest BVM version.");let Q=q.tagName.startsWith("v")?q.tagName.slice(1):q.tagName;if(!V(Q))throw Error(`Unrecognized version received: ${q.tagName}`);if(!C$(Q,i$)){$.succeed(K.green(`BVM is already up to date (v${i$}).`)),console.log(K.blue("You are using the latest version."));return}if($.text=`Updating BVM to v${Q}...`,T&&!process.env.BVM_TEST_REAL_UPGRADE){$.succeed(K.green("BVM updated successfully (test mode)."));return}$.update("Fetching remote fingerprints...");let J=w$.includes("jsdelivr.net")?`${w$}@${q.tagName}`:w$,Z=`${J.replace(/\/$/,"")}/package.json`,Y=await g(Z,{timeout:5000});if(!Y.ok)throw Error("Failed to fetch remote package.json");let b=(await Y.json()).bvm_fingerprints||{},W={};try{if(await G(z$))W=JSON.parse(await R(z$))}catch(x){}let z=f$.filter((x)=>{if(!x.platform)return!0;if(x.platform==="win32")return D==="win32";if(x.platform==="posix")return D!=="win32";return!0}),w={...W},H=0;for(let x of z){let h=`${J.replace(/\/$/,"")}/dist/${x.remotePath}`,_=e4(k,x.localPath),P=x.name==="CLI Core"?"cli":x.name==="Windows Shim"?"shim_win":"shim_unix",I=b[P],m=W[P];if($.update(`Checking ${x.name}...`),I&&m===I&&await G(_))continue;if($.update(`Downloading ${x.name}...`),await $6(h,_,x.name),I)w[P]=I;H++}if(H>0)$.update("Saving fingerprints..."),await O(k),await i(z$,JSON.stringify(w,null,2)),$.update("Finalizing environment..."),await G$(!1),$.succeed(K.green(`BVM updated to v${Q} successfully (${H} components updated).`));else $.succeed(K.green(`BVM components are already at the latest fingerprints for v${Q}.`));console.log(K.yellow("Please restart your terminal to apply changes."))},{failMessage:"Failed to upgrade BVM"})}catch($){throw Error(`Failed to upgrade BVM: ${$.message}`)}}async function $6($,q,Q){let J=await g($,{timeout:1e4});if(!J.ok)throw Error(`Failed to download ${Q}`);let Z=await J.arrayBuffer();if(Z.byteLength<10)throw Error(`${Q} invalid`);await X1(q,new Uint8Array(Z))}F();N();C();f();import{homedir as q6}from"os";import{join as Q6}from"path";async function V1(){await U("Gathering BVM diagnostics...",async()=>{let $={currentVersion:(await p()).version,installedVersions:await u(),aliases:await J6(),env:{BVM_DIR:k,BVM_BIN_DIR:M,BVM_SHIMS_DIR:E,BVM_VERSIONS_DIR:L,BVM_TEST_MODE:process.env.BVM_TEST_MODE,HOME:process.env.HOME||q6()}};Y6($)})}async function J6(){if(!await G(j))return[];let $=await c(j),q=[];for(let Q of $){let J=Q6(j,Q);if(await G(J)){let Z=await Bun.file(J).text();q.push({name:Q,target:y(Z.trim())})}}return q}function Y6($){if(console.log(K.bold(`
Directories`)),console.log(`  BVM_DIR: ${K.cyan($.env.BVM_DIR||"")}`),console.log(`  BIN_DIR: ${K.cyan(M)}`),console.log(`  SHIMS_DIR: ${K.cyan(E)}`),console.log(`  VERSIONS_DIR: ${K.cyan(L)}`),console.log(K.bold(`
Environment`)),console.log(`  HOME: ${$.env.HOME||"n/a"}`),console.log(`  BVM_TEST_MODE: ${$.env.BVM_TEST_MODE||"false"}`),console.log(K.bold(`
Installed Versions`)),$.installedVersions.length===0)console.log("  (none installed)");else $.installedVersions.forEach((q)=>{let Q=q===$.currentVersion,J=Q?K.green("*"):" ",Z=Q?K.green(q):q,Y=Q?K.green(" (current)"):"";console.log(`  ${J} ${Z}${Y}`)});if(console.log(K.bold(`
Aliases`)),$.aliases.length===0)console.log("  (no aliases configured)");else $.aliases.forEach((q)=>{console.log(`  ${q.name} ${K.gray("->")} ${K.cyan(q.target)}`)});console.log(`
`+K.green("Diagnostics complete."))}var o$=["install","uninstall","use","ls","ls-remote","current","alias","unalias","run","exec","which","cache","setup","upgrade","doctor","completion","deactivate","help"],d1={bash:`#!/usr/bin/env bash
_bvm_completions() {
  COMPREPLY=( $(compgen -W "${o$.join(" ")}" -- "\${COMP_WORDS[COMP_CWORD]}") )
}
complete -F _bvm_completions bvm
`,zsh:`#compdef bvm
_bvm() {
  local -a commands
  commands=( ${o$.join(" ")} )
  _describe 'command' commands
}
compdef _bvm bvm
`,fish:`complete -c bvm -f -a "${o$.join(" ")}"
`};function g1($){let q=d1[$];if(!q)throw Error(`Unsupported shell '${$}'. Supported shells: ${Object.keys(d1).join(", ")}`);console.log(q)}F();N();C();import{join as h1}from"path";F();var m1="update-check.json",Z6=86400000;async function c1(){if(process.env.CI||T)return;let $=h1(v,m1);try{if(await G($)){let q=await R($),Q=JSON.parse(q);if(Date.now()-Q.lastCheck<Z6)return}}catch(q){}try{let q=await F$();if(q){let Q=q.tagName.startsWith("v")?q.tagName.slice(1):q.tagName;await O(v),await i($,JSON.stringify({lastCheck:Date.now(),latestVersion:Q}))}}catch(q){}}async function p1(){if(process.env.CI||T)return null;let $=K$.version,q=h1(v,m1);try{if(await G(q)){let Q=await R(q),J=JSON.parse(Q);if(J.latestVersion&&C$(J.latestVersion,$))return`
${K.gray("Update available:")} ${K.green(`v${J.latestVersion}`)} ${K.dim(`(current: v${$})`)}
${K.gray("Run")} ${K.cyan("bvm upgrade")} ${K.gray("to update.")}`}}catch(Q){}return null}class l1{commands={};helpEntries=[];name;versionStr;constructor($){this.name=$,this.versionStr=K$.version}command($,q,Q={}){let J=$.split(" ")[0],Z={description:q,usage:`${this.name} ${$}`,action:async()=>{},aliases:Q.aliases};if(this.commands[J]=Z,this.helpEntries.push(`  ${$.padEnd(35)} ${q}`),Q.aliases)Q.aliases.forEach((X)=>{this.commands[X]=Z});let Y={action:(X)=>{return Z.action=X,Y},option:(X,b)=>Y};return Y}async run(){c1().catch(()=>{});let{values:$,positionals:q}=K6({args:Bun.argv.slice(2),strict:!1,allowPositionals:!0,options:{help:{type:"boolean",short:"h"},version:{type:"boolean",short:"v"},silent:{type:"boolean",short:"s"}}}),Q=q[0],J=!!($.silent||$.s),Z=!!($.version||$.v||$.help||$.h);if(!Q){if($.version||$.v)console.log(this.versionStr),process.exit(0);if($.help||$.h)this.showHelp(),process.exit(0);this.showHelp(),process.exit(1)}if($.help||$.h)this.showHelp(),process.exit(0);let Y=this.commands[Q];if(!Y)console.error(K.yellow(`Unknown command '${Q}'`)),this.showHelp(),process.exit(0);try{if(await Y.action(q.slice(1),$),!Z&&!J&&["ls","current","doctor","default"].includes(Q)){let X=await p1();if(X)console.log(X)}}catch(X){if(!X.reported)console.error(K.red(`\u2716 ${X.message}`));process.exit(1)}}showHelp(){console.log(`Bun Version Manager (bvm) v${this.versionStr}`),console.log(`Built with Bun \xB7 Runs with Bun \xB7 Tested on Bun
`),console.log("Usage:"),console.log(`  ${this.name} <command> [flags]
`),console.log("Commands:"),console.log(this.helpEntries.join(`
`)),console.log(`
Global Flags:`),console.log("  --help, -h                     Show this help message"),console.log("  --version, -v                  Show version number"),console.log(`
Examples:`),console.log("  bvm install 1.0.0"),console.log("  bvm use 1.0.0"),console.log("  bvm run 1.0.0 index.ts")}}async function X6(){let $=new l1("bvm");$.command("rehash","Regenerate shims for all installed binaries").action(async()=>{await Q$()}),$.command("install [version]","Install a Bun version and set as current").option("--global, -g","Install as a global tool (not just default)").action(async(q,Q)=>{await p$(q[0],{global:Q.global||Q.g})}),$.command("i [version]","Alias for install").action(async(q,Q)=>{await p$(q[0],{global:Q.global||Q.g})}),$.command("ls","List installed Bun versions",{aliases:["list"]}).action(async()=>{await M1()}),$.command("ls-remote","List all available remote Bun versions").action(async()=>{await D1()}),$.command("use <version>","Switch the active Bun version immediately (all terminals)").action(async(q)=>{if(!q[0])throw Error("Version is required");await A$(q[0])}),$.command("shell <version>","Switch Bun version for the current shell session").action(async(q)=>{if(!q[0])throw Error("Version is required");await E1(q[0])}),$.command("default [version]","Display or set the global default Bun version").action(async(q)=>{await v1(q[0])}),$.command("current","Display the currently active Bun version").action(async()=>{await B1()}),$.command("uninstall <version>","Uninstall a Bun version").action(async(q)=>{if(!q[0])throw Error("Version is required");await f1(q[0])}),$.command("alias <name> <version>","Create an alias for a Bun version").action(async(q)=>{if(!q[0]||!q[1])throw Error("Name and version are required");await H$(q[0],q[1])}),$.command("unalias <name>","Remove an existing alias").action(async(q)=>{if(!q[0])throw Error("Alias name is required");await T1(q[0])}),$.command("run <version> [...args]","Run a command with a specific Bun version").action(async(q)=>{let Q=q[0];if(!Q)throw Error("Version is required");let J=process.argv.indexOf("run"),Z=J!==-1?process.argv.slice(J+2):[];await R1(Q,Z)}),$.command("exec <version> <cmd> [...args]","Execute a command with a specific Bun version's environment").action(async(q)=>{let Q=q[0],J=q[1];if(!Q||!J)throw Error("Version and command are required");let Z=process.argv.indexOf("exec"),Y=Z!==-1?process.argv.slice(Z+3):[];await S1(Q,J,Y)}),$.command("which [version]","Display path to installed bun version").action(async(q)=>{await I1(q[0])}),$.command("deactivate","Undo effects of bvm on current shell").action(async()=>{await _1()}),$.command("version <spec>","Resolve the given description to a single local version").action(async(q)=>{if(!q[0])throw Error("Version specifier is required");await h$(q[0])}),$.command("cache <action>","Manage bvm cache").action(async(q)=>{if(!q[0])throw Error("Action is required");await P1(q[0])}),$.command("setup","Configure shell environment automatically").option("--silent, -s","Suppress output").action(async(q,Q)=>{await G$(!(Q.silent||Q.s))}),$.command("upgrade","Upgrade bvm to the latest version",{aliases:["self-update"]}).action(async()=>{await u1()}),$.command("doctor","Show diagnostics for Bun/BVM setup").action(async()=>{await V1()}),$.command("completion <shell>","Generate shell completion script (bash|zsh|fish)").action(async(q)=>{if(!q[0])throw Error("Shell name is required");g1(q[0])}),await $.run(),process.exit(0)}X6().catch(($)=>{console.error(K.red(`
[FATAL ERROR] Unexpected Crash:`)),console.error($),process.exit(1)});
