#!/usr/bin/env bun
// @bun
var o1=Object.create;var{getPrototypeOf:i1,defineProperty:B$,getOwnPropertyNames:a1}=Object;var s1=Object.prototype.hasOwnProperty;var U$=($,q,Q)=>{Q=$!=null?o1(i1($)):{};let J=q||!$||!$.__esModule?B$(Q,"default",{value:$,enumerable:!0}):Q;for(let Y of a1($))if(!s1.call(J,Y))B$(J,Y,{get:()=>$[Y],enumerable:!0});return J};var s$=($,q)=>{for(var Q in q)B$($,Q,{get:q[Q],enumerable:!0,configurable:!0,set:(J)=>q[Q]=()=>J})};var y$=($,q)=>()=>($&&(q=$($=0)),q);var O$=import.meta.require;var e$={};s$(e$,{getBvmDir:()=>r$,getBunAssetName:()=>D$,USER_AGENT:()=>X$,TEST_REMOTE_VERSIONS:()=>Z$,REPO_FOR_BVM_CLI:()=>q6,OS_PLATFORM:()=>j,IS_TEST_MODE:()=>R,EXECUTABLE_NAME:()=>T,CPU_ARCH:()=>z$,BVM_VERSIONS_DIR:()=>w,BVM_SRC_DIR:()=>M$,BVM_SHIMS_DIR:()=>E,BVM_FINGERPRINTS_FILE:()=>f$,BVM_DIR:()=>z,BVM_CURRENT_DIR:()=>b$,BVM_COMPONENTS:()=>K6,BVM_CDN_ROOT:()=>J6,BVM_CACHE_DIR:()=>_,BVM_BIN_DIR:()=>B,BVM_ALIAS_DIR:()=>C,BUN_GITHUB_RELEASES_API:()=>$6,ASSET_NAME_FOR_BVM:()=>Q6});import{homedir as e1}from"os";import{join as i}from"path";function r$(){let $=process.env.HOME||e1();return i($,".bvm")}function D$($){return`bun-${j==="win32"?"windows":j}-${z$==="arm64"?"aarch64":"x64"}.zip`}var j,z$,R,Z$,z,M$,w,B,E,b$,C,_,f$,T,$6="https://api.github.com/repos/oven-sh/bun/releases",q6="EricLLLLLL/bvm",Q6,X$="bvm (Bun Version Manager)",J6,K6;var N=y$(()=>{j=process.platform,z$=process.arch,R=process.env.BVM_TEST_MODE==="true",Z$=["v1.3.4","v1.2.23","v1.0.0","bun-v1.4.0-canary"];z=r$(),M$=i(z,"src"),w=i(z,"versions"),B=i(z,"bin"),E=i(z,"shims"),b$=i(z,"current"),C=i(z,"aliases"),_=i(z,"cache"),f$=i(z,"fingerprints.json"),T=j==="win32"?"bun.exe":"bun",Q6=j==="win32"?"bvm.exe":"bvm",J6=process.env.BVM_CDN_URL||"https://cdn.jsdelivr.net/gh/EricLLLLLL/bvm",K6=[{name:"CLI Core",remotePath:"index.js",localPath:"src/index.js"},{name:"Windows Shim",remotePath:"bvm-shim.js",localPath:"bin/bvm-shim.js",platform:"win32"},{name:"Unix Shim",remotePath:"bvm-shim.sh",localPath:"bin/bvm-shim.sh",platform:"posix"}]});function c($){if(!$)return null;return $.match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/)?$:null}function $1($){let q=c($);return q?q.replace(/^v/,""):null}function J$($){if(!$)return null;let q=$.replace(/^v/,""),J=q.split(/[-+]/)[0].split(".").map(Number);if(J.length===0||J.some((K)=>isNaN(K)))return null;let Y=q.includes("-")?q.split("-")[1].split("+")[0]:void 0;return{major:J[0],minor:J[1],patch:J[2],pre:Y}}function R$($,q){if(!$||!q)return 0;if($.major!==q.major)return $.major-q.major;if($.minor!==q.minor)return $.minor-q.minor;if($.patch!==q.patch)return $.patch-q.patch;if($.pre&&!q.pre)return-1;if(!$.pre&&q.pre)return 1;if($.pre&&q.pre)return $.pre.localeCompare(q.pre);return 0}function q1($,q){let Q=J$($),J=J$(q);return R$(Q,J)}function K$($,q){return q1(q,$)}function C$($,q){return q1($,q)>0}function Q1($,q){if(q==="*"||q===""||q==="latest")return!0;let Q=J$($);if(!Q)return!1;let J=q;if(q.startsWith("v"))J=q.substring(1);if($1($)===$1(q))return!0;let Y=J.split(".");if(Y.length===1){let K=Number(Y[0]);if(Q.major===K)return!0}else if(Y.length===2){let K=Number(Y[0]),b=Number(Y[1]);if(Q.major===K&&Q.minor===b)return!0}if(q.startsWith("~")){let K=J$(q.substring(1));if(!K)return!1;let b=K.patch??0;return Q.major===K.major&&Q.minor===K.minor&&Q.patch>=b}if(q.startsWith("^")){let K=J$(q.substring(1));if(!K)return!1;let b=K.patch??0,X=K.minor??0;if(K.major===0){if(Q.major!==0)return!1;if(Q.minor!==X)return!1;return Q.patch>=b}if(Q.major!==K.major)return!1;if(Q.minor<X)return!1;if(Q.minor===X&&Q.patch<b)return!1;return!0}return!1}import{readdir as Z6,mkdir as b6,stat as J1,symlink as X6,unlink as K1,rm as Y1,readlink as G6}from"fs/promises";import{join as k$,dirname as W6,basename as H6}from"path";async function f($){try{await b6($,{recursive:!0})}catch(q){if(q.code==="EEXIST")try{if((await J1($)).isDirectory())return}catch{}throw q}}async function G($){try{return await J1($),!0}catch(q){if(q.code==="ENOENT")return!1;throw q}}async function Z1($,q){try{await K1(q)}catch(J){try{await Y1(q,{recursive:!0,force:!0})}catch(Y){}}let Q=process.platform==="win32"?"junction":"dir";await X6($,q,Q)}async function b1($){try{return await G6($)}catch(q){if(q.code==="ENOENT"||q.code==="EINVAL")return null;throw q}}async function G$($){await Y1($,{recursive:!0,force:!0})}async function l($){try{return await Z6($)}catch(q){if(q.code==="ENOENT")return[];throw q}}async function M($){return await Bun.file($).text()}async function g($,q){await Bun.write($,q)}async function L$($,q,Q={}){let{backup:J=!0}=Q,Y=W6($);await f(Y);let K=`${$}.tmp-${Date.now()}`,b=`${$}.bak`;try{if(await g(K,q),J&&await G($))try{let{rename:W,unlink:O}=await import("fs/promises");if(await G(b))await O(b).catch(()=>{});await W($,b)}catch(W){}let{rename:X}=await import("fs/promises");try{await X(K,$)}catch(W){await Bun.write($,q),await K1(K).catch(()=>{})}}catch(X){let{unlink:W}=await import("fs/promises");throw await W(K).catch(()=>{}),X}}function U($){let q=$.trim();if(q.startsWith("bun-v"))q=q.substring(4);if(!q.startsWith("v")&&/^\d/.test(q))q=`v${q}`;return q}async function u(){return await f(w),(await l(w)).filter((q)=>c(U(q))).sort(K$)}async function t(){if(process.env.BVM_ACTIVE_VERSION)return{version:U(process.env.BVM_ACTIVE_VERSION),source:"env"};let $=k$(process.cwd(),".bvmrc");if(await G($)){let b=(await M($)).trim();return{version:U(b),source:".bvmrc"}}let{getBvmDir:q}=await Promise.resolve().then(() => (N(),e$)),Q=q(),J=k$(Q,"current"),Y=k$(Q,"aliases");if(await G(J)){let{realpath:b}=await import("fs/promises");try{let X=await b(J);return{version:U(H6(X)),source:"current"}}catch(X){}}let K=k$(Y,"default");if(await G(K)){let b=(await M(K)).trim();return{version:U(b),source:"default"}}return{version:null,source:null}}function e($,q){if(!$||q.length===0)return null;let Q=U($);if(q.includes(Q))return Q;if($.toLowerCase()==="latest")return q[0];if(/^\d+\.\d+\.\d+$/.test($.replace(/^v/,"")))return null;if(!/^[v\d]/.test($))return null;let Y=$.startsWith("v")?`~${$.substring(1)}`:`~${$}`,K=q.filter((b)=>Q1(b,Y));if(K.length>0)return K.sort(K$)[0];return null}var x=y$(()=>{N()});class T${timer=null;frames=process.platform==="win32"?["-"]:["\u280B","\u2819","\u2839","\u2838","\u283C","\u2834","\u2826","\u2827","\u2807","\u280F"];frameIndex=0;text;isWindows=process.platform==="win32";constructor($){this.text=$}start($){if($)this.text=$;if(this.timer)return;if(this.isWindows){process.stdout.write(`${Z.cyan(">")} ${this.text}
`);return}this.timer=setInterval(()=>{process.stdout.write(`\r\x1B[K${Z.cyan(this.frames[this.frameIndex])} ${this.text}`),this.frameIndex=(this.frameIndex+1)%this.frames.length},80)}stop(){if(this.isWindows)return;if(this.timer)clearInterval(this.timer),this.timer=null,process.stdout.write("\r\x1B[K");process.stdout.write("\x1B[?25h")}succeed($){this.stop(),console.log(`${Z.green("  \u2713")} ${$||this.text}`)}fail($){this.stop(),console.log(`${Z.red("  \u2716")} ${$||this.text}`)}info($){this.stop(),console.log(`${Z.blue("  \u2139")} ${$||this.text}`)}update($){if(this.text=$,this.isWindows)console.log(Z.dim(`  ... ${this.text}`))}}class I${total;current=0;width=20;constructor($){this.total=$}start(){process.stdout.write("\x1B[?25l"),this.render()}update($,q){this.current=$,this.render(q)}stop(){process.stdout.write(`\x1B[?25h
`)}render($){let q=Math.min(1,this.current/this.total),Q=Math.round(this.width*q),J=this.width-Q,Y=process.platform==="win32",K=Y?"=":"\u2588",b=Y?"-":"\u2591",X=Z.green(K.repeat(Q))+Z.gray(b.repeat(J)),W=(q*100).toFixed(0).padStart(3," "),O=(this.current/1048576).toFixed(1),F=(this.total/1048576).toFixed(1),H=$?` ${$.speed}KB/s`:"";process.stdout.write(`\r\x1B[2K ${X} ${W}% | ${O}/${F}MB${H}`)}}var U6,y6=($)=>$.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),a=($,q,Q=$)=>(J)=>U6?$+J.replace(new RegExp(y6(q),"g"),Q)+q:J,Z;var k=y$(()=>{U6=!process.env.NO_COLOR,Z={red:a("\x1B[1;31m","\x1B[39m"),green:a("\x1B[1;32m","\x1B[39m"),yellow:a("\x1B[1;33m","\x1B[39m"),blue:a("\x1B[1;34m","\x1B[39m"),magenta:a("\x1B[1;35m","\x1B[39m"),cyan:a("\x1B[1;36m","\x1B[39m"),gray:a("\x1B[90m","\x1B[39m"),bold:a("\x1B[1m","\x1B[22m","\x1B[22m\x1B[1m"),dim:a("\x1B[2m","\x1B[22m","\x1B[22m\x1B[2m")}});async function y($,q,Q){if(process.platform==="win32"){console.log(Z.cyan(`> ${$}`));let K={start:(b)=>{if(b)console.log(Z.cyan(`> ${b}`))},stop:()=>{},succeed:(b)=>console.log(Z.green(`  \u2713 ${b}`)),fail:(b)=>console.log(Z.red(`  \u2716 ${b}`)),info:(b)=>console.log(Z.cyan(`  \u2139 ${b}`)),update:(b)=>console.log(Z.dim(`  ... ${b}`)),isSpinning:!1};try{return await q(K)}catch(b){let X=z1(b,Q?.failMessage);if(console.log(Z.red(`  \u2716 ${X}`)),process.env.BVM_DEBUG,console.log(Z.dim(`    Details: ${b.message}`)),b.code)console.log(Z.dim(`    Code: ${b.code}`));throw b.reported=!0,b}}let Y=new T$($);Y.start();try{let K=await q(Y);return Y.stop(),K}catch(K){let b=z1(K,Q?.failMessage);throw Y.fail(Z.red(b)),K.reported=!0,K}}function z1($,q){let Q=$ instanceof Error?$.message:String($);if(!q)return Q;if(typeof q==="function")return q($);return`${q}: ${Q}`}var D=y$(()=>{k()});var L1={};s$(L1,{resolveLocalVersion:()=>h,displayVersion:()=>h$});import{join as v6}from"path";async function h($){if($==="current"){let{version:Y}=await t();return Y}if($==="latest"){let Y=await u();if(Y.length>0)return Y[0];return null}let q=v6(C,$);if(await G(q))try{let Y=(await M(q)).trim();return U(Y)}catch{return null}let Q=U($),J=await u();return e($,J)}async function h$($){await y(`Resolving version '${$}'...`,async()=>{let q=await h($);if(q)console.log(q);else throw Error("N/A")},{failMessage:`Failed to resolve version '${$}'`})}var q$=y$(()=>{N();x();D()});import{parseArgs as K4}from"util";var Y$={name:"bvm-core",version:"1.1.18",description:"The native version manager for Bun. Cross-platform, shell-agnostic, and zero-dependency.",main:"dist/index.js",bin:{bvm:"bin/bvm-npm.js"},publishConfig:{access:"public"},scripts:{dev:"bun run src/index.ts",build:"bun build src/index.ts --target=bun --outfile dist/index.js --minify && bun run scripts/sync-runtime.ts",test:"bun test",bvm:"bun run src/index.ts","bvm:sandbox":'mkdir -p "$PWD/.sandbox-home" && HOME="$PWD/.sandbox-home" bun run src/index.ts',release:"bun run scripts/release.ts","test:e2e:npm":"bun run scripts/verify-e2e-npm.ts","sync-runtime":"bun run scripts/sync-runtime.ts",postinstall:"node scripts/postinstall.js"},repository:{type:"git",url:"git+https://github.com/EricLLLLLL/bvm.git"},keywords:["bun","version-manager","cli","bvm","nvm","nvm-windows","fnm","nodenv","bun-nvm","version-switching"],files:["dist/index.js","dist/bvm-shim.sh","dist/bvm-shim.js","bin/bvm-npm.js","scripts/postinstall.js","install.sh","install.ps1","README.md"],author:"EricLLLLLL",license:"MIT",type:"commonjs",dependencies:{"cli-progress":"^3.12.0"},optionalDependencies:{"@oven/bun-darwin-aarch64":"^1.3.6","@oven/bun-darwin-x64":"^1.3.6","@oven/bun-linux-aarch64":"^1.3.6","@oven/bun-linux-x64":"^1.3.6","@oven/bun-windows-x64":"^1.3.6"},devDependencies:{"@types/bun":"^1.3.4","@types/cli-progress":"^3.11.6","@types/node":"^24.10.2",bun:"^1.3.6",esbuild:"^0.27.2",execa:"^9.6.1",typescript:"^5"},peerDependencies:{typescript:"^5"}};N();x();import{join as o,basename as g6,dirname as d6}from"path";N();x();k();import{join as L6}from"path";function X1($,q){if($==="darwin"){if(q==="arm64")return"@oven/bun-darwin-aarch64";if(q==="x64")return"@oven/bun-darwin-x64"}if($==="linux"){if(q==="arm64")return"@oven/bun-linux-aarch64";if(q==="x64")return"@oven/bun-linux-x64"}if($==="win32"){if(q==="x64")return"@oven/bun-windows-x64"}return null}function G1($,q,Q){let J=Q;if(!J.endsWith("/"))J+="/";let Y=$.startsWith("@"),K=$;if(Y){let X=$.split("/");if(X.length===2)K=X[1]}let b=`${K}-${q}.tgz`;return`${J}${$}/-/${b}`}k();async function d($,q={}){let{cwd:Q,env:J,prependPath:Y,stdin:K="inherit",stdout:b="inherit",stderr:X="inherit"}=q,W={...process.env,...J};if(Y){let H=W.PATH||"",A=process.platform==="win32"?";":":";W.PATH=`${Y}${A}${H}`}let F=await Bun.spawn({cmd:$,cwd:Q,env:W,stdin:K,stdout:b,stderr:X}).exited;if((F??0)!==0)throw Error(`${Z.red("Command failed")}: ${$.join(" ")} (code ${F})`);return F??0}async function s($,q={}){let{timeout:Q=5000,...J}=q,Y=new AbortController,K=setTimeout(()=>Y.abort(),Q);try{let b=await fetch($,{...J,signal:Y.signal});return clearTimeout(K),b}catch(b){if(clearTimeout(K),b.name==="AbortError")throw Error(`Request to ${$} timed out after ${Q}ms`);throw b}}async function O6($,q=2000){if($.length===0)throw Error("No URLs to race");if($.length===1)return $[0];return new Promise((Q,J)=>{let Y=0,K=!1;$.forEach((b)=>{s(b,{method:"HEAD",timeout:q}).then((X)=>{if(X.ok&&!K)K=!0,Q(b);else if(!K){if(Y++,Y===$.length)J(Error("All requests failed"))}}).catch(()=>{if(!K){if(Y++,Y===$.length)J(Error("All requests failed"))}})})})}async function z6(){try{let $=await s("https://1.1.1.1/cdn-cgi/trace",{timeout:500});if(!$.ok)return null;let Q=(await $.text()).match(/loc=([A-Z]{2})/);return Q?Q[1]:null}catch($){return null}}var E$=null,w$={NPM:"https://registry.npmjs.org",TAOBAO:"https://registry.npmmirror.com",TENCENT:"https://mirrors.cloud.tencent.com/npm/"};async function $$(){if(E$)return E$;let $=await z6(),q=[];if($==="CN")q=[w$.TAOBAO,w$.TENCENT,w$.NPM];else q=[w$.NPM,w$.TAOBAO];try{let Q=await O6(q,2000);return E$=Q,Q}catch(Q){return q[0]}}x();var w6="bun-versions.json",x6=3600000;async function C6(){if(R)return[...Z$];let $=L6(_,w6);try{if(await G($)){let Y=await M($),K=JSON.parse(Y);if(Date.now()-K.timestamp<x6&&Array.isArray(K.versions))return K.versions}}catch(Y){}let q=await $$(),Q=[q];if(q!=="https://registry.npmjs.org")Q.push("https://registry.npmjs.org");let J=null;for(let Y of Q){let K=`${Y.replace(/\/$/,"")}/bun`;try{let b=await s(K,{headers:{"User-Agent":X$,Accept:"application/vnd.npm.install-v1+json"},timeout:1e4});if(!b.ok)throw Error(`Status ${b.status}`);let X=await b.json();if(!X.versions)throw Error("Invalid response (no versions)");let W=Object.keys(X.versions);try{await f(_),await g($,JSON.stringify({timestamp:Date.now(),versions:W}))}catch(O){}return W}catch(b){J=b}}throw J||Error("Failed to fetch versions from any registry.")}async function k6(){if(R)return[...Z$];return new Promise(($,q)=>{let Q=[];try{let J=Bun.spawn(["git","ls-remote","--tags","https://github.com/oven-sh/bun.git"],{stdout:"pipe",stderr:"pipe"}),Y=setTimeout(()=>{J.kill(),q(Error("Git operation timed out"))},1e4);new Response(J.stdout).text().then((b)=>{clearTimeout(Y);let X=b.split(`
`);for(let W of X){let O=W.match(/refs\/tags\/bun-v?(\d+\.\d+\.\d+.*)$/);if(O)Q.push(O[1])}$(Q)}).catch((b)=>{clearTimeout(Y),q(b)})}catch(J){q(Error(`Failed to run git: ${J.message}`))}})}async function W1(){if(R)return[...Z$];try{let q=(await C6()).filter((Q)=>c(Q)).map((Q)=>({v:Q,parsed:J$(Q)}));return q.sort((Q,J)=>R$(J.parsed,Q.parsed)),q.map((Q)=>Q.v)}catch($){try{let q=await k6();if(q.length>0)return Array.from(new Set(q.filter((J)=>c(J)))).sort(K$);throw Error("No versions found via Git")}catch(q){throw Error(`Failed to fetch versions. NPM: ${$.message}. Git: ${q.message}`)}}}async function H1($){if(R)return Z$.includes($)||$==="latest";let q=await $$(),Q=$.replace(/^v/,""),J=`${q}/bun/${Q}`,Y=j==="win32"?"curl.exe":"curl",K=async()=>{try{return await d([Y,"-I","-f","-m","5","-s",J],{stdout:"ignore",stderr:"ignore"}),!0}catch(X){return!1}},b=new Promise((X)=>setTimeout(()=>X(!1),1e4));return Promise.race([K(),b])}async function U1(){if(R)return{latest:"1.1.20"};let q=`${await $$()}/-/package/bun/dist-tags`;try{let Q=await s(q,{headers:{"User-Agent":X$},timeout:5000});if(Q.ok)return await Q.json()}catch(Q){}return{}}async function y1($){let q=U($);if(!c(q))return console.error(Z.red(`Invalid version provided to findBunDownloadUrl: ${$}`)),null;if(R)return{url:`https://example.com/${D$(q)}`,foundVersion:q};let Y=X1(j==="win32"?"win32":j,z$==="arm64"?"arm64":"x64");if(!Y)throw Error(`Unsupported platform/arch for NPM download: ${j}-${z$}`);let K="";if(process.env.BVM_REGISTRY)K=process.env.BVM_REGISTRY;else if(process.env.BVM_DOWNLOAD_MIRROR)K=process.env.BVM_DOWNLOAD_MIRROR;else K=await $$();let b=q.replace(/^v/,"");return{url:G1(Y,b,K),foundVersion:q}}async function F$(){try{let q=(await $$()).replace(/\/$/,""),Q=await s(`${q}/-/package/bvm-core/dist-tags`,{headers:{"User-Agent":X$},timeout:5000});if(!Q.ok)return null;let Y=(await Q.json()).latest;if(!Y)return null;let K=await s(`${q}/bvm-core/${Y}`,{headers:{"User-Agent":X$},timeout:5000});if(K.ok){let b=await K.json();return{version:Y,tarball:b.dist.tarball,integrity:b.dist.integrity,shasum:b.dist.shasum}}}catch($){}return null}k();N();import{spawn as F6}from"child_process";async function O1($,q){if($.endsWith(".zip"))if(j==="win32")await d(["powershell","-Command",`Expand-Archive -Path "${$}" -DestinationPath "${q}" -Force`],{stdout:"ignore",stderr:"inherit"});else await d(["unzip","-o","-q",$,"-d",q],{stdout:"ignore",stderr:"inherit"});else if($.endsWith(".tar.gz")||$.endsWith(".tgz"))await new Promise((Q,J)=>{let Y=F6("tar",["-xzf",$,"-C",q],{stdio:"inherit",shell:!1});Y.on("close",(K)=>{if(K===0)Q();else J(Error(`tar exited with code ${K}`))}),Y.on("error",(K)=>J(K))});else throw Error(`Unsupported archive format: ${$}`)}import{chmod as m$}from"fs/promises";x();N();k();import{join as L,dirname as R6}from"path";import{homedir as v}from"os";import{mkdir as d$}from"fs/promises";import{chmod as x$}from"fs/promises";var S$=`#!/bin/bash

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
`;var v$=`#!/bin/bash
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
`;var P$=`const path = require('path');
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
`;var u$=`@echo off
set "BVM_DIR=%USERPROFILE%\\.bvm"

:: Fast-path: If no .bvmrc in current directory, run default directly
if not exist ".bvmrc" (
    "%BVM_DIR%\\runtime\\current\\bin\\bun.exe" %*
    exit /b %errorlevel%
)

:: Slow-path: Hand over to JS shim for version resolution
"%BVM_DIR%\\runtime\\current\\bin\\bun.exe" "%BVM_DIR%\\bin\\bvm-shim.js" "bun" %*

`;var V$=`@echo off
set "BVM_DIR=%USERPROFILE%\\.bvm"

if not exist ".bvmrc" (
    "%BVM_DIR%\\runtime\\current\\bin\\bun.exe" %*
    exit /b %errorlevel%
)

"%BVM_DIR%\\runtime\\current\\bin\\bun.exe" "%BVM_DIR%\\bin\\bvm-shim.js" "bunx" %*

`;var g$=`@echo off
set "BVM_DIR=%USERPROFILE%\\.bvm"
"%BVM_DIR%\\runtime\\current\\bin\\bun.exe" "%BVM_DIR%\\src\\index.js" %*
`;async function W$($=!0){if(await T6($),process.platform==="win32"){await I6($);return}let q=process.env.SHELL||"",Q="",J="";if(q.includes("zsh"))J="zsh",Q=L(v(),".zshrc");else if(q.includes("bash"))if(J="bash",process.platform==="darwin")if(await G(L(v(),".bashrc")))Q=L(v(),".bashrc");else Q=L(v(),".bash_profile");else Q=L(v(),".bashrc");else if(q.includes("fish"))J="fish",Q=L(v(),".config","fish","config.fish");else if(await G(L(v(),".zshrc")))J="zsh",Q=L(v(),".zshrc");else if(await G(L(v(),".config","fish","config.fish")))J="fish",Q=L(v(),".config","fish","config.fish");else if(await G(L(v(),".bashrc")))J="bash",Q=L(v(),".bashrc");else if(await G(L(v(),".bash_profile")))J="bash",Q=L(v(),".bash_profile");else{if($)console.log(Z.yellow(`Could not detect a supported shell (zsh, bash, fish). Please manually add ${B} to your PATH.`));return}let Y=L(B,"bvm-init.sh");await Bun.write(Y,S$),await x$(Y,493);let K=L(B,"bvm-init.fish");await Bun.write(K,_$),await x$(K,493);let b="";try{b=await Bun.file(Q).text()}catch(H){if(H.code==="ENOENT")await Bun.write(Q,""),b="";else throw H}let X="# >>> bvm initialize >>>",W="# <<< bvm initialize <<<",O=`${X}
# !! Contents within this block are managed by 'bvm setup' !!
export BVM_DIR="${z}"
export PATH="$BVM_DIR/shims:$BVM_DIR/bin:$PATH"
# Reset current version to default for new terminal sessions
[ -L "$BVM_DIR/current" ] && rm "$BVM_DIR/current"
${W}`,F=`# >>> bvm initialize >>>
# !! Contents within this block are managed by 'bvm setup' !!
set -Ux BVM_DIR "${z}"
fish_add_path "$BVM_DIR/shims"
fish_add_path "$BVM_DIR/bin"
# Reset current version to default
if test -L "$BVM_DIR/current"
    rm "$BVM_DIR/current"
end
# <<< bvm initialize <<<`;if($)console.log(Z.cyan(`Configuring ${J} environment in ${Q}...`));try{let H=b,A=X.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),m=W.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),P=new RegExp(`${A}[\\s\\S]*?${m}`,"g");if(b.includes(X))H=b.replace(P,"").trim();let V=J==="fish"?F:O;if(H=(H?H+`

`:"")+V+`
`,H!==b){if(await Bun.write(Q,H),$)console.log(Z.green(`\u2713 Successfully updated BVM configuration in ${Q}`)),console.log(Z.gray("  (Moved configuration to the end of file to ensure PATH precedence)"))}if($)console.log(Z.yellow(`Please restart your terminal or run "source ${Q}" to apply changes.`))}catch(H){console.error(Z.red(`Failed to write to ${Q}: ${H.message}`))}}async function T6($){if($)console.log(Z.cyan("Refreshing shims and wrappers..."));if(!$)console.log(`[DEBUG] BIN_DIR: ${B}`),console.log(`[DEBUG] SHIMS_DIR: ${E}`);if(await d$(B,{recursive:!0}),await d$(E,{recursive:!0}),process.platform==="win32")await Bun.write(L(B,"bvm-shim.js"),P$),await Bun.write(L(B,"bvm.cmd"),g$),await Bun.write(L(E,"bun.cmd"),u$),await Bun.write(L(E,"bunx.cmd"),V$);else{let Q=L(B,"bvm-shim.sh");await Bun.write(Q,v$),await x$(Q,493);let J="",Y=L(z,"runtime","current","bin","bun"),K=L(M$,"index.js");if(process.env.BVM_INSTALL_SOURCE==="npm")J=`#!/bin/bash
export BVM_DIR="${z}"
export BVM_INSTALL_SOURCE="npm"
if [ -f "${Y}" ]; then
  exec "${Y}" "${K}" "$@"
elif command -v bun >/dev/null 2>&1; then
  exec bun "${K}" "$@"
else
  # Last resort: use the node entry point if it's an NPM install
  # This is only possible if we are in the original NPM environment
  # We'll leave this as a hint or a very specific fallback
  echo "Error: BVM Bunker Runtime not found. Attempting emergency fallback..."
  node -e "require('child_process').spawnSync('node', [require('path').join(process.env.BVM_DIR, '../', 'bin/bvm-npm.js'), ...process.argv.slice(1)], {stdio:'inherit'})" "$@"
fi
`;else J=`#!/bin/bash
export BVM_DIR="${z}"
exec "${Y}" "${K}" "$@"`;let b=L(B,"bvm");await Bun.write(b,J),await x$(b,493);for(let X of["bun","bunx"]){let W=`#!/bin/bash
export BVM_DIR="${z}"
exec "${z}/bin/bvm-shim.sh" "${X}" "$@"`,O=L(E,X);await Bun.write(O,W),await x$(O,493)}}}async function I6($=!0){let q="";try{q=Bun.spawnSync({cmd:["powershell","-NoProfile","-Command","echo $PROFILE.CurrentUserAllHosts"],stdout:"pipe"}).stdout.toString().trim()}catch(Q){q=L(v(),"Documents","WindowsPowerShell","Microsoft.PowerShell_profile.ps1")}if(!q)return;await d$(R6(q),{recursive:!0}),await E6(q,$)}async function E6($,q=!0){let Q=`
# BVM Configuration
$env:BVM_DIR = "${z}"
$env:PATH = "$env:BVM_DIRshims;$env:BVM_DIR\bin;$env:PATH"
# Auto-activate default version
if (Test-Path "$env:BVM_DIR\bin\bvm.cmd") {
    & "$env:BVM_DIR\bin\bvm.cmd" use default --silent *>$null
}
`;try{let J="";if(await G($))J=await Bun.file($).text();else await Bun.write($,"");if(J.includes("$env:BVM_DIR")){if(q)console.log(Z.gray("\u2713 Configuration is already up to date."));return}if(q)console.log(Z.cyan(`Configuring PowerShell environment in ${$}...`));if(await Bun.write($,J+`\r
${Q}`),q)console.log(Z.green(`\u2713 Successfully configured BVM path in ${$}`)),console.log(Z.yellow("Please restart your terminal to apply changes."))}catch(J){console.error(Z.red(`Failed to write to ${$}: ${J.message}`))}}x();import{join as S6,dirname as _6}from"path";async function N$(){let $=process.cwd();while(!0){let q=S6($,".bvmrc");if(await G(q))try{return(await Bun.file(q).text()).trim()}catch(J){return null}let Q=_6($);if(Q===$)break;$=Q}return null}k();N();x();q$();D();import{join as w1}from"path";async function H$($,q,Q={}){let J=async(Y)=>{let K=await h(q);if(!K){if(!Q.silent)console.log(Z.blue(`Please install Bun ${q} first using: bvm install ${q}`));throw Error(`Bun version '${q}' is not installed. Cannot create alias.`)}let b=w1(w,K);if(!await G(b))throw Error(`Internal Error: Resolved Bun version ${K} not found.`);await f(C);let X=w1(C,$);if($!=="default"&&await G(X))throw Error(`Alias '${$}' already exists. Use 'bvm alias ${$} <new-version>' to update or 'bvm unalias ${$}' to remove.`);if(await g(X,`${K}
`),Y)Y.succeed(Z.green(`Alias '${$}' created for Bun ${K}.`))};if(Q.silent)await J();else await y(`Creating alias '${$}' for Bun ${q}...`,(Y)=>J(Y),{failMessage:`Failed to create alias '${$}'`})}D();N();x();k();import{join as x1}from"path";q$();D();async function A$($,q={}){let Q=$;if(!Q)Q=await N$()||void 0;if(!Q){if(!q.silent)console.error(Z.red("No version specified. Usage: bvm use <version>"));throw Error("No version specified.")}let J=async(Y)=>{let K=null,b=await h(Q);if(b)K=b;else{let F=(await u()).map((H)=>U(H));K=e(Q,F)}if(!K)throw Error(`Bun version '${Q}' is not installed.`);let X=U(K),W=x1(w,X),O=x1(W,"bin",T);if(!await G(O))throw Error(`Version ${X} is not properly installed (binary missing).`);if(await Z1(W,b$),Y)Y.succeed(Z.green(`Now using Bun ${X} (immediate effect).`))};if(q.silent)await J();else await y(`Switching to Bun ${Q}...`,(Y)=>J(Y),{failMessage:()=>`Failed to switch to Bun ${Q}`})}N();x();k();import{join as n,dirname as C1}from"path";import{chmod as k1,unlink as P6}from"fs/promises";var __dirname="/Users/leiliao/MyWorkspace/bvm/src/commands",u6=($)=>`@echo off
set "BVM_DIR=%USERPROFILE%.bvm"
if exist "%BVM_DIR%\runtimecurrent\bin\bun.exe" (
    "%BVM_DIR%\runtimecurrent\bin\bun.exe" "%BVM_DIR%\bin\bvm-shim.js" "${$}" %*
) else (
    echo BVM Error: Bun runtime not found.
    exit /b 1
)`,V6=($)=>`#!/bin/bash
export BVM_DIR="${z}"
exec "${n(B,"bvm-shim.sh")}" "${$}" "$@"`;async function Q$(){await f(E),await f(B);let $=j==="win32";try{let Q=n(C1(C1(__dirname)),"src","templates");if($){let J=await Bun.file(n(Q,"bvm-shim.js")).text();await Bun.write(n(B,"bvm-shim.js"),J)}else{let J=await Bun.file(n(Q,"bvm-shim.sh")).text(),Y=n(B,"bvm-shim.sh");await Bun.write(Y,J),await k1(Y,493)}}catch(Q){}let q=new Set(["bun","bunx"]);if(await G(w)){let Q=await l(w);for(let J of Q){if(J.startsWith("."))continue;let Y=n(w,J,"bin");if(await G(Y)){let K=await l(Y);for(let b of K){let X=b.replace(/\.(exe|ps1|cmd)$/i,"");if(X)q.add(X)}}}}for(let Q of q)if($){await Bun.write(n(E,`${Q}.cmd`),u6(Q));let J=n(E,`${Q}.ps1`);if(await G(J))await P6(J)}else{let J=n(E,Q);await Bun.write(J,V6(Q)),await k1(J,493)}console.log(Z.green(`\u2713 Regenerated ${q.size} shims in ${E}`))}import{rename as h6,rm as N1}from"fs/promises";async function c$($,q){try{await h6($,q)}catch(Q){await Bun.write(Bun.file(q),Bun.file($)),await N1($,{force:!0})}}async function F1($,q,Q,J){let Y=await fetch($);if(!Y.ok)throw Error(`Status ${Y.status}`);let K=+(Y.headers.get("Content-Length")||0),b=0,X=Y.body?.getReader();if(!X)throw Error("No response body");let W=Bun.file(q).writer(),O=j==="win32";Q.stop();let F=null,H=-1;if(!O)F=new I$(K||41943040),F.start();else console.log(`Downloading Bun ${J}...`);try{let A=Date.now();while(!0){let{done:m,value:P}=await X.read();if(m)break;if(W.write(P),b+=P.length,!O&&F){let V=(Date.now()-A)/1000,p=V>0?(b/1024/V).toFixed(0):"0";F.update(b,{speed:p})}else if(O&&K){let V=Math.floor(b/K*10);if(V>H)console.log(`  > ${V*10}%`),H=V}}if(await W.end(),!O&&F)F.stop();else console.log("  > 100% [Done]")}catch(A){try{W.end()}catch(m){}if(!O&&F)F.stop();else console.log("  > Download Failed");throw Q.start(),A}Q.start()}async function p$($,q={}){let Q=$,J=null,Y=!1;if(!Q)Q=await N$()||void 0;if(!Q){console.error(Z.red("No version specified and no .bvmrc found. Usage: bvm install <version>"));return}try{await y(`Finding Bun ${Q} release...`,async(K)=>{let b=null,X=U(Q);if(/^v?\d+\.\d+\.\d+$/.test(Q)&&!Q.includes("canary"))if(K.update(`Checking if Bun ${X} exists...`),await H1(X))b=X;else throw K.fail(Z.red(`Bun version ${X} not found on registry.`)),Error(`Bun version ${X} not found on registry.`);else if(Q==="latest"){K.update("Checking latest version...");let V=await U1();if(V.latest)b=U(V.latest);else throw Error('Could not resolve "latest" version.')}else throw K.fail(Z.yellow('Fuzzy matching (e.g. "1.1") is disabled for stability.')),console.log(Z.dim('  Please specify the exact version (e.g. "1.1.20") or "latest".')),console.log(Z.dim("  To see available versions, run: bvm ls-remote")),Error("Fuzzy matching disabled");if(!b)throw K.fail(Z.red(`Could not find a Bun release for '${Q}' compatible with your system.`)),Error(`Could not find a Bun release for '${Q}' compatible with your system.`);let W=await y1(b);if(!W)throw Error(`Could not find a Bun release for ${b} compatible with your system.`);let{url:O,mirrorUrl:F,foundVersion:H}=W,A=o(w,H),m=o(A,"bin"),P=o(m,T);if(await G(P))K.succeed(Z.green(`Bun ${H} is already installed.`)),J=H,Y=!0;else if(U(Bun.version)===H&&!R){K.info(Z.cyan(`Requested version ${H} matches current BVM runtime. Creating symlink...`)),await f(m);let p=process.execPath;try{let{symlink:r}=await import("fs/promises");await r(p,P)}catch(r){await Bun.write(Bun.file(P),Bun.file(p)),await m$(P,493)}K.succeed(Z.green(`Bun ${H} linked from local runtime.`)),J=H,Y=!0}else if(R)await f(m),await c6(P,H),J=H,Y=!0;else{K.update(`Downloading Bun ${H} to cache...`),await f(_);let p=o(_,`${H}-${g6(O)}`);if(await G(p))K.succeed(Z.green(`Using cached Bun ${H} archive.`));else{let I=`${p}.${Date.now()}.tmp`;try{await F1(O,I,K,H),await c$(I,p)}catch(a$){try{await N1(I,{force:!0})}catch{}if(K.update("Download failed, trying mirror..."),console.log(Z.dim(`
Debug: ${a$.message}`)),F){let n1=new URL(F).hostname;K.update(`Downloading from mirror (${n1})...`),await F1(F,I,K,H),await c$(I,p)}else throw a$}}K.update(`Extracting Bun ${H}...`),await f(A),await O1(p,A);let r="",j$=[o(A,T),o(A,"bin",T),o(A,"package","bin",T)],t1=await l(A);for(let I of t1)if(I.startsWith("bun-"))j$.push(o(A,I,T)),j$.push(o(A,I,"bin",T));for(let I of j$)if(await G(I)){r=I;break}if(!r)throw Error(`Could not find bun executable in ${A}`);if(await f(m),r!==P){await c$(r,P);let I=d6(r);if(I!==A&&I!==m)await G$(I)}await m$(P,493),K.succeed(Z.green(`Bun ${H} installed successfully.`)),J=H,Y=!0}},{failMessage:`Failed to install Bun ${Q}`})}catch(K){throw Error(`Failed to install Bun: ${K.message}`)}if(Y)await W$(!1);if(J)try{await A$(J,{silent:!0});let K=o(C,"default");if(!await G(K))await H$("default",J,{silent:!0})}catch(K){}if(await Q$(),J)console.log(Z.cyan(`
\u2713 Bun ${J} installed and active.`)),console.log(Z.dim("  To verify, run: bun --version or bvm ls"))}async function c6($,q){let Q=q.replace(/^v/,""),J=`#!/usr/bin/env bash
set -euo pipefail
if [[ $# -gt 0 && "$1" == "--version" ]]; then echo "${Q}"; exit 0; fi
echo "Bun ${Q} stub invoked with: $@"
exit 0
`;await Bun.write($,J),await m$($,493)}k();x();D();async function A1(){await y("Fetching remote Bun versions...",async($)=>{let Q=(await W1()).filter((J)=>c(J)).filter((J)=>!J.includes("canary")).sort(K$);if(Q.length===0)throw Error("No remote Bun versions found.");$.succeed(Z.green("Available remote Bun versions:")),Q.forEach((J)=>{console.log(`  ${U(J)}`)})},{failMessage:"Failed to fetch remote Bun versions"})}k();x();N();D();import{join as m6}from"path";async function j1(){await y("Fetching locally installed Bun versions...",async($)=>{let q=await u(),J=(await t()).version;if($.succeed(Z.green("Locally installed Bun versions:")),q.length===0)console.log("  (No versions installed yet)");else q.forEach((K)=>{if(K===J)console.log(`* ${Z.green(K)} ${Z.dim("(current)")}`);else console.log(`  ${K}`)});if(await G(C)){let K=await l(C);if(K.length>0){console.log(Z.green(`
Aliases:`));for(let b of K)try{let X=(await M(m6(C,b))).trim(),W=U(X),O=`-> ${Z.cyan(W)}`;if(W===J)O+=` ${Z.dim("(current)")}`;console.log(`  ${b} ${Z.gray(O)}`)}catch(X){}}}},{failMessage:"Failed to list local Bun versions"})}k();x();D();async function B1(){await y("Checking current Bun version...",async($)=>{let{version:q,source:Q}=await t();if(q)$.stop(),console.log(`${Z.green("\u2713")} Current Bun version: ${Z.green(q)} ${Z.dim(`(${Q})`)}`);else $.info(Z.blue("No Bun version is currently active.")),console.log(Z.yellow("Use 'bvm install <version>' to set a default, or create a .bvmrc file."))},{failMessage:"Failed to determine current Bun version"})}k();N();x();D();import{join as l$,basename as p6}from"path";import{unlink as l6}from"fs/promises";async function M1($){await y(`Attempting to uninstall Bun ${$}...`,async(q)=>{let Q=U($),J=l$(w,Q),Y=l$(J,"bin",T);if(!await G(Y))throw Error(`Bun ${$} is not installed.`);let K=!1;try{let b=l$(C,"default");if(await G(b)){let X=(await M(b)).trim();if(U(X)===Q)K=!0}}catch(b){}if(K)throw console.log(Z.yellow("Hint: Set a new default using 'bvm default <new_version>'")),Error(`Bun ${$} is currently set as default. Please set another default before uninstalling.`);try{let b=await b1(b$);if(b){if(U(p6(b))===Q)await l6(b$)}}catch(b){}await G$(J),q.succeed(Z.green(`Bun ${Q} uninstalled successfully.`)),await Q$()},{failMessage:`Failed to uninstall Bun ${$}`})}k();N();x();D();import{join as t6}from"path";import{unlink as n6}from"fs/promises";async function f1($){await y(`Removing alias '${$}'...`,async(q)=>{let Q=t6(C,$);if(!await G(Q))throw Error(`Alias '${$}' does not exist.`);await n6(Q),q.succeed(Z.green(`Alias '${$}' removed successfully.`))},{failMessage:`Failed to remove alias '${$}'`})}k();N();x();q$();D();import{join as t$}from"path";async function D1($,q){await y(`Preparing to run with Bun ${$}...`,async(Q)=>{let J=await h($);if(!J)J=U($);let Y=t$(w,J),K=t$(Y,"bin"),b=t$(K,T);if(!await G(b)){Q.fail(Z.red(`Bun ${$} (resolved: ${J}) is not installed.`)),console.log(Z.yellow(`You can install it using: bvm install ${$}`));return}Q.stop();try{await d([b,...q],{cwd:process.cwd(),prependPath:K}),process.exit(0)}catch(X){console.error(X.message),process.exit(1)}},{failMessage:`Failed to run command with Bun ${$}`})}k();N();x();q$();D();import{join as n$}from"path";async function R1($,q,Q){await y(`Preparing environment for Bun ${$} to execute '${q}'...`,async(J)=>{let Y=await h($);if(!Y)Y=U($);let K=n$(w,Y),b=n$(K,"bin"),X=n$(b,T);if(!await G(X)){J.fail(Z.red(`Bun ${$} (resolved: ${Y}) is not installed.`)),console.log(Z.yellow(`You can install it using: bvm install ${$}`));return}J.stop();try{await d([q,...Q],{cwd:process.cwd(),prependPath:b}),process.exit(0)}catch(W){console.error(W.message),process.exit(1)}},{failMessage:`Failed to execute command with Bun ${$}'s environment`})}N();x();D();import{join as o6}from"path";async function T1($){await y("Resolving path...",async()=>{let q=null,Q="bun",{version:J}=await t();if(!$||$==="current"){if(q=J,!q)throw Error("No active Bun version found.")}else{let{resolveLocalVersion:K}=await Promise.resolve().then(() => (q$(),L1));if(q=await K($),!q)if(J)q=J,Q=$;else throw Error(`Bun version or command '${$}' not found.`)}let Y=o6(w,q,"bin",Q==="bun"?T:Q);if(await G(Y))console.log(Y);else throw Error(`Command '${Q}' not found in Bun ${q}.`)},{failMessage:"Failed to resolve path"})}k();x();D();q$();async function I1($){await y(`Resolving session version for Bun ${$}...`,async(q)=>{let Q=null,J=await h($);if(J)Q=J;else{let K=(await u()).map((b)=>U(b));Q=e($,K)}if(!Q)throw Error(`Bun version '${$}' is not installed or cannot be resolved.`);let Y=U(Q);q.succeed(Z.green(`Bun ${Y} will be active in this session.`)),console.log(`export BVM_ACTIVE_VERSION=${Y}`),console.log(Z.dim("Run `eval $(bvm shell <version>)` or `export BVM_ACTIVE_VERSION=...` to activate."))},{failMessage:`Failed to set session version for Bun ${$}`})}k();N();x();D();import{join as i6}from"path";async function E1($){let q=i6(C,"default");if(!$)await y("Checking current default Bun version...",async(Q)=>{if(await G(q)){let J=await M(q);Q.succeed(Z.green(`Default Bun version: ${U(J.trim())}`))}else Q.info(Z.blue("No global default Bun version is set.")),console.log(Z.yellow("Use 'bvm default <version>' to set one."))},{failMessage:"Failed to retrieve default Bun version"});else await y(`Setting global default to Bun ${$}...`,async(Q)=>{let J=(await u()).map((K)=>U(K)),Y=e($,J);if(!Y)throw Error(`Bun version '${$}' is not installed.`);await H$("default",Y,{silent:!0}),Q.succeed(Z.green(`\u2713 Default set to ${Y}. New terminals will now start with this version.`))},{failMessage:`Failed to set global default to Bun ${$}`})}N();x();k();D();import{unlink as a6}from"fs/promises";import{join as s6}from"path";async function S1(){await y("Deactivating current Bun version...",async($)=>{let q=s6(C,"default");if(await G(q))await a6(q),$.succeed(Z.green("Default Bun version deactivated.")),console.log(Z.gray("Run `bvm use <version>` to reactivate.")),await Q$();else $.info("No default Bun version is currently active.")},{failMessage:"Failed to deactivate"})}q$();N();x();k();D();async function _1($){if($==="dir"){console.log(_);return}if($==="clear"){await y("Clearing cache...",async(q)=>{await G$(_),await f(_),q.succeed(Z.green("Cache cleared."))},{failMessage:"Failed to clear cache"});return}console.error(Z.red(`Unknown cache command: ${$}`)),console.log("Usage: bvm cache dir | bvm cache clear")}k();N();D();x();import{join as S}from"path";import{tmpdir as r6}from"os";import{rm as v1,mkdir as P1}from"fs/promises";var __dirname="/Users/leiliao/MyWorkspace/bvm/src/commands",o$=Y$.version;async function u1(){let $=process.env.BVM_INSTALL_SOURCE;if($==="npm"||$==="bun"||__dirname.includes("node_modules")){await y(`Upgrading BVM via ${$||"package manager"}...`,async(Q)=>{let J=await $$(),Y=$==="bun"?"bun":"npm";Q.text=`Upgrading BVM via ${Y} using ${J}...`;try{await d([Y,"install","-g","bvm-core","--registry",J]),Q.succeed(Z.green(`BVM upgraded via ${Y} successfully.`))}catch(K){throw Error(`${Y} upgrade failed: ${K.message}`)}});return}try{await y("Checking for BVM updates...",async(Q)=>{let J=R?{version:process.env.BVM_TEST_LATEST_VERSION?.replace("v","")||o$,tarball:"https://example.com/bvm-test.tgz",shasum:"mock",integrity:"mock"}:await F$();if(!J)throw Error("Unable to determine the latest BVM version from NPM Registry.");let Y=J.version;if(!c(Y))throw Error(`Unrecognized version received: ${Y}`);if(!C$(Y,o$)){Q.succeed(Z.green(`BVM is already up to date (v${o$}).`)),console.log(Z.blue("You are using the latest version."));return}if(Q.text=`Updating BVM to v${Y}...`,R&&!process.env.BVM_TEST_REAL_UPGRADE){Q.succeed(Z.green("BVM updated successfully (test mode)."));return}Q.update("Downloading update package...");let K=S(r6(),`bvm-upgrade-${Date.now()}`);await P1(K,{recursive:!0});let b=S(K,"bvm-core.tgz");if(R){await g(b,"mock-tarball");let W=S(K,"package","dist");await P1(W,{recursive:!0}),await g(S(W,"index.js"),"// new cli"),await g(S(W,"bvm-shim.sh"),"# new shim"),await g(S(W,"bvm-shim.js"),"// new shim")}else{let W=await s(J.tarball,{timeout:30000});if(!W.ok)throw Error(`Failed to download tarball: ${W.statusText}`);let O=await W.arrayBuffer();await L$(b,new Uint8Array(O)),Q.update("Extracting update...");try{await d(["tar","-xzf",b,"-C",K])}catch(F){throw Error('Failed to extract update package. Ensure "tar" is available.')}}Q.update("Applying updates...");let X=S(K,"package","dist");if(await G(S(X,"index.js")))await L$(S(z,"src","index.js"),await M(S(X,"index.js")));if(j!=="win32"&&await G(S(X,"bvm-shim.sh")))await L$(S(z,"bin","bvm-shim.sh"),await M(S(X,"bvm-shim.sh")));if(j==="win32"&&await G(S(X,"bvm-shim.js")))await L$(S(z,"bin","bvm-shim.js"),await M(S(X,"bvm-shim.js")));try{await v1(K,{recursive:!0,force:!0})}catch(W){}try{await v1(f$,{force:!0})}catch(W){}Q.update("Finalizing environment..."),await W$(!1),Q.succeed(Z.green(`BVM updated to v${Y} successfully.`)),console.log(Z.yellow("Please restart your terminal to apply changes."))},{failMessage:"Failed to upgrade BVM"})}catch(Q){throw Error(`Failed to upgrade BVM: ${Q.message}`)}}k();N();x();D();import{homedir as e6}from"os";import{join as $4}from"path";async function V1(){await y("Gathering BVM diagnostics...",async()=>{let $={currentVersion:(await t()).version,installedVersions:await u(),aliases:await q4(),env:{BVM_DIR:z,BVM_BIN_DIR:B,BVM_SHIMS_DIR:E,BVM_VERSIONS_DIR:w,BVM_TEST_MODE:process.env.BVM_TEST_MODE,HOME:process.env.HOME||e6()}};Q4($)})}async function q4(){if(!await G(C))return[];let $=await l(C),q=[];for(let Q of $){let J=$4(C,Q);if(await G(J)){let Y=await Bun.file(J).text();q.push({name:Q,target:U(Y.trim())})}}return q}function Q4($){if(console.log(Z.bold(`
Directories`)),console.log(`  BVM_DIR: ${Z.cyan($.env.BVM_DIR||"")}`),console.log(`  BIN_DIR: ${Z.cyan(B)}`),console.log(`  SHIMS_DIR: ${Z.cyan(E)}`),console.log(`  VERSIONS_DIR: ${Z.cyan(w)}`),console.log(Z.bold(`
Environment`)),console.log(`  HOME: ${$.env.HOME||"n/a"}`),console.log(`  BVM_TEST_MODE: ${$.env.BVM_TEST_MODE||"false"}`),console.log(Z.bold(`
Installed Versions`)),$.installedVersions.length===0)console.log("  (none installed)");else $.installedVersions.forEach((q)=>{let Q=q===$.currentVersion,J=Q?Z.green("*"):" ",Y=Q?Z.green(q):q,K=Q?Z.green(" (current)"):"";console.log(`  ${J} ${Y}${K}`)});if(console.log(Z.bold(`
Aliases`)),$.aliases.length===0)console.log("  (no aliases configured)");else $.aliases.forEach((q)=>{console.log(`  ${q.name} ${Z.gray("->")} ${Z.cyan(q.target)}`)});console.log(`
`+Z.green("Diagnostics complete."))}var i$=["install","uninstall","use","ls","ls-remote","current","alias","unalias","run","exec","which","cache","setup","upgrade","doctor","completion","deactivate","help"],g1={bash:`#!/usr/bin/env bash
_bvm_completions() {
  COMPREPLY=( $(compgen -W "${i$.join(" ")}" -- "\${COMP_WORDS[COMP_CWORD]}") )
}
complete -F _bvm_completions bvm
`,zsh:`#compdef bvm
_bvm() {
  local -a commands
  commands=( ${i$.join(" ")} )
  _describe 'command' commands
}
compdef _bvm bvm
`,fish:`complete -c bvm -f -a "${i$.join(" ")}"
`};function d1($){let q=g1[$];if(!q)throw Error(`Unsupported shell '${$}'. Supported shells: ${Object.keys(g1).join(", ")}`);console.log(q)}k();N();x();import{join as h1}from"path";k();var c1="update-check.json",J4=86400000;async function m1(){if(process.env.CI||R)return;let $=h1(_,c1);try{if(await G($)){let q=await M($),Q=JSON.parse(q);if(Date.now()-Q.lastCheck<J4)return}}catch(q){}try{let q=await F$();if(q){let Q=q.tagName.startsWith("v")?q.tagName.slice(1):q.tagName;await f(_),await g($,JSON.stringify({lastCheck:Date.now(),latestVersion:Q}))}}catch(q){}}async function p1(){if(process.env.CI||R)return null;let $=Y$.version,q=h1(_,c1);try{if(await G(q)){let Q=await M(q),J=JSON.parse(Q);if(J.latestVersion&&C$(J.latestVersion,$))return`
${Z.gray("Update available:")} ${Z.green(`v${J.latestVersion}`)} ${Z.dim(`(current: v${$})`)}
${Z.gray("Run")} ${Z.cyan("bvm upgrade")} ${Z.gray("to update.")}`}}catch(Q){}return null}class l1{commands={};helpEntries=[];name;versionStr;constructor($){this.name=$,this.versionStr=Y$.version}command($,q,Q={}){let J=$.split(" ")[0],Y={description:q,usage:`${this.name} ${$}`,action:async()=>{},aliases:Q.aliases};if(this.commands[J]=Y,this.helpEntries.push(`  ${$.padEnd(35)} ${q}`),Q.aliases)Q.aliases.forEach((b)=>{this.commands[b]=Y});let K={action:(b)=>{return Y.action=b,K},option:(b,X)=>K};return K}async run(){m1().catch(()=>{});let{values:$,positionals:q}=K4({args:Bun.argv.slice(2),strict:!1,allowPositionals:!0,options:{help:{type:"boolean",short:"h"},version:{type:"boolean",short:"v"},silent:{type:"boolean",short:"s"}}}),Q=q[0],J=!!($.silent||$.s),Y=!!($.version||$.v||$.help||$.h);if(!Q){if($.version||$.v)console.log(this.versionStr),process.exit(0);if($.help||$.h)this.showHelp(),process.exit(0);this.showHelp(),process.exit(1)}if($.help||$.h)this.showHelp(),process.exit(0);let K=this.commands[Q];if(!K)console.error(Z.yellow(`Unknown command '${Q}'`)),this.showHelp(),process.exit(0);try{if(await K.action(q.slice(1),$),!Y&&!J&&["ls","current","doctor","default"].includes(Q)){let b=await p1();if(b)console.log(b)}}catch(b){if(!b.reported)console.error(Z.red(`\u2716 ${b.message}`));process.exit(1)}}showHelp(){console.log(`Bun Version Manager (bvm) v${this.versionStr}`),console.log(`Built with Bun \xB7 Runs with Bun \xB7 Tested on Bun
`),console.log("Usage:"),console.log(`  ${this.name} <command> [flags]
`),console.log("Commands:"),console.log(this.helpEntries.join(`
`)),console.log(`
Global Flags:`),console.log("  --help, -h                     Show this help message"),console.log("  --version, -v                  Show version number"),console.log(`
Examples:`),console.log("  bvm install 1.0.0"),console.log("  bvm use 1.0.0"),console.log("  bvm run 1.0.0 index.ts")}}async function Y4(){let $=new l1("bvm");$.command("rehash","Regenerate shims for all installed binaries").action(async()=>{await Q$()}),$.command("install [version]","Install a Bun version and set as current").option("--global, -g","Install as a global tool (not just default)").action(async(q,Q)=>{await p$(q[0],{global:Q.global||Q.g})}),$.command("i [version]","Alias for install").action(async(q,Q)=>{await p$(q[0],{global:Q.global||Q.g})}),$.command("ls","List installed Bun versions",{aliases:["list"]}).action(async()=>{await j1()}),$.command("ls-remote","List all available remote Bun versions").action(async()=>{await A1()}),$.command("use <version>","Switch the active Bun version immediately (all terminals)").action(async(q)=>{if(!q[0])throw Error("Version is required");await A$(q[0])}),$.command("shell <version>","Switch Bun version for the current shell session").action(async(q)=>{if(!q[0])throw Error("Version is required");await I1(q[0])}),$.command("default [version]","Display or set the global default Bun version").action(async(q)=>{await E1(q[0])}),$.command("current","Display the currently active Bun version").action(async()=>{await B1()}),$.command("uninstall <version>","Uninstall a Bun version").action(async(q)=>{if(!q[0])throw Error("Version is required");await M1(q[0])}),$.command("alias <name> <version>","Create an alias for a Bun version").action(async(q)=>{if(!q[0]||!q[1])throw Error("Name and version are required");await H$(q[0],q[1])}),$.command("unalias <name>","Remove an existing alias").action(async(q)=>{if(!q[0])throw Error("Alias name is required");await f1(q[0])}),$.command("run <version> [...args]","Run a command with a specific Bun version").action(async(q)=>{let Q=q[0];if(!Q)throw Error("Version is required");let J=process.argv.indexOf("run"),Y=J!==-1?process.argv.slice(J+2):[];await D1(Q,Y)}),$.command("exec <version> <cmd> [...args]","Execute a command with a specific Bun version's environment").action(async(q)=>{let Q=q[0],J=q[1];if(!Q||!J)throw Error("Version and command are required");let Y=process.argv.indexOf("exec"),K=Y!==-1?process.argv.slice(Y+3):[];await R1(Q,J,K)}),$.command("which [version]","Display path to installed bun version").action(async(q)=>{await T1(q[0])}),$.command("deactivate","Undo effects of bvm on current shell").action(async()=>{await S1()}),$.command("version <spec>","Resolve the given description to a single local version").action(async(q)=>{if(!q[0])throw Error("Version specifier is required");await h$(q[0])}),$.command("cache <action>","Manage bvm cache").action(async(q)=>{if(!q[0])throw Error("Action is required");await _1(q[0])}),$.command("setup","Configure shell environment automatically").option("--silent, -s","Suppress output").action(async(q,Q)=>{await W$(!(Q.silent||Q.s))}),$.command("upgrade","Upgrade bvm to the latest version",{aliases:["self-update"]}).action(async()=>{await u1()}),$.command("doctor","Show diagnostics for Bun/BVM setup").action(async()=>{await V1()}),$.command("completion <shell>","Generate shell completion script (bash|zsh|fish)").action(async(q)=>{if(!q[0])throw Error("Shell name is required");d1(q[0])}),await $.run(),process.exit(0)}Y4().catch(($)=>{console.error(Z.red(`
[FATAL ERROR] Unexpected Crash:`)),console.error($),process.exit(1)});
