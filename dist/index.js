#!/usr/bin/env bun
// @bun
var t1=Object.create;var{getPrototypeOf:n1,defineProperty:B$,getOwnPropertyNames:o1}=Object;var i1=Object.prototype.hasOwnProperty;var U$=($,q,Q)=>{Q=$!=null?t1(n1($)):{};let J=q||!$||!$.__esModule?B$(Q,"default",{value:$,enumerable:!0}):Q;for(let Y of o1($))if(!i1.call(J,Y))B$(J,Y,{get:()=>$[Y],enumerable:!0});return J};var i$=($,q)=>{for(var Q in q)B$($,Q,{get:q[Q],enumerable:!0,configurable:!0,set:(J)=>q[Q]=()=>J})};var y$=($,q)=>()=>($&&(q=$($=0)),q);var O$=import.meta.require;var s$={};i$(s$,{getBvmDir:()=>a$,getBunAssetName:()=>f$,USER_AGENT:()=>b$,TEST_REMOTE_VERSIONS:()=>Z$,REPO_FOR_BVM_CLI:()=>$6,OS_PLATFORM:()=>B,IS_TEST_MODE:()=>D,EXECUTABLE_NAME:()=>j,CPU_ARCH:()=>z$,BVM_VERSIONS_DIR:()=>L,BVM_SRC_DIR:()=>r1,BVM_SHIMS_DIR:()=>S,BVM_FINGERPRINTS_FILE:()=>M$,BVM_DIR:()=>O,BVM_CURRENT_DIR:()=>X$,BVM_COMPONENTS:()=>J6,BVM_CDN_ROOT:()=>Q6,BVM_CACHE_DIR:()=>_,BVM_BIN_DIR:()=>M,BVM_ALIAS_DIR:()=>x,BUN_GITHUB_RELEASES_API:()=>e1,ASSET_NAME_FOR_BVM:()=>q6});import{homedir as s1}from"os";import{join as o}from"path";function a$(){let $=process.env.HOME||s1();return o($,".bvm")}function f$($){return`bun-${B==="win32"?"windows":B}-${z$==="arm64"?"aarch64":"x64"}.zip`}var B,z$,D,Z$,O,r1,L,M,S,X$,x,_,M$,j,e1="https://api.github.com/repos/oven-sh/bun/releases",$6="EricLLLLLL/bvm",q6,b$="bvm (Bun Version Manager)",Q6,J6;var F=y$(()=>{B=process.platform,z$=process.arch,D=process.env.BVM_TEST_MODE==="true",Z$=["v1.3.4","v1.2.23","v1.0.0","bun-v1.4.0-canary"];O=a$(),r1=o(O,"src"),L=o(O,"versions"),M=o(O,"bin"),S=o(O,"shims"),X$=o(O,"current"),x=o(O,"aliases"),_=o(O,"cache"),M$=o(O,"fingerprints.json"),j=B==="win32"?"bun.exe":"bun",q6=B==="win32"?"bvm.exe":"bvm",Q6=process.env.BVM_CDN_URL||"https://cdn.jsdelivr.net/gh/EricLLLLLL/bvm",J6=[{name:"CLI Core",remotePath:"index.js",localPath:"src/index.js"},{name:"Windows Shim",remotePath:"bvm-shim.js",localPath:"bin/bvm-shim.js",platform:"win32"},{name:"Unix Shim",remotePath:"bvm-shim.sh",localPath:"bin/bvm-shim.sh",platform:"posix"}]});function m($){if(!$)return null;return $.match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/)?$:null}function r$($){let q=m($);return q?q.replace(/^v/,""):null}function J$($){if(!$)return null;let q=$.replace(/^v/,""),J=q.split(/[-+]/)[0].split(".").map(Number);if(J.length===0||J.some((K)=>isNaN(K)))return null;let Y=q.includes("-")?q.split("-")[1].split("+")[0]:void 0;return{major:J[0],minor:J[1],patch:J[2],pre:Y}}function T$($,q){if(!$||!q)return 0;if($.major!==q.major)return $.major-q.major;if($.minor!==q.minor)return $.minor-q.minor;if($.patch!==q.patch)return $.patch-q.patch;if($.pre&&!q.pre)return-1;if(!$.pre&&q.pre)return 1;if($.pre&&q.pre)return $.pre.localeCompare(q.pre);return 0}function e$($,q){let Q=J$($),J=J$(q);return T$(Q,J)}function K$($,q){return e$(q,$)}function k$($,q){return e$($,q)>0}function $1($,q){if(q==="*"||q===""||q==="latest")return!0;let Q=J$($);if(!Q)return!1;let J=q;if(q.startsWith("v"))J=q.substring(1);if(r$($)===r$(q))return!0;let Y=J.split(".");if(Y.length===1){let K=Number(Y[0]);if(Q.major===K)return!0}else if(Y.length===2){let K=Number(Y[0]),X=Number(Y[1]);if(Q.major===K&&Q.minor===X)return!0}if(q.startsWith("~")){let K=J$(q.substring(1));if(!K)return!1;let X=K.patch??0;return Q.major===K.major&&Q.minor===K.minor&&Q.patch>=X}if(q.startsWith("^")){let K=J$(q.substring(1));if(!K)return!1;let X=K.patch??0,b=K.minor??0;if(K.major===0){if(Q.major!==0)return!1;if(Q.minor!==b)return!1;return Q.patch>=X}if(Q.major!==K.major)return!1;if(Q.minor<b)return!1;if(Q.minor===b&&Q.patch<X)return!1;return!0}return!1}import{readdir as Y6,mkdir as Z6,stat as X6,symlink as b6,unlink as q1,rm as Q1,readlink as G6}from"fs/promises";import{join as C$,dirname as H6,basename as W6}from"path";async function N($){await Z6($,{recursive:!0})}async function G($){try{return await X6($),!0}catch(q){if(q.code==="ENOENT")return!1;throw q}}async function J1($,q){try{await q1(q)}catch(J){try{await Q1(q,{recursive:!0,force:!0})}catch(Y){}}let Q=process.platform==="win32"?"junction":"dir";await b6($,q,Q)}async function K1($){try{return await G6($)}catch(q){if(q.code==="ENOENT"||q.code==="EINVAL")return null;throw q}}async function G$($){await Q1($,{recursive:!0,force:!0})}async function p($){try{return await Y6($)}catch(q){if(q.code==="ENOENT")return[];throw q}}async function f($){return await Bun.file($).text()}async function V($,q){await Bun.write($,q)}async function L$($,q,Q={}){let{backup:J=!0}=Q,Y=H6($);await N(Y);let K=`${$}.tmp-${Date.now()}`,X=`${$}.bak`;try{if(await V(K,q),J&&await G($))try{let{rename:H,unlink:z}=await import("fs/promises");if(await G(X))await z(X).catch(()=>{});await H($,X)}catch(H){}let{rename:b}=await import("fs/promises");try{await b(K,$)}catch(H){await Bun.write($,q),await q1(K).catch(()=>{})}}catch(b){let{unlink:H}=await import("fs/promises");throw await H(K).catch(()=>{}),b}}function U($){let q=$.trim();if(q.startsWith("bun-v"))q=q.substring(4);if(!q.startsWith("v")&&/^\d/.test(q))q=`v${q}`;return q}async function P(){return await N(L),(await p(L)).filter((q)=>m(U(q))).sort(K$)}async function l(){if(process.env.BVM_ACTIVE_VERSION)return{version:U(process.env.BVM_ACTIVE_VERSION),source:"env"};let $=C$(process.cwd(),".bvmrc");if(await G($)){let X=(await f($)).trim();return{version:U(X),source:".bvmrc"}}let{getBvmDir:q}=await Promise.resolve().then(() => (F(),s$)),Q=q(),J=C$(Q,"current"),Y=C$(Q,"aliases");if(await G(J)){let{realpath:X}=await import("fs/promises");try{let b=await X(J);return{version:U(W6(b)),source:"current"}}catch(b){}}let K=C$(Y,"default");if(await G(K)){let X=(await f(K)).trim();return{version:U(X),source:"default"}}return{version:null,source:null}}function r($,q){if(!$||q.length===0)return null;let Q=U($);if(q.includes(Q))return Q;if($.toLowerCase()==="latest")return q[0];if(/^\d+\.\d+\.\d+$/.test($.replace(/^v/,"")))return null;if(!/^[v\d]/.test($))return null;let Y=$.startsWith("v")?`~${$.substring(1)}`:`~${$}`,K=q.filter((X)=>$1(X,Y));if(K.length>0)return K.sort(K$)[0];return null}var w=y$(()=>{F()});class R${timer=null;frames=process.platform==="win32"?["-"]:["\u280B","\u2819","\u2839","\u2838","\u283C","\u2834","\u2826","\u2827","\u2807","\u280F"];frameIndex=0;text;isWindows=process.platform==="win32";constructor($){this.text=$}start($){if($)this.text=$;if(this.timer)return;if(this.isWindows){process.stdout.write(`${Z.cyan(">")} ${this.text}
`);return}this.timer=setInterval(()=>{process.stdout.write(`\r\x1B[K${Z.cyan(this.frames[this.frameIndex])} ${this.text}`),this.frameIndex=(this.frameIndex+1)%this.frames.length},80)}stop(){if(this.isWindows)return;if(this.timer)clearInterval(this.timer),this.timer=null,process.stdout.write("\r\x1B[K");process.stdout.write("\x1B[?25h")}succeed($){this.stop(),console.log(`${Z.green("  \u2713")} ${$||this.text}`)}fail($){this.stop(),console.log(`${Z.red("  \u2716")} ${$||this.text}`)}info($){this.stop(),console.log(`${Z.blue("  \u2139")} ${$||this.text}`)}update($){if(this.text=$,this.isWindows)console.log(Z.dim(`  ... ${this.text}`))}}class D${total;current=0;width=20;constructor($){this.total=$}start(){process.stdout.write("\x1B[?25l"),this.render()}update($,q){this.current=$,this.render(q)}stop(){process.stdout.write(`\x1B[?25h
`)}render($){let q=Math.min(1,this.current/this.total),Q=Math.round(this.width*q),J=this.width-Q,Y=process.platform==="win32",K=Y?"=":"\u2588",X=Y?"-":"\u2591",b=Z.green(K.repeat(Q))+Z.gray(X.repeat(J)),H=(q*100).toFixed(0).padStart(3," "),z=(this.current/1048576).toFixed(1),C=(this.total/1048576).toFixed(1),W=$?` ${$.speed}KB/s`:"";process.stdout.write(`\r\x1B[2K ${b} ${H}% | ${z}/${C}MB${W}`)}}var U6,y6=($)=>$.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),i=($,q,Q=$)=>(J)=>U6?$+J.replace(new RegExp(y6(q),"g"),Q)+q:J,Z;var k=y$(()=>{U6=!process.env.NO_COLOR,Z={red:i("\x1B[1;31m","\x1B[39m"),green:i("\x1B[1;32m","\x1B[39m"),yellow:i("\x1B[1;33m","\x1B[39m"),blue:i("\x1B[1;34m","\x1B[39m"),magenta:i("\x1B[1;35m","\x1B[39m"),cyan:i("\x1B[1;36m","\x1B[39m"),gray:i("\x1B[90m","\x1B[39m"),bold:i("\x1B[1m","\x1B[22m","\x1B[22m\x1B[1m"),dim:i("\x1B[2m","\x1B[22m","\x1B[22m\x1B[2m")}});async function y($,q,Q){if(process.platform==="win32"){console.log(Z.cyan(`> ${$}`));let K={start:(X)=>{if(X)console.log(Z.cyan(`> ${X}`))},stop:()=>{},succeed:(X)=>console.log(Z.green(`  \u2713 ${X}`)),fail:(X)=>console.log(Z.red(`  \u2716 ${X}`)),info:(X)=>console.log(Z.cyan(`  \u2139 ${X}`)),update:(X)=>console.log(Z.dim(`  ... ${X}`)),isSpinning:!1};try{return await q(K)}catch(X){let b=y1(X,Q?.failMessage);if(console.log(Z.red(`  \u2716 ${b}`)),process.env.BVM_DEBUG,console.log(Z.dim(`    Details: ${X.message}`)),X.code)console.log(Z.dim(`    Code: ${X.code}`));throw X.reported=!0,X}}let Y=new R$($);Y.start();try{let K=await q(Y);return Y.stop(),K}catch(K){let X=y1(K,Q?.failMessage);throw Y.fail(Z.red(X)),K.reported=!0,K}}function y1($,q){let Q=$ instanceof Error?$.message:String($);if(!q)return Q;if(typeof q==="function")return q($);return`${q}: ${Q}`}var R=y$(()=>{k()});var O1={};i$(O1,{resolveLocalVersion:()=>g,displayVersion:()=>d$});import{join as P6}from"path";async function g($){if($==="current"){let{version:Y}=await l();return Y}if($==="latest"){let Y=await P();if(Y.length>0)return Y[0];return null}let q=P6(x,$);if(await G(q))try{let Y=(await f(q)).trim();return U(Y)}catch{return null}let Q=U($),J=await P();return r($,J)}async function d$($){await y(`Resolving version '${$}'...`,async()=>{let q=await g($);if(q)console.log(q);else throw Error("N/A")},{failMessage:`Failed to resolve version '${$}'`})}var q$=y$(()=>{F();w();R()});import{parseArgs as Y4}from"util";var Y$={name:"bvm-core",version:"1.1.15",description:"The native version manager for Bun. Cross-platform, shell-agnostic, and zero-dependency.",main:"dist/index.js",bin:{bvm:"dist/index.js"},publishConfig:{access:"public"},scripts:{dev:"bun run src/index.ts",build:"bun build src/index.ts --target=bun --outfile dist/index.js --minify && bun run scripts/sync-runtime.ts",test:"bun test",bvm:"bun run src/index.ts","bvm:sandbox":'mkdir -p "$PWD/.sandbox-home" && HOME="$PWD/.sandbox-home" bun run src/index.ts',release:"bun run scripts/release.ts","test:e2e:npm":"bun run scripts/verify-e2e-npm.ts","sync-runtime":"bun run scripts/sync-runtime.ts",postinstall:"node scripts/postinstall.js"},repository:{type:"git",url:"git+https://github.com/EricLLLLLL/bvm.git"},keywords:["bun","version-manager","cli","bvm","nvm","nvm-windows","fnm","nodenv","bun-nvm","version-switching"],files:["dist/index.js","dist/bvm-shim.sh","dist/bvm-shim.js","scripts/postinstall.js","install.sh","install.ps1","README.md"],author:"EricLLLLLL",license:"MIT",type:"commonjs",dependencies:{"@oven/bun-darwin-aarch64":"^1.3.5","cli-progress":"^3.12.0"},devDependencies:{"@types/bun":"^1.3.4","@types/cli-progress":"^3.11.6","@types/node":"^24.10.2",bun:"^1.3.6",esbuild:"^0.27.2",execa:"^9.6.1",typescript:"^5"},peerDependencies:{typescript:"^5"}};F();w();import{join as n,basename as g6,dirname as m6}from"path";F();w();k();import{join as L6}from"path";function Y1($,q){if($==="darwin"){if(q==="arm64")return"@oven/bun-darwin-aarch64";if(q==="x64")return"@oven/bun-darwin-x64"}if($==="linux"){if(q==="arm64")return"@oven/bun-linux-aarch64";if(q==="x64")return"@oven/bun-linux-x64"}if($==="win32"){if(q==="x64")return"@oven/bun-windows-x64"}return null}function Z1($,q,Q){let J=Q;if(!J.endsWith("/"))J+="/";let Y=$.startsWith("@"),K=$;if(Y){let b=$.split("/");if(b.length===2)K=b[1]}let X=`${K}-${q}.tgz`;return`${J}${$}/-/${X}`}k();async function d($,q={}){let{cwd:Q,env:J,prependPath:Y,stdin:K="inherit",stdout:X="inherit",stderr:b="inherit"}=q,H={...process.env,...J};if(Y){let W=H.PATH||"",A=process.platform==="win32"?";":":";H.PATH=`${Y}${A}${W}`}let C=await Bun.spawn({cmd:$,cwd:Q,env:H,stdin:K,stdout:X,stderr:b}).exited;if((C??0)!==0)throw Error(`${Z.red("Command failed")}: ${$.join(" ")} (code ${C})`);return C??0}async function a($,q={}){let{timeout:Q=5000,...J}=q,Y=new AbortController,K=setTimeout(()=>Y.abort(),Q);try{let X=await fetch($,{...J,signal:Y.signal});return clearTimeout(K),X}catch(X){if(clearTimeout(K),X.name==="AbortError")throw Error(`Request to ${$} timed out after ${Q}ms`);throw X}}async function O6($,q=2000){if($.length===0)throw Error("No URLs to race");if($.length===1)return $[0];return new Promise((Q,J)=>{let Y=0,K=!1;$.forEach((X)=>{a(X,{method:"HEAD",timeout:q}).then((b)=>{if(b.ok&&!K)K=!0,Q(X);else if(!K){if(Y++,Y===$.length)J(Error("All requests failed"))}}).catch(()=>{if(!K){if(Y++,Y===$.length)J(Error("All requests failed"))}})})})}async function z6(){try{let $=await a("https://1.1.1.1/cdn-cgi/trace",{timeout:500});if(!$.ok)return null;let Q=(await $.text()).match(/loc=([A-Z]{2})/);return Q?Q[1]:null}catch($){return null}}var I$=null,w$={NPM:"https://registry.npmjs.org",TAOBAO:"https://registry.npmmirror.com",TENCENT:"https://mirrors.cloud.tencent.com/npm/"};async function e(){if(I$)return I$;let $=await z6(),q=[];if($==="CN")q=[w$.TAOBAO,w$.TENCENT,w$.NPM];else q=[w$.NPM,w$.TAOBAO];try{let Q=await O6(q,2000);return I$=Q,Q}catch(Q){return q[0]}}w();var w6="bun-versions.json",x6=3600000;async function k6(){if(D)return[...Z$];let $=L6(_,w6);try{if(await G($)){let Y=await f($),K=JSON.parse(Y);if(Date.now()-K.timestamp<x6&&Array.isArray(K.versions))return K.versions}}catch(Y){}let q=await e(),Q=[q];if(q!=="https://registry.npmjs.org")Q.push("https://registry.npmjs.org");let J=null;for(let Y of Q){let K=`${Y.replace(/\/$/,"")}/bun`;try{let X=await a(K,{headers:{"User-Agent":b$,Accept:"application/vnd.npm.install-v1+json"},timeout:1e4});if(!X.ok)throw Error(`Status ${X.status}`);let b=await X.json();if(!b.versions)throw Error("Invalid response (no versions)");let H=Object.keys(b.versions);try{await N(_),await V($,JSON.stringify({timestamp:Date.now(),versions:H}))}catch(z){}return H}catch(X){J=X}}throw J||Error("Failed to fetch versions from any registry.")}async function C6(){if(D)return[...Z$];return new Promise(($,q)=>{let Q=[];try{let J=Bun.spawn(["git","ls-remote","--tags","https://github.com/oven-sh/bun.git"],{stdout:"pipe",stderr:"pipe"}),Y=setTimeout(()=>{J.kill(),q(Error("Git operation timed out"))},1e4);new Response(J.stdout).text().then((X)=>{clearTimeout(Y);let b=X.split(`
`);for(let H of b){let z=H.match(/refs\/tags\/bun-v?(\d+\.\d+\.\d+.*)$/);if(z)Q.push(z[1])}$(Q)}).catch((X)=>{clearTimeout(Y),q(X)})}catch(J){q(Error(`Failed to run git: ${J.message}`))}})}async function X1(){if(D)return[...Z$];try{let q=(await k6()).filter((Q)=>m(Q)).map((Q)=>({v:Q,parsed:J$(Q)}));return q.sort((Q,J)=>T$(J.parsed,Q.parsed)),q.map((Q)=>Q.v)}catch($){try{let q=await C6();if(q.length>0)return Array.from(new Set(q.filter((J)=>m(J)))).sort(K$);throw Error("No versions found via Git")}catch(q){throw Error(`Failed to fetch versions. NPM: ${$.message}. Git: ${q.message}`)}}}async function b1($){if(D)return Z$.includes($)||$==="latest";let q=await e(),Q=$.replace(/^v/,""),J=`${q}/bun/${Q}`,Y=B==="win32"?"curl.exe":"curl",K=async()=>{try{return await d([Y,"-I","-f","-m","5","-s",J],{stdout:"ignore",stderr:"ignore"}),!0}catch(b){return!1}},X=new Promise((b)=>setTimeout(()=>b(!1),1e4));return Promise.race([K(),X])}async function G1(){if(D)return{latest:"1.1.20"};let q=`${await e()}/-/package/bun/dist-tags`;try{let Q=await a(q,{headers:{"User-Agent":b$},timeout:5000});if(Q.ok)return await Q.json()}catch(Q){}return{}}async function H1($){let q=U($);if(!m(q))return console.error(Z.red(`Invalid version provided to findBunDownloadUrl: ${$}`)),null;if(D)return{url:`https://example.com/${f$(q)}`,foundVersion:q};let Y=Y1(B==="win32"?"win32":B,z$==="arm64"?"arm64":"x64");if(!Y)throw Error(`Unsupported platform/arch for NPM download: ${B}-${z$}`);let K="";if(process.env.BVM_REGISTRY)K=process.env.BVM_REGISTRY;else if(process.env.BVM_DOWNLOAD_MIRROR)K=process.env.BVM_DOWNLOAD_MIRROR;else K=await e();let X=q.replace(/^v/,"");return{url:Z1(Y,X,K),foundVersion:q}}async function F$(){try{let q=(await e()).replace(/\/$/,""),Q=await a(`${q}/-/package/bvm-core/dist-tags`,{headers:{"User-Agent":b$},timeout:5000});if(!Q.ok)return null;let Y=(await Q.json()).latest;if(!Y)return null;let K=await a(`${q}/bvm-core/${Y}`,{headers:{"User-Agent":b$},timeout:5000});if(K.ok){let X=await K.json();return{version:Y,tarball:X.dist.tarball,integrity:X.dist.integrity,shasum:X.dist.shasum}}}catch($){}return null}k();F();import{spawn as F6}from"child_process";async function W1($,q){if($.endsWith(".zip"))if(B==="win32")await d(["powershell","-Command",`Expand-Archive -Path "${$}" -DestinationPath "${q}" -Force`],{stdout:"ignore",stderr:"inherit"});else await d(["unzip","-o","-q",$,"-d",q],{stdout:"ignore",stderr:"inherit"});else if($.endsWith(".tar.gz")||$.endsWith(".tgz"))await new Promise((Q,J)=>{let Y=F6("tar",["-xzf",$,"-C",q],{stdio:"inherit",shell:!1});Y.on("close",(K)=>{if(K===0)Q();else J(Error(`tar exited with code ${K}`))}),Y.on("error",(K)=>J(K))});else throw Error(`Unsupported archive format: ${$}`)}import{chmod as m$}from"fs/promises";w();F();k();import{join as T,dirname as R6,delimiter as D6}from"path";import{homedir as $$}from"os";import{chmod as x$}from"fs/promises";var E$=`#!/bin/bash

# bvm-init.sh: Initializes bvm default version on shell startup

# Check if BVM_DIR is set
if [ -z "\${BVM_DIR}" ]; then
  return
fi

# Try to switch to the 'default' version silently.
"\${BVM_DIR}/bin/bvm" use default --silent >/dev/null 2>&1 || true
`;var S$=`# bvm-init.fish: Initializes bvm default version on shell startup

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
`;async function H$($=!0){if(await I6($),process.platform==="win32"){await E6($);return}if(!process.env.BVM_TEST_MODE)await U1();let q=process.env.SHELL||"",Q="",J="";if(q.includes("zsh"))J="zsh",Q=T($$(),".zshrc");else if(q.includes("bash"))if(J="bash",process.platform==="darwin")if(await G(T($$(),".bashrc")))Q=T($$(),".bashrc");else Q=T($$(),".bash_profile");else Q=T($$(),".bashrc");else if(q.includes("fish"))J="fish",Q=T($$(),".config","fish","config.fish");else{if($)console.log(Z.yellow(`Could not detect a supported shell (zsh, bash, fish). Please manually add ${M} to your PATH.`));return}let Y=T(M,"bvm-init.sh");await Bun.write(Y,E$),await x$(Y,493);let K=T(M,"bvm-init.fish");await Bun.write(K,S$),await x$(K,493);let X="";try{X=await Bun.file(Q).text()}catch(W){if(W.code==="ENOENT")await Bun.write(Q,""),X="";else throw W}let b="# >>> bvm initialize >>>",H="# <<< bvm initialize <<<",z=`${b}
# !! Contents within this block are managed by 'bvm setup' !!
export BVM_DIR="${O}"
export PATH="$BVM_DIR/shims:$BVM_DIR/bin:$PATH"
# Reset current version to default for new terminal sessions
[ -L "$BVM_DIR/current" ] && rm "$BVM_DIR/current"
${H}`,C=`# >>> bvm initialize >>>
# !! Contents within this block are managed by 'bvm setup' !!
set -Ux BVM_DIR "${O}"
fish_add_path "$BVM_DIR/shims"
fish_add_path "$BVM_DIR/bin"
# Reset current version to default
if test -L "$BVM_DIR/current"
    rm "$BVM_DIR/current"
end
# <<< bvm initialize <<<`;if($)console.log(Z.cyan(`Configuring ${J} environment in ${Q}...`));try{let W=X,A=b.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),h=H.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),v=new RegExp(`${A}[\\s\\S]*?${h}`,"g");if(X.includes(b))W=X.replace(v,"").trim();let u=J==="fish"?C:z;if(W=(W?W+`

`:"")+u+`
`,W!==X){if(await Bun.write(Q,W),$)console.log(Z.green(`\u2713 Successfully updated BVM configuration in ${Q}`)),console.log(Z.gray("  (Moved configuration to the end of file to ensure PATH precedence)"))}if($)console.log(Z.yellow(`Please restart your terminal or run "source ${Q}" to apply changes.`))}catch(W){console.error(Z.red(`Failed to write to ${Q}: ${W.message}`))}}async function I6($){if($)console.log(Z.cyan("Refreshing shims and wrappers..."));if(await N(M),await N(S),process.platform==="win32")await Bun.write(T(M,"bvm-shim.js"),v$),await Bun.write(T(M,"bvm.cmd"),V$),await Bun.write(T(S,"bun.cmd"),P$),await Bun.write(T(S,"bunx.cmd"),u$);else{let Q=T(M,"bvm-shim.sh");await Bun.write(Q,_$),await x$(Q,493);let J="";if(process.env.BVM_INSTALL_SOURCE==="npm")J=`#!/bin/bash
export BVM_DIR="${O}"
export BVM_INSTALL_SOURCE="npm"
# 1. Try internal runtime
if [ -x "${O}/current/bin/bun" ]; then
  exec "${O}/current/bin/bun" "${O}/src/index.js" "$@"
# 2. Try global/system bun (fallback)
elif command -v bun >/dev/null 2>&1; then
  exec bun "${O}/src/index.js" "$@"
else
  echo "Error: BVM requires Bun. Please install Bun or ensure it is in your PATH."
  exit 1
fi
`;else J=`#!/bin/bash
export BVM_DIR="${O}"
exec "${O}/current/bin/bun" "${O}/src/index.js" "$@"`;let Y=T(M,"bvm");await Bun.write(Y,J),await x$(Y,493);for(let K of["bun","bunx"]){let X=`#!/bin/bash
export BVM_DIR="${O}"
exec "${O}/bin/bvm-shim.sh" "${K}" "$@"`,b=T(S,K);await Bun.write(b,X),await x$(b,493)}}}async function E6($=!0){await U1();let q="";try{q=Bun.spawnSync({cmd:["powershell","-NoProfile","-Command","echo $PROFILE.CurrentUserAllHosts"],stdout:"pipe"}).stdout.toString().trim()}catch(Q){q=T($$(),"Documents","WindowsPowerShell","Microsoft.PowerShell_profile.ps1")}if(!q)return;await N(R6(q)),await S6(q,$)}async function S6($,q=!0){let Q=`
# BVM Configuration
$env:BVM_DIR = "${O}"
$env:PATH = "$env:BVM_DIRshims;$env:BVM_DIR\bin;$env:PATH"
# Auto-activate default version
if (Test-Path "$env:BVM_DIR\bin\bvm.cmd") {
    & "$env:BVM_DIR\bin\bvm.cmd" use default --silent *>$null
}
`;try{let J="";if(await G($))J=await Bun.file($).text();else await Bun.write($,"");if(J.includes("$env:BVM_DIR")){if(q)console.log(Z.gray("\u2713 Configuration is already up to date."));return}if(q)console.log(Z.cyan(`Configuring PowerShell environment in ${$}...`));if(await Bun.write($,J+`\r
${Q}`),q)console.log(Z.green(`\u2713 Successfully configured BVM path in ${$}`)),console.log(Z.yellow("Please restart your terminal to apply changes."))}catch(J){console.error(Z.red(`Failed to write to ${$}: ${J.message}`))}}async function U1(){if(process.env.BVM_TEST_MODE)return;if(process.env.BVM_SUPPRESS_CONFLICT_WARNING==="true")return;let $=(process.env.PATH||"").split(D6),q=T($$(),".bun"),Q=T(q,"bin");for(let J of $){if(!J||J===M||J.includes(".bvm"))continue;let Y=T(J,j);if(await G(Y)){if(J.includes("node_modules"))continue;if(J===Q||J===q){console.log(),console.log(Z.yellow(" NOTE: OFFICIAL BUN DETECTED ")),console.log(Z.yellow(`Found existing official Bun installation at: ${Y}`)),console.log(Z.yellow("BVM will coexist by taking precedence in your PATH.")),console.log(Z.dim("No files will be deleted. BVM shims will handle version switching."));return}else{console.log(),console.log(Z.yellow(" NOTE: ANOTHER BUN DETECTED ")),console.log(Z.yellow(`Found another Bun installation at: ${Y}`)),console.log(Z.yellow("BVM will take precedence. To avoid confusion, you may manually manage the other version.")),console.log();return}}}}w();import{join as _6,dirname as v6}from"path";async function N$(){let $=process.cwd();while(!0){let q=_6($,".bvmrc");if(await G(q))try{return(await Bun.file(q).text()).trim()}catch(J){return null}let Q=v6($);if(Q===$)break;$=Q}return null}k();F();w();q$();R();import{join as z1}from"path";async function W$($,q,Q={}){let J=async(Y)=>{let K=await g(q);if(!K){if(!Q.silent)console.log(Z.blue(`Please install Bun ${q} first using: bvm install ${q}`));throw Error(`Bun version '${q}' is not installed. Cannot create alias.`)}let X=z1(L,K);if(!await G(X))throw Error(`Internal Error: Resolved Bun version ${K} not found.`);await N(x);let b=z1(x,$);if($!=="default"&&await G(b))throw Error(`Alias '${$}' already exists. Use 'bvm alias ${$} <new-version>' to update or 'bvm unalias ${$}' to remove.`);if(await V(b,`${K}
`),Y)Y.succeed(Z.green(`Alias '${$}' created for Bun ${K}.`))};if(Q.silent)await J();else await y(`Creating alias '${$}' for Bun ${q}...`,(Y)=>J(Y),{failMessage:`Failed to create alias '${$}'`})}R();F();w();k();import{join as L1}from"path";q$();R();async function j$($,q={}){let Q=$;if(!Q)Q=await N$()||void 0;if(!Q){if(!q.silent)console.error(Z.red("No version specified. Usage: bvm use <version>"));throw Error("No version specified.")}let J=async(Y)=>{let K=null,X=await g(Q);if(X)K=X;else{let C=(await P()).map((W)=>U(W));K=r(Q,C)}if(!K)throw Error(`Bun version '${Q}' is not installed.`);let b=U(K),H=L1(L,b),z=L1(H,"bin",j);if(!await G(z))throw Error(`Version ${b} is not properly installed (binary missing).`);if(await J1(H,X$),Y)Y.succeed(Z.green(`Now using Bun ${b} (immediate effect).`))};if(q.silent)await J();else await y(`Switching to Bun ${Q}...`,(Y)=>J(Y),{failMessage:()=>`Failed to switch to Bun ${Q}`})}F();w();k();import{join as t,dirname as w1}from"path";import{chmod as x1,unlink as u6}from"fs/promises";var __dirname="/home/runner/work/bvm/bvm/src/commands",V6=($)=>`@echo off
set "BVM_DIR=%USERPROFILE%.bvm"
if exist "%BVM_DIR%\runtimecurrent\bin\bun.exe" (
    "%BVM_DIR%\runtimecurrent\bin\bun.exe" "%BVM_DIR%\bin\bvm-shim.js" "${$}" %*
) else (
    echo BVM Error: Bun runtime not found.
    exit /b 1
)`,d6=($)=>`#!/bin/bash
export BVM_DIR="${O}"
exec "${t(M,"bvm-shim.sh")}" "${$}" "$@"`;async function Q$(){await N(S),await N(M);let $=B==="win32";try{let Q=t(w1(w1(__dirname)),"src","templates");if($){let J=await Bun.file(t(Q,"bvm-shim.js")).text();await Bun.write(t(M,"bvm-shim.js"),J)}else{let J=await Bun.file(t(Q,"bvm-shim.sh")).text(),Y=t(M,"bvm-shim.sh");await Bun.write(Y,J),await x1(Y,493)}}catch(Q){}let q=new Set(["bun","bunx"]);if(await G(L)){let Q=await p(L);for(let J of Q){if(J.startsWith("."))continue;let Y=t(L,J,"bin");if(await G(Y)){let K=await p(Y);for(let X of K){let b=X.replace(/\.(exe|ps1|cmd)$/i,"");if(b)q.add(b)}}}}for(let Q of q)if($){await Bun.write(t(S,`${Q}.cmd`),V6(Q));let J=t(S,`${Q}.ps1`);if(await G(J))await u6(J)}else{let J=t(S,Q);await Bun.write(J,d6(Q)),await x1(J,493)}console.log(Z.green(`\u2713 Regenerated ${q.size} shims in ${S}`))}import{rename as h6,rm as C1}from"fs/promises";async function g$($,q){try{await h6($,q)}catch(Q){await Bun.write(Bun.file(q),Bun.file($)),await C1($,{force:!0})}}async function k1($,q,Q,J){let Y=await fetch($);if(!Y.ok)throw Error(`Status ${Y.status}`);let K=+(Y.headers.get("Content-Length")||0),X=0,b=Y.body?.getReader();if(!b)throw Error("No response body");let H=Bun.file(q).writer(),z=B==="win32";Q.stop();let C=null,W=-1;if(!z)C=new D$(K||41943040),C.start();else console.log(`Downloading Bun ${J}...`);try{let A=Date.now();while(!0){let{done:h,value:v}=await b.read();if(h)break;if(H.write(v),X+=v.length,!z&&C){let u=(Date.now()-A)/1000,c=u>0?(X/1024/u).toFixed(0):"0";C.update(X,{speed:c})}else if(z&&K){let u=Math.floor(X/K*10);if(u>W)console.log(`  > ${u*10}%`),W=u}}if(await H.end(),!z&&C)C.stop();else console.log("  > 100% [Done]")}catch(A){try{H.end()}catch(h){}if(!z&&C)C.stop();else console.log("  > Download Failed");throw Q.start(),A}Q.start()}async function h$($,q={}){let Q=$,J=null,Y=!1;if(!Q)Q=await N$()||void 0;if(!Q){console.error(Z.red("No version specified and no .bvmrc found. Usage: bvm install <version>"));return}try{await y(`Finding Bun ${Q} release...`,async(K)=>{let X=null,b=U(Q);if(/^v?\d+\.\d+\.\d+$/.test(Q)&&!Q.includes("canary"))if(K.update(`Checking if Bun ${b} exists...`),await b1(b))X=b;else throw K.fail(Z.red(`Bun version ${b} not found on registry.`)),Error(`Bun version ${b} not found on registry.`);else if(Q==="latest"){K.update("Checking latest version...");let u=await G1();if(u.latest)X=U(u.latest);else throw Error('Could not resolve "latest" version.')}else throw K.fail(Z.yellow('Fuzzy matching (e.g. "1.1") is disabled for stability.')),console.log(Z.dim('  Please specify the exact version (e.g. "1.1.20") or "latest".')),console.log(Z.dim("  To see available versions, run: bvm ls-remote")),Error("Fuzzy matching disabled");if(!X)throw K.fail(Z.red(`Could not find a Bun release for '${Q}' compatible with your system.`)),Error(`Could not find a Bun release for '${Q}' compatible with your system.`);let H=await H1(X);if(!H)throw Error(`Could not find a Bun release for ${X} compatible with your system.`);let{url:z,mirrorUrl:C,foundVersion:W}=H,A=n(L,W),h=n(A,"bin"),v=n(h,j);if(await G(v))K.succeed(Z.green(`Bun ${W} is already installed.`)),J=W,Y=!0;else if(U(Bun.version)===W&&!D){K.info(Z.cyan(`Requested version ${W} matches current BVM runtime. Creating symlink...`)),await N(h);let c=process.execPath;try{let{symlink:s}=await import("fs/promises");await s(c,v)}catch(s){await Bun.write(Bun.file(v),Bun.file(c)),await m$(v,493)}K.succeed(Z.green(`Bun ${W} linked from local runtime.`)),J=W,Y=!0}else if(D)await N(h),await c6(v,W),J=W,Y=!0;else{K.update(`Downloading Bun ${W} to cache...`),await N(_);let c=n(_,`${W}-${g6(z)}`);if(await G(c))K.succeed(Z.green(`Using cached Bun ${W} archive.`));else{let I=`${c}.${Date.now()}.tmp`;try{await k1(z,I,K,W),await g$(I,c)}catch(o$){try{await C1(I,{force:!0})}catch{}if(K.update("Download failed, trying mirror..."),console.log(Z.dim(`
Debug: ${o$.message}`)),C){let l1=new URL(C).hostname;K.update(`Downloading from mirror (${l1})...`),await k1(C,I,K,W),await g$(I,c)}else throw o$}}K.update(`Extracting Bun ${W}...`),await N(A),await W1(c,A);let s="",A$=[n(A,j),n(A,"bin",j),n(A,"package","bin",j)],p1=await p(A);for(let I of p1)if(I.startsWith("bun-"))A$.push(n(A,I,j)),A$.push(n(A,I,"bin",j));for(let I of A$)if(await G(I)){s=I;break}if(!s)throw Error(`Could not find bun executable in ${A}`);if(await N(h),s!==v){await g$(s,v);let I=m6(s);if(I!==A&&I!==h)await G$(I)}await m$(v,493),K.succeed(Z.green(`Bun ${W} installed successfully.`)),J=W,Y=!0}},{failMessage:`Failed to install Bun ${Q}`})}catch(K){throw Error(`Failed to install Bun: ${K.message}`)}if(Y)await H$(!1);if(J)try{await j$(J,{silent:!0});let K=n(x,"default");if(!await G(K))await W$("default",J,{silent:!0})}catch(K){}if(await Q$(),J)console.log(Z.cyan(`
\u2713 Bun ${J} installed and active.`)),console.log(Z.dim("  To verify, run: bun --version or bvm ls"))}async function c6($,q){let Q=q.replace(/^v/,""),J=`#!/usr/bin/env bash
set -euo pipefail
if [[ $# -gt 0 && "$1" == "--version" ]]; then echo "${Q}"; exit 0; fi
echo "Bun ${Q} stub invoked with: $@"
exit 0
`;await Bun.write($,J),await m$($,493)}k();w();R();async function F1(){await y("Fetching remote Bun versions...",async($)=>{let Q=(await X1()).filter((J)=>m(J)).filter((J)=>!J.includes("canary")).sort(K$);if(Q.length===0)throw Error("No remote Bun versions found.");$.succeed(Z.green("Available remote Bun versions:")),Q.forEach((J)=>{console.log(`  ${U(J)}`)})},{failMessage:"Failed to fetch remote Bun versions"})}k();w();F();R();import{join as p6}from"path";async function N1(){await y("Fetching locally installed Bun versions...",async($)=>{let q=await P(),J=(await l()).version;if($.succeed(Z.green("Locally installed Bun versions:")),q.length===0)console.log("  (No versions installed yet)");else q.forEach((K)=>{if(K===J)console.log(`* ${Z.green(K)} ${Z.dim("(current)")}`);else console.log(`  ${K}`)});if(await G(x)){let K=await p(x);if(K.length>0){console.log(Z.green(`
Aliases:`));for(let X of K)try{let b=(await f(p6(x,X))).trim(),H=U(b),z=`-> ${Z.cyan(H)}`;if(H===J)z+=` ${Z.dim("(current)")}`;console.log(`  ${X} ${Z.gray(z)}`)}catch(b){}}}},{failMessage:"Failed to list local Bun versions"})}k();w();R();async function j1(){await y("Checking current Bun version...",async($)=>{let{version:q,source:Q}=await l();if(q)$.stop(),console.log(`${Z.green("\u2713")} Current Bun version: ${Z.green(q)} ${Z.dim(`(${Q})`)}`);else $.info(Z.blue("No Bun version is currently active.")),console.log(Z.yellow("Use 'bvm install <version>' to set a default, or create a .bvmrc file."))},{failMessage:"Failed to determine current Bun version"})}k();F();w();R();import{join as c$,basename as l6}from"path";import{unlink as t6}from"fs/promises";async function A1($){await y(`Attempting to uninstall Bun ${$}...`,async(q)=>{let Q=U($),J=c$(L,Q),Y=c$(J,"bin",j);if(!await G(Y))throw Error(`Bun ${$} is not installed.`);let K=!1;try{let X=c$(x,"default");if(await G(X)){let b=(await f(X)).trim();if(U(b)===Q)K=!0}}catch(X){}if(K)throw console.log(Z.yellow("Hint: Set a new default using 'bvm default <new_version>'")),Error(`Bun ${$} is currently set as default. Please set another default before uninstalling.`);try{let X=await K1(X$);if(X){if(U(l6(X))===Q)await t6(X$)}}catch(X){}await G$(J),q.succeed(Z.green(`Bun ${Q} uninstalled successfully.`)),await Q$()},{failMessage:`Failed to uninstall Bun ${$}`})}k();F();w();R();import{join as n6}from"path";import{unlink as o6}from"fs/promises";async function B1($){await y(`Removing alias '${$}'...`,async(q)=>{let Q=n6(x,$);if(!await G(Q))throw Error(`Alias '${$}' does not exist.`);await o6(Q),q.succeed(Z.green(`Alias '${$}' removed successfully.`))},{failMessage:`Failed to remove alias '${$}'`})}k();F();w();q$();R();import{join as p$}from"path";async function M1($,q){await y(`Preparing to run with Bun ${$}...`,async(Q)=>{let J=await g($);if(!J)J=U($);let Y=p$(L,J),K=p$(Y,"bin"),X=p$(K,j);if(!await G(X)){Q.fail(Z.red(`Bun ${$} (resolved: ${J}) is not installed.`)),console.log(Z.yellow(`You can install it using: bvm install ${$}`));return}Q.stop();try{await d([X,...q],{cwd:process.cwd(),prependPath:K}),process.exit(0)}catch(b){console.error(b.message),process.exit(1)}},{failMessage:`Failed to run command with Bun ${$}`})}k();F();w();q$();R();import{join as l$}from"path";async function f1($,q,Q){await y(`Preparing environment for Bun ${$} to execute '${q}'...`,async(J)=>{let Y=await g($);if(!Y)Y=U($);let K=l$(L,Y),X=l$(K,"bin"),b=l$(X,j);if(!await G(b)){J.fail(Z.red(`Bun ${$} (resolved: ${Y}) is not installed.`)),console.log(Z.yellow(`You can install it using: bvm install ${$}`));return}J.stop();try{await d([q,...Q],{cwd:process.cwd(),prependPath:X}),process.exit(0)}catch(H){console.error(H.message),process.exit(1)}},{failMessage:`Failed to execute command with Bun ${$}'s environment`})}F();w();R();import{join as i6}from"path";async function T1($){await y("Resolving path...",async()=>{let q=null,Q="bun",{version:J}=await l();if(!$||$==="current"){if(q=J,!q)throw Error("No active Bun version found.")}else{let{resolveLocalVersion:K}=await Promise.resolve().then(() => (q$(),O1));if(q=await K($),!q)if(J)q=J,Q=$;else throw Error(`Bun version or command '${$}' not found.`)}let Y=i6(L,q,"bin",Q==="bun"?j:Q);if(await G(Y))console.log(Y);else throw Error(`Command '${Q}' not found in Bun ${q}.`)},{failMessage:"Failed to resolve path"})}k();w();R();q$();async function R1($){await y(`Resolving session version for Bun ${$}...`,async(q)=>{let Q=null,J=await g($);if(J)Q=J;else{let K=(await P()).map((X)=>U(X));Q=r($,K)}if(!Q)throw Error(`Bun version '${$}' is not installed or cannot be resolved.`);let Y=U(Q);q.succeed(Z.green(`Bun ${Y} will be active in this session.`)),console.log(`export BVM_ACTIVE_VERSION=${Y}`),console.log(Z.dim("Run `eval $(bvm shell <version>)` or `export BVM_ACTIVE_VERSION=...` to activate."))},{failMessage:`Failed to set session version for Bun ${$}`})}k();F();w();R();import{join as a6}from"path";async function D1($){let q=a6(x,"default");if(!$)await y("Checking current default Bun version...",async(Q)=>{if(await G(q)){let J=await f(q);Q.succeed(Z.green(`Default Bun version: ${U(J.trim())}`))}else Q.info(Z.blue("No global default Bun version is set.")),console.log(Z.yellow("Use 'bvm default <version>' to set one."))},{failMessage:"Failed to retrieve default Bun version"});else await y(`Setting global default to Bun ${$}...`,async(Q)=>{let J=(await P()).map((K)=>U(K)),Y=r($,J);if(!Y)throw Error(`Bun version '${$}' is not installed.`);await W$("default",Y,{silent:!0}),Q.succeed(Z.green(`\u2713 Default set to ${Y}. New terminals will now start with this version.`))},{failMessage:`Failed to set global default to Bun ${$}`})}F();w();k();R();import{unlink as s6}from"fs/promises";import{join as r6}from"path";async function I1(){await y("Deactivating current Bun version...",async($)=>{let q=r6(x,"default");if(await G(q))await s6(q),$.succeed(Z.green("Default Bun version deactivated.")),console.log(Z.gray("Run `bvm use <version>` to reactivate.")),await Q$();else $.info("No default Bun version is currently active.")},{failMessage:"Failed to deactivate"})}q$();F();w();k();R();async function E1($){if($==="dir"){console.log(_);return}if($==="clear"){await y("Clearing cache...",async(q)=>{await G$(_),await N(_),q.succeed(Z.green("Cache cleared."))},{failMessage:"Failed to clear cache"});return}console.error(Z.red(`Unknown cache command: ${$}`)),console.log("Usage: bvm cache dir | bvm cache clear")}k();F();R();w();import{join as E}from"path";import{tmpdir as e6}from"os";import{rm as S1,mkdir as _1}from"fs/promises";var __dirname="/home/runner/work/bvm/bvm/src/commands",t$=Y$.version;async function v1(){let $=process.env.BVM_INSTALL_SOURCE;if($==="npm"||$==="bun"||__dirname.includes("node_modules")){await y(`Upgrading BVM via ${$||"package manager"}...`,async(Q)=>{let J=await e(),Y=$==="bun"?"bun":"npm";Q.text=`Upgrading BVM via ${Y} using ${J}...`;try{await d([Y,"install","-g","bvm-core","--registry",J]),Q.succeed(Z.green(`BVM upgraded via ${Y} successfully.`))}catch(K){throw Error(`${Y} upgrade failed: ${K.message}`)}});return}try{await y("Checking for BVM updates...",async(Q)=>{let J=D?{version:process.env.BVM_TEST_LATEST_VERSION?.replace("v","")||t$,tarball:"https://example.com/bvm-test.tgz",shasum:"mock",integrity:"mock"}:await F$();if(!J)throw Error("Unable to determine the latest BVM version from NPM Registry.");let Y=J.version;if(!m(Y))throw Error(`Unrecognized version received: ${Y}`);if(!k$(Y,t$)){Q.succeed(Z.green(`BVM is already up to date (v${t$}).`)),console.log(Z.blue("You are using the latest version."));return}if(Q.text=`Updating BVM to v${Y}...`,D&&!process.env.BVM_TEST_REAL_UPGRADE){Q.succeed(Z.green("BVM updated successfully (test mode)."));return}Q.update("Downloading update package...");let K=E(e6(),`bvm-upgrade-${Date.now()}`);await _1(K,{recursive:!0});let X=E(K,"bvm-core.tgz");if(D){await V(X,"mock-tarball");let H=E(K,"package","dist");await _1(H,{recursive:!0}),await V(E(H,"index.js"),"// new cli"),await V(E(H,"bvm-shim.sh"),"# new shim"),await V(E(H,"bvm-shim.js"),"// new shim")}else{let H=await a(J.tarball,{timeout:30000});if(!H.ok)throw Error(`Failed to download tarball: ${H.statusText}`);let z=await H.arrayBuffer();await L$(X,new Uint8Array(z)),Q.update("Extracting update...");try{await d(["tar","-xzf",X,"-C",K])}catch(C){throw Error('Failed to extract update package. Ensure "tar" is available.')}}Q.update("Applying updates...");let b=E(K,"package","dist");if(await G(E(b,"index.js")))await L$(E(O,"src","index.js"),await f(E(b,"index.js")));if(B!=="win32"&&await G(E(b,"bvm-shim.sh")))await L$(E(O,"bin","bvm-shim.sh"),await f(E(b,"bvm-shim.sh")));if(B==="win32"&&await G(E(b,"bvm-shim.js")))await L$(E(O,"bin","bvm-shim.js"),await f(E(b,"bvm-shim.js")));try{await S1(K,{recursive:!0,force:!0})}catch(H){}try{await S1(M$,{force:!0})}catch(H){}Q.update("Finalizing environment..."),await H$(!1),Q.succeed(Z.green(`BVM updated to v${Y} successfully.`)),console.log(Z.yellow("Please restart your terminal to apply changes."))},{failMessage:"Failed to upgrade BVM"})}catch(Q){throw Error(`Failed to upgrade BVM: ${Q.message}`)}}k();F();w();R();import{homedir as $4}from"os";import{join as q4}from"path";async function P1(){await y("Gathering BVM diagnostics...",async()=>{let $={currentVersion:(await l()).version,installedVersions:await P(),aliases:await Q4(),env:{BVM_DIR:O,BVM_BIN_DIR:M,BVM_SHIMS_DIR:S,BVM_VERSIONS_DIR:L,BVM_TEST_MODE:process.env.BVM_TEST_MODE,HOME:process.env.HOME||$4()}};J4($)})}async function Q4(){if(!await G(x))return[];let $=await p(x),q=[];for(let Q of $){let J=q4(x,Q);if(await G(J)){let Y=await Bun.file(J).text();q.push({name:Q,target:U(Y.trim())})}}return q}function J4($){if(console.log(Z.bold(`
Directories`)),console.log(`  BVM_DIR: ${Z.cyan($.env.BVM_DIR||"")}`),console.log(`  BIN_DIR: ${Z.cyan(M)}`),console.log(`  SHIMS_DIR: ${Z.cyan(S)}`),console.log(`  VERSIONS_DIR: ${Z.cyan(L)}`),console.log(Z.bold(`
Environment`)),console.log(`  HOME: ${$.env.HOME||"n/a"}`),console.log(`  BVM_TEST_MODE: ${$.env.BVM_TEST_MODE||"false"}`),console.log(Z.bold(`
Installed Versions`)),$.installedVersions.length===0)console.log("  (none installed)");else $.installedVersions.forEach((q)=>{let Q=q===$.currentVersion,J=Q?Z.green("*"):" ",Y=Q?Z.green(q):q,K=Q?Z.green(" (current)"):"";console.log(`  ${J} ${Y}${K}`)});if(console.log(Z.bold(`
Aliases`)),$.aliases.length===0)console.log("  (no aliases configured)");else $.aliases.forEach((q)=>{console.log(`  ${q.name} ${Z.gray("->")} ${Z.cyan(q.target)}`)});console.log(`
`+Z.green("Diagnostics complete."))}var n$=["install","uninstall","use","ls","ls-remote","current","alias","unalias","run","exec","which","cache","setup","upgrade","doctor","completion","deactivate","help"],u1={bash:`#!/usr/bin/env bash
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
`};function V1($){let q=u1[$];if(!q)throw Error(`Unsupported shell '${$}'. Supported shells: ${Object.keys(u1).join(", ")}`);console.log(q)}k();F();w();import{join as d1}from"path";k();var g1="update-check.json",K4=86400000;async function m1(){if(process.env.CI||D)return;let $=d1(_,g1);try{if(await G($)){let q=await f($),Q=JSON.parse(q);if(Date.now()-Q.lastCheck<K4)return}}catch(q){}try{let q=await F$();if(q){let Q=q.tagName.startsWith("v")?q.tagName.slice(1):q.tagName;await N(_),await V($,JSON.stringify({lastCheck:Date.now(),latestVersion:Q}))}}catch(q){}}async function h1(){if(process.env.CI||D)return null;let $=Y$.version,q=d1(_,g1);try{if(await G(q)){let Q=await f(q),J=JSON.parse(Q);if(J.latestVersion&&k$(J.latestVersion,$))return`
${Z.gray("Update available:")} ${Z.green(`v${J.latestVersion}`)} ${Z.dim(`(current: v${$})`)}
${Z.gray("Run")} ${Z.cyan("bvm upgrade")} ${Z.gray("to update.")}`}}catch(Q){}return null}class c1{commands={};helpEntries=[];name;versionStr;constructor($){this.name=$,this.versionStr=Y$.version}command($,q,Q={}){let J=$.split(" ")[0],Y={description:q,usage:`${this.name} ${$}`,action:async()=>{},aliases:Q.aliases};if(this.commands[J]=Y,this.helpEntries.push(`  ${$.padEnd(35)} ${q}`),Q.aliases)Q.aliases.forEach((X)=>{this.commands[X]=Y});let K={action:(X)=>{return Y.action=X,K},option:(X,b)=>K};return K}async run(){m1().catch(()=>{});let{values:$,positionals:q}=Y4({args:Bun.argv.slice(2),strict:!1,allowPositionals:!0,options:{help:{type:"boolean",short:"h"},version:{type:"boolean",short:"v"},silent:{type:"boolean",short:"s"}}}),Q=q[0],J=!!($.silent||$.s),Y=!!($.version||$.v||$.help||$.h);if(!Q){if($.version||$.v)console.log(this.versionStr),process.exit(0);if($.help||$.h)this.showHelp(),process.exit(0);this.showHelp(),process.exit(1)}if($.help||$.h)this.showHelp(),process.exit(0);let K=this.commands[Q];if(!K)console.error(Z.yellow(`Unknown command '${Q}'`)),this.showHelp(),process.exit(0);try{if(await K.action(q.slice(1),$),!Y&&!J&&["ls","current","doctor","default"].includes(Q)){let X=await h1();if(X)console.log(X)}}catch(X){if(!X.reported)console.error(Z.red(`\u2716 ${X.message}`));process.exit(1)}}showHelp(){console.log(`Bun Version Manager (bvm) v${this.versionStr}`),console.log(`Built with Bun \xB7 Runs with Bun \xB7 Tested on Bun
`),console.log("Usage:"),console.log(`  ${this.name} <command> [flags]
`),console.log("Commands:"),console.log(this.helpEntries.join(`
`)),console.log(`
Global Flags:`),console.log("  --help, -h                     Show this help message"),console.log("  --version, -v                  Show version number"),console.log(`
Examples:`),console.log("  bvm install 1.0.0"),console.log("  bvm use 1.0.0"),console.log("  bvm run 1.0.0 index.ts")}}async function Z4(){let $=new c1("bvm");$.command("rehash","Regenerate shims for all installed binaries").action(async()=>{await Q$()}),$.command("install [version]","Install a Bun version and set as current").option("--global, -g","Install as a global tool (not just default)").action(async(q,Q)=>{await h$(q[0],{global:Q.global||Q.g})}),$.command("i [version]","Alias for install").action(async(q,Q)=>{await h$(q[0],{global:Q.global||Q.g})}),$.command("ls","List installed Bun versions",{aliases:["list"]}).action(async()=>{await N1()}),$.command("ls-remote","List all available remote Bun versions").action(async()=>{await F1()}),$.command("use <version>","Switch the active Bun version immediately (all terminals)").action(async(q)=>{if(!q[0])throw Error("Version is required");await j$(q[0])}),$.command("shell <version>","Switch Bun version for the current shell session").action(async(q)=>{if(!q[0])throw Error("Version is required");await R1(q[0])}),$.command("default [version]","Display or set the global default Bun version").action(async(q)=>{await D1(q[0])}),$.command("current","Display the currently active Bun version").action(async()=>{await j1()}),$.command("uninstall <version>","Uninstall a Bun version").action(async(q)=>{if(!q[0])throw Error("Version is required");await A1(q[0])}),$.command("alias <name> <version>","Create an alias for a Bun version").action(async(q)=>{if(!q[0]||!q[1])throw Error("Name and version are required");await W$(q[0],q[1])}),$.command("unalias <name>","Remove an existing alias").action(async(q)=>{if(!q[0])throw Error("Alias name is required");await B1(q[0])}),$.command("run <version> [...args]","Run a command with a specific Bun version").action(async(q)=>{let Q=q[0];if(!Q)throw Error("Version is required");let J=process.argv.indexOf("run"),Y=J!==-1?process.argv.slice(J+2):[];await M1(Q,Y)}),$.command("exec <version> <cmd> [...args]","Execute a command with a specific Bun version's environment").action(async(q)=>{let Q=q[0],J=q[1];if(!Q||!J)throw Error("Version and command are required");let Y=process.argv.indexOf("exec"),K=Y!==-1?process.argv.slice(Y+3):[];await f1(Q,J,K)}),$.command("which [version]","Display path to installed bun version").action(async(q)=>{await T1(q[0])}),$.command("deactivate","Undo effects of bvm on current shell").action(async()=>{await I1()}),$.command("version <spec>","Resolve the given description to a single local version").action(async(q)=>{if(!q[0])throw Error("Version specifier is required");await d$(q[0])}),$.command("cache <action>","Manage bvm cache").action(async(q)=>{if(!q[0])throw Error("Action is required");await E1(q[0])}),$.command("setup","Configure shell environment automatically").option("--silent, -s","Suppress output").action(async(q,Q)=>{await H$(!(Q.silent||Q.s))}),$.command("upgrade","Upgrade bvm to the latest version",{aliases:["self-update"]}).action(async()=>{await v1()}),$.command("doctor","Show diagnostics for Bun/BVM setup").action(async()=>{await P1()}),$.command("completion <shell>","Generate shell completion script (bash|zsh|fish)").action(async(q)=>{if(!q[0])throw Error("Shell name is required");V1(q[0])}),await $.run(),process.exit(0)}Z4().catch(($)=>{console.error(Z.red(`
[FATAL ERROR] Unexpected Crash:`)),console.error($),process.exit(1)});
