#!/usr/bin/env bun
// @bun
var i6=Object.create;var{getPrototypeOf:a6,defineProperty:B$,getOwnPropertyNames:s6}=Object;var r6=Object.prototype.hasOwnProperty;var z$=($,q,Q)=>{Q=$!=null?i6(a6($)):{};let J=q||!$||!$.__esModule?B$(Q,"default",{value:$,enumerable:!0}):Q;for(let Y of s6($))if(!r6.call(J,Y))B$(J,Y,{get:()=>$[Y],enumerable:!0});return J};var a$=($,q)=>{for(var Q in q)B$($,Q,{get:q[Q],enumerable:!0,configurable:!0,set:(J)=>q[Q]=()=>J})};var L$=($,q)=>()=>($&&(q=$($=0)),q);var O$=import.meta.require;var r$={};a$(r$,{getBvmDir:()=>s$,getBunAssetName:()=>D$,USER_AGENT:()=>G$,TEST_REMOTE_VERSIONS:()=>b$,REPO_FOR_BVM_CLI:()=>K1,OS_PLATFORM:()=>A,IS_TEST_MODE:()=>T,EXECUTABLE_NAME:()=>R,CPU_ARCH:()=>e,BVM_VERSIONS_DIR:()=>w,BVM_SRC_DIR:()=>f$,BVM_SHIMS_DIR:()=>I,BVM_FINGERPRINTS_FILE:()=>M$,BVM_DIR:()=>L,BVM_CURRENT_DIR:()=>X$,BVM_COMPONENTS:()=>b1,BVM_CDN_ROOT:()=>Z1,BVM_CACHE_DIR:()=>_,BVM_BIN_DIR:()=>j,BVM_ALIAS_DIR:()=>k,BUN_GITHUB_RELEASES_API:()=>J1,ASSET_NAME_FOR_BVM:()=>Y1});import{homedir as $1}from"os";import{join as i}from"path";import{spawnSync as q1}from"child_process";function Q1(){let $=process.arch;if(A==="darwin"&&$==="x64")try{if(q1("sysctl",["-in","hw.optional.arm64"],{encoding:"utf-8"}).stdout.trim()==="1")return"arm64"}catch(q){}return $}function s$(){let $=process.env.HOME||$1();return i($,".bvm")}function D$($){return`bun-${A==="win32"?"windows":A}-${e==="arm64"?"aarch64":"x64"}.zip`}var A,e,T,b$,L,f$,w,j,I,X$,k,_,M$,R,J1="https://api.github.com/repos/oven-sh/bun/releases",K1="EricLLLLLL/bvm",Y1,G$="bvm (Bun Version Manager)",Z1,b1;var F=L$(()=>{A=process.platform;e=Q1(),T=process.env.BVM_TEST_MODE==="true",b$=["v1.3.4","v1.2.23","v1.0.0","bun-v1.4.0-canary"];L=s$(),f$=i(L,"src"),w=i(L,"versions"),j=i(L,"bin"),I=i(L,"shims"),X$=i(L,"current"),k=i(L,"aliases"),_=i(L,"cache"),M$=i(L,"fingerprints.json"),R=A==="win32"?"bun.exe":"bun",Y1=A==="win32"?"bvm.exe":"bvm",Z1=process.env.BVM_CDN_URL||"https://cdn.jsdelivr.net/gh/EricLLLLLL/bvm",b1=[{name:"CLI Core",remotePath:"index.js",localPath:"src/index.js"},{name:"Windows Shim",remotePath:"bvm-shim.js",localPath:"bin/bvm-shim.js",platform:"win32"},{name:"Unix Shim",remotePath:"bvm-shim.sh",localPath:"bin/bvm-shim.sh",platform:"posix"}]});function m($){if(!$)return null;return $.match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/)?$:null}function e$($){let q=m($);return q?q.replace(/^v/,""):null}function K$($){if(!$)return null;let q=$.replace(/^v/,""),J=q.split(/[-+]/)[0].split(".").map(Number);if(J.length===0||J.some((K)=>isNaN(K)))return null;let Y=q.includes("-")?q.split("-")[1].split("+")[0]:void 0;return{major:J[0],minor:J[1],patch:J[2],pre:Y}}function T$($,q){if(!$||!q)return 0;if($.major!==q.major)return $.major-q.major;if($.minor!==q.minor)return $.minor-q.minor;if($.patch!==q.patch)return $.patch-q.patch;if($.pre&&!q.pre)return-1;if(!$.pre&&q.pre)return 1;if($.pre&&q.pre)return $.pre.localeCompare(q.pre);return 0}function $6($,q){let Q=K$($),J=K$(q);return T$(Q,J)}function Y$($,q){return $6(q,$)}function C$($,q){return $6($,q)>0}function q6($,q){if(q==="*"||q===""||q==="latest")return!0;let Q=K$($);if(!Q)return!1;let J=q;if(q.startsWith("v"))J=q.substring(1);if(e$($)===e$(q))return!0;let Y=J.split(".");if(Y.length===1){let K=Number(Y[0]);if(Q.major===K)return!0}else if(Y.length===2){let K=Number(Y[0]),b=Number(Y[1]);if(Q.major===K&&Q.minor===b)return!0}if(q.startsWith("~")){let K=K$(q.substring(1));if(!K)return!1;let b=K.patch??0;return Q.major===K.major&&Q.minor===K.minor&&Q.patch>=b}if(q.startsWith("^")){let K=K$(q.substring(1));if(!K)return!1;let b=K.patch??0,X=K.minor??0;if(K.major===0){if(Q.major!==0)return!1;if(Q.minor!==X)return!1;return Q.patch>=b}if(Q.major!==K.major)return!1;if(Q.minor<X)return!1;if(Q.minor===X&&Q.patch<b)return!1;return!0}return!1}import{readdir as G1,mkdir as W1,stat as Q6,symlink as H1,unlink as J6,rm as K6,readlink as U1}from"fs/promises";import{join as N$,dirname as y1,basename as z1}from"path";async function M($){try{await W1($,{recursive:!0})}catch(q){if(q.code==="EEXIST")try{if((await Q6($)).isDirectory())return}catch{}throw q}}async function G($){try{return await Q6($),!0}catch(q){if(q.code==="ENOENT")return!1;throw q}}async function Y6($,q){try{await J6(q)}catch(J){try{await K6(q,{recursive:!0,force:!0})}catch(Y){}}let Q=process.platform==="win32"?"junction":"dir";await H1($,q,Q)}async function Z6($){try{return await U1($)}catch(q){if(q.code==="ENOENT"||q.code==="EINVAL")return null;throw q}}async function W$($){await K6($,{recursive:!0,force:!0})}async function l($){try{return await G1($)}catch(q){if(q.code==="ENOENT")return[];throw q}}async function f($){return await Bun.file($).text()}async function g($,q){await Bun.write($,q)}async function w$($,q,Q={}){let{backup:J=!0}=Q,Y=y1($);await M(Y);let K=`${$}.tmp-${Date.now()}`,b=`${$}.bak`;try{if(await g(K,q),J&&await G($))try{let{rename:W,unlink:z}=await import("fs/promises");if(await G(b))await z(b).catch(()=>{});await W($,b)}catch(W){}let{rename:X}=await import("fs/promises");try{await X(K,$)}catch(W){await Bun.write($,q),await J6(K).catch(()=>{})}}catch(X){let{unlink:W}=await import("fs/promises");throw await W(K).catch(()=>{}),X}}function U($){let q=$.trim();if(q.startsWith("bun-v"))q=q.substring(4);if(!q.startsWith("v")&&/^\d/.test(q))q=`v${q}`;return q}async function u(){return await M(w),(await l(w)).filter((q)=>m(U(q))).sort(Y$)}async function t(){if(process.env.BVM_ACTIVE_VERSION)return{version:U(process.env.BVM_ACTIVE_VERSION),source:"env"};let $=N$(process.cwd(),".bvmrc");if(await G($)){let b=(await f($)).trim();return{version:U(b),source:".bvmrc"}}let{getBvmDir:q}=await Promise.resolve().then(() => (F(),r$)),Q=q(),J=N$(Q,"current"),Y=N$(Q,"aliases");if(await G(J)){let{realpath:b}=await import("fs/promises");try{let X=await b(J);return{version:U(z1(X)),source:"current"}}catch(X){}}let K=N$(Y,"default");if(await G(K)){let b=(await f(K)).trim();return{version:U(b),source:"default"}}return{version:null,source:null}}function $$($,q){if(!$||q.length===0)return null;let Q=U($);if(q.includes(Q))return Q;if($.toLowerCase()==="latest")return q[0];if(/^\d+\.\d+\.\d+$/.test($.replace(/^v/,"")))return null;if(!/^[v\d]/.test($))return null;let Y=$.startsWith("v")?`~${$.substring(1)}`:`~${$}`,K=q.filter((b)=>q6(b,Y));if(K.length>0)return K.sort(Y$)[0];return null}var x=L$(()=>{F()});class R${timer=null;frames=process.platform==="win32"?["-"]:["\u280B","\u2819","\u2839","\u2838","\u283C","\u2834","\u2826","\u2827","\u2807","\u280F"];frameIndex=0;text;isWindows=process.platform==="win32";constructor($){this.text=$}start($){if($)this.text=$;if(this.timer)return;if(this.isWindows){process.stdout.write(`${Z.cyan(">")} ${this.text}
`);return}this.timer=setInterval(()=>{process.stdout.write(`\r\x1B[K${Z.cyan(this.frames[this.frameIndex])} ${this.text}`),this.frameIndex=(this.frameIndex+1)%this.frames.length},80)}stop(){if(this.isWindows)return;if(this.timer)clearInterval(this.timer),this.timer=null,process.stdout.write("\r\x1B[K");process.stdout.write("\x1B[?25h")}succeed($){this.stop(),console.log(`${Z.green("  \u2713")} ${$||this.text}`)}fail($){this.stop(),console.log(`${Z.red("  \u2716")} ${$||this.text}`)}info($){this.stop(),console.log(`${Z.blue("  \u2139")} ${$||this.text}`)}update($){if(this.text=$,this.isWindows)console.log(Z.dim(`  ... ${this.text}`))}}class I${total;current=0;width=20;constructor($){this.total=$}start(){process.stdout.write("\x1B[?25l"),this.render()}update($,q){this.current=$,this.render(q)}stop(){process.stdout.write(`\x1B[?25h
`)}render($){let q=Math.min(1,this.current/this.total),Q=Math.round(this.width*q),J=this.width-Q,Y=process.platform==="win32",K=Y?"=":"\u2588",b=Y?"-":"\u2591",X=Z.green(K.repeat(Q))+Z.gray(b.repeat(J)),W=(q*100).toFixed(0).padStart(3," "),z=(this.current/1048576).toFixed(1),N=(this.total/1048576).toFixed(1),H=$?` ${$.speed}KB/s`:"";process.stdout.write(`\r\x1B[2K ${X} ${W}% | ${z}/${N}MB${H}`)}}var L1,O1=($)=>$.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),a=($,q,Q=$)=>(J)=>L1?$+J.replace(new RegExp(O1(q),"g"),Q)+q:J,Z;var C=L$(()=>{L1=!process.env.NO_COLOR,Z={red:a("\x1B[1;31m","\x1B[39m"),green:a("\x1B[1;32m","\x1B[39m"),yellow:a("\x1B[1;33m","\x1B[39m"),blue:a("\x1B[1;34m","\x1B[39m"),magenta:a("\x1B[1;35m","\x1B[39m"),cyan:a("\x1B[1;36m","\x1B[39m"),gray:a("\x1B[90m","\x1B[39m"),bold:a("\x1B[1m","\x1B[22m","\x1B[22m\x1B[1m"),dim:a("\x1B[2m","\x1B[22m","\x1B[22m\x1B[2m")}});async function y($,q,Q){if(process.platform==="win32"){console.log(Z.cyan(`> ${$}`));let K={start:(b)=>{if(b)console.log(Z.cyan(`> ${b}`))},stop:()=>{},succeed:(b)=>console.log(Z.green(`  \u2713 ${b}`)),fail:(b)=>console.log(Z.red(`  \u2716 ${b}`)),info:(b)=>console.log(Z.cyan(`  \u2139 ${b}`)),update:(b)=>console.log(Z.dim(`  ... ${b}`)),isSpinning:!1};try{return await q(K)}catch(b){let X=z6(b,Q?.failMessage);if(console.log(Z.red(`  \u2716 ${X}`)),process.env.BVM_DEBUG,console.log(Z.dim(`    Details: ${b.message}`)),b.code)console.log(Z.dim(`    Code: ${b.code}`));throw b.reported=!0,b}}let Y=new R$($);Y.start();try{let K=await q(Y);return Y.stop(),K}catch(K){let b=z6(K,Q?.failMessage);throw Y.fail(Z.red(b)),K.reported=!0,K}}function z6($,q){let Q=$ instanceof Error?$.message:String($);if(!q)return Q;if(typeof q==="function")return q($);return`${q}: ${Q}`}var D=L$(()=>{C()});var L6={};a$(L6,{resolveLocalVersion:()=>h,displayVersion:()=>S$});import{join as M1}from"path";async function h($){if($==="current"){let{version:Y}=await t();return Y}if($==="latest"){let Y=await u();if(Y.length>0)return Y[0];return null}let q=M1(k,$);if(await G(q))try{let Y=(await f(q)).trim();return U(Y)}catch{return null}let Q=U($),J=await u();return $$($,J)}async function S$($){await y(`Resolving version '${$}'...`,async()=>{let q=await h($);if(q)console.log(q);else throw Error("N/A")},{failMessage:`Failed to resolve version '${$}'`})}var Q$=L$(()=>{F();x();D()});import{parseArgs as Z4}from"util";var Z$={name:"bvm-core",version:"1.1.26",description:"The native version manager for Bun. Cross-platform, shell-agnostic, and zero-dependency.",main:"dist/index.js",bin:{bvm:"bin/bvm-npm.js"},publishConfig:{access:"public"},scripts:{dev:"bun run src/index.ts",build:"bun build src/index.ts --target=bun --outfile dist/index.js --minify && bun run scripts/sync-runtime.ts",test:"bun test",bvm:"bun run src/index.ts","bvm:sandbox":'mkdir -p "$PWD/.sandbox-home" && HOME="$PWD/.sandbox-home" bun run src/index.ts',release:"bun run scripts/check-integrity.ts && bun run build && bun run scripts/release.ts","check-integrity":"bun run scripts/check-integrity.ts","test:e2e:npm":"bun run scripts/verify-e2e-npm.ts","sync-runtime":"bun run scripts/sync-runtime.ts",postinstall:"node scripts/postinstall.js"},repository:{type:"git",url:"git+https://github.com/EricLLLLLL/bvm.git"},keywords:["bun","version-manager","cli","bvm","nvm","nvm-windows","fnm","nodenv","bun-nvm","version-switching"],files:["dist/index.js","dist/bvm-shim.sh","dist/bvm-shim.js","bin/bvm-npm.js","scripts/postinstall.js","install.sh","install.ps1","README.md"],author:"EricLLLLLL",license:"MIT",type:"commonjs",dependencies:{"cli-progress":"^3.12.0"},optionalDependencies:{"@oven/bun-darwin-aarch64":"^1.3.6","@oven/bun-darwin-x64":"^1.3.6","@oven/bun-linux-aarch64":"^1.3.6","@oven/bun-linux-x64":"^1.3.6","@oven/bun-windows-x64":"^1.3.6"},devDependencies:{"@types/bun":"^1.3.4","@types/cli-progress":"^3.11.6","@types/node":"^24.10.2",bun:"^1.3.6",esbuild:"^0.27.2",execa:"^9.6.1",typescript:"^5"},peerDependencies:{typescript:"^5"}};F();x();import{join as o,basename as h1,dirname as c1}from"path";F();x();C();import{join as k1}from"path";function b6($,q){if($==="darwin"){if(q==="arm64")return"@oven/bun-darwin-aarch64";if(q==="x64")return"@oven/bun-darwin-x64"}if($==="linux"){if(q==="arm64")return"@oven/bun-linux-aarch64";if(q==="x64")return"@oven/bun-linux-x64"}if($==="win32"){if(q==="x64")return"@oven/bun-windows-x64"}return null}function X6($,q,Q){let J=Q;if(!J.endsWith("/"))J+="/";let Y=$.startsWith("@"),K=$;if(Y){let X=$.split("/");if(X.length===2)K=X[1]}let b=`${K}-${q}.tgz`;return`${J}${$}/-/${b}`}C();async function d($,q={}){let{cwd:Q,env:J,prependPath:Y,stdin:K="inherit",stdout:b="inherit",stderr:X="inherit"}=q,W={...process.env,...J};if(Y){let H=W.PATH||"",B=process.platform==="win32"?";":":";W.PATH=`${Y}${B}${H}`}let N=await Bun.spawn({cmd:$,cwd:Q,env:W,stdin:K,stdout:b,stderr:X}).exited;if((N??0)!==0)throw Error(`${Z.red("Command failed")}: ${$.join(" ")} (code ${N})`);return N??0}async function s($,q={}){let{timeout:Q=5000,...J}=q,Y=new AbortController,K=setTimeout(()=>Y.abort(),Q);try{let b=await fetch($,{...J,signal:Y.signal});return clearTimeout(K),b}catch(b){if(clearTimeout(K),b.name==="AbortError")throw Error(`Request to ${$} timed out after ${Q}ms`);throw b}}async function w1($,q=2000){if($.length===0)throw Error("No URLs to race");if($.length===1)return $[0];return new Promise((Q,J)=>{let Y=0,K=!1;$.forEach((b)=>{s(b,{method:"HEAD",timeout:q}).then((X)=>{if(X.ok&&!K)K=!0,Q(b);else if(!K){if(Y++,Y===$.length)J(Error("All requests failed"))}}).catch(()=>{if(!K){if(Y++,Y===$.length)J(Error("All requests failed"))}})})})}async function x1(){try{let $=await s("https://1.1.1.1/cdn-cgi/trace",{timeout:500});if(!$.ok)return null;let Q=(await $.text()).match(/loc=([A-Z]{2})/);return Q?Q[1]:null}catch($){return null}}var E$=null,x$={NPM:"https://registry.npmjs.org",TAOBAO:"https://registry.npmmirror.com",TENCENT:"https://mirrors.cloud.tencent.com/npm/"};async function q$(){if(E$)return E$;let $=await x1(),q=[];if($==="CN")q=[x$.TAOBAO,x$.TENCENT,x$.NPM];else q=[x$.NPM,x$.TAOBAO];try{let Q=await w1(q,2000);return E$=Q,Q}catch(Q){return q[0]}}x();var C1="bun-versions.json",N1=3600000;async function F1(){if(T)return[...b$];let $=k1(_,C1);try{if(await G($)){let Y=await f($),K=JSON.parse(Y);if(Date.now()-K.timestamp<N1&&Array.isArray(K.versions))return K.versions}}catch(Y){}let q=await q$(),Q=[q];if(q!=="https://registry.npmjs.org")Q.push("https://registry.npmjs.org");let J=null;for(let Y of Q){let K=`${Y.replace(/\/$/,"")}/bun`;try{let b=await s(K,{headers:{"User-Agent":G$,Accept:"application/vnd.npm.install-v1+json"},timeout:1e4});if(!b.ok)throw Error(`Status ${b.status}`);let X=await b.json();if(!X.versions)throw Error("Invalid response (no versions)");let W=Object.keys(X.versions);try{await M(_),await g($,JSON.stringify({timestamp:Date.now(),versions:W}))}catch(z){}return W}catch(b){J=b}}throw J||Error("Failed to fetch versions from any registry.")}async function A1(){if(T)return[...b$];return new Promise(($,q)=>{let Q=[];try{let J=Bun.spawn(["git","ls-remote","--tags","https://github.com/oven-sh/bun.git"],{stdout:"pipe",stderr:"pipe"}),Y=setTimeout(()=>{J.kill(),q(Error("Git operation timed out"))},1e4);new Response(J.stdout).text().then((b)=>{clearTimeout(Y);let X=b.split(`
`);for(let W of X){let z=W.match(/refs\/tags\/bun-v?(\d+\.\d+\.\d+.*)$/);if(z)Q.push(z[1])}$(Q)}).catch((b)=>{clearTimeout(Y),q(b)})}catch(J){q(Error(`Failed to run git: ${J.message}`))}})}async function G6(){if(T)return[...b$];try{let q=(await F1()).filter((Q)=>m(Q)).map((Q)=>({v:Q,parsed:K$(Q)}));return q.sort((Q,J)=>T$(J.parsed,Q.parsed)),q.map((Q)=>Q.v)}catch($){try{let q=await A1();if(q.length>0)return Array.from(new Set(q.filter((J)=>m(J)))).sort(Y$);throw Error("No versions found via Git")}catch(q){throw Error(`Failed to fetch versions. NPM: ${$.message}. Git: ${q.message}`)}}}async function W6($){if(T)return b$.includes($)||$==="latest";let q=await q$(),Q=$.replace(/^v/,""),J=`${q}/bun/${Q}`,Y=A==="win32"?"curl.exe":"curl",K=async()=>{try{return await d([Y,"-I","-f","-m","5","-s",J],{stdout:"ignore",stderr:"ignore"}),!0}catch(X){return!1}},b=new Promise((X)=>setTimeout(()=>X(!1),1e4));return Promise.race([K(),b])}async function H6(){if(T)return{latest:"1.1.20"};let q=`${await q$()}/-/package/bun/dist-tags`;try{let Q=await s(q,{headers:{"User-Agent":G$},timeout:5000});if(Q.ok)return await Q.json()}catch(Q){}return{}}async function U6($){let q=U($);if(!m(q))return console.error(Z.red(`Invalid version provided to findBunDownloadUrl: ${$}`)),null;if(T)return{url:`https://example.com/${D$(q)}`,foundVersion:q};let Y=b6(A==="win32"?"win32":A,e==="arm64"?"arm64":"x64");if(!Y)throw Error(`Unsupported platform/arch for NPM download: ${A}-${e}`);let K="";if(process.env.BVM_REGISTRY)K=process.env.BVM_REGISTRY;else if(process.env.BVM_DOWNLOAD_MIRROR)K=process.env.BVM_DOWNLOAD_MIRROR;else K=await q$();let b=q.replace(/^v/,"");return{url:X6(Y,b,K),foundVersion:q}}async function F$(){try{let q=(await q$()).replace(/\/$/,""),Q=await s(`${q}/-/package/bvm-core/dist-tags`,{headers:{"User-Agent":G$},timeout:5000});if(!Q.ok)return null;let Y=(await Q.json()).latest;if(!Y)return null;let K=await s(`${q}/bvm-core/${Y}`,{headers:{"User-Agent":G$},timeout:5000});if(K.ok){let b=await K.json();return{version:Y,tarball:b.dist.tarball,integrity:b.dist.integrity,shasum:b.dist.shasum}}}catch($){}return null}C();F();import{spawn as j1}from"child_process";async function y6($,q){if($.endsWith(".zip"))if(A==="win32")await d(["powershell","-Command",`Expand-Archive -Path "${$}" -DestinationPath "${q}" -Force`],{stdout:"ignore",stderr:"inherit"});else await d(["unzip","-o","-q",$,"-d",q],{stdout:"ignore",stderr:"inherit"});else if($.endsWith(".tar.gz")||$.endsWith(".tgz"))await new Promise((Q,J)=>{let Y=j1("tar",["-xzf",$,"-C",q],{stdio:"inherit",shell:!1});Y.on("close",(K)=>{if(K===0)Q();else J(Error(`tar exited with code ${K}`))}),Y.on("error",(K)=>J(K))});else throw Error(`Unsupported archive format: ${$}`)}import{chmod as c$}from"fs/promises";x();F();C();import{join as O,dirname as w6}from"path";import{homedir as v}from"os";import{mkdir as x6}from"fs/promises";import{chmod as k$}from"fs/promises";F();x();C();import{join as O6}from"path";x();import{join as B1,dirname as f1}from"path";async function A$(){let $=process.cwd();while(!0){let q=B1($,".bvmrc");if(await G(q))try{return(await Bun.file(q).text()).trim()}catch(J){return null}let Q=f1($);if(Q===$)break;$=Q}return null}Q$();D();async function H$($,q={}){let Q=$;if(!Q)Q=await A$()||void 0;if(!Q){if(!q.silent)console.error(Z.red("No version specified. Usage: bvm use <version>"));throw Error("No version specified.")}let J=async(Y)=>{let K=null,b=await h(Q);if(b)K=b;else{let N=(await u()).map((H)=>U(H));K=$$(Q,N)}if(!K)throw Error(`Bun version '${Q}' is not installed.`);let X=U(K),W=O6(w,X),z=O6(W,"bin",R);if(!await G(z))throw Error(`Version ${X} is not properly installed (binary missing).`);if(await Y6(W,X$),Y)Y.succeed(Z.green(`Now using Bun ${X} (immediate effect).`))};if(q.silent)await J();else await y(`Switching to Bun ${Q}...`,(Y)=>J(Y),{failMessage:()=>`Failed to switch to Bun ${Q}`})}var _$=`#!/bin/bash

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
`;async function U$($=!0){if(await v1($),process.platform==="win32"){await P1($);return}let q=process.env.SHELL||"",Q="",J="";if(q.includes("zsh"))J="zsh",Q=O(v(),".zshrc");else if(q.includes("bash"))if(J="bash",process.platform==="darwin")if(await G(O(v(),".bashrc")))Q=O(v(),".bashrc");else Q=O(v(),".bash_profile");else Q=O(v(),".bashrc");else if(q.includes("fish"))J="fish",Q=O(v(),".config","fish","config.fish");else if(await G(O(v(),".zshrc")))J="zsh",Q=O(v(),".zshrc");else if(await G(O(v(),".config","fish","config.fish")))J="fish",Q=O(v(),".config","fish","config.fish");else if(await G(O(v(),".bashrc")))J="bash",Q=O(v(),".bashrc");else if(await G(O(v(),".bash_profile")))J="bash",Q=O(v(),".bash_profile");else{if($)console.log(Z.yellow(`Could not detect a supported shell (zsh, bash, fish). Please manually add ${j} to your PATH.`));return}let Y=O(j,"bvm-init.sh");await Bun.write(Y,_$),await k$(Y,493);let K=O(j,"bvm-init.fish");await Bun.write(K,v$),await k$(K,493);let b="";try{b=await Bun.file(Q).text()}catch(H){if(H.code==="ENOENT")await Bun.write(Q,""),b="";else throw H}let X="# >>> bvm initialize >>>",W="# <<< bvm initialize <<<",z=`${X}
# !! Contents within this block are managed by 'bvm setup' !!
export BVM_DIR="${L}"
export PATH="$BVM_DIR/shims:$BVM_DIR/bin:$BVM_DIR/current/bin:$PATH"
# Ensure current link exists for PATH consistency
if [ ! -L "$BVM_DIR/current" ] && [ -f "$BVM_DIR/aliases/default" ]; then
    ln -sf "$BVM_DIR/versions/$(cat "$BVM_DIR/aliases/default")" "$BVM_DIR/current"
fi
${W}`,N=`# >>> bvm initialize >>>
# !! Contents within this block are managed by 'bvm setup' !!
set -Ux BVM_DIR "${L}"
fish_add_path "$BVM_DIR/shims"
fish_add_path "$BVM_DIR/bin"
fish_add_path "$BVM_DIR/current/bin"
# Ensure current link exists
if not test -L "$BVM_DIR/current"
    if test -f "$BVM_DIR/aliases/default"
        ln -sf "$BVM_DIR/versions/$(cat "$BVM_DIR/aliases/default")" "$BVM_DIR/current"
    end
end
# <<< bvm initialize <<<`;if($)console.log(Z.cyan(`Configuring ${J} environment in ${Q}...`));try{let H=b,B=X.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),p=W.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),P=new RegExp(`${B}[\\s\\S]*?${p}`,"g");if(b.includes(X))H=b.replace(P,"").trim();let V=J==="fish"?N:z;if(H=(H?H+`

`:"")+V+`
`,H!==b){if(await Bun.write(Q,H),$)console.log(Z.green(`\u2713 Successfully updated BVM configuration in ${Q}`)),console.log(Z.gray("  (Moved configuration to the end of file to ensure PATH precedence)"))}if($)console.log(Z.yellow(`Please restart your terminal or run "source ${Q}" to apply changes.`));try{await H$("default",{silent:!0})}catch(c){}}catch(H){console.error(Z.red(`Failed to write to ${Q}: ${H.message}`))}}async function v1($){if($)console.log(Z.cyan("Refreshing shims and wrappers..."));if(!$)console.log(`[DEBUG] BIN_DIR: ${j}`),console.log(`[DEBUG] SHIMS_DIR: ${I}`);if(await x6(j,{recursive:!0}),await x6(I,{recursive:!0}),process.platform==="win32")await Bun.write(O(j,"bvm-shim.js"),u$),await Bun.write(O(j,"bvm.cmd"),d$),await Bun.write(O(I,"bun.cmd"),V$),await Bun.write(O(I,"bunx.cmd"),g$);else{let Q=O(j,"bvm-shim.sh");await Bun.write(Q,P$),await k$(Q,493);let J="",Y=O(L,"runtime","current","bin","bun"),K=O(f$,"index.js");if(process.env.BVM_INSTALL_SOURCE==="npm")J=`#!/bin/bash
export BVM_DIR="${L}"
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
export BVM_DIR="${L}"
exec "${Y}" "${K}" "$@"`;let b=O(j,"bvm");await Bun.write(b,J),await k$(b,493);for(let X of["bun","bunx"]){let W=`#!/bin/bash
export BVM_DIR="${L}"
exec "${L}/bin/bvm-shim.sh" "${X}" "$@"`,z=O(I,X);await Bun.write(z,W),await k$(z,493)}}}async function P1($=!0){let q=O(j),Q=O(I),J=O(L,"current","bin");if($)console.log(Z.cyan("Configuring Windows environment variables (Registry)..."));let Y=`
        $targetDir = "${L}";
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
    `;try{let b=Bun.spawnSync({cmd:["powershell","-NoProfile","-Command",Y],stdout:"pipe",stderr:"pipe"}),X=b.stdout.toString().trim();if(b.success){if($)if(X==="SUCCESS")console.log(Z.green("\u2713 Successfully updated User PATH and BVM_DIR in Registry."));else console.log(Z.gray("\u2713 Environment variables are already up to date."))}else throw Error(b.stderr.toString())}catch(b){console.error(Z.red(`Failed to update environment variables: ${b.message}`))}let K="";try{if(K=Bun.spawnSync({cmd:["powershell","-NoProfile","-Command","echo $PROFILE.CurrentUserAllHosts"],stdout:"pipe"}).stdout.toString().trim(),K)Bun.spawnSync({cmd:["powershell","-NoProfile","-Command",`if (!(Test-Path "${w6(K)}")) { New-Item -ItemType Directory -Force -Path "${w6(K)}" }`],stderr:"pipe"}),await u1(K,!1)}catch(b){}if($)console.log(Z.yellow("Please restart your terminal or IDE to apply the new PATH."))}async function u1($,q=!0){let Q=`
# BVM Configuration
$env:BVM_DIR = "${L}"
$env:PATH = "$env:BVM_DIR\\shims;$env:BVM_DIR\\bin;$env:BVM_DIR\\current\\bin;$env:PATH"
# Auto-activate default version
if (Test-Path "$env:BVM_DIR\\bin\\bvm.cmd") {
    & "$env:BVM_DIR\\bin\\bvm.cmd" use default --silent *>$null
}
`;try{let J="";if(await G($))J=await Bun.file($).text();else await Bun.write($,"");if(J.includes("$env:BVM_DIR")){if(q)console.log(Z.gray("\u2713 Configuration is already up to date."));return}if(q)console.log(Z.cyan(`Configuring PowerShell environment in ${$}...`));if(await Bun.write($,J+`\r
${Q}`),q)console.log(Z.green(`\u2713 Successfully configured BVM path in ${$}`)),console.log(Z.yellow("Please restart your terminal to apply changes."))}catch(J){console.error(Z.red(`Failed to write to ${$}: ${J.message}`))}}C();F();x();Q$();D();import{join as k6}from"path";async function y$($,q,Q={}){let J=async(Y)=>{let K=await h(q);if(!K){if(!Q.silent)console.log(Z.blue(`Please install Bun ${q} first using: bvm install ${q}`));throw Error(`Bun version '${q}' is not installed. Cannot create alias.`)}let b=k6(w,K);if(!await G(b))throw Error(`Internal Error: Resolved Bun version ${K} not found.`);await M(k);let X=k6(k,$);if($!=="default"&&await G(X))throw Error(`Alias '${$}' already exists. Use 'bvm alias ${$} <new-version>' to update or 'bvm unalias ${$}' to remove.`);if(await g(X,`${K}
`),Y)Y.succeed(Z.green(`Alias '${$}' created for Bun ${K}.`))};if(Q.silent)await J();else await y(`Creating alias '${$}' for Bun ${q}...`,(Y)=>J(Y),{failMessage:`Failed to create alias '${$}'`})}D();F();x();C();import{join as n,dirname as C6}from"path";import{chmod as N6,unlink as V1}from"fs/promises";var __dirname="/Users/leiliao/MyWorkspace/bvm/src/commands",g1=($)=>`@echo off
set "BVM_DIR=%USERPROFILE%.bvm"
if exist "%BVM_DIR%\runtimecurrent\bin\bun.exe" (
    "%BVM_DIR%\runtimecurrent\bin\bun.exe" "%BVM_DIR%\bin\bvm-shim.js" "${$}" %*
) else (
    echo BVM Error: Bun runtime not found.
    exit /b 1
)`,d1=($)=>`#!/bin/bash
export BVM_DIR="${L}"
exec "${n(j,"bvm-shim.sh")}" "${$}" "$@"`;async function J$(){await M(I),await M(j);let $=A==="win32";try{let Q=n(C6(C6(__dirname)),"src","templates");if($){let J=await Bun.file(n(Q,"bvm-shim.js")).text();await Bun.write(n(j,"bvm-shim.js"),J)}else{let J=await Bun.file(n(Q,"bvm-shim.sh")).text(),Y=n(j,"bvm-shim.sh");await Bun.write(Y,J),await N6(Y,493)}}catch(Q){}let q=new Set(["bun","bunx"]);if(await G(w)){let Q=await l(w);for(let J of Q){if(J.startsWith("."))continue;let Y=n(w,J,"bin");if(await G(Y)){let K=await l(Y);for(let b of K){let X=b.replace(/\.(exe|ps1|cmd)$/i,"");if(X)q.add(X)}}}}for(let Q of q)if($){await Bun.write(n(I,`${Q}.cmd`),g1(Q));let J=n(I,`${Q}.ps1`);if(await G(J))await V1(J)}else{let J=n(I,Q);await Bun.write(J,d1(Q)),await N6(J,493)}console.log(Z.green(`\u2713 Regenerated ${q.size} shims in ${I}`))}import{rename as m1,rm as A6}from"fs/promises";async function h$($,q){try{await m1($,q)}catch(Q){await Bun.write(Bun.file(q),Bun.file($)),await A6($,{force:!0})}}async function F6($,q,Q,J){let Y=await fetch($);if(!Y.ok)throw Error(`Status ${Y.status}`);let K=+(Y.headers.get("Content-Length")||0),b=0,X=Y.body?.getReader();if(!X)throw Error("No response body");let W=Bun.file(q).writer(),z=A==="win32";Q.stop();let N=null,H=-1;if(!z)N=new I$(K||41943040),N.start();else console.log(`Downloading Bun ${J}...`);try{let B=Date.now();while(!0){let{done:p,value:P}=await X.read();if(p)break;if(W.write(P),b+=P.length,!z&&N){let V=(Date.now()-B)/1000,c=V>0?(b/1024/V).toFixed(0):"0";N.update(b,{speed:c})}else if(z&&K){let V=Math.floor(b/K*10);if(V>H)console.log(`  > ${V*10}%`),H=V}}if(await W.end(),!z&&N)N.stop();else console.log("  > 100% [Done]")}catch(B){try{W.end()}catch(p){}if(!z&&N)N.stop();else console.log("  > Download Failed");throw Q.start(),B}Q.start()}async function m$($,q={}){let Q=$,J=null,Y=!1;if(!Q)Q=await A$()||void 0;if(!Q){console.error(Z.red("No version specified and no .bvmrc found. Usage: bvm install <version>"));return}try{await y(`Finding Bun ${Q} release...`,async(K)=>{let b=null,X=U(Q);if(/^v?\d+\.\d+\.\d+$/.test(Q)&&!Q.includes("canary"))if(K.update(`Checking if Bun ${X} exists...`),await W6(X))b=X;else throw K.fail(Z.red(`Bun version ${X} not found on registry.`)),Error(`Bun version ${X} not found on registry.`);else if(Q==="latest"){K.update("Checking latest version...");let V=await H6();if(V.latest)b=U(V.latest);else throw Error('Could not resolve "latest" version.')}else throw K.fail(Z.yellow('Fuzzy matching (e.g. "1.1") is disabled for stability.')),console.log(Z.dim('  Please specify the exact version (e.g. "1.1.20") or "latest".')),console.log(Z.dim("  To see available versions, run: bvm ls-remote")),Error("Fuzzy matching disabled");if(!b)throw K.fail(Z.red(`Could not find a Bun release for '${Q}' compatible with your system.`)),Error(`Could not find a Bun release for '${Q}' compatible with your system.`);let W=await U6(b);if(!W)throw Error(`Could not find a Bun release for ${b} compatible with your system.`);let{url:z,mirrorUrl:N,foundVersion:H}=W,B=o(w,H),p=o(B,"bin"),P=o(p,R);if(await G(P))K.succeed(Z.green(`Bun ${H} is already installed.`)),J=H,Y=!0;else if(U(Bun.version)===H&&!T){K.info(Z.cyan(`Requested version ${H} matches current BVM runtime. Creating symlink...`)),await M(p);let c=process.execPath;try{let{symlink:r}=await import("fs/promises");await r(c,P)}catch(r){await Bun.write(Bun.file(P),Bun.file(c)),await c$(P,493)}K.succeed(Z.green(`Bun ${H} linked from local runtime.`)),J=H,Y=!0}else if(T)await M(p),await p1(P,H),J=H,Y=!0;else{K.update(`Downloading Bun ${H} to cache...`),await M(_);let c=o(_,`${H}-${h1(z)}`);if(await G(c))K.succeed(Z.green(`Using cached Bun ${H} archive.`));else{let E=`${c}.${Date.now()}.tmp`;try{await F6(z,E,K,H),await h$(E,c)}catch(i$){try{await A6(E,{force:!0})}catch{}if(K.update("Download failed, trying mirror..."),console.log(Z.dim(`
Debug: ${i$.message}`)),N){let o6=new URL(N).hostname;K.update(`Downloading from mirror (${o6})...`),await F6(N,E,K,H),await h$(E,c)}else throw i$}}K.update(`Extracting Bun ${H}...`),await M(B),await y6(c,B);let r="",j$=[o(B,R),o(B,"bin",R),o(B,"package","bin",R)],n6=await l(B);for(let E of n6)if(E.startsWith("bun-"))j$.push(o(B,E,R)),j$.push(o(B,E,"bin",R));for(let E of j$)if(await G(E)){r=E;break}if(!r)throw Error(`Could not find bun executable in ${B}`);if(await M(p),r!==P){await h$(r,P);let E=c1(r);if(E!==B&&E!==p)await W$(E)}await c$(P,493),K.succeed(Z.green(`Bun ${H} installed successfully.`)),J=H,Y=!0}},{failMessage:`Failed to install Bun ${Q}`})}catch(K){throw Error(`Failed to install Bun: ${K.message}`)}if(Y)await U$(!1);if(J)try{await H$(J,{silent:!0});let K=o(k,"default");if(!await G(K))await y$("default",J,{silent:!0})}catch(K){}if(await J$(),J)console.log(Z.cyan(`
\u2713 Bun ${J} installed and active.`)),console.log(Z.dim("  To verify, run: bun --version or bvm ls"))}async function p1($,q){let Q=q.replace(/^v/,""),J=`#!/usr/bin/env bash
set -euo pipefail
if [[ $# -gt 0 && "$1" == "--version" ]]; then echo "${Q}"; exit 0; fi
echo "Bun ${Q} stub invoked with: $@"
exit 0
`;await Bun.write($,J),await c$($,493)}C();x();D();async function j6(){await y("Fetching remote Bun versions...",async($)=>{let Q=(await G6()).filter((J)=>m(J)).filter((J)=>!J.includes("canary")).sort(Y$);if(Q.length===0)throw Error("No remote Bun versions found.");$.succeed(Z.green("Available remote Bun versions:")),Q.forEach((J)=>{console.log(`  ${U(J)}`)})},{failMessage:"Failed to fetch remote Bun versions"})}C();x();F();D();import{join as l1}from"path";async function B6(){await y("Fetching locally installed Bun versions...",async($)=>{let q=await u(),J=(await t()).version;if($.succeed(Z.green("Locally installed Bun versions:")),q.length===0)console.log("  (No versions installed yet)");else q.forEach((K)=>{if(K===J)console.log(`* ${Z.green(K)} ${Z.dim("(current)")}`);else console.log(`  ${K}`)});if(await G(k)){let K=await l(k);if(K.length>0){console.log(Z.green(`
Aliases:`));for(let b of K)try{let X=(await f(l1(k,b))).trim(),W=U(X),z=`-> ${Z.cyan(W)}`;if(W===J)z+=` ${Z.dim("(current)")}`;console.log(`  ${b} ${Z.gray(z)}`)}catch(X){}}}},{failMessage:"Failed to list local Bun versions"})}C();x();D();async function f6(){await y("Checking current Bun version...",async($)=>{let{version:q,source:Q}=await t();if(q)$.stop(),console.log(`${Z.green("\u2713")} Current Bun version: ${Z.green(q)} ${Z.dim(`(${Q})`)}`);else $.info(Z.blue("No Bun version is currently active.")),console.log(Z.yellow("Use 'bvm install <version>' to set a default, or create a .bvmrc file."))},{failMessage:"Failed to determine current Bun version"})}C();F();x();D();import{join as p$,basename as t1}from"path";import{unlink as n1}from"fs/promises";async function M6($){await y(`Attempting to uninstall Bun ${$}...`,async(q)=>{let Q=U($),J=p$(w,Q),Y=p$(J,"bin",R);if(!await G(Y))throw Error(`Bun ${$} is not installed.`);let K=!1;try{let b=p$(k,"default");if(await G(b)){let X=(await f(b)).trim();if(U(X)===Q)K=!0}}catch(b){}if(K)throw console.log(Z.yellow("Hint: Set a new default using 'bvm default <new_version>'")),Error(`Bun ${$} is currently set as default. Please set another default before uninstalling.`);try{let b=await Z6(X$);if(b){if(U(t1(b))===Q)await n1(X$)}}catch(b){}await W$(J),q.succeed(Z.green(`Bun ${Q} uninstalled successfully.`)),await J$()},{failMessage:`Failed to uninstall Bun ${$}`})}C();F();x();D();import{join as o1}from"path";import{unlink as i1}from"fs/promises";async function D6($){await y(`Removing alias '${$}'...`,async(q)=>{let Q=o1(k,$);if(!await G(Q))throw Error(`Alias '${$}' does not exist.`);await i1(Q),q.succeed(Z.green(`Alias '${$}' removed successfully.`))},{failMessage:`Failed to remove alias '${$}'`})}C();F();x();Q$();D();import{join as l$}from"path";async function T6($,q){await y(`Preparing to run with Bun ${$}...`,async(Q)=>{let J=await h($);if(!J)J=U($);let Y=l$(w,J),K=l$(Y,"bin"),b=l$(K,R);if(!await G(b)){Q.fail(Z.red(`Bun ${$} (resolved: ${J}) is not installed.`)),console.log(Z.yellow(`You can install it using: bvm install ${$}`));return}Q.stop();try{await d([b,...q],{cwd:process.cwd(),prependPath:K}),process.exit(0)}catch(X){console.error(X.message),process.exit(1)}},{failMessage:`Failed to run command with Bun ${$}`})}C();F();x();Q$();D();import{join as t$}from"path";async function R6($,q,Q){await y(`Preparing environment for Bun ${$} to execute '${q}'...`,async(J)=>{let Y=await h($);if(!Y)Y=U($);let K=t$(w,Y),b=t$(K,"bin"),X=t$(b,R);if(!await G(X)){J.fail(Z.red(`Bun ${$} (resolved: ${Y}) is not installed.`)),console.log(Z.yellow(`You can install it using: bvm install ${$}`));return}J.stop();try{await d([q,...Q],{cwd:process.cwd(),prependPath:b}),process.exit(0)}catch(W){console.error(W.message),process.exit(1)}},{failMessage:`Failed to execute command with Bun ${$}'s environment`})}F();x();D();import{join as a1}from"path";async function I6($){await y("Resolving path...",async()=>{let q=null,Q="bun",{version:J}=await t();if(!$||$==="current"){if(q=J,!q)throw Error("No active Bun version found.")}else{let{resolveLocalVersion:K}=await Promise.resolve().then(() => (Q$(),L6));if(q=await K($),!q)if(J)q=J,Q=$;else throw Error(`Bun version or command '${$}' not found.`)}let Y=a1(w,q,"bin",Q==="bun"?R:Q);if(await G(Y))console.log(Y);else throw Error(`Command '${Q}' not found in Bun ${q}.`)},{failMessage:"Failed to resolve path"})}C();x();D();Q$();async function E6($){await y(`Resolving session version for Bun ${$}...`,async(q)=>{let Q=null,J=await h($);if(J)Q=J;else{let K=(await u()).map((b)=>U(b));Q=$$($,K)}if(!Q)throw Error(`Bun version '${$}' is not installed or cannot be resolved.`);let Y=U(Q);q.succeed(Z.green(`Bun ${Y} will be active in this session.`)),console.log(`export BVM_ACTIVE_VERSION=${Y}`),console.log(Z.dim("Run `eval $(bvm shell <version>)` or `export BVM_ACTIVE_VERSION=...` to activate."))},{failMessage:`Failed to set session version for Bun ${$}`})}C();F();x();D();import{join as s1}from"path";async function S6($){let q=s1(k,"default");if(!$)await y("Checking current default Bun version...",async(Q)=>{if(await G(q)){let J=await f(q);Q.succeed(Z.green(`Default Bun version: ${U(J.trim())}`))}else Q.info(Z.blue("No global default Bun version is set.")),console.log(Z.yellow("Use 'bvm default <version>' to set one."))},{failMessage:"Failed to retrieve default Bun version"});else await y(`Setting global default to Bun ${$}...`,async(Q)=>{let J=(await u()).map((K)=>U(K)),Y=$$($,J);if(!Y)throw Error(`Bun version '${$}' is not installed.`);await y$("default",Y,{silent:!0}),Q.succeed(Z.green(`\u2713 Default set to ${Y}. New terminals will now start with this version.`))},{failMessage:`Failed to set global default to Bun ${$}`})}F();x();C();D();import{unlink as r1}from"fs/promises";import{join as e1}from"path";async function _6(){await y("Deactivating current Bun version...",async($)=>{let q=e1(k,"default");if(await G(q))await r1(q),$.succeed(Z.green("Default Bun version deactivated.")),console.log(Z.gray("Run `bvm use <version>` to reactivate.")),await J$();else $.info("No default Bun version is currently active.")},{failMessage:"Failed to deactivate"})}Q$();F();x();C();D();async function v6($){if($==="dir"){console.log(_);return}if($==="clear"){await y("Clearing cache...",async(q)=>{await W$(_),await M(_),q.succeed(Z.green("Cache cleared."))},{failMessage:"Failed to clear cache"});return}console.error(Z.red(`Unknown cache command: ${$}`)),console.log("Usage: bvm cache dir | bvm cache clear")}C();F();D();x();import{join as S}from"path";import{tmpdir as $4}from"os";import{rm as P6,mkdir as u6}from"fs/promises";var __dirname="/Users/leiliao/MyWorkspace/bvm/src/commands",n$=Z$.version;async function V6(){let $=process.env.BVM_INSTALL_SOURCE;if($==="npm"||$==="bun"||__dirname.includes("node_modules")){await y(`Upgrading BVM via ${$||"package manager"}...`,async(Q)=>{let J=await q$(),Y=$==="bun"?"bun":"npm";Q.text=`Upgrading BVM via ${Y} using ${J}...`;try{await d([Y,"install","-g","bvm-core","--registry",J]),Q.succeed(Z.green(`BVM upgraded via ${Y} successfully.`))}catch(K){throw Error(`${Y} upgrade failed: ${K.message}`)}});return}try{await y("Checking for BVM updates...",async(Q)=>{let J=T?{version:process.env.BVM_TEST_LATEST_VERSION?.replace("v","")||n$,tarball:"https://example.com/bvm-test.tgz",shasum:"mock",integrity:"mock"}:await F$();if(!J)throw Error("Unable to determine the latest BVM version from NPM Registry.");let Y=J.version;if(!m(Y))throw Error(`Unrecognized version received: ${Y}`);if(!C$(Y,n$)){Q.succeed(Z.green(`BVM is already up to date (v${n$}).`)),console.log(Z.blue("You are using the latest version."));return}if(Q.text=`Updating BVM to v${Y}...`,T&&!process.env.BVM_TEST_REAL_UPGRADE){Q.succeed(Z.green("BVM updated successfully (test mode)."));return}Q.update("Downloading update package...");let K=S($4(),`bvm-upgrade-${Date.now()}`);await u6(K,{recursive:!0});let b=S(K,"bvm-core.tgz");if(T){await g(b,"mock-tarball");let W=S(K,"package","dist");await u6(W,{recursive:!0}),await g(S(W,"index.js"),"// new cli"),await g(S(W,"bvm-shim.sh"),"# new shim"),await g(S(W,"bvm-shim.js"),"// new shim")}else{let W=await s(J.tarball,{timeout:30000});if(!W.ok)throw Error(`Failed to download tarball: ${W.statusText}`);let z=await W.arrayBuffer();await w$(b,new Uint8Array(z)),Q.update("Extracting update...");try{await d(["tar","-xzf",b,"-C",K])}catch(N){throw Error('Failed to extract update package. Ensure "tar" is available.')}}Q.update("Applying updates...");let X=S(K,"package","dist");if(await G(S(X,"index.js")))await w$(S(L,"src","index.js"),await f(S(X,"index.js")));if(A!=="win32"&&await G(S(X,"bvm-shim.sh")))await w$(S(L,"bin","bvm-shim.sh"),await f(S(X,"bvm-shim.sh")));if(A==="win32"&&await G(S(X,"bvm-shim.js")))await w$(S(L,"bin","bvm-shim.js"),await f(S(X,"bvm-shim.js")));try{await P6(K,{recursive:!0,force:!0})}catch(W){}try{await P6(M$,{force:!0})}catch(W){}Q.update("Finalizing environment..."),await U$(!1),Q.succeed(Z.green(`BVM updated to v${Y} successfully.`)),console.log(Z.yellow("Please restart your terminal to apply changes."))},{failMessage:"Failed to upgrade BVM"})}catch(Q){throw Error(`Failed to upgrade BVM: ${Q.message}`)}}C();F();x();D();import{homedir as q4}from"os";import{join as Q4}from"path";async function g6(){await y("Gathering BVM diagnostics...",async()=>{let $={currentVersion:(await t()).version,installedVersions:await u(),aliases:await J4(),env:{BVM_DIR:L,BVM_BIN_DIR:j,BVM_SHIMS_DIR:I,BVM_VERSIONS_DIR:w,BVM_TEST_MODE:process.env.BVM_TEST_MODE,HOME:process.env.HOME||q4()}};K4($)})}async function J4(){if(!await G(k))return[];let $=await l(k),q=[];for(let Q of $){let J=Q4(k,Q);if(await G(J)){let Y=await Bun.file(J).text();q.push({name:Q,target:U(Y.trim())})}}return q}function K4($){if(console.log(Z.bold(`
System`)),console.log(`  OS: ${Z.cyan(A)}`),console.log(`  Arch: ${Z.cyan(e)} ${process.arch!==e?Z.yellow(`(Process: ${process.arch})`):""}`),console.log(Z.bold(`
Directories`)),console.log(`  BVM_DIR: ${Z.cyan($.env.BVM_DIR||"")}`),console.log(`  BIN_DIR: ${Z.cyan(j)}`),console.log(`  SHIMS_DIR: ${Z.cyan(I)}`),console.log(`  VERSIONS_DIR: ${Z.cyan(w)}`),console.log(Z.bold(`
Environment`)),console.log(`  HOME: ${$.env.HOME||"n/a"}`),console.log(`  BVM_TEST_MODE: ${$.env.BVM_TEST_MODE||"false"}`),console.log(Z.bold(`
Installed Versions`)),$.installedVersions.length===0)console.log("  (none installed)");else $.installedVersions.forEach((q)=>{let Q=q===$.currentVersion,J=Q?Z.green("*"):" ",Y=Q?Z.green(q):q,K=Q?Z.green(" (current)"):"";console.log(`  ${J} ${Y}${K}`)});if(console.log(Z.bold(`
Aliases`)),$.aliases.length===0)console.log("  (no aliases configured)");else $.aliases.forEach((q)=>{console.log(`  ${q.name} ${Z.gray("->")} ${Z.cyan(q.target)}`)});console.log(`
`+Z.green("Diagnostics complete."))}var o$=["install","uninstall","use","ls","ls-remote","current","alias","unalias","run","exec","which","cache","setup","upgrade","doctor","completion","deactivate","help"],d6={bash:`#!/usr/bin/env bash
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
`};function h6($){let q=d6[$];if(!q)throw Error(`Unsupported shell '${$}'. Supported shells: ${Object.keys(d6).join(", ")}`);console.log(q)}C();F();x();import{join as c6}from"path";C();var m6="update-check.json",Y4=86400000;async function p6(){if(process.env.CI||T)return;let $=c6(_,m6);try{if(await G($)){let q=await f($),Q=JSON.parse(q);if(Date.now()-Q.lastCheck<Y4)return}}catch(q){}try{let q=await F$();if(q){let Q=q.tagName.startsWith("v")?q.tagName.slice(1):q.tagName;await M(_),await g($,JSON.stringify({lastCheck:Date.now(),latestVersion:Q}))}}catch(q){}}async function l6(){if(process.env.CI||T)return null;let $=Z$.version,q=c6(_,m6);try{if(await G(q)){let Q=await f(q),J=JSON.parse(Q);if(J.latestVersion&&C$(J.latestVersion,$))return`
${Z.gray("Update available:")} ${Z.green(`v${J.latestVersion}`)} ${Z.dim(`(current: v${$})`)}
${Z.gray("Run")} ${Z.cyan("bvm upgrade")} ${Z.gray("to update.")}`}}catch(Q){}return null}class t6{commands={};helpEntries=[];name;versionStr;constructor($){this.name=$,this.versionStr=Z$.version}command($,q,Q={}){let J=$.split(" ")[0],Y={description:q,usage:`${this.name} ${$}`,action:async()=>{},aliases:Q.aliases};if(this.commands[J]=Y,this.helpEntries.push(`  ${$.padEnd(35)} ${q}`),Q.aliases)Q.aliases.forEach((b)=>{this.commands[b]=Y});let K={action:(b)=>{return Y.action=b,K},option:(b,X)=>K};return K}async run(){p6().catch(()=>{});let{values:$,positionals:q}=Z4({args:Bun.argv.slice(2),strict:!1,allowPositionals:!0,options:{help:{type:"boolean",short:"h"},version:{type:"boolean",short:"v"},silent:{type:"boolean",short:"s"}}}),Q=q[0],J=!!($.silent||$.s),Y=!!($.version||$.v||$.help||$.h);if(!Q){if($.version||$.v)console.log(this.versionStr),process.exit(0);if($.help||$.h)this.showHelp(),process.exit(0);this.showHelp(),process.exit(1)}if($.help||$.h)this.showHelp(),process.exit(0);let K=this.commands[Q];if(!K)console.error(Z.yellow(`Unknown command '${Q}'`)),this.showHelp(),process.exit(0);try{if(await K.action(q.slice(1),$),!Y&&!J&&["ls","current","doctor","default"].includes(Q)){let b=await l6();if(b)console.log(b)}}catch(b){if(!b.reported)console.error(Z.red(`\u2716 ${b.message}`));process.exit(1)}}showHelp(){console.log(`Bun Version Manager (bvm) v${this.versionStr}`),console.log(`Built with Bun \xB7 Runs with Bun \xB7 Tested on Bun
`),console.log("Usage:"),console.log(`  ${this.name} <command> [flags]
`),console.log("Commands:"),console.log(this.helpEntries.join(`
`)),console.log(`
Global Flags:`),console.log("  --help, -h                     Show this help message"),console.log("  --version, -v                  Show version number"),console.log(`
Examples:`),console.log("  bvm install 1.0.0"),console.log("  bvm use 1.0.0"),console.log("  bvm run 1.0.0 index.ts")}}async function b4(){let $=new t6("bvm");$.command("rehash","Regenerate shims for all installed binaries").action(async()=>{await J$()}),$.command("install [version]","Install a Bun version and set as current").option("--global, -g","Install as a global tool (not just default)").action(async(q,Q)=>{await m$(q[0],{global:Q.global||Q.g})}),$.command("i [version]","Alias for install").action(async(q,Q)=>{await m$(q[0],{global:Q.global||Q.g})}),$.command("ls","List installed Bun versions",{aliases:["list"]}).action(async()=>{await B6()}),$.command("ls-remote","List all available remote Bun versions").action(async()=>{await j6()}),$.command("use <version>","Switch the active Bun version immediately (all terminals)").action(async(q)=>{if(!q[0])throw Error("Version is required");await H$(q[0])}),$.command("shell <version>","Switch Bun version for the current shell session").action(async(q)=>{if(!q[0])throw Error("Version is required");await E6(q[0])}),$.command("default [version]","Display or set the global default Bun version").action(async(q)=>{await S6(q[0])}),$.command("current","Display the currently active Bun version").action(async()=>{await f6()}),$.command("uninstall <version>","Uninstall a Bun version").action(async(q)=>{if(!q[0])throw Error("Version is required");await M6(q[0])}),$.command("alias <name> <version>","Create an alias for a Bun version").action(async(q)=>{if(!q[0]||!q[1])throw Error("Name and version are required");await y$(q[0],q[1])}),$.command("unalias <name>","Remove an existing alias").action(async(q)=>{if(!q[0])throw Error("Alias name is required");await D6(q[0])}),$.command("run <version> [...args]","Run a command with a specific Bun version").action(async(q)=>{let Q=q[0];if(!Q)throw Error("Version is required");let J=process.argv.indexOf("run"),Y=J!==-1?process.argv.slice(J+2):[];await T6(Q,Y)}),$.command("exec <version> <cmd> [...args]","Execute a command with a specific Bun version's environment").action(async(q)=>{let Q=q[0],J=q[1];if(!Q||!J)throw Error("Version and command are required");let Y=process.argv.indexOf("exec"),K=Y!==-1?process.argv.slice(Y+3):[];await R6(Q,J,K)}),$.command("which [version]","Display path to installed bun version").action(async(q)=>{await I6(q[0])}),$.command("deactivate","Undo effects of bvm on current shell").action(async()=>{await _6()}),$.command("version <spec>","Resolve the given description to a single local version").action(async(q)=>{if(!q[0])throw Error("Version specifier is required");await S$(q[0])}),$.command("cache <action>","Manage bvm cache").action(async(q)=>{if(!q[0])throw Error("Action is required");await v6(q[0])}),$.command("setup","Configure shell environment automatically").option("--silent, -s","Suppress output").action(async(q,Q)=>{await U$(!(Q.silent||Q.s))}),$.command("upgrade","Upgrade bvm to the latest version",{aliases:["self-update"]}).action(async()=>{await V6()}),$.command("doctor","Show diagnostics for Bun/BVM setup").action(async()=>{await g6()}),$.command("completion <shell>","Generate shell completion script (bash|zsh|fish)").action(async(q)=>{if(!q[0])throw Error("Shell name is required");h6(q[0])}),await $.run(),process.exit(0)}b4().catch(($)=>{console.error(Z.red(`
[FATAL ERROR] Unexpected Crash:`)),console.error($),process.exit(1)});
