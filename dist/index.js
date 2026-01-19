#!/usr/bin/env bun
// @bun
var n1=Object.create;var{getPrototypeOf:o1,defineProperty:M$,getOwnPropertyNames:i1}=Object;var a1=Object.prototype.hasOwnProperty;var U$=($,q,Q)=>{Q=$!=null?n1(o1($)):{};let J=q||!$||!$.__esModule?M$(Q,"default",{value:$,enumerable:!0}):Q;for(let Z of i1($))if(!a1.call(J,Z))M$(J,Z,{get:()=>$[Z],enumerable:!0});return J};var i$=($,q)=>{for(var Q in q)M$($,Q,{get:q[Q],enumerable:!0,configurable:!0,set:(J)=>q[Q]=()=>J})};var y$=($,q)=>()=>($&&(q=$($=0)),q);var O$=import.meta.require;var s$={};i$(s$,{getBvmDir:()=>a$,getBunAssetName:()=>f$,USER_AGENT:()=>G$,TEST_REMOTE_VERSIONS:()=>X$,REPO_FOR_BVM_CLI:()=>q6,OS_PLATFORM:()=>M,IS_TEST_MODE:()=>D,EXECUTABLE_NAME:()=>A,CPU_ARCH:()=>z$,BVM_VERSIONS_DIR:()=>L,BVM_SRC_DIR:()=>e1,BVM_SHIMS_DIR:()=>E,BVM_FINGERPRINTS_FILE:()=>B$,BVM_DIR:()=>O,BVM_CURRENT_DIR:()=>b$,BVM_COMPONENTS:()=>K6,BVM_CDN_ROOT:()=>J6,BVM_CACHE_DIR:()=>_,BVM_BIN_DIR:()=>B,BVM_ALIAS_DIR:()=>k,BUN_GITHUB_RELEASES_API:()=>$6,ASSET_NAME_FOR_BVM:()=>Q6});import{homedir as r1}from"os";import{join as n}from"path";function a$(){let $=process.env.HOME||r1();return n($,".bvm")}function f$($){return`bun-${M==="win32"?"windows":M}-${z$==="arm64"?"aarch64":"x64"}.zip`}var M,z$,D,X$,O,e1,L,B,E,b$,k,_,B$,A,$6="https://api.github.com/repos/oven-sh/bun/releases",q6="EricLLLLLL/bvm",Q6,G$="bvm (Bun Version Manager)",J6,K6;var F=y$(()=>{M=process.platform,z$=process.arch,D=process.env.BVM_TEST_MODE==="true",X$=["v1.3.4","v1.2.23","v1.0.0","bun-v1.4.0-canary"];O=a$(),e1=n(O,"src"),L=n(O,"versions"),B=n(O,"bin"),E=n(O,"shims"),b$=n(O,"current"),k=n(O,"aliases"),_=n(O,"cache"),B$=n(O,"fingerprints.json"),A=M==="win32"?"bun.exe":"bun",Q6=M==="win32"?"bvm.exe":"bvm",J6=process.env.BVM_CDN_URL||"https://cdn.jsdelivr.net/gh/EricLLLLLL/bvm",K6=[{name:"CLI Core",remotePath:"index.js",localPath:"src/index.js"},{name:"Windows Shim",remotePath:"bvm-shim.js",localPath:"bin/bvm-shim.js",platform:"win32"},{name:"Unix Shim",remotePath:"bvm-shim.sh",localPath:"bin/bvm-shim.sh",platform:"posix"}]});function g($){if(!$)return null;return $.match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/)?$:null}function r$($){let q=g($);return q?q.replace(/^v/,""):null}function K$($){if(!$)return null;let q=$.replace(/^v/,""),J=q.split(/[-+]/)[0].split(".").map(Number);if(J.length===0||J.some((K)=>isNaN(K)))return null;let Z=q.includes("-")?q.split("-")[1].split("+")[0]:void 0;return{major:J[0],minor:J[1],patch:J[2],pre:Z}}function T$($,q){if(!$||!q)return 0;if($.major!==q.major)return $.major-q.major;if($.minor!==q.minor)return $.minor-q.minor;if($.patch!==q.patch)return $.patch-q.patch;if($.pre&&!q.pre)return-1;if(!$.pre&&q.pre)return 1;if($.pre&&q.pre)return $.pre.localeCompare(q.pre);return 0}function e$($,q){let Q=K$($),J=K$(q);return T$(Q,J)}function Y$($,q){return e$(q,$)}function k$($,q){return e$($,q)>0}function $1($,q){if(q==="*"||q===""||q==="latest")return!0;let Q=K$($);if(!Q)return!1;let J=q;if(q.startsWith("v"))J=q.substring(1);if(r$($)===r$(q))return!0;let Z=J.split(".");if(Z.length===1){let K=Number(Z[0]);if(Q.major===K)return!0}else if(Z.length===2){let K=Number(Z[0]),X=Number(Z[1]);if(Q.major===K&&Q.minor===X)return!0}if(q.startsWith("~")){let K=K$(q.substring(1));if(!K)return!1;let X=K.patch??0;return Q.major===K.major&&Q.minor===K.minor&&Q.patch>=X}if(q.startsWith("^")){let K=K$(q.substring(1));if(!K)return!1;let X=K.patch??0,b=K.minor??0;if(K.major===0){if(Q.major!==0)return!1;if(Q.minor!==b)return!1;return Q.patch>=X}if(Q.major!==K.major)return!1;if(Q.minor<b)return!1;if(Q.minor===b&&Q.patch<X)return!1;return!0}return!1}import{readdir as Z6,mkdir as X6,stat as b6,symlink as G6,unlink as q1,rm as Q1,readlink as H6}from"fs/promises";import{join as C$,dirname as W6,basename as U6}from"path";async function N($){await X6($,{recursive:!0})}async function G($){try{return await b6($),!0}catch(q){if(q.code==="ENOENT")return!1;throw q}}async function J1($,q){try{await q1(q)}catch(J){try{await Q1(q,{recursive:!0,force:!0})}catch(Z){}}let Q=process.platform==="win32"?"junction":"dir";await G6($,q,Q)}async function K1($){try{return await H6($)}catch(q){if(q.code==="ENOENT"||q.code==="EINVAL")return null;throw q}}async function r($){await Q1($,{recursive:!0,force:!0})}async function c($){try{return await Z6($)}catch(q){if(q.code==="ENOENT")return[];throw q}}async function f($){return await Bun.file($).text()}async function P($,q){await Bun.write($,q)}async function L$($,q,Q={}){let{backup:J=!0}=Q,Z=W6($);await N(Z);let K=`${$}.tmp-${Date.now()}`,X=`${$}.bak`;try{if(await P(K,q),J&&await G($))try{let{rename:y,unlink:z}=await import("fs/promises");if(await G(X))await z(X).catch(()=>{});await y($,X)}catch(y){}let{rename:b}=await import("fs/promises");try{await b(K,$)}catch(y){await Bun.write($,q),await q1(K).catch(()=>{})}}catch(b){let{unlink:y}=await import("fs/promises");throw await y(K).catch(()=>{}),b}}function H($){let q=$.trim();if(q.startsWith("bun-v"))q=q.substring(4);if(!q.startsWith("v")&&/^\d/.test(q))q=`v${q}`;return q}async function v(){return await N(L),(await c(L)).filter((q)=>g(H(q))).sort(Y$)}async function p(){if(process.env.BVM_ACTIVE_VERSION)return{version:H(process.env.BVM_ACTIVE_VERSION),source:"env"};let $=C$(process.cwd(),".bvmrc");if(await G($)){let X=(await f($)).trim();return{version:H(X),source:".bvmrc"}}let{getBvmDir:q}=await Promise.resolve().then(() => (F(),s$)),Q=q(),J=C$(Q,"current"),Z=C$(Q,"aliases");if(await G(J)){let{realpath:X}=await import("fs/promises");try{let b=await X(J);return{version:H(U6(b)),source:"current"}}catch(b){}}let K=C$(Z,"default");if(await G(K)){let X=(await f(K)).trim();return{version:H(X),source:"default"}}return{version:null,source:null}}function e($,q){if(!$||q.length===0)return null;let Q=H($);if(q.includes(Q))return Q;if($.toLowerCase()==="latest")return q[0];if(/^\d+\.\d+\.\d+$/.test($.replace(/^v/,"")))return null;if(!/^[v\d]/.test($))return null;let Z=$.startsWith("v")?`~${$.substring(1)}`:`~${$}`,K=q.filter((X)=>$1(X,Z));if(K.length>0)return K.sort(Y$)[0];return null}var w=y$(()=>{F()});import{createInterface as y6}from"readline";class R${timer=null;frames=process.platform==="win32"?["-"]:["\u280B","\u2819","\u2839","\u2838","\u283C","\u2834","\u2826","\u2827","\u2807","\u280F"];frameIndex=0;text;isWindows=process.platform==="win32";constructor($){this.text=$}start($){if($)this.text=$;if(this.timer)return;if(this.isWindows){process.stdout.write(`${Y.cyan(">")} ${this.text}
`);return}this.timer=setInterval(()=>{process.stdout.write(`\r\x1B[K${Y.cyan(this.frames[this.frameIndex])} ${this.text}`),this.frameIndex=(this.frameIndex+1)%this.frames.length},80)}stop(){if(this.isWindows)return;if(this.timer)clearInterval(this.timer),this.timer=null,process.stdout.write("\r\x1B[K");process.stdout.write("\x1B[?25h")}succeed($){this.stop(),console.log(`${Y.green("  \u2713")} ${$||this.text}`)}fail($){this.stop(),console.log(`${Y.red("  \u2716")} ${$||this.text}`)}info($){this.stop(),console.log(`${Y.blue("  \u2139")} ${$||this.text}`)}update($){if(this.text=$,this.isWindows)console.log(Y.dim(`  ... ${this.text}`))}}class D${total;current=0;width=20;constructor($){this.total=$}start(){process.stdout.write("\x1B[?25l"),this.render()}update($,q){this.current=$,this.render(q)}stop(){process.stdout.write(`\x1B[?25h
`)}render($){let q=Math.min(1,this.current/this.total),Q=Math.round(this.width*q),J=this.width-Q,Z=process.platform==="win32",K=Z?"=":"\u2588",X=Z?"-":"\u2591",b=Y.green(K.repeat(Q))+Y.gray(X.repeat(J)),y=(q*100).toFixed(0).padStart(3," "),z=(this.current/1048576).toFixed(1),x=(this.total/1048576).toFixed(1),U=$?` ${$.speed}KB/s`:"";process.stdout.write(`\r\x1B[2K ${b} ${y}% | ${z}/${x}MB${U}`)}}async function Y1($){let q=y6({input:process.stdin,output:process.stdout});return new Promise((Q)=>{q.question(`${Y.yellow("?")} ${$} (Y/n) `,(J)=>{q.close(),Q(J.toLowerCase()!=="n")})})}var O6,z6=($)=>$.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),o=($,q,Q=$)=>(J)=>O6?$+J.replace(new RegExp(z6(q),"g"),Q)+q:J,Y;var C=y$(()=>{O6=!process.env.NO_COLOR,Y={red:o("\x1B[1;31m","\x1B[39m"),green:o("\x1B[1;32m","\x1B[39m"),yellow:o("\x1B[1;33m","\x1B[39m"),blue:o("\x1B[1;34m","\x1B[39m"),magenta:o("\x1B[1;35m","\x1B[39m"),cyan:o("\x1B[1;36m","\x1B[39m"),gray:o("\x1B[90m","\x1B[39m"),bold:o("\x1B[1m","\x1B[22m","\x1B[22m\x1B[1m"),dim:o("\x1B[2m","\x1B[22m","\x1B[22m\x1B[2m")}});async function W($,q,Q){if(process.platform==="win32"){console.log(Y.cyan(`> ${$}`));let K={start:(X)=>{if(X)console.log(Y.cyan(`> ${X}`))},stop:()=>{},succeed:(X)=>console.log(Y.green(`  \u2713 ${X}`)),fail:(X)=>console.log(Y.red(`  \u2716 ${X}`)),info:(X)=>console.log(Y.cyan(`  \u2139 ${X}`)),update:(X)=>console.log(Y.dim(`  ... ${X}`)),isSpinning:!1};try{return await q(K)}catch(X){let b=O1(X,Q?.failMessage);if(console.log(Y.red(`  \u2716 ${b}`)),process.env.BVM_DEBUG,console.log(Y.dim(`    Details: ${X.message}`)),X.code)console.log(Y.dim(`    Code: ${X.code}`));throw X.reported=!0,X}}let Z=new R$($);Z.start();try{let K=await q(Z);return Z.stop(),K}catch(K){let X=O1(K,Q?.failMessage);throw Z.fail(Y.red(X)),K.reported=!0,K}}function O1($,q){let Q=$ instanceof Error?$.message:String($);if(!q)return Q;if(typeof q==="function")return q($);return`${q}: ${Q}`}var R=y$(()=>{C()});var z1={};i$(z1,{resolveLocalVersion:()=>V,displayVersion:()=>d$});import{join as d6}from"path";async function V($){if($==="current"){let{version:Z}=await p();return Z}if($==="latest"){let Z=await v();if(Z.length>0)return Z[0];return null}let q=d6(k,$);if(await G(q))try{let Z=(await f(q)).trim();return H(Z)}catch{return null}let Q=H($),J=await v();return e($,J)}async function d$($){await W(`Resolving version '${$}'...`,async()=>{let q=await V($);if(q)console.log(q);else throw Error("N/A")},{failMessage:`Failed to resolve version '${$}'`})}var Q$=y$(()=>{F();w();R()});import{parseArgs as b4}from"util";var Z$={name:"bvm-core",version:"1.1.13",description:"The native version manager for Bun. Cross-platform, shell-agnostic, and zero-dependency.",main:"dist/index.js",bin:{bvm:"dist/index.js"},publishConfig:{access:"public"},scripts:{dev:"bun run src/index.ts",build:"bun build src/index.ts --target=bun --outfile dist/index.js --minify && bun run scripts/sync-runtime.ts",test:"bun test",bvm:"bun run src/index.ts","bvm:sandbox":'mkdir -p "$PWD/.sandbox-home" && HOME="$PWD/.sandbox-home" bun run src/index.ts',release:"bun run scripts/release.ts","test:e2e:npm":"bun run scripts/verify-e2e-npm.ts","sync-runtime":"bun run scripts/sync-runtime.ts",postinstall:"node scripts/postinstall.js"},repository:{type:"git",url:"git+https://github.com/EricLLLLLL/bvm.git"},keywords:["bun","version-manager","cli","bvm","nvm","nvm-windows","fnm","nodenv","bun-nvm","version-switching"],files:["dist/index.js","dist/bvm-shim.sh","dist/bvm-shim.js","scripts/postinstall.js","install.sh","install.ps1","README.md"],author:"EricLLLLLL",license:"MIT",type:"commonjs",dependencies:{"@oven/bun-darwin-aarch64":"^1.3.5","cli-progress":"^3.12.0"},devDependencies:{"@types/bun":"^1.3.4","@types/cli-progress":"^3.11.6","@types/node":"^24.10.2",bun:"^1.3.5",esbuild:"^0.27.2",execa:"^9.6.1",typescript:"^5"},peerDependencies:{typescript:"^5"}};F();w();import{join as t,basename as c6,dirname as p6}from"path";F();w();C();import{join as x6}from"path";function Z1($,q){if($==="darwin"){if(q==="arm64")return"@oven/bun-darwin-aarch64";if(q==="x64")return"@oven/bun-darwin-x64"}if($==="linux"){if(q==="arm64")return"@oven/bun-linux-aarch64";if(q==="x64")return"@oven/bun-linux-x64"}if($==="win32"){if(q==="x64")return"@oven/bun-windows-x64"}return null}function X1($,q,Q){let J=Q;if(!J.endsWith("/"))J+="/";let Z=$.startsWith("@"),K=$;if(Z){let b=$.split("/");if(b.length===2)K=b[1]}let X=`${K}-${q}.tgz`;return`${J}${$}/-/${X}`}C();async function u($,q={}){let{cwd:Q,env:J,prependPath:Z,stdin:K="inherit",stdout:X="inherit",stderr:b="inherit"}=q,y={...process.env,...J};if(Z){let U=y.PATH||"",j=process.platform==="win32"?";":":";y.PATH=`${Z}${j}${U}`}let x=await Bun.spawn({cmd:$,cwd:Q,env:y,stdin:K,stdout:X,stderr:b}).exited;if((x??0)!==0)throw Error(`${Y.red("Command failed")}: ${$.join(" ")} (code ${x})`);return x??0}async function i($,q={}){let{timeout:Q=5000,...J}=q,Z=new AbortController,K=setTimeout(()=>Z.abort(),Q);try{let X=await fetch($,{...J,signal:Z.signal});return clearTimeout(K),X}catch(X){if(clearTimeout(K),X.name==="AbortError")throw Error(`Request to ${$} timed out after ${Q}ms`);throw X}}async function L6($,q=2000){if($.length===0)throw Error("No URLs to race");if($.length===1)return $[0];return new Promise((Q,J)=>{let Z=0,K=!1;$.forEach((X)=>{i(X,{method:"HEAD",timeout:q}).then((b)=>{if(b.ok&&!K)K=!0,Q(X);else if(!K){if(Z++,Z===$.length)J(Error("All requests failed"))}}).catch(()=>{if(!K){if(Z++,Z===$.length)J(Error("All requests failed"))}})})})}async function w6(){try{let $=await i("https://1.1.1.1/cdn-cgi/trace",{timeout:500});if(!$.ok)return null;let Q=(await $.text()).match(/loc=([A-Z]{2})/);return Q?Q[1]:null}catch($){return null}}var I$=null,w$={NPM:"https://registry.npmjs.org",TAOBAO:"https://registry.npmmirror.com",TENCENT:"https://mirrors.cloud.tencent.com/npm/"};async function $$(){if(I$)return I$;let $=await w6(),q=[];if($==="CN")q=[w$.TAOBAO,w$.TENCENT,w$.NPM];else q=[w$.NPM,w$.TAOBAO];try{let Q=await L6(q,2000);return I$=Q,Q}catch(Q){return q[0]}}w();var k6="bun-versions.json",C6=3600000;async function F6(){if(D)return[...X$];let $=x6(_,k6);try{if(await G($)){let Z=await f($),K=JSON.parse(Z);if(Date.now()-K.timestamp<C6&&Array.isArray(K.versions))return K.versions}}catch(Z){}let q=await $$(),Q=[q];if(q!=="https://registry.npmjs.org")Q.push("https://registry.npmjs.org");let J=null;for(let Z of Q){let K=`${Z.replace(/\/$/,"")}/bun`;try{let X=await i(K,{headers:{"User-Agent":G$,Accept:"application/vnd.npm.install-v1+json"},timeout:1e4});if(!X.ok)throw Error(`Status ${X.status}`);let b=await X.json();if(!b.versions)throw Error("Invalid response (no versions)");let y=Object.keys(b.versions);try{await N(_),await P($,JSON.stringify({timestamp:Date.now(),versions:y}))}catch(z){}return y}catch(X){J=X}}throw J||Error("Failed to fetch versions from any registry.")}async function N6(){if(D)return[...X$];return new Promise(($,q)=>{let Q=[];try{let J=Bun.spawn(["git","ls-remote","--tags","https://github.com/oven-sh/bun.git"],{stdout:"pipe",stderr:"pipe"}),Z=setTimeout(()=>{J.kill(),q(Error("Git operation timed out"))},1e4);new Response(J.stdout).text().then((X)=>{clearTimeout(Z);let b=X.split(`
`);for(let y of b){let z=y.match(/refs\/tags\/bun-v?(\d+\.\d+\.\d+.*)$/);if(z)Q.push(z[1])}$(Q)}).catch((X)=>{clearTimeout(Z),q(X)})}catch(J){q(Error(`Failed to run git: ${J.message}`))}})}async function b1(){if(D)return[...X$];try{let q=(await F6()).filter((Q)=>g(Q)).map((Q)=>({v:Q,parsed:K$(Q)}));return q.sort((Q,J)=>T$(J.parsed,Q.parsed)),q.map((Q)=>Q.v)}catch($){try{let q=await N6();if(q.length>0)return Array.from(new Set(q.filter((J)=>g(J)))).sort(Y$);throw Error("No versions found via Git")}catch(q){throw Error(`Failed to fetch versions. NPM: ${$.message}. Git: ${q.message}`)}}}async function G1($){if(D)return X$.includes($)||$==="latest";let q=await $$(),Q=$.replace(/^v/,""),J=`${q}/bun/${Q}`,Z=M==="win32"?"curl.exe":"curl",K=async()=>{try{return await u([Z,"-I","-f","-m","5","-s",J],{stdout:"ignore",stderr:"ignore"}),!0}catch(b){return!1}},X=new Promise((b)=>setTimeout(()=>b(!1),1e4));return Promise.race([K(),X])}async function H1(){if(D)return{latest:"1.1.20"};let q=`${await $$()}/-/package/bun/dist-tags`;try{let Q=await i(q,{headers:{"User-Agent":G$},timeout:5000});if(Q.ok)return await Q.json()}catch(Q){}return{}}async function W1($){let q=H($);if(!g(q))return console.error(Y.red(`Invalid version provided to findBunDownloadUrl: ${$}`)),null;if(D)return{url:`https://example.com/${f$(q)}`,foundVersion:q};let Z=Z1(M==="win32"?"win32":M,z$==="arm64"?"arm64":"x64");if(!Z)throw Error(`Unsupported platform/arch for NPM download: ${M}-${z$}`);let K="";if(process.env.BVM_REGISTRY)K=process.env.BVM_REGISTRY;else if(process.env.BVM_DOWNLOAD_MIRROR)K=process.env.BVM_DOWNLOAD_MIRROR;else K=await $$();let X=q.replace(/^v/,"");return{url:X1(Z,X,K),foundVersion:q}}async function F$(){try{let q=(await $$()).replace(/\/$/,""),Q=await i(`${q}/-/package/bvm-core/dist-tags`,{headers:{"User-Agent":G$},timeout:5000});if(!Q.ok)return null;let Z=(await Q.json()).latest;if(!Z)return null;let K=await i(`${q}/bvm-core/${Z}`,{headers:{"User-Agent":G$},timeout:5000});if(K.ok){let X=await K.json();return{version:Z,tarball:X.dist.tarball,integrity:X.dist.integrity,shasum:X.dist.shasum}}}catch($){}return null}C();F();import{spawn as A6}from"child_process";async function U1($,q){if($.endsWith(".zip"))if(M==="win32")await u(["powershell","-Command",`Expand-Archive -Path "${$}" -DestinationPath "${q}" -Force`],{stdout:"ignore",stderr:"inherit"});else await u(["unzip","-o","-q",$,"-d",q],{stdout:"ignore",stderr:"inherit"});else if($.endsWith(".tar.gz")||$.endsWith(".tgz"))await new Promise((Q,J)=>{let Z=A6("tar",["-xzf",$,"-C",q],{stdio:"inherit",shell:!1});Z.on("close",(K)=>{if(K===0)Q();else J(Error(`tar exited with code ${K}`))}),Z.on("error",(K)=>J(K))});else throw Error(`Unsupported archive format: ${$}`)}import{chmod as m$}from"fs/promises";w();F();C();import{join as T,dirname as I6,delimiter as S6}from"path";import{homedir as q$}from"os";import{chmod as x$}from"fs/promises";var S$=`#!/bin/bash

# bvm-init.sh: Initializes bvm default version on shell startup

# Check if BVM_DIR is set
if [ -z "\${BVM_DIR}" ]; then
  return
fi

# Try to switch to the 'default' version silently.
"\${BVM_DIR}/bin/bvm" use default --silent >/dev/null 2>&1 || true
`;var E$=`# bvm-init.fish: Initializes bvm default version on shell startup

# Check if BVM_DIR is set
if not set -q BVM_DIR
  return
end

# Try to switch to the 'default' version silently.
eval "$BVM_DIR/bin/bvm" use default --silent >/dev/null 2>&1 || true
`;var _$=`#!/bin/bash
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
`;var v$=`const path = require('path');
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
`;var P$=`@echo off
set "BVM_DIR=%USERPROFILE%\\.bvm"

:: Fast-path: If no .bvmrc in current directory, run default directly
if not exist ".bvmrc" (
    "%BVM_DIR%\\runtime\\current\\bin\\bun.exe" %*
    exit /b %errorlevel%
)

:: Slow-path: Hand over to JS shim for version resolution
"%BVM_DIR%\\runtime\\current\\bin\\bun.exe" "%BVM_DIR%\\bin\\bvm-shim.js" "bun" %*

`;var u$=`@echo off
set "BVM_DIR=%USERPROFILE%\\.bvm"

if not exist ".bvmrc" (
    "%BVM_DIR%\\runtime\\current\\bin\\bun.exe" %*
    exit /b %errorlevel%
)

"%BVM_DIR%\\runtime\\current\\bin\\bun.exe" "%BVM_DIR%\\bin\\bvm-shim.js" "bunx" %*

`;var V$=`@echo off
set "BVM_DIR=%USERPROFILE%\\.bvm"
"%BVM_DIR%\\runtime\\current\\bin\\bun.exe" "%BVM_DIR%\\src\\index.js" %*
`;async function H$($=!0){if(await E6($),process.platform==="win32"){await _6($);return}if(!process.env.BVM_TEST_MODE)await y1();let q=process.env.SHELL||"",Q="",J="";if(q.includes("zsh"))J="zsh",Q=T(q$(),".zshrc");else if(q.includes("bash"))if(J="bash",process.platform==="darwin")if(await G(T(q$(),".bashrc")))Q=T(q$(),".bashrc");else Q=T(q$(),".bash_profile");else Q=T(q$(),".bashrc");else if(q.includes("fish"))J="fish",Q=T(q$(),".config","fish","config.fish");else{if($)console.log(Y.yellow(`Could not detect a supported shell (zsh, bash, fish). Please manually add ${B} to your PATH.`));return}let Z=T(B,"bvm-init.sh");await Bun.write(Z,S$),await x$(Z,493);let K=T(B,"bvm-init.fish");await Bun.write(K,E$),await x$(K,493);let X="";try{X=await Bun.file(Q).text()}catch(U){if(U.code==="ENOENT")await Bun.write(Q,""),X="";else throw U}let b="# >>> bvm initialize >>>",y="# <<< bvm initialize <<<",z=`${b}
# !! Contents within this block are managed by 'bvm setup' !!
export BVM_DIR="${O}"
export PATH="$BVM_DIR/shims:$BVM_DIR/bin:$PATH"
# Reset current version to default for new terminal sessions
[ -L "$BVM_DIR/current" ] && rm "$BVM_DIR/current"
${y}`,x=`# >>> bvm initialize >>>
# !! Contents within this block are managed by 'bvm setup' !!
set -Ux BVM_DIR "${O}"
fish_add_path "$BVM_DIR/shims"
fish_add_path "$BVM_DIR/bin"
# Reset current version to default
if test -L "$BVM_DIR/current"
    rm "$BVM_DIR/current"
end
# <<< bvm initialize <<<`;if($)console.log(Y.cyan(`Configuring ${J} environment in ${Q}...`));try{let U=X,j=new RegExp(`${b}[sS]*?${y}`,"g");if(X.includes(b))U=X.replace(j,J==="fish"?x:z);else if(X.includes("export BVM_DIR=")||X.includes("set -Ux BVM_DIR"))U=X+`
`+(J==="fish"?x:z);else U=X+`
`+(J==="fish"?x:z);if(U!==X){if(await Bun.write(Q,U),$)console.log(Y.green(`\u2713 Successfully updated BVM configuration in ${Q}`))}else if($)console.log(Y.gray("\u2713 Configuration is already up to date."));if($)console.log(Y.yellow(`Please restart your terminal or run "source ${Q}" to apply changes.`))}catch(U){console.error(Y.red(`Failed to write to ${Q}: ${U.message}`))}}async function E6($){if($)console.log(Y.cyan("Refreshing shims and wrappers..."));if(await N(B),await N(E),process.platform==="win32")await Bun.write(T(B,"bvm-shim.js"),v$),await Bun.write(T(B,"bvm.cmd"),V$),await Bun.write(T(E,"bun.cmd"),P$),await Bun.write(T(E,"bunx.cmd"),u$);else{let Q=T(B,"bvm-shim.sh");await Bun.write(Q,_$),await x$(Q,493);let J="";if(process.env.BVM_INSTALL_SOURCE==="npm")J=`#!/bin/bash
export BVM_DIR="${O}"
export BVM_INSTALL_SOURCE="npm"
# 1. Try internal runtime
if [ -x "${O}/runtime/current/bin/bun" ]; then
  exec "${O}/runtime/current/bin/bun" "${O}/src/index.js" "$@"
# 2. Try global/system bun (fallback)
elif command -v bun >/dev/null 2>&1; then
  exec bun "${O}/src/index.js" "$@"
else
  echo "Error: BVM requires Bun. Please install Bun or ensure it is in your PATH."
  exit 1
fi
`;else J=`#!/bin/bash
export BVM_DIR="${O}"
exec "${O}/runtime/current/bin/bun" "${O}/src/index.js" "$@"`;let Z=T(B,"bvm");await Bun.write(Z,J),await x$(Z,493);for(let K of["bun","bunx"]){let X=`#!/bin/bash
export BVM_DIR="${O}"
exec "${O}/bin/bvm-shim.sh" "${K}" "$@"`,b=T(E,K);await Bun.write(b,X),await x$(b,493)}}}async function _6($=!0){await y1();let q="";try{q=Bun.spawnSync({cmd:["powershell","-NoProfile","-Command","echo $PROFILE.CurrentUserAllHosts"],stdout:"pipe"}).stdout.toString().trim()}catch(Q){q=T(q$(),"Documents","WindowsPowerShell","Microsoft.PowerShell_profile.ps1")}if(!q)return;await N(I6(q)),await v6(q,$)}async function v6($,q=!0){let Q=`
# BVM Configuration
$env:BVM_DIR = "${O}"
$env:PATH = "$env:BVM_DIRshims;$env:BVM_DIR\bin;$env:PATH"
# Auto-activate default version
if (Test-Path "$env:BVM_DIR\bin\bvm.cmd") {
    & "$env:BVM_DIR\bin\bvm.cmd" use default --silent *>$null
}
`;try{let J="";if(await G($))J=await Bun.file($).text();else await Bun.write($,"");if(J.includes("$env:BVM_DIR")){if(q)console.log(Y.gray("\u2713 Configuration is already up to date."));return}if(q)console.log(Y.cyan(`Configuring PowerShell environment in ${$}...`));if(await Bun.write($,J+`\r
${Q}`),q)console.log(Y.green(`\u2713 Successfully configured BVM path in ${$}`)),console.log(Y.yellow("Please restart your terminal to apply changes."))}catch(J){console.error(Y.red(`Failed to write to ${$}: ${J.message}`))}}async function y1(){if(process.env.BVM_TEST_MODE)return;if(process.env.BVM_SUPPRESS_CONFLICT_WARNING==="true")return;let $=(process.env.PATH||"").split(S6),q=T(q$(),".bun"),Q=T(q,"bin");for(let J of $){if(!J||J===B||J.includes(".bvm"))continue;let Z=T(J,A);if(await G(Z)){if(J.includes("node_modules"))continue;if(J===Q||J===q){console.log(),console.log(Y.yellow(" CONFLICT DETECTED ")),console.log(Y.yellow(`Found existing official Bun installation at: ${Z}`)),console.log(Y.yellow("This will conflict with bvm as it is also in your PATH."));try{if(await Y1("Do you want bvm to uninstall the official Bun version (~/.bun) to resolve this?"))await P6(q);else console.log(Y.dim("Skipping uninstallation. Please ensure bvm path takes precedence."))}catch(K){}return}else{console.log(),console.log(Y.red(" CONFLICT DETECTED ")),console.log(Y.red(`Found another Bun installation at: ${Z}`)),console.log(Y.yellow("This might be installed via npm, Homebrew, or another package manager.")),console.log(Y.yellow("To avoid conflicts, please uninstall it manually (e.g., 'npm uninstall -g bun').")),console.log();return}}}}async function P6($){console.log(Y.cyan(`Removing official Bun installation at ${$}...`));try{await r($),console.log(Y.green("\u2713 Official Bun uninstalled.")),console.log(Y.yellow("Note: You may still need to remove `.bun/bin` from your PATH manually if it was added in your rc file."))}catch(q){console.error(Y.red(`Failed to remove official Bun: ${q.message}`))}}w();import{join as u6,dirname as V6}from"path";async function N$(){let $=process.cwd();while(!0){let q=u6($,".bvmrc");if(await G(q))try{return(await Bun.file(q).text()).trim()}catch(J){return null}let Q=V6($);if(Q===$)break;$=Q}return null}C();F();w();Q$();R();import{join as L1}from"path";async function W$($,q,Q={}){let J=async(Z)=>{let K=await V(q);if(!K){if(!Q.silent)console.log(Y.blue(`Please install Bun ${q} first using: bvm install ${q}`));throw Error(`Bun version '${q}' is not installed. Cannot create alias.`)}let X=L1(L,K);if(!await G(X))throw Error(`Internal Error: Resolved Bun version ${K} not found.`);await N(k);let b=L1(k,$);if($!=="default"&&await G(b))throw Error(`Alias '${$}' already exists. Use 'bvm alias ${$} <new-version>' to update or 'bvm unalias ${$}' to remove.`);if(await P(b,`${K}
`),Z)Z.succeed(Y.green(`Alias '${$}' created for Bun ${K}.`))};if(Q.silent)await J();else await W(`Creating alias '${$}' for Bun ${q}...`,(Z)=>J(Z),{failMessage:`Failed to create alias '${$}'`})}R();F();w();C();import{join as w1}from"path";Q$();R();async function A$($,q={}){let Q=$;if(!Q)Q=await N$()||void 0;if(!Q){if(!q.silent)console.error(Y.red("No version specified. Usage: bvm use <version>"));throw Error("No version specified.")}let J=async(Z)=>{let K=null,X=await V(Q);if(X)K=X;else{let x=(await v()).map((U)=>H(U));K=e(Q,x)}if(!K)throw Error(`Bun version '${Q}' is not installed.`);let b=H(K),y=w1(L,b),z=w1(y,"bin",A);if(!await G(z))throw Error(`Version ${b} is not properly installed (binary missing).`);if(await J1(y,b$),Z)Z.succeed(Y.green(`Now using Bun ${b} (immediate effect).`))};if(q.silent)await J();else await W(`Switching to Bun ${Q}...`,(Z)=>J(Z),{failMessage:()=>`Failed to switch to Bun ${Q}`})}F();w();C();import{join as l,dirname as x1}from"path";import{chmod as k1,unlink as g6}from"fs/promises";var __dirname="/home/runner/work/bvm/bvm/src/commands",m6=($)=>`@echo off
set "BVM_DIR=%USERPROFILE%.bvm"
if exist "%BVM_DIR%\runtimecurrent\bin\bun.exe" (
    "%BVM_DIR%\runtimecurrent\bin\bun.exe" "%BVM_DIR%\bin\bvm-shim.js" "${$}" %*
) else (
    echo BVM Error: Bun runtime not found.
    exit /b 1
)`,h6=($)=>`#!/bin/bash
export BVM_DIR="${O}"
exec "${l(B,"bvm-shim.sh")}" "${$}" "$@"`;async function J$(){await N(E),await N(B);let $=M==="win32";try{let Q=l(x1(x1(__dirname)),"src","templates");if($){let J=await Bun.file(l(Q,"bvm-shim.js")).text();await Bun.write(l(B,"bvm-shim.js"),J)}else{let J=await Bun.file(l(Q,"bvm-shim.sh")).text(),Z=l(B,"bvm-shim.sh");await Bun.write(Z,J),await k1(Z,493)}}catch(Q){}let q=new Set(["bun","bunx"]);if(await G(L)){let Q=await c(L);for(let J of Q){if(J.startsWith("."))continue;let Z=l(L,J,"bin");if(await G(Z)){let K=await c(Z);for(let X of K){let b=X.replace(/\.(exe|ps1|cmd)$/i,"");if(b)q.add(b)}}}}for(let Q of q)if($){await Bun.write(l(E,`${Q}.cmd`),m6(Q));let J=l(E,`${Q}.ps1`);if(await G(J))await g6(J)}else{let J=l(E,Q);await Bun.write(J,h6(Q)),await k1(J,493)}console.log(Y.green(`\u2713 Regenerated ${q.size} shims in ${E}`))}import{rename as l6,rm as F1}from"fs/promises";async function g$($,q){try{await l6($,q)}catch(Q){await Bun.write(Bun.file(q),Bun.file($)),await F1($,{force:!0})}}async function C1($,q,Q,J){let Z=await fetch($);if(!Z.ok)throw Error(`Status ${Z.status}`);let K=+(Z.headers.get("Content-Length")||0),X=0,b=Z.body?.getReader();if(!b)throw Error("No response body");let y=Bun.file(q).writer(),z=M==="win32";Q.stop();let x=null,U=-1;if(!z)x=new D$(K||41943040),x.start();else console.log(`Downloading Bun ${J}...`);try{let j=Date.now();while(!0){let{done:a,value:d}=await b.read();if(a)break;if(y.write(d),X+=d.length,!z&&x){let m=(Date.now()-j)/1000,h=m>0?(X/1024/m).toFixed(0):"0";x.update(X,{speed:h})}else if(z&&K){let m=Math.floor(X/K*10);if(m>U)console.log(`  > ${m*10}%`),U=m}}if(await y.end(),!z&&x)x.stop();else console.log("  > 100% [Done]")}catch(j){try{y.end()}catch(a){}if(!z&&x)x.stop();else console.log("  > Download Failed");throw Q.start(),j}Q.start()}async function h$($,q={}){let Q=$,J=null,Z=!1;if(!Q)Q=await N$()||void 0;if(!Q){console.error(Y.red("No version specified and no .bvmrc found. Usage: bvm install <version>"));return}try{await W(`Finding Bun ${Q} release...`,async(K)=>{let X=null,b=H(Q);if(/^v?\d+\.\d+\.\d+$/.test(Q)&&!Q.includes("canary"))if(K.update(`Checking if Bun ${b} exists...`),await G1(b))X=b;else throw K.fail(Y.red(`Bun version ${b} not found on registry.`)),Error(`Bun version ${b} not found on registry.`);else if(Q==="latest"){K.update("Checking latest version...");let m=await H1();if(m.latest)X=H(m.latest);else throw Error('Could not resolve "latest" version.')}else throw K.fail(Y.yellow('Fuzzy matching (e.g. "1.1") is disabled for stability.')),console.log(Y.dim('  Please specify the exact version (e.g. "1.1.20") or "latest".')),console.log(Y.dim("  To see available versions, run: bvm ls-remote")),Error("Fuzzy matching disabled");if(!X)throw K.fail(Y.red(`Could not find a Bun release for '${Q}' compatible with your system.`)),Error(`Could not find a Bun release for '${Q}' compatible with your system.`);let y=await W1(X);if(!y)throw Error(`Could not find a Bun release for ${X} compatible with your system.`);let{url:z,mirrorUrl:x,foundVersion:U}=y,j=t(L,U),a=t(j,"bin"),d=t(a,A);if(await G(d))K.succeed(Y.green(`Bun ${U} is already installed.`)),J=U,Z=!0;else if(H(Bun.version)===U&&!D){K.info(Y.cyan(`Requested version ${U} matches current BVM runtime. Creating symlink...`)),await N(a);let h=process.execPath;try{let{symlink:s}=await import("fs/promises");await s(h,d)}catch(s){await Bun.write(Bun.file(d),Bun.file(h)),await m$(d,493)}K.succeed(Y.green(`Bun ${U} linked from local runtime.`)),J=U,Z=!0}else if(D)await N(a),await t6(d,U),J=U,Z=!0;else{K.update(`Downloading Bun ${U} to cache...`),await N(_);let h=t(_,`${U}-${c6(z)}`);if(await G(h))K.succeed(Y.green(`Using cached Bun ${U} archive.`));else{let I=`${h}.${Date.now()}.tmp`;try{await C1(z,I,K,U),await g$(I,h)}catch(o$){try{await F1(I,{force:!0})}catch{}if(K.update("Download failed, trying mirror..."),console.log(Y.dim(`
Debug: ${o$.message}`)),x){let t1=new URL(x).hostname;K.update(`Downloading from mirror (${t1})...`),await C1(x,I,K,U),await g$(I,h)}else throw o$}}K.update(`Extracting Bun ${U}...`),await N(j),await U1(h,j);let s="",j$=[t(j,A),t(j,"bin",A),t(j,"package","bin",A)],l1=await c(j);for(let I of l1)if(I.startsWith("bun-"))j$.push(t(j,I,A)),j$.push(t(j,I,"bin",A));for(let I of j$)if(await G(I)){s=I;break}if(!s)throw Error(`Could not find bun executable in ${j}`);if(await N(a),s!==d){await g$(s,d);let I=p6(s);if(I!==j&&I!==a)await r(I)}await m$(d,493),K.succeed(Y.green(`Bun ${U} installed successfully.`)),J=U,Z=!0}},{failMessage:`Failed to install Bun ${Q}`})}catch(K){throw Error(`Failed to install Bun: ${K.message}`)}if(Z)await H$(!1);if(J)try{await A$(J,{silent:!0});let K=t(k,"default");if(!await G(K))await W$("default",J,{silent:!0})}catch(K){}if(await J$(),J)console.log(Y.cyan(`
\u2713 Bun ${J} installed and active.`)),console.log(Y.dim("  To verify, run: bun --version or bvm ls"))}async function t6($,q){let Q=q.replace(/^v/,""),J=`#!/usr/bin/env bash
set -euo pipefail
if [[ $# -gt 0 && "$1" == "--version" ]]; then echo "${Q}"; exit 0; fi
echo "Bun ${Q} stub invoked with: $@"
exit 0
`;await Bun.write($,J),await m$($,493)}C();w();R();async function N1(){await W("Fetching remote Bun versions...",async($)=>{let Q=(await b1()).filter((J)=>g(J)).filter((J)=>!J.includes("canary")).sort(Y$);if(Q.length===0)throw Error("No remote Bun versions found.");$.succeed(Y.green("Available remote Bun versions:")),Q.forEach((J)=>{console.log(`  ${H(J)}`)})},{failMessage:"Failed to fetch remote Bun versions"})}C();w();F();R();import{join as n6}from"path";async function A1(){await W("Fetching locally installed Bun versions...",async($)=>{let q=await v(),J=(await p()).version;if($.succeed(Y.green("Locally installed Bun versions:")),q.length===0)console.log("  (No versions installed yet)");else q.forEach((K)=>{if(K===J)console.log(`* ${Y.green(K)} ${Y.dim("(current)")}`);else console.log(`  ${K}`)});if(await G(k)){let K=await c(k);if(K.length>0){console.log(Y.green(`
Aliases:`));for(let X of K)try{let b=(await f(n6(k,X))).trim(),y=H(b),z=`-> ${Y.cyan(y)}`;if(y===J)z+=` ${Y.dim("(current)")}`;console.log(`  ${X} ${Y.gray(z)}`)}catch(b){}}}},{failMessage:"Failed to list local Bun versions"})}C();w();R();async function j1(){await W("Checking current Bun version...",async($)=>{let{version:q,source:Q}=await p();if(q)$.stop(),console.log(`${Y.green("\u2713")} Current Bun version: ${Y.green(q)} ${Y.dim(`(${Q})`)}`);else $.info(Y.blue("No Bun version is currently active.")),console.log(Y.yellow("Use 'bvm install <version>' to set a default, or create a .bvmrc file."))},{failMessage:"Failed to determine current Bun version"})}C();F();w();R();import{join as c$,basename as o6}from"path";import{unlink as i6}from"fs/promises";async function M1($){await W(`Attempting to uninstall Bun ${$}...`,async(q)=>{let Q=H($),J=c$(L,Q),Z=c$(J,"bin",A);if(!await G(Z))throw Error(`Bun ${$} is not installed.`);let K=!1;try{let X=c$(k,"default");if(await G(X)){let b=(await f(X)).trim();if(H(b)===Q)K=!0}}catch(X){}if(K)throw console.log(Y.yellow("Hint: Set a new default using 'bvm default <new_version>'")),Error(`Bun ${$} is currently set as default. Please set another default before uninstalling.`);try{let X=await K1(b$);if(X){if(H(o6(X))===Q)await i6(b$)}}catch(X){}await r(J),q.succeed(Y.green(`Bun ${Q} uninstalled successfully.`)),await J$()},{failMessage:`Failed to uninstall Bun ${$}`})}C();F();w();R();import{join as a6}from"path";import{unlink as s6}from"fs/promises";async function B1($){await W(`Removing alias '${$}'...`,async(q)=>{let Q=a6(k,$);if(!await G(Q))throw Error(`Alias '${$}' does not exist.`);await s6(Q),q.succeed(Y.green(`Alias '${$}' removed successfully.`))},{failMessage:`Failed to remove alias '${$}'`})}C();F();w();Q$();R();import{join as p$}from"path";async function f1($,q){await W(`Preparing to run with Bun ${$}...`,async(Q)=>{let J=await V($);if(!J)J=H($);let Z=p$(L,J),K=p$(Z,"bin"),X=p$(K,A);if(!await G(X)){Q.fail(Y.red(`Bun ${$} (resolved: ${J}) is not installed.`)),console.log(Y.yellow(`You can install it using: bvm install ${$}`));return}Q.stop();try{await u([X,...q],{cwd:process.cwd(),prependPath:K}),process.exit(0)}catch(b){console.error(b.message),process.exit(1)}},{failMessage:`Failed to run command with Bun ${$}`})}C();F();w();Q$();R();import{join as l$}from"path";async function T1($,q,Q){await W(`Preparing environment for Bun ${$} to execute '${q}'...`,async(J)=>{let Z=await V($);if(!Z)Z=H($);let K=l$(L,Z),X=l$(K,"bin"),b=l$(X,A);if(!await G(b)){J.fail(Y.red(`Bun ${$} (resolved: ${Z}) is not installed.`)),console.log(Y.yellow(`You can install it using: bvm install ${$}`));return}J.stop();try{await u([q,...Q],{cwd:process.cwd(),prependPath:X}),process.exit(0)}catch(y){console.error(y.message),process.exit(1)}},{failMessage:`Failed to execute command with Bun ${$}'s environment`})}F();w();R();import{join as r6}from"path";async function R1($){await W("Resolving path...",async()=>{let q=null,Q="bun",{version:J}=await p();if(!$||$==="current"){if(q=J,!q)throw Error("No active Bun version found.")}else{let{resolveLocalVersion:K}=await Promise.resolve().then(() => (Q$(),z1));if(q=await K($),!q)if(J)q=J,Q=$;else throw Error(`Bun version or command '${$}' not found.`)}let Z=r6(L,q,"bin",Q==="bun"?A:Q);if(await G(Z))console.log(Z);else throw Error(`Command '${Q}' not found in Bun ${q}.`)},{failMessage:"Failed to resolve path"})}C();w();R();Q$();async function D1($){await W(`Resolving session version for Bun ${$}...`,async(q)=>{let Q=null,J=await V($);if(J)Q=J;else{let K=(await v()).map((X)=>H(X));Q=e($,K)}if(!Q)throw Error(`Bun version '${$}' is not installed or cannot be resolved.`);let Z=H(Q);q.succeed(Y.green(`Bun ${Z} will be active in this session.`)),console.log(`export BVM_ACTIVE_VERSION=${Z}`),console.log(Y.dim("Run `eval $(bvm shell <version>)` or `export BVM_ACTIVE_VERSION=...` to activate."))},{failMessage:`Failed to set session version for Bun ${$}`})}C();F();w();R();import{join as e6}from"path";async function I1($){let q=e6(k,"default");if(!$)await W("Checking current default Bun version...",async(Q)=>{if(await G(q)){let J=await f(q);Q.succeed(Y.green(`Default Bun version: ${H(J.trim())}`))}else Q.info(Y.blue("No global default Bun version is set.")),console.log(Y.yellow("Use 'bvm default <version>' to set one."))},{failMessage:"Failed to retrieve default Bun version"});else await W(`Setting global default to Bun ${$}...`,async(Q)=>{let J=(await v()).map((K)=>H(K)),Z=e($,J);if(!Z)throw Error(`Bun version '${$}' is not installed.`);await W$("default",Z,{silent:!0}),Q.succeed(Y.green(`\u2713 Default set to ${Z}. New terminals will now start with this version.`))},{failMessage:`Failed to set global default to Bun ${$}`})}F();w();C();R();import{unlink as $4}from"fs/promises";import{join as q4}from"path";async function S1(){await W("Deactivating current Bun version...",async($)=>{let q=q4(k,"default");if(await G(q))await $4(q),$.succeed(Y.green("Default Bun version deactivated.")),console.log(Y.gray("Run `bvm use <version>` to reactivate.")),await J$();else $.info("No default Bun version is currently active.")},{failMessage:"Failed to deactivate"})}Q$();F();w();C();R();async function E1($){if($==="dir"){console.log(_);return}if($==="clear"){await W("Clearing cache...",async(q)=>{await r(_),await N(_),q.succeed(Y.green("Cache cleared."))},{failMessage:"Failed to clear cache"});return}console.error(Y.red(`Unknown cache command: ${$}`)),console.log("Usage: bvm cache dir | bvm cache clear")}C();F();R();w();import{join as S}from"path";import{tmpdir as Q4}from"os";import{rm as _1,mkdir as v1}from"fs/promises";var __dirname="/home/runner/work/bvm/bvm/src/commands",t$=Z$.version;async function P1(){if(process.env.BVM_INSTALL_SOURCE==="npm"||__dirname.includes("node_modules")){await W("Upgrading BVM via npm...",async($)=>{let q=await $$();$.text=`Upgrading BVM via npm using ${q}...`;try{await u(["npm","install","-g","bvm-core","--registry",q]),$.succeed(Y.green("BVM upgraded via npm successfully."))}catch(Q){throw Error(`NPM upgrade failed: ${Q.message}`)}});return}try{await W("Checking for BVM updates...",async($)=>{let q=D?{version:process.env.BVM_TEST_LATEST_VERSION?.replace("v","")||t$,tarball:"https://example.com/bvm-test.tgz",shasum:"mock",integrity:"mock"}:await F$();if(!q)throw Error("Unable to determine the latest BVM version from NPM Registry.");let Q=q.version;if(!g(Q))throw Error(`Unrecognized version received: ${Q}`);if(!k$(Q,t$)){$.succeed(Y.green(`BVM is already up to date (v${t$}).`)),console.log(Y.blue("You are using the latest version."));return}if($.text=`Updating BVM to v${Q}...`,D&&!process.env.BVM_TEST_REAL_UPGRADE){$.succeed(Y.green("BVM updated successfully (test mode)."));return}$.update("Downloading update package...");let J=S(Q4(),`bvm-upgrade-${Date.now()}`);await v1(J,{recursive:!0});let Z=S(J,"bvm-core.tgz");if(D){await P(Z,"mock-tarball");let X=S(J,"package","dist");await v1(X,{recursive:!0}),await P(S(X,"index.js"),"// new cli"),await P(S(X,"bvm-shim.sh"),"# new shim"),await P(S(X,"bvm-shim.js"),"// new shim")}else{let X=await i(q.tarball,{timeout:30000});if(!X.ok)throw Error(`Failed to download tarball: ${X.statusText}`);let b=await X.arrayBuffer();await L$(Z,new Uint8Array(b)),$.update("Extracting update...");try{await u(["tar","-xzf",Z,"-C",J])}catch(y){throw Error('Failed to extract update package. Ensure "tar" is available.')}}$.update("Applying updates...");let K=S(J,"package","dist");if(await G(S(K,"index.js")))await L$(S(O,"src","index.js"),await f(S(K,"index.js")));if(M!=="win32"&&await G(S(K,"bvm-shim.sh")))await L$(S(O,"bin","bvm-shim.sh"),await f(S(K,"bvm-shim.sh")));if(M==="win32"&&await G(S(K,"bvm-shim.js")))await L$(S(O,"bin","bvm-shim.js"),await f(S(K,"bvm-shim.js")));try{await _1(J,{recursive:!0,force:!0})}catch(X){}try{await _1(B$,{force:!0})}catch(X){}$.update("Finalizing environment..."),await H$(!1),$.succeed(Y.green(`BVM updated to v${Q} successfully.`)),console.log(Y.yellow("Please restart your terminal to apply changes."))},{failMessage:"Failed to upgrade BVM"})}catch($){throw Error(`Failed to upgrade BVM: ${$.message}`)}}C();F();w();R();import{homedir as J4}from"os";import{join as K4}from"path";async function u1(){await W("Gathering BVM diagnostics...",async()=>{let $={currentVersion:(await p()).version,installedVersions:await v(),aliases:await Y4(),env:{BVM_DIR:O,BVM_BIN_DIR:B,BVM_SHIMS_DIR:E,BVM_VERSIONS_DIR:L,BVM_TEST_MODE:process.env.BVM_TEST_MODE,HOME:process.env.HOME||J4()}};Z4($)})}async function Y4(){if(!await G(k))return[];let $=await c(k),q=[];for(let Q of $){let J=K4(k,Q);if(await G(J)){let Z=await Bun.file(J).text();q.push({name:Q,target:H(Z.trim())})}}return q}function Z4($){if(console.log(Y.bold(`
Directories`)),console.log(`  BVM_DIR: ${Y.cyan($.env.BVM_DIR||"")}`),console.log(`  BIN_DIR: ${Y.cyan(B)}`),console.log(`  SHIMS_DIR: ${Y.cyan(E)}`),console.log(`  VERSIONS_DIR: ${Y.cyan(L)}`),console.log(Y.bold(`
Environment`)),console.log(`  HOME: ${$.env.HOME||"n/a"}`),console.log(`  BVM_TEST_MODE: ${$.env.BVM_TEST_MODE||"false"}`),console.log(Y.bold(`
Installed Versions`)),$.installedVersions.length===0)console.log("  (none installed)");else $.installedVersions.forEach((q)=>{let Q=q===$.currentVersion,J=Q?Y.green("*"):" ",Z=Q?Y.green(q):q,K=Q?Y.green(" (current)"):"";console.log(`  ${J} ${Z}${K}`)});if(console.log(Y.bold(`
Aliases`)),$.aliases.length===0)console.log("  (no aliases configured)");else $.aliases.forEach((q)=>{console.log(`  ${q.name} ${Y.gray("->")} ${Y.cyan(q.target)}`)});console.log(`
`+Y.green("Diagnostics complete."))}var n$=["install","uninstall","use","ls","ls-remote","current","alias","unalias","run","exec","which","cache","setup","upgrade","doctor","completion","deactivate","help"],V1={bash:`#!/usr/bin/env bash
_bvm_completions() {
  COMPREPLY=( $(compgen -W "${n$.join(" ")}" -- "\${COMP_WORDS[COMP_CWORD]}") )
}
complete -F _bvm_completions bvm
`,zsh:`#compdef bvm
_bvm() {
  local -a commands
  commands=( ${n$.join(" ")} )
  _describe 'command' commands
}
compdef _bvm bvm
`,fish:`complete -c bvm -f -a "${n$.join(" ")}"
`};function d1($){let q=V1[$];if(!q)throw Error(`Unsupported shell '${$}'. Supported shells: ${Object.keys(V1).join(", ")}`);console.log(q)}C();F();w();import{join as g1}from"path";C();var m1="update-check.json",X4=86400000;async function h1(){if(process.env.CI||D)return;let $=g1(_,m1);try{if(await G($)){let q=await f($),Q=JSON.parse(q);if(Date.now()-Q.lastCheck<X4)return}}catch(q){}try{let q=await F$();if(q){let Q=q.tagName.startsWith("v")?q.tagName.slice(1):q.tagName;await N(_),await P($,JSON.stringify({lastCheck:Date.now(),latestVersion:Q}))}}catch(q){}}async function c1(){if(process.env.CI||D)return null;let $=Z$.version,q=g1(_,m1);try{if(await G(q)){let Q=await f(q),J=JSON.parse(Q);if(J.latestVersion&&k$(J.latestVersion,$))return`
${Y.gray("Update available:")} ${Y.green(`v${J.latestVersion}`)} ${Y.dim(`(current: v${$})`)}
${Y.gray("Run")} ${Y.cyan("bvm upgrade")} ${Y.gray("to update.")}`}}catch(Q){}return null}class p1{commands={};helpEntries=[];name;versionStr;constructor($){this.name=$,this.versionStr=Z$.version}command($,q,Q={}){let J=$.split(" ")[0],Z={description:q,usage:`${this.name} ${$}`,action:async()=>{},aliases:Q.aliases};if(this.commands[J]=Z,this.helpEntries.push(`  ${$.padEnd(35)} ${q}`),Q.aliases)Q.aliases.forEach((X)=>{this.commands[X]=Z});let K={action:(X)=>{return Z.action=X,K},option:(X,b)=>K};return K}async run(){h1().catch(()=>{});let{values:$,positionals:q}=b4({args:Bun.argv.slice(2),strict:!1,allowPositionals:!0,options:{help:{type:"boolean",short:"h"},version:{type:"boolean",short:"v"},silent:{type:"boolean",short:"s"}}}),Q=q[0],J=!!($.silent||$.s),Z=!!($.version||$.v||$.help||$.h);if(!Q){if($.version||$.v)console.log(this.versionStr),process.exit(0);if($.help||$.h)this.showHelp(),process.exit(0);this.showHelp(),process.exit(1)}if($.help||$.h)this.showHelp(),process.exit(0);let K=this.commands[Q];if(!K)console.error(Y.yellow(`Unknown command '${Q}'`)),this.showHelp(),process.exit(0);try{if(await K.action(q.slice(1),$),!Z&&!J&&["ls","current","doctor","default"].includes(Q)){let X=await c1();if(X)console.log(X)}}catch(X){if(!X.reported)console.error(Y.red(`\u2716 ${X.message}`));process.exit(1)}}showHelp(){console.log(`Bun Version Manager (bvm) v${this.versionStr}`),console.log(`Built with Bun \xB7 Runs with Bun \xB7 Tested on Bun
`),console.log("Usage:"),console.log(`  ${this.name} <command> [flags]
`),console.log("Commands:"),console.log(this.helpEntries.join(`
`)),console.log(`
Global Flags:`),console.log("  --help, -h                     Show this help message"),console.log("  --version, -v                  Show version number"),console.log(`
Examples:`),console.log("  bvm install 1.0.0"),console.log("  bvm use 1.0.0"),console.log("  bvm run 1.0.0 index.ts")}}async function G4(){let $=new p1("bvm");$.command("rehash","Regenerate shims for all installed binaries").action(async()=>{await J$()}),$.command("install [version]","Install a Bun version and set as current").option("--global, -g","Install as a global tool (not just default)").action(async(q,Q)=>{await h$(q[0],{global:Q.global||Q.g})}),$.command("i [version]","Alias for install").action(async(q,Q)=>{await h$(q[0],{global:Q.global||Q.g})}),$.command("ls","List installed Bun versions",{aliases:["list"]}).action(async()=>{await A1()}),$.command("ls-remote","List all available remote Bun versions").action(async()=>{await N1()}),$.command("use <version>","Switch the active Bun version immediately (all terminals)").action(async(q)=>{if(!q[0])throw Error("Version is required");await A$(q[0])}),$.command("shell <version>","Switch Bun version for the current shell session").action(async(q)=>{if(!q[0])throw Error("Version is required");await D1(q[0])}),$.command("default [version]","Display or set the global default Bun version").action(async(q)=>{await I1(q[0])}),$.command("current","Display the currently active Bun version").action(async()=>{await j1()}),$.command("uninstall <version>","Uninstall a Bun version").action(async(q)=>{if(!q[0])throw Error("Version is required");await M1(q[0])}),$.command("alias <name> <version>","Create an alias for a Bun version").action(async(q)=>{if(!q[0]||!q[1])throw Error("Name and version are required");await W$(q[0],q[1])}),$.command("unalias <name>","Remove an existing alias").action(async(q)=>{if(!q[0])throw Error("Alias name is required");await B1(q[0])}),$.command("run <version> [...args]","Run a command with a specific Bun version").action(async(q)=>{let Q=q[0];if(!Q)throw Error("Version is required");let J=process.argv.indexOf("run"),Z=J!==-1?process.argv.slice(J+2):[];await f1(Q,Z)}),$.command("exec <version> <cmd> [...args]","Execute a command with a specific Bun version's environment").action(async(q)=>{let Q=q[0],J=q[1];if(!Q||!J)throw Error("Version and command are required");let Z=process.argv.indexOf("exec"),K=Z!==-1?process.argv.slice(Z+3):[];await T1(Q,J,K)}),$.command("which [version]","Display path to installed bun version").action(async(q)=>{await R1(q[0])}),$.command("deactivate","Undo effects of bvm on current shell").action(async()=>{await S1()}),$.command("version <spec>","Resolve the given description to a single local version").action(async(q)=>{if(!q[0])throw Error("Version specifier is required");await d$(q[0])}),$.command("cache <action>","Manage bvm cache").action(async(q)=>{if(!q[0])throw Error("Action is required");await E1(q[0])}),$.command("setup","Configure shell environment automatically").option("--silent, -s","Suppress output").action(async(q,Q)=>{await H$(!(Q.silent||Q.s))}),$.command("upgrade","Upgrade bvm to the latest version",{aliases:["self-update"]}).action(async()=>{await P1()}),$.command("doctor","Show diagnostics for Bun/BVM setup").action(async()=>{await u1()}),$.command("completion <shell>","Generate shell completion script (bash|zsh|fish)").action(async(q)=>{if(!q[0])throw Error("Shell name is required");d1(q[0])}),await $.run(),process.exit(0)}G4().catch(($)=>{console.error(Y.red(`
[FATAL ERROR] Unexpected Crash:`)),console.error($),process.exit(1)});
