#!/usr/bin/env bun
// @bun
var i1=Object.create;var{getPrototypeOf:a1,defineProperty:B$,getOwnPropertyNames:s1}=Object;var r1=Object.prototype.hasOwnProperty;var O$=($,q,Q)=>{Q=$!=null?i1(a1($)):{};let J=q||!$||!$.__esModule?B$(Q,"default",{value:$,enumerable:!0}):Q;for(let Y of s1($))if(!r1.call(J,Y))B$(J,Y,{get:()=>$[Y],enumerable:!0});return J};var a$=($,q)=>{for(var Q in q)B$($,Q,{get:q[Q],enumerable:!0,configurable:!0,set:(J)=>q[Q]=()=>J})};var y$=($,q)=>()=>($&&(q=$($=0)),q);var z$=import.meta.require;var r$={};a$(r$,{getBvmDir:()=>s$,getBunAssetName:()=>T$,USER_AGENT:()=>X$,TEST_REMOTE_VERSIONS:()=>Z$,REPO_FOR_BVM_CLI:()=>Q6,OS_PLATFORM:()=>B,IS_TEST_MODE:()=>D,EXECUTABLE_NAME:()=>R,CPU_ARCH:()=>L$,BVM_VERSIONS_DIR:()=>w,BVM_SRC_DIR:()=>M$,BVM_SHIMS_DIR:()=>I,BVM_FINGERPRINTS_FILE:()=>f$,BVM_DIR:()=>z,BVM_CURRENT_DIR:()=>b$,BVM_COMPONENTS:()=>Y6,BVM_CDN_ROOT:()=>K6,BVM_CACHE_DIR:()=>_,BVM_BIN_DIR:()=>A,BVM_ALIAS_DIR:()=>C,BUN_GITHUB_RELEASES_API:()=>q6,ASSET_NAME_FOR_BVM:()=>J6});import{homedir as $6}from"os";import{join as i}from"path";function s$(){let $=process.env.HOME||$6();return i($,".bvm")}function T$($){return`bun-${B==="win32"?"windows":B}-${L$==="arm64"?"aarch64":"x64"}.zip`}var B,L$,D,Z$,z,M$,w,A,I,b$,C,_,f$,R,q6="https://api.github.com/repos/oven-sh/bun/releases",Q6="EricLLLLLL/bvm",J6,X$="bvm (Bun Version Manager)",K6,Y6;var F=y$(()=>{B=process.platform,L$=process.arch,D=process.env.BVM_TEST_MODE==="true",Z$=["v1.3.4","v1.2.23","v1.0.0","bun-v1.4.0-canary"];z=s$(),M$=i(z,"src"),w=i(z,"versions"),A=i(z,"bin"),I=i(z,"shims"),b$=i(z,"current"),C=i(z,"aliases"),_=i(z,"cache"),f$=i(z,"fingerprints.json"),R=B==="win32"?"bun.exe":"bun",J6=B==="win32"?"bvm.exe":"bvm",K6=process.env.BVM_CDN_URL||"https://cdn.jsdelivr.net/gh/EricLLLLLL/bvm",Y6=[{name:"CLI Core",remotePath:"index.js",localPath:"src/index.js"},{name:"Windows Shim",remotePath:"bvm-shim.js",localPath:"bin/bvm-shim.js",platform:"win32"},{name:"Unix Shim",remotePath:"bvm-shim.sh",localPath:"bin/bvm-shim.sh",platform:"posix"}]});function m($){if(!$)return null;return $.match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/)?$:null}function e$($){let q=m($);return q?q.replace(/^v/,""):null}function J$($){if(!$)return null;let q=$.replace(/^v/,""),J=q.split(/[-+]/)[0].split(".").map(Number);if(J.length===0||J.some((K)=>isNaN(K)))return null;let Y=q.includes("-")?q.split("-")[1].split("+")[0]:void 0;return{major:J[0],minor:J[1],patch:J[2],pre:Y}}function D$($,q){if(!$||!q)return 0;if($.major!==q.major)return $.major-q.major;if($.minor!==q.minor)return $.minor-q.minor;if($.patch!==q.patch)return $.patch-q.patch;if($.pre&&!q.pre)return-1;if(!$.pre&&q.pre)return 1;if($.pre&&q.pre)return $.pre.localeCompare(q.pre);return 0}function $1($,q){let Q=J$($),J=J$(q);return D$(Q,J)}function K$($,q){return $1(q,$)}function k$($,q){return $1($,q)>0}function q1($,q){if(q==="*"||q===""||q==="latest")return!0;let Q=J$($);if(!Q)return!1;let J=q;if(q.startsWith("v"))J=q.substring(1);if(e$($)===e$(q))return!0;let Y=J.split(".");if(Y.length===1){let K=Number(Y[0]);if(Q.major===K)return!0}else if(Y.length===2){let K=Number(Y[0]),Z=Number(Y[1]);if(Q.major===K&&Q.minor===Z)return!0}if(q.startsWith("~")){let K=J$(q.substring(1));if(!K)return!1;let Z=K.patch??0;return Q.major===K.major&&Q.minor===K.minor&&Q.patch>=Z}if(q.startsWith("^")){let K=J$(q.substring(1));if(!K)return!1;let Z=K.patch??0,X=K.minor??0;if(K.major===0){if(Q.major!==0)return!1;if(Q.minor!==X)return!1;return Q.patch>=Z}if(Q.major!==K.major)return!1;if(Q.minor<X)return!1;if(Q.minor===X&&Q.patch<Z)return!1;return!0}return!1}import{readdir as b6,mkdir as X6,stat as Q1,symlink as G6,unlink as J1,rm as K1,readlink as W6}from"fs/promises";import{join as N$,dirname as H6,basename as U6}from"path";async function f($){try{await X6($,{recursive:!0})}catch(q){if(q.code==="EEXIST")try{if((await Q1($)).isDirectory())return}catch{}throw q}}async function G($){try{return await Q1($),!0}catch(q){if(q.code==="ENOENT")return!1;throw q}}async function Y1($,q){try{await J1(q)}catch(J){try{await K1(q,{recursive:!0,force:!0})}catch(Y){}}let Q=process.platform==="win32"?"junction":"dir";await G6($,q,Q)}async function Z1($){try{return await W6($)}catch(q){if(q.code==="ENOENT"||q.code==="EINVAL")return null;throw q}}async function G$($){await K1($,{recursive:!0,force:!0})}async function l($){try{return await b6($)}catch(q){if(q.code==="ENOENT")return[];throw q}}async function M($){return await Bun.file($).text()}async function g($,q){await Bun.write($,q)}async function w$($,q,Q={}){let{backup:J=!0}=Q,Y=H6($);await f(Y);let K=`${$}.tmp-${Date.now()}`,Z=`${$}.bak`;try{if(await g(K,q),J&&await G($))try{let{rename:W,unlink:y}=await import("fs/promises");if(await G(Z))await y(Z).catch(()=>{});await W($,Z)}catch(W){}let{rename:X}=await import("fs/promises");try{await X(K,$)}catch(W){await Bun.write($,q),await J1(K).catch(()=>{})}}catch(X){let{unlink:W}=await import("fs/promises");throw await W(K).catch(()=>{}),X}}function U($){let q=$.trim();if(q.startsWith("bun-v"))q=q.substring(4);if(!q.startsWith("v")&&/^\d/.test(q))q=`v${q}`;return q}async function u(){return await f(w),(await l(w)).filter((q)=>m(U(q))).sort(K$)}async function t(){if(process.env.BVM_ACTIVE_VERSION)return{version:U(process.env.BVM_ACTIVE_VERSION),source:"env"};let $=N$(process.cwd(),".bvmrc");if(await G($)){let Z=(await M($)).trim();return{version:U(Z),source:".bvmrc"}}let{getBvmDir:q}=await Promise.resolve().then(() => (F(),r$)),Q=q(),J=N$(Q,"current"),Y=N$(Q,"aliases");if(await G(J)){let{realpath:Z}=await import("fs/promises");try{let X=await Z(J);return{version:U(U6(X)),source:"current"}}catch(X){}}let K=N$(Y,"default");if(await G(K)){let Z=(await M(K)).trim();return{version:U(Z),source:"default"}}return{version:null,source:null}}function e($,q){if(!$||q.length===0)return null;let Q=U($);if(q.includes(Q))return Q;if($.toLowerCase()==="latest")return q[0];if(/^\d+\.\d+\.\d+$/.test($.replace(/^v/,"")))return null;if(!/^[v\d]/.test($))return null;let Y=$.startsWith("v")?`~${$.substring(1)}`:`~${$}`,K=q.filter((Z)=>q1(Z,Y));if(K.length>0)return K.sort(K$)[0];return null}var x=y$(()=>{F()});class R${timer=null;frames=process.platform==="win32"?["-"]:["\u280B","\u2819","\u2839","\u2838","\u283C","\u2834","\u2826","\u2827","\u2807","\u280F"];frameIndex=0;text;isWindows=process.platform==="win32";constructor($){this.text=$}start($){if($)this.text=$;if(this.timer)return;if(this.isWindows){process.stdout.write(`${b.cyan(">")} ${this.text}
`);return}this.timer=setInterval(()=>{process.stdout.write(`\r\x1B[K${b.cyan(this.frames[this.frameIndex])} ${this.text}`),this.frameIndex=(this.frameIndex+1)%this.frames.length},80)}stop(){if(this.isWindows)return;if(this.timer)clearInterval(this.timer),this.timer=null,process.stdout.write("\r\x1B[K");process.stdout.write("\x1B[?25h")}succeed($){this.stop(),console.log(`${b.green("  \u2713")} ${$||this.text}`)}fail($){this.stop(),console.log(`${b.red("  \u2716")} ${$||this.text}`)}info($){this.stop(),console.log(`${b.blue("  \u2139")} ${$||this.text}`)}update($){if(this.text=$,this.isWindows)console.log(b.dim(`  ... ${this.text}`))}}class I${total;current=0;width=20;constructor($){this.total=$}start(){process.stdout.write("\x1B[?25l"),this.render()}update($,q){this.current=$,this.render(q)}stop(){process.stdout.write(`\x1B[?25h
`)}render($){let q=Math.min(1,this.current/this.total),Q=Math.round(this.width*q),J=this.width-Q,Y=process.platform==="win32",K=Y?"=":"\u2588",Z=Y?"-":"\u2591",X=b.green(K.repeat(Q))+b.gray(Z.repeat(J)),W=(q*100).toFixed(0).padStart(3," "),y=(this.current/1048576).toFixed(1),N=(this.total/1048576).toFixed(1),H=$?` ${$.speed}KB/s`:"";process.stdout.write(`\r\x1B[2K ${X} ${W}% | ${y}/${N}MB${H}`)}}var O6,y6=($)=>$.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),a=($,q,Q=$)=>(J)=>O6?$+J.replace(new RegExp(y6(q),"g"),Q)+q:J,b;var k=y$(()=>{O6=!process.env.NO_COLOR,b={red:a("\x1B[1;31m","\x1B[39m"),green:a("\x1B[1;32m","\x1B[39m"),yellow:a("\x1B[1;33m","\x1B[39m"),blue:a("\x1B[1;34m","\x1B[39m"),magenta:a("\x1B[1;35m","\x1B[39m"),cyan:a("\x1B[1;36m","\x1B[39m"),gray:a("\x1B[90m","\x1B[39m"),bold:a("\x1B[1m","\x1B[22m","\x1B[22m\x1B[1m"),dim:a("\x1B[2m","\x1B[22m","\x1B[22m\x1B[2m")}});async function O($,q,Q){if(process.platform==="win32"){console.log(b.cyan(`> ${$}`));let K={start:(Z)=>{if(Z)console.log(b.cyan(`> ${Z}`))},stop:()=>{},succeed:(Z)=>console.log(b.green(`  \u2713 ${Z}`)),fail:(Z)=>console.log(b.red(`  \u2716 ${Z}`)),info:(Z)=>console.log(b.cyan(`  \u2139 ${Z}`)),update:(Z)=>console.log(b.dim(`  ... ${Z}`)),isSpinning:!1};try{return await q(K)}catch(Z){let X=y1(Z,Q?.failMessage);if(console.log(b.red(`  \u2716 ${X}`)),process.env.BVM_DEBUG,console.log(b.dim(`    Details: ${Z.message}`)),Z.code)console.log(b.dim(`    Code: ${Z.code}`));throw Z.reported=!0,Z}}let Y=new R$($);Y.start();try{let K=await q(Y);return Y.stop(),K}catch(K){let Z=y1(K,Q?.failMessage);throw Y.fail(b.red(Z)),K.reported=!0,K}}function y1($,q){let Q=$ instanceof Error?$.message:String($);if(!q)return Q;if(typeof q==="function")return q($);return`${q}: ${Q}`}var T=y$(()=>{k()});var z1={};a$(z1,{resolveLocalVersion:()=>h,displayVersion:()=>S$});import{join as B6}from"path";async function h($){if($==="current"){let{version:Y}=await t();return Y}if($==="latest"){let Y=await u();if(Y.length>0)return Y[0];return null}let q=B6(C,$);if(await G(q))try{let Y=(await M(q)).trim();return U(Y)}catch{return null}let Q=U($),J=await u();return e($,J)}async function S$($){await O(`Resolving version '${$}'...`,async()=>{let q=await h($);if(q)console.log(q);else throw Error("N/A")},{failMessage:`Failed to resolve version '${$}'`})}var q$=y$(()=>{F();x();T()});import{parseArgs as K4}from"util";var Y$={name:"bvm-core",version:"1.1.25",description:"The native version manager for Bun. Cross-platform, shell-agnostic, and zero-dependency.",main:"dist/index.js",bin:{bvm:"bin/bvm-npm.js"},publishConfig:{access:"public"},scripts:{dev:"bun run src/index.ts",build:"bun build src/index.ts --target=bun --outfile dist/index.js --minify && bun run scripts/sync-runtime.ts",test:"bun test",bvm:"bun run src/index.ts","bvm:sandbox":'mkdir -p "$PWD/.sandbox-home" && HOME="$PWD/.sandbox-home" bun run src/index.ts',release:"bun run scripts/release.ts","test:e2e:npm":"bun run scripts/verify-e2e-npm.ts","sync-runtime":"bun run scripts/sync-runtime.ts",postinstall:"node scripts/postinstall.js"},repository:{type:"git",url:"git+https://github.com/EricLLLLLL/bvm.git"},keywords:["bun","version-manager","cli","bvm","nvm","nvm-windows","fnm","nodenv","bun-nvm","version-switching"],files:["dist/index.js","dist/bvm-shim.sh","dist/bvm-shim.js","bin/bvm-npm.js","scripts/postinstall.js","install.sh","install.ps1","README.md"],author:"EricLLLLLL",license:"MIT",type:"commonjs",dependencies:{"cli-progress":"^3.12.0"},optionalDependencies:{"@oven/bun-darwin-aarch64":"^1.3.6","@oven/bun-darwin-x64":"^1.3.6","@oven/bun-linux-aarch64":"^1.3.6","@oven/bun-linux-x64":"^1.3.6","@oven/bun-windows-x64":"^1.3.6"},devDependencies:{"@types/bun":"^1.3.4","@types/cli-progress":"^3.11.6","@types/node":"^24.10.2",bun:"^1.3.6",esbuild:"^0.27.2",execa:"^9.6.1",typescript:"^5"},peerDependencies:{typescript:"^5"}};F();x();import{join as o,basename as g6,dirname as d6}from"path";F();x();k();import{join as w6}from"path";function b1($,q){if($==="darwin"){if(q==="arm64")return"@oven/bun-darwin-aarch64";if(q==="x64")return"@oven/bun-darwin-x64"}if($==="linux"){if(q==="arm64")return"@oven/bun-linux-aarch64";if(q==="x64")return"@oven/bun-linux-x64"}if($==="win32"){if(q==="x64")return"@oven/bun-windows-x64"}return null}function X1($,q,Q){let J=Q;if(!J.endsWith("/"))J+="/";let Y=$.startsWith("@"),K=$;if(Y){let X=$.split("/");if(X.length===2)K=X[1]}let Z=`${K}-${q}.tgz`;return`${J}${$}/-/${Z}`}k();async function d($,q={}){let{cwd:Q,env:J,prependPath:Y,stdin:K="inherit",stdout:Z="inherit",stderr:X="inherit"}=q,W={...process.env,...J};if(Y){let H=W.PATH||"",j=process.platform==="win32"?";":":";W.PATH=`${Y}${j}${H}`}let N=await Bun.spawn({cmd:$,cwd:Q,env:W,stdin:K,stdout:Z,stderr:X}).exited;if((N??0)!==0)throw Error(`${b.red("Command failed")}: ${$.join(" ")} (code ${N})`);return N??0}async function s($,q={}){let{timeout:Q=5000,...J}=q,Y=new AbortController,K=setTimeout(()=>Y.abort(),Q);try{let Z=await fetch($,{...J,signal:Y.signal});return clearTimeout(K),Z}catch(Z){if(clearTimeout(K),Z.name==="AbortError")throw Error(`Request to ${$} timed out after ${Q}ms`);throw Z}}async function z6($,q=2000){if($.length===0)throw Error("No URLs to race");if($.length===1)return $[0];return new Promise((Q,J)=>{let Y=0,K=!1;$.forEach((Z)=>{s(Z,{method:"HEAD",timeout:q}).then((X)=>{if(X.ok&&!K)K=!0,Q(Z);else if(!K){if(Y++,Y===$.length)J(Error("All requests failed"))}}).catch(()=>{if(!K){if(Y++,Y===$.length)J(Error("All requests failed"))}})})})}async function L6(){try{let $=await s("https://1.1.1.1/cdn-cgi/trace",{timeout:500});if(!$.ok)return null;let Q=(await $.text()).match(/loc=([A-Z]{2})/);return Q?Q[1]:null}catch($){return null}}var E$=null,x$={NPM:"https://registry.npmjs.org",TAOBAO:"https://registry.npmmirror.com",TENCENT:"https://mirrors.cloud.tencent.com/npm/"};async function $$(){if(E$)return E$;let $=await L6(),q=[];if($==="CN")q=[x$.TAOBAO,x$.TENCENT,x$.NPM];else q=[x$.NPM,x$.TAOBAO];try{let Q=await z6(q,2000);return E$=Q,Q}catch(Q){return q[0]}}x();var x6="bun-versions.json",C6=3600000;async function k6(){if(D)return[...Z$];let $=w6(_,x6);try{if(await G($)){let Y=await M($),K=JSON.parse(Y);if(Date.now()-K.timestamp<C6&&Array.isArray(K.versions))return K.versions}}catch(Y){}let q=await $$(),Q=[q];if(q!=="https://registry.npmjs.org")Q.push("https://registry.npmjs.org");let J=null;for(let Y of Q){let K=`${Y.replace(/\/$/,"")}/bun`;try{let Z=await s(K,{headers:{"User-Agent":X$,Accept:"application/vnd.npm.install-v1+json"},timeout:1e4});if(!Z.ok)throw Error(`Status ${Z.status}`);let X=await Z.json();if(!X.versions)throw Error("Invalid response (no versions)");let W=Object.keys(X.versions);try{await f(_),await g($,JSON.stringify({timestamp:Date.now(),versions:W}))}catch(y){}return W}catch(Z){J=Z}}throw J||Error("Failed to fetch versions from any registry.")}async function N6(){if(D)return[...Z$];return new Promise(($,q)=>{let Q=[];try{let J=Bun.spawn(["git","ls-remote","--tags","https://github.com/oven-sh/bun.git"],{stdout:"pipe",stderr:"pipe"}),Y=setTimeout(()=>{J.kill(),q(Error("Git operation timed out"))},1e4);new Response(J.stdout).text().then((Z)=>{clearTimeout(Y);let X=Z.split(`
`);for(let W of X){let y=W.match(/refs\/tags\/bun-v?(\d+\.\d+\.\d+.*)$/);if(y)Q.push(y[1])}$(Q)}).catch((Z)=>{clearTimeout(Y),q(Z)})}catch(J){q(Error(`Failed to run git: ${J.message}`))}})}async function G1(){if(D)return[...Z$];try{let q=(await k6()).filter((Q)=>m(Q)).map((Q)=>({v:Q,parsed:J$(Q)}));return q.sort((Q,J)=>D$(J.parsed,Q.parsed)),q.map((Q)=>Q.v)}catch($){try{let q=await N6();if(q.length>0)return Array.from(new Set(q.filter((J)=>m(J)))).sort(K$);throw Error("No versions found via Git")}catch(q){throw Error(`Failed to fetch versions. NPM: ${$.message}. Git: ${q.message}`)}}}async function W1($){if(D)return Z$.includes($)||$==="latest";let q=await $$(),Q=$.replace(/^v/,""),J=`${q}/bun/${Q}`,Y=B==="win32"?"curl.exe":"curl",K=async()=>{try{return await d([Y,"-I","-f","-m","5","-s",J],{stdout:"ignore",stderr:"ignore"}),!0}catch(X){return!1}},Z=new Promise((X)=>setTimeout(()=>X(!1),1e4));return Promise.race([K(),Z])}async function H1(){if(D)return{latest:"1.1.20"};let q=`${await $$()}/-/package/bun/dist-tags`;try{let Q=await s(q,{headers:{"User-Agent":X$},timeout:5000});if(Q.ok)return await Q.json()}catch(Q){}return{}}async function U1($){let q=U($);if(!m(q))return console.error(b.red(`Invalid version provided to findBunDownloadUrl: ${$}`)),null;if(D)return{url:`https://example.com/${T$(q)}`,foundVersion:q};let Y=b1(B==="win32"?"win32":B,L$==="arm64"?"arm64":"x64");if(!Y)throw Error(`Unsupported platform/arch for NPM download: ${B}-${L$}`);let K="";if(process.env.BVM_REGISTRY)K=process.env.BVM_REGISTRY;else if(process.env.BVM_DOWNLOAD_MIRROR)K=process.env.BVM_DOWNLOAD_MIRROR;else K=await $$();let Z=q.replace(/^v/,"");return{url:X1(Y,Z,K),foundVersion:q}}async function F$(){try{let q=(await $$()).replace(/\/$/,""),Q=await s(`${q}/-/package/bvm-core/dist-tags`,{headers:{"User-Agent":X$},timeout:5000});if(!Q.ok)return null;let Y=(await Q.json()).latest;if(!Y)return null;let K=await s(`${q}/bvm-core/${Y}`,{headers:{"User-Agent":X$},timeout:5000});if(K.ok){let Z=await K.json();return{version:Y,tarball:Z.dist.tarball,integrity:Z.dist.integrity,shasum:Z.dist.shasum}}}catch($){}return null}k();F();import{spawn as F6}from"child_process";async function O1($,q){if($.endsWith(".zip"))if(B==="win32")await d(["powershell","-Command",`Expand-Archive -Path "${$}" -DestinationPath "${q}" -Force`],{stdout:"ignore",stderr:"inherit"});else await d(["unzip","-o","-q",$,"-d",q],{stdout:"ignore",stderr:"inherit"});else if($.endsWith(".tar.gz")||$.endsWith(".tgz"))await new Promise((Q,J)=>{let Y=F6("tar",["-xzf",$,"-C",q],{stdio:"inherit",shell:!1});Y.on("close",(K)=>{if(K===0)Q();else J(Error(`tar exited with code ${K}`))}),Y.on("error",(K)=>J(K))});else throw Error(`Unsupported archive format: ${$}`)}import{chmod as c$}from"fs/promises";x();F();k();import{join as L,dirname as w1}from"path";import{homedir as v}from"os";import{mkdir as x1}from"fs/promises";import{chmod as C$}from"fs/promises";F();x();k();import{join as L1}from"path";x();import{join as A6,dirname as j6}from"path";async function A$(){let $=process.cwd();while(!0){let q=A6($,".bvmrc");if(await G(q))try{return(await Bun.file(q).text()).trim()}catch(J){return null}let Q=j6($);if(Q===$)break;$=Q}return null}q$();T();async function W$($,q={}){let Q=$;if(!Q)Q=await A$()||void 0;if(!Q){if(!q.silent)console.error(b.red("No version specified. Usage: bvm use <version>"));throw Error("No version specified.")}let J=async(Y)=>{let K=null,Z=await h(Q);if(Z)K=Z;else{let N=(await u()).map((H)=>U(H));K=e(Q,N)}if(!K)throw Error(`Bun version '${Q}' is not installed.`);let X=U(K),W=L1(w,X),y=L1(W,"bin",R);if(!await G(y))throw Error(`Version ${X} is not properly installed (binary missing).`);if(await Y1(W,b$),Y)Y.succeed(b.green(`Now using Bun ${X} (immediate effect).`))};if(q.silent)await J();else await O(`Switching to Bun ${Q}...`,(Y)=>J(Y),{failMessage:()=>`Failed to switch to Bun ${Q}`})}var _$=`#!/bin/bash

# bvm-init.sh: Initializes bvm default version on shell startup

# Check if BVM_DIR is set
if [ -z "\${BVM_DIR}" ]; then
  return
fi

# Try to switch to the 'default' version silently.
"\${BVM_DIR}/bin/bvm" use default --silent >/dev/null 2>&1 || true
`;var v$=`# bvm-init.fish: Initializes bvm default version on shell startup

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
set "BUN_INSTALL=%BVM_DIR%\\current"

:: Fast-path: If no .bvmrc in current directory, run default directly
if not exist ".bvmrc" (
    "%BVM_DIR%\\runtime\\current\\bin\\bun.exe" %*
    exit /b %errorlevel%
)

:: Slow-path: Hand over to JS shim for version resolution
"%BVM_DIR%\\runtime\\current\\bin\\bun.exe" "%BVM_DIR%\\bin\\bvm-shim.js" "bun" %*

`;var g$=`@echo off
set "BVM_DIR=%USERPROFILE%\\.bvm"
set "BUN_INSTALL=%BVM_DIR%\\current"

if not exist ".bvmrc" (
    "%BVM_DIR%\\runtime\\current\\bin\\bun.exe" %*
    exit /b %errorlevel%
)

"%BVM_DIR%\\runtime\\current\\bin\\bun.exe" "%BVM_DIR%\\bin\\bvm-shim.js" "bunx" %*

`;var d$=`@echo off
set "BVM_DIR=%USERPROFILE%\\.bvm"
"%BVM_DIR%\\runtime\\current\\bin\\bun.exe" "%BVM_DIR%\\src\\index.js" %*
`;async function H$($=!0){if(await S6($),process.platform==="win32"){await _6($);return}let q=process.env.SHELL||"",Q="",J="";if(q.includes("zsh"))J="zsh",Q=L(v(),".zshrc");else if(q.includes("bash"))if(J="bash",process.platform==="darwin")if(await G(L(v(),".bashrc")))Q=L(v(),".bashrc");else Q=L(v(),".bash_profile");else Q=L(v(),".bashrc");else if(q.includes("fish"))J="fish",Q=L(v(),".config","fish","config.fish");else if(await G(L(v(),".zshrc")))J="zsh",Q=L(v(),".zshrc");else if(await G(L(v(),".config","fish","config.fish")))J="fish",Q=L(v(),".config","fish","config.fish");else if(await G(L(v(),".bashrc")))J="bash",Q=L(v(),".bashrc");else if(await G(L(v(),".bash_profile")))J="bash",Q=L(v(),".bash_profile");else{if($)console.log(b.yellow(`Could not detect a supported shell (zsh, bash, fish). Please manually add ${A} to your PATH.`));return}let Y=L(A,"bvm-init.sh");await Bun.write(Y,_$),await C$(Y,493);let K=L(A,"bvm-init.fish");await Bun.write(K,v$),await C$(K,493);let Z="";try{Z=await Bun.file(Q).text()}catch(H){if(H.code==="ENOENT")await Bun.write(Q,""),Z="";else throw H}let X="# >>> bvm initialize >>>",W="# <<< bvm initialize <<<",y=`${X}
# !! Contents within this block are managed by 'bvm setup' !!
export BVM_DIR="${z}"
export PATH="$BVM_DIR/shims:$BVM_DIR/bin:$BVM_DIR/current/bin:$PATH"
# Ensure current link exists for PATH consistency
if [ ! -L "$BVM_DIR/current" ] && [ -f "$BVM_DIR/aliases/default" ]; then
    ln -sf "$BVM_DIR/versions/$(cat "$BVM_DIR/aliases/default")" "$BVM_DIR/current"
fi
${W}`,N=`# >>> bvm initialize >>>
# !! Contents within this block are managed by 'bvm setup' !!
set -Ux BVM_DIR "${z}"
fish_add_path "$BVM_DIR/shims"
fish_add_path "$BVM_DIR/bin"
fish_add_path "$BVM_DIR/current/bin"
# Ensure current link exists
if not test -L "$BVM_DIR/current"
    if test -f "$BVM_DIR/aliases/default"
        ln -sf "$BVM_DIR/versions/$(cat "$BVM_DIR/aliases/default")" "$BVM_DIR/current"
    end
end
# <<< bvm initialize <<<`;if($)console.log(b.cyan(`Configuring ${J} environment in ${Q}...`));try{let H=Z,j=X.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),p=W.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),P=new RegExp(`${j}[\\s\\S]*?${p}`,"g");if(Z.includes(X))H=Z.replace(P,"").trim();let V=J==="fish"?N:y;if(H=(H?H+`

`:"")+V+`
`,H!==Z){if(await Bun.write(Q,H),$)console.log(b.green(`\u2713 Successfully updated BVM configuration in ${Q}`)),console.log(b.gray("  (Moved configuration to the end of file to ensure PATH precedence)"))}if($)console.log(b.yellow(`Please restart your terminal or run "source ${Q}" to apply changes.`));try{await W$("default",{silent:!0})}catch(c){}}catch(H){console.error(b.red(`Failed to write to ${Q}: ${H.message}`))}}async function S6($){if($)console.log(b.cyan("Refreshing shims and wrappers..."));if(!$)console.log(`[DEBUG] BIN_DIR: ${A}`),console.log(`[DEBUG] SHIMS_DIR: ${I}`);if(await x1(A,{recursive:!0}),await x1(I,{recursive:!0}),process.platform==="win32")await Bun.write(L(A,"bvm-shim.js"),u$),await Bun.write(L(A,"bvm.cmd"),d$),await Bun.write(L(I,"bun.cmd"),V$),await Bun.write(L(I,"bunx.cmd"),g$);else{let Q=L(A,"bvm-shim.sh");await Bun.write(Q,P$),await C$(Q,493);let J="",Y=L(z,"runtime","current","bin","bun"),K=L(M$,"index.js");if(process.env.BVM_INSTALL_SOURCE==="npm")J=`#!/bin/bash
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
exec "${Y}" "${K}" "$@"`;let Z=L(A,"bvm");await Bun.write(Z,J),await C$(Z,493);for(let X of["bun","bunx"]){let W=`#!/bin/bash
export BVM_DIR="${z}"
exec "${z}/bin/bvm-shim.sh" "${X}" "$@"`,y=L(I,X);await Bun.write(y,W),await C$(y,493)}}}async function _6($=!0){let q=L(A),Q=L(I),J=L(z,"current","bin");if($)console.log(b.cyan("Configuring Windows environment variables (Registry)..."));let Y=`
        $targetDir = "${z}";
        $shimsPath = "${Q}";
        $binPath = "${q}";
        $currentBinPath = "${J}";
        
        # Set BVM_DIR
        [Environment]::SetEnvironmentVariable("BVM_DIR", $targetDir, "User");
        
        # Get current PATH
        $oldPath = [Environment]::GetEnvironmentVariable("PATH", "User");
        $paths = $oldPath -split ";"
        
        $newPaths = @()
        if ($paths -notcontains $shimsPath) { $newPaths += $shimsPath }
        if ($paths -notcontains $binPath) { $newPaths += $binPath }
        if ($paths -notcontains $currentBinPath) { $newPaths += $currentBinPath }
        
        if ($newPaths.Count -gt 0) {
            $newPathString = (($newPaths + $paths) -join ";").Trim(";")
            [Environment]::SetEnvironmentVariable("PATH", $newPathString, "User");
            return "SUCCESS"
        }
        return "ALREADY_SET"
    `;try{let Z=Bun.spawnSync({cmd:["powershell","-NoProfile","-Command",Y],stdout:"pipe",stderr:"pipe"}),X=Z.stdout.toString().trim();if(Z.success){if($)if(X==="SUCCESS")console.log(b.green("\u2713 Successfully updated User PATH and BVM_DIR in Registry."));else console.log(b.gray("\u2713 Environment variables are already up to date."))}else throw Error(Z.stderr.toString())}catch(Z){console.error(b.red(`Failed to update environment variables: ${Z.message}`))}let K="";try{if(K=Bun.spawnSync({cmd:["powershell","-NoProfile","-Command","echo $PROFILE.CurrentUserAllHosts"],stdout:"pipe"}).stdout.toString().trim(),K)Bun.spawnSync({cmd:["powershell","-NoProfile","-Command",`if (!(Test-Path "${w1(K)}")) { New-Item -ItemType Directory -Force -Path "${w1(K)}" }`],stderr:"pipe"}),await v6(K,!1)}catch(Z){}if($)console.log(b.yellow("Please restart your terminal or IDE to apply the new PATH."))}async function v6($,q=!0){let Q=`
# BVM Configuration
$env:BVM_DIR = "${z}"
$env:PATH = "$env:BVM_DIR\\shims;$env:BVM_DIR\\bin;$env:BVM_DIR\\current\\bin;$env:PATH"
# Auto-activate default version
if (Test-Path "$env:BVM_DIR\\bin\\bvm.cmd") {
    & "$env:BVM_DIR\\bin\\bvm.cmd" use default --silent *>$null
}
`;try{let J="";if(await G($))J=await Bun.file($).text();else await Bun.write($,"");if(J.includes("$env:BVM_DIR")){if(q)console.log(b.gray("\u2713 Configuration is already up to date."));return}if(q)console.log(b.cyan(`Configuring PowerShell environment in ${$}...`));if(await Bun.write($,J+`\r
${Q}`),q)console.log(b.green(`\u2713 Successfully configured BVM path in ${$}`)),console.log(b.yellow("Please restart your terminal to apply changes."))}catch(J){console.error(b.red(`Failed to write to ${$}: ${J.message}`))}}k();F();x();q$();T();import{join as C1}from"path";async function U$($,q,Q={}){let J=async(Y)=>{let K=await h(q);if(!K){if(!Q.silent)console.log(b.blue(`Please install Bun ${q} first using: bvm install ${q}`));throw Error(`Bun version '${q}' is not installed. Cannot create alias.`)}let Z=C1(w,K);if(!await G(Z))throw Error(`Internal Error: Resolved Bun version ${K} not found.`);await f(C);let X=C1(C,$);if($!=="default"&&await G(X))throw Error(`Alias '${$}' already exists. Use 'bvm alias ${$} <new-version>' to update or 'bvm unalias ${$}' to remove.`);if(await g(X,`${K}
`),Y)Y.succeed(b.green(`Alias '${$}' created for Bun ${K}.`))};if(Q.silent)await J();else await O(`Creating alias '${$}' for Bun ${q}...`,(Y)=>J(Y),{failMessage:`Failed to create alias '${$}'`})}T();F();x();k();import{join as n,dirname as k1}from"path";import{chmod as N1,unlink as P6}from"fs/promises";var __dirname="/Users/leiliao/MyWorkspace/bvm/src/commands",u6=($)=>`@echo off
set "BVM_DIR=%USERPROFILE%.bvm"
if exist "%BVM_DIR%\runtimecurrent\bin\bun.exe" (
    "%BVM_DIR%\runtimecurrent\bin\bun.exe" "%BVM_DIR%\bin\bvm-shim.js" "${$}" %*
) else (
    echo BVM Error: Bun runtime not found.
    exit /b 1
)`,V6=($)=>`#!/bin/bash
export BVM_DIR="${z}"
exec "${n(A,"bvm-shim.sh")}" "${$}" "$@"`;async function Q$(){await f(I),await f(A);let $=B==="win32";try{let Q=n(k1(k1(__dirname)),"src","templates");if($){let J=await Bun.file(n(Q,"bvm-shim.js")).text();await Bun.write(n(A,"bvm-shim.js"),J)}else{let J=await Bun.file(n(Q,"bvm-shim.sh")).text(),Y=n(A,"bvm-shim.sh");await Bun.write(Y,J),await N1(Y,493)}}catch(Q){}let q=new Set(["bun","bunx"]);if(await G(w)){let Q=await l(w);for(let J of Q){if(J.startsWith("."))continue;let Y=n(w,J,"bin");if(await G(Y)){let K=await l(Y);for(let Z of K){let X=Z.replace(/\.(exe|ps1|cmd)$/i,"");if(X)q.add(X)}}}}for(let Q of q)if($){await Bun.write(n(I,`${Q}.cmd`),u6(Q));let J=n(I,`${Q}.ps1`);if(await G(J))await P6(J)}else{let J=n(I,Q);await Bun.write(J,V6(Q)),await N1(J,493)}console.log(b.green(`\u2713 Regenerated ${q.size} shims in ${I}`))}import{rename as h6,rm as A1}from"fs/promises";async function h$($,q){try{await h6($,q)}catch(Q){await Bun.write(Bun.file(q),Bun.file($)),await A1($,{force:!0})}}async function F1($,q,Q,J){let Y=await fetch($);if(!Y.ok)throw Error(`Status ${Y.status}`);let K=+(Y.headers.get("Content-Length")||0),Z=0,X=Y.body?.getReader();if(!X)throw Error("No response body");let W=Bun.file(q).writer(),y=B==="win32";Q.stop();let N=null,H=-1;if(!y)N=new I$(K||41943040),N.start();else console.log(`Downloading Bun ${J}...`);try{let j=Date.now();while(!0){let{done:p,value:P}=await X.read();if(p)break;if(W.write(P),Z+=P.length,!y&&N){let V=(Date.now()-j)/1000,c=V>0?(Z/1024/V).toFixed(0):"0";N.update(Z,{speed:c})}else if(y&&K){let V=Math.floor(Z/K*10);if(V>H)console.log(`  > ${V*10}%`),H=V}}if(await W.end(),!y&&N)N.stop();else console.log("  > 100% [Done]")}catch(j){try{W.end()}catch(p){}if(!y&&N)N.stop();else console.log("  > Download Failed");throw Q.start(),j}Q.start()}async function m$($,q={}){let Q=$,J=null,Y=!1;if(!Q)Q=await A$()||void 0;if(!Q){console.error(b.red("No version specified and no .bvmrc found. Usage: bvm install <version>"));return}try{await O(`Finding Bun ${Q} release...`,async(K)=>{let Z=null,X=U(Q);if(/^v?\d+\.\d+\.\d+$/.test(Q)&&!Q.includes("canary"))if(K.update(`Checking if Bun ${X} exists...`),await W1(X))Z=X;else throw K.fail(b.red(`Bun version ${X} not found on registry.`)),Error(`Bun version ${X} not found on registry.`);else if(Q==="latest"){K.update("Checking latest version...");let V=await H1();if(V.latest)Z=U(V.latest);else throw Error('Could not resolve "latest" version.')}else throw K.fail(b.yellow('Fuzzy matching (e.g. "1.1") is disabled for stability.')),console.log(b.dim('  Please specify the exact version (e.g. "1.1.20") or "latest".')),console.log(b.dim("  To see available versions, run: bvm ls-remote")),Error("Fuzzy matching disabled");if(!Z)throw K.fail(b.red(`Could not find a Bun release for '${Q}' compatible with your system.`)),Error(`Could not find a Bun release for '${Q}' compatible with your system.`);let W=await U1(Z);if(!W)throw Error(`Could not find a Bun release for ${Z} compatible with your system.`);let{url:y,mirrorUrl:N,foundVersion:H}=W,j=o(w,H),p=o(j,"bin"),P=o(p,R);if(await G(P))K.succeed(b.green(`Bun ${H} is already installed.`)),J=H,Y=!0;else if(U(Bun.version)===H&&!D){K.info(b.cyan(`Requested version ${H} matches current BVM runtime. Creating symlink...`)),await f(p);let c=process.execPath;try{let{symlink:r}=await import("fs/promises");await r(c,P)}catch(r){await Bun.write(Bun.file(P),Bun.file(c)),await c$(P,493)}K.succeed(b.green(`Bun ${H} linked from local runtime.`)),J=H,Y=!0}else if(D)await f(p),await c6(P,H),J=H,Y=!0;else{K.update(`Downloading Bun ${H} to cache...`),await f(_);let c=o(_,`${H}-${g6(y)}`);if(await G(c))K.succeed(b.green(`Using cached Bun ${H} archive.`));else{let E=`${c}.${Date.now()}.tmp`;try{await F1(y,E,K,H),await h$(E,c)}catch(i$){try{await A1(E,{force:!0})}catch{}if(K.update("Download failed, trying mirror..."),console.log(b.dim(`
Debug: ${i$.message}`)),N){let o1=new URL(N).hostname;K.update(`Downloading from mirror (${o1})...`),await F1(N,E,K,H),await h$(E,c)}else throw i$}}K.update(`Extracting Bun ${H}...`),await f(j),await O1(c,j);let r="",j$=[o(j,R),o(j,"bin",R),o(j,"package","bin",R)],n1=await l(j);for(let E of n1)if(E.startsWith("bun-"))j$.push(o(j,E,R)),j$.push(o(j,E,"bin",R));for(let E of j$)if(await G(E)){r=E;break}if(!r)throw Error(`Could not find bun executable in ${j}`);if(await f(p),r!==P){await h$(r,P);let E=d6(r);if(E!==j&&E!==p)await G$(E)}await c$(P,493),K.succeed(b.green(`Bun ${H} installed successfully.`)),J=H,Y=!0}},{failMessage:`Failed to install Bun ${Q}`})}catch(K){throw Error(`Failed to install Bun: ${K.message}`)}if(Y)await H$(!1);if(J)try{await W$(J,{silent:!0});let K=o(C,"default");if(!await G(K))await U$("default",J,{silent:!0})}catch(K){}if(await Q$(),J)console.log(b.cyan(`
\u2713 Bun ${J} installed and active.`)),console.log(b.dim("  To verify, run: bun --version or bvm ls"))}async function c6($,q){let Q=q.replace(/^v/,""),J=`#!/usr/bin/env bash
set -euo pipefail
if [[ $# -gt 0 && "$1" == "--version" ]]; then echo "${Q}"; exit 0; fi
echo "Bun ${Q} stub invoked with: $@"
exit 0
`;await Bun.write($,J),await c$($,493)}k();x();T();async function j1(){await O("Fetching remote Bun versions...",async($)=>{let Q=(await G1()).filter((J)=>m(J)).filter((J)=>!J.includes("canary")).sort(K$);if(Q.length===0)throw Error("No remote Bun versions found.");$.succeed(b.green("Available remote Bun versions:")),Q.forEach((J)=>{console.log(`  ${U(J)}`)})},{failMessage:"Failed to fetch remote Bun versions"})}k();x();F();T();import{join as m6}from"path";async function B1(){await O("Fetching locally installed Bun versions...",async($)=>{let q=await u(),J=(await t()).version;if($.succeed(b.green("Locally installed Bun versions:")),q.length===0)console.log("  (No versions installed yet)");else q.forEach((K)=>{if(K===J)console.log(`* ${b.green(K)} ${b.dim("(current)")}`);else console.log(`  ${K}`)});if(await G(C)){let K=await l(C);if(K.length>0){console.log(b.green(`
Aliases:`));for(let Z of K)try{let X=(await M(m6(C,Z))).trim(),W=U(X),y=`-> ${b.cyan(W)}`;if(W===J)y+=` ${b.dim("(current)")}`;console.log(`  ${Z} ${b.gray(y)}`)}catch(X){}}}},{failMessage:"Failed to list local Bun versions"})}k();x();T();async function M1(){await O("Checking current Bun version...",async($)=>{let{version:q,source:Q}=await t();if(q)$.stop(),console.log(`${b.green("\u2713")} Current Bun version: ${b.green(q)} ${b.dim(`(${Q})`)}`);else $.info(b.blue("No Bun version is currently active.")),console.log(b.yellow("Use 'bvm install <version>' to set a default, or create a .bvmrc file."))},{failMessage:"Failed to determine current Bun version"})}k();F();x();T();import{join as p$,basename as p6}from"path";import{unlink as l6}from"fs/promises";async function f1($){await O(`Attempting to uninstall Bun ${$}...`,async(q)=>{let Q=U($),J=p$(w,Q),Y=p$(J,"bin",R);if(!await G(Y))throw Error(`Bun ${$} is not installed.`);let K=!1;try{let Z=p$(C,"default");if(await G(Z)){let X=(await M(Z)).trim();if(U(X)===Q)K=!0}}catch(Z){}if(K)throw console.log(b.yellow("Hint: Set a new default using 'bvm default <new_version>'")),Error(`Bun ${$} is currently set as default. Please set another default before uninstalling.`);try{let Z=await Z1(b$);if(Z){if(U(p6(Z))===Q)await l6(b$)}}catch(Z){}await G$(J),q.succeed(b.green(`Bun ${Q} uninstalled successfully.`)),await Q$()},{failMessage:`Failed to uninstall Bun ${$}`})}k();F();x();T();import{join as t6}from"path";import{unlink as n6}from"fs/promises";async function T1($){await O(`Removing alias '${$}'...`,async(q)=>{let Q=t6(C,$);if(!await G(Q))throw Error(`Alias '${$}' does not exist.`);await n6(Q),q.succeed(b.green(`Alias '${$}' removed successfully.`))},{failMessage:`Failed to remove alias '${$}'`})}k();F();x();q$();T();import{join as l$}from"path";async function D1($,q){await O(`Preparing to run with Bun ${$}...`,async(Q)=>{let J=await h($);if(!J)J=U($);let Y=l$(w,J),K=l$(Y,"bin"),Z=l$(K,R);if(!await G(Z)){Q.fail(b.red(`Bun ${$} (resolved: ${J}) is not installed.`)),console.log(b.yellow(`You can install it using: bvm install ${$}`));return}Q.stop();try{await d([Z,...q],{cwd:process.cwd(),prependPath:K}),process.exit(0)}catch(X){console.error(X.message),process.exit(1)}},{failMessage:`Failed to run command with Bun ${$}`})}k();F();x();q$();T();import{join as t$}from"path";async function R1($,q,Q){await O(`Preparing environment for Bun ${$} to execute '${q}'...`,async(J)=>{let Y=await h($);if(!Y)Y=U($);let K=t$(w,Y),Z=t$(K,"bin"),X=t$(Z,R);if(!await G(X)){J.fail(b.red(`Bun ${$} (resolved: ${Y}) is not installed.`)),console.log(b.yellow(`You can install it using: bvm install ${$}`));return}J.stop();try{await d([q,...Q],{cwd:process.cwd(),prependPath:Z}),process.exit(0)}catch(W){console.error(W.message),process.exit(1)}},{failMessage:`Failed to execute command with Bun ${$}'s environment`})}F();x();T();import{join as o6}from"path";async function I1($){await O("Resolving path...",async()=>{let q=null,Q="bun",{version:J}=await t();if(!$||$==="current"){if(q=J,!q)throw Error("No active Bun version found.")}else{let{resolveLocalVersion:K}=await Promise.resolve().then(() => (q$(),z1));if(q=await K($),!q)if(J)q=J,Q=$;else throw Error(`Bun version or command '${$}' not found.`)}let Y=o6(w,q,"bin",Q==="bun"?R:Q);if(await G(Y))console.log(Y);else throw Error(`Command '${Q}' not found in Bun ${q}.`)},{failMessage:"Failed to resolve path"})}k();x();T();q$();async function E1($){await O(`Resolving session version for Bun ${$}...`,async(q)=>{let Q=null,J=await h($);if(J)Q=J;else{let K=(await u()).map((Z)=>U(Z));Q=e($,K)}if(!Q)throw Error(`Bun version '${$}' is not installed or cannot be resolved.`);let Y=U(Q);q.succeed(b.green(`Bun ${Y} will be active in this session.`)),console.log(`export BVM_ACTIVE_VERSION=${Y}`),console.log(b.dim("Run `eval $(bvm shell <version>)` or `export BVM_ACTIVE_VERSION=...` to activate."))},{failMessage:`Failed to set session version for Bun ${$}`})}k();F();x();T();import{join as i6}from"path";async function S1($){let q=i6(C,"default");if(!$)await O("Checking current default Bun version...",async(Q)=>{if(await G(q)){let J=await M(q);Q.succeed(b.green(`Default Bun version: ${U(J.trim())}`))}else Q.info(b.blue("No global default Bun version is set.")),console.log(b.yellow("Use 'bvm default <version>' to set one."))},{failMessage:"Failed to retrieve default Bun version"});else await O(`Setting global default to Bun ${$}...`,async(Q)=>{let J=(await u()).map((K)=>U(K)),Y=e($,J);if(!Y)throw Error(`Bun version '${$}' is not installed.`);await U$("default",Y,{silent:!0}),Q.succeed(b.green(`\u2713 Default set to ${Y}. New terminals will now start with this version.`))},{failMessage:`Failed to set global default to Bun ${$}`})}F();x();k();T();import{unlink as a6}from"fs/promises";import{join as s6}from"path";async function _1(){await O("Deactivating current Bun version...",async($)=>{let q=s6(C,"default");if(await G(q))await a6(q),$.succeed(b.green("Default Bun version deactivated.")),console.log(b.gray("Run `bvm use <version>` to reactivate.")),await Q$();else $.info("No default Bun version is currently active.")},{failMessage:"Failed to deactivate"})}q$();F();x();k();T();async function v1($){if($==="dir"){console.log(_);return}if($==="clear"){await O("Clearing cache...",async(q)=>{await G$(_),await f(_),q.succeed(b.green("Cache cleared."))},{failMessage:"Failed to clear cache"});return}console.error(b.red(`Unknown cache command: ${$}`)),console.log("Usage: bvm cache dir | bvm cache clear")}k();F();T();x();import{join as S}from"path";import{tmpdir as r6}from"os";import{rm as P1,mkdir as u1}from"fs/promises";var __dirname="/Users/leiliao/MyWorkspace/bvm/src/commands",n$=Y$.version;async function V1(){let $=process.env.BVM_INSTALL_SOURCE;if($==="npm"||$==="bun"||__dirname.includes("node_modules")){await O(`Upgrading BVM via ${$||"package manager"}...`,async(Q)=>{let J=await $$(),Y=$==="bun"?"bun":"npm";Q.text=`Upgrading BVM via ${Y} using ${J}...`;try{await d([Y,"install","-g","bvm-core","--registry",J]),Q.succeed(b.green(`BVM upgraded via ${Y} successfully.`))}catch(K){throw Error(`${Y} upgrade failed: ${K.message}`)}});return}try{await O("Checking for BVM updates...",async(Q)=>{let J=D?{version:process.env.BVM_TEST_LATEST_VERSION?.replace("v","")||n$,tarball:"https://example.com/bvm-test.tgz",shasum:"mock",integrity:"mock"}:await F$();if(!J)throw Error("Unable to determine the latest BVM version from NPM Registry.");let Y=J.version;if(!m(Y))throw Error(`Unrecognized version received: ${Y}`);if(!k$(Y,n$)){Q.succeed(b.green(`BVM is already up to date (v${n$}).`)),console.log(b.blue("You are using the latest version."));return}if(Q.text=`Updating BVM to v${Y}...`,D&&!process.env.BVM_TEST_REAL_UPGRADE){Q.succeed(b.green("BVM updated successfully (test mode)."));return}Q.update("Downloading update package...");let K=S(r6(),`bvm-upgrade-${Date.now()}`);await u1(K,{recursive:!0});let Z=S(K,"bvm-core.tgz");if(D){await g(Z,"mock-tarball");let W=S(K,"package","dist");await u1(W,{recursive:!0}),await g(S(W,"index.js"),"// new cli"),await g(S(W,"bvm-shim.sh"),"# new shim"),await g(S(W,"bvm-shim.js"),"// new shim")}else{let W=await s(J.tarball,{timeout:30000});if(!W.ok)throw Error(`Failed to download tarball: ${W.statusText}`);let y=await W.arrayBuffer();await w$(Z,new Uint8Array(y)),Q.update("Extracting update...");try{await d(["tar","-xzf",Z,"-C",K])}catch(N){throw Error('Failed to extract update package. Ensure "tar" is available.')}}Q.update("Applying updates...");let X=S(K,"package","dist");if(await G(S(X,"index.js")))await w$(S(z,"src","index.js"),await M(S(X,"index.js")));if(B!=="win32"&&await G(S(X,"bvm-shim.sh")))await w$(S(z,"bin","bvm-shim.sh"),await M(S(X,"bvm-shim.sh")));if(B==="win32"&&await G(S(X,"bvm-shim.js")))await w$(S(z,"bin","bvm-shim.js"),await M(S(X,"bvm-shim.js")));try{await P1(K,{recursive:!0,force:!0})}catch(W){}try{await P1(f$,{force:!0})}catch(W){}Q.update("Finalizing environment..."),await H$(!1),Q.succeed(b.green(`BVM updated to v${Y} successfully.`)),console.log(b.yellow("Please restart your terminal to apply changes."))},{failMessage:"Failed to upgrade BVM"})}catch(Q){throw Error(`Failed to upgrade BVM: ${Q.message}`)}}k();F();x();T();import{homedir as e6}from"os";import{join as $4}from"path";async function g1(){await O("Gathering BVM diagnostics...",async()=>{let $={currentVersion:(await t()).version,installedVersions:await u(),aliases:await q4(),env:{BVM_DIR:z,BVM_BIN_DIR:A,BVM_SHIMS_DIR:I,BVM_VERSIONS_DIR:w,BVM_TEST_MODE:process.env.BVM_TEST_MODE,HOME:process.env.HOME||e6()}};Q4($)})}async function q4(){if(!await G(C))return[];let $=await l(C),q=[];for(let Q of $){let J=$4(C,Q);if(await G(J)){let Y=await Bun.file(J).text();q.push({name:Q,target:U(Y.trim())})}}return q}function Q4($){if(console.log(b.bold(`
Directories`)),console.log(`  BVM_DIR: ${b.cyan($.env.BVM_DIR||"")}`),console.log(`  BIN_DIR: ${b.cyan(A)}`),console.log(`  SHIMS_DIR: ${b.cyan(I)}`),console.log(`  VERSIONS_DIR: ${b.cyan(w)}`),console.log(b.bold(`
Environment`)),console.log(`  HOME: ${$.env.HOME||"n/a"}`),console.log(`  BVM_TEST_MODE: ${$.env.BVM_TEST_MODE||"false"}`),console.log(b.bold(`
Installed Versions`)),$.installedVersions.length===0)console.log("  (none installed)");else $.installedVersions.forEach((q)=>{let Q=q===$.currentVersion,J=Q?b.green("*"):" ",Y=Q?b.green(q):q,K=Q?b.green(" (current)"):"";console.log(`  ${J} ${Y}${K}`)});if(console.log(b.bold(`
Aliases`)),$.aliases.length===0)console.log("  (no aliases configured)");else $.aliases.forEach((q)=>{console.log(`  ${q.name} ${b.gray("->")} ${b.cyan(q.target)}`)});console.log(`
`+b.green("Diagnostics complete."))}var o$=["install","uninstall","use","ls","ls-remote","current","alias","unalias","run","exec","which","cache","setup","upgrade","doctor","completion","deactivate","help"],d1={bash:`#!/usr/bin/env bash
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
`};function h1($){let q=d1[$];if(!q)throw Error(`Unsupported shell '${$}'. Supported shells: ${Object.keys(d1).join(", ")}`);console.log(q)}k();F();x();import{join as c1}from"path";k();var m1="update-check.json",J4=86400000;async function p1(){if(process.env.CI||D)return;let $=c1(_,m1);try{if(await G($)){let q=await M($),Q=JSON.parse(q);if(Date.now()-Q.lastCheck<J4)return}}catch(q){}try{let q=await F$();if(q){let Q=q.tagName.startsWith("v")?q.tagName.slice(1):q.tagName;await f(_),await g($,JSON.stringify({lastCheck:Date.now(),latestVersion:Q}))}}catch(q){}}async function l1(){if(process.env.CI||D)return null;let $=Y$.version,q=c1(_,m1);try{if(await G(q)){let Q=await M(q),J=JSON.parse(Q);if(J.latestVersion&&k$(J.latestVersion,$))return`
${b.gray("Update available:")} ${b.green(`v${J.latestVersion}`)} ${b.dim(`(current: v${$})`)}
${b.gray("Run")} ${b.cyan("bvm upgrade")} ${b.gray("to update.")}`}}catch(Q){}return null}class t1{commands={};helpEntries=[];name;versionStr;constructor($){this.name=$,this.versionStr=Y$.version}command($,q,Q={}){let J=$.split(" ")[0],Y={description:q,usage:`${this.name} ${$}`,action:async()=>{},aliases:Q.aliases};if(this.commands[J]=Y,this.helpEntries.push(`  ${$.padEnd(35)} ${q}`),Q.aliases)Q.aliases.forEach((Z)=>{this.commands[Z]=Y});let K={action:(Z)=>{return Y.action=Z,K},option:(Z,X)=>K};return K}async run(){p1().catch(()=>{});let{values:$,positionals:q}=K4({args:Bun.argv.slice(2),strict:!1,allowPositionals:!0,options:{help:{type:"boolean",short:"h"},version:{type:"boolean",short:"v"},silent:{type:"boolean",short:"s"}}}),Q=q[0],J=!!($.silent||$.s),Y=!!($.version||$.v||$.help||$.h);if(!Q){if($.version||$.v)console.log(this.versionStr),process.exit(0);if($.help||$.h)this.showHelp(),process.exit(0);this.showHelp(),process.exit(1)}if($.help||$.h)this.showHelp(),process.exit(0);let K=this.commands[Q];if(!K)console.error(b.yellow(`Unknown command '${Q}'`)),this.showHelp(),process.exit(0);try{if(await K.action(q.slice(1),$),!Y&&!J&&["ls","current","doctor","default"].includes(Q)){let Z=await l1();if(Z)console.log(Z)}}catch(Z){if(!Z.reported)console.error(b.red(`\u2716 ${Z.message}`));process.exit(1)}}showHelp(){console.log(`Bun Version Manager (bvm) v${this.versionStr}`),console.log(`Built with Bun \xB7 Runs with Bun \xB7 Tested on Bun
`),console.log("Usage:"),console.log(`  ${this.name} <command> [flags]
`),console.log("Commands:"),console.log(this.helpEntries.join(`
`)),console.log(`
Global Flags:`),console.log("  --help, -h                     Show this help message"),console.log("  --version, -v                  Show version number"),console.log(`
Examples:`),console.log("  bvm install 1.0.0"),console.log("  bvm use 1.0.0"),console.log("  bvm run 1.0.0 index.ts")}}async function Y4(){let $=new t1("bvm");$.command("rehash","Regenerate shims for all installed binaries").action(async()=>{await Q$()}),$.command("install [version]","Install a Bun version and set as current").option("--global, -g","Install as a global tool (not just default)").action(async(q,Q)=>{await m$(q[0],{global:Q.global||Q.g})}),$.command("i [version]","Alias for install").action(async(q,Q)=>{await m$(q[0],{global:Q.global||Q.g})}),$.command("ls","List installed Bun versions",{aliases:["list"]}).action(async()=>{await B1()}),$.command("ls-remote","List all available remote Bun versions").action(async()=>{await j1()}),$.command("use <version>","Switch the active Bun version immediately (all terminals)").action(async(q)=>{if(!q[0])throw Error("Version is required");await W$(q[0])}),$.command("shell <version>","Switch Bun version for the current shell session").action(async(q)=>{if(!q[0])throw Error("Version is required");await E1(q[0])}),$.command("default [version]","Display or set the global default Bun version").action(async(q)=>{await S1(q[0])}),$.command("current","Display the currently active Bun version").action(async()=>{await M1()}),$.command("uninstall <version>","Uninstall a Bun version").action(async(q)=>{if(!q[0])throw Error("Version is required");await f1(q[0])}),$.command("alias <name> <version>","Create an alias for a Bun version").action(async(q)=>{if(!q[0]||!q[1])throw Error("Name and version are required");await U$(q[0],q[1])}),$.command("unalias <name>","Remove an existing alias").action(async(q)=>{if(!q[0])throw Error("Alias name is required");await T1(q[0])}),$.command("run <version> [...args]","Run a command with a specific Bun version").action(async(q)=>{let Q=q[0];if(!Q)throw Error("Version is required");let J=process.argv.indexOf("run"),Y=J!==-1?process.argv.slice(J+2):[];await D1(Q,Y)}),$.command("exec <version> <cmd> [...args]","Execute a command with a specific Bun version's environment").action(async(q)=>{let Q=q[0],J=q[1];if(!Q||!J)throw Error("Version and command are required");let Y=process.argv.indexOf("exec"),K=Y!==-1?process.argv.slice(Y+3):[];await R1(Q,J,K)}),$.command("which [version]","Display path to installed bun version").action(async(q)=>{await I1(q[0])}),$.command("deactivate","Undo effects of bvm on current shell").action(async()=>{await _1()}),$.command("version <spec>","Resolve the given description to a single local version").action(async(q)=>{if(!q[0])throw Error("Version specifier is required");await S$(q[0])}),$.command("cache <action>","Manage bvm cache").action(async(q)=>{if(!q[0])throw Error("Action is required");await v1(q[0])}),$.command("setup","Configure shell environment automatically").option("--silent, -s","Suppress output").action(async(q,Q)=>{await H$(!(Q.silent||Q.s))}),$.command("upgrade","Upgrade bvm to the latest version",{aliases:["self-update"]}).action(async()=>{await V1()}),$.command("doctor","Show diagnostics for Bun/BVM setup").action(async()=>{await g1()}),$.command("completion <shell>","Generate shell completion script (bash|zsh|fish)").action(async(q)=>{if(!q[0])throw Error("Shell name is required");h1(q[0])}),await $.run(),process.exit(0)}Y4().catch(($)=>{console.error(b.red(`
[FATAL ERROR] Unexpected Crash:`)),console.error($),process.exit(1)});
