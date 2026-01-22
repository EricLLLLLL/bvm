#!/usr/bin/env bun
// @bun
var a1=Object.create;var{getPrototypeOf:s1,defineProperty:M$,getOwnPropertyNames:r1}=Object;var e1=Object.prototype.hasOwnProperty;var y$=($,q,Q)=>{Q=$!=null?a1(s1($)):{};let J=q||!$||!$.__esModule?M$(Q,"default",{value:$,enumerable:!0}):Q;for(let Y of r1($))if(!e1.call(J,Y))M$(J,Y,{get:()=>$[Y],enumerable:!0});return J};var r$=($,q)=>{for(var Q in q)M$($,Q,{get:q[Q],enumerable:!0,configurable:!0,set:(J)=>q[Q]=()=>J})};var L$=($,q)=>()=>($&&(q=$($=0)),q);var O$=import.meta.require;var e$={};r$(e$,{getBunAssetName:()=>I$,USER_AGENT:()=>X$,TEST_REMOTE_VERSIONS:()=>b$,REPO_FOR_BVM_CLI:()=>K6,OS_PLATFORM:()=>w,IS_TEST_MODE:()=>T,HAS_AVX2:()=>C$,EXECUTABLE_NAME:()=>I,CPU_ARCH:()=>e,BVM_VERSIONS_DIR:()=>x,BVM_SRC_DIR:()=>D$,BVM_SHIMS_DIR:()=>R,BVM_FINGERPRINTS_FILE:()=>T$,BVM_DIR:()=>L,BVM_CURRENT_DIR:()=>G$,BVM_COMPONENTS:()=>b6,BVM_CDN_ROOT:()=>Z6,BVM_CACHE_DIR:()=>_,BVM_BIN_DIR:()=>A,BVM_ALIAS_DIR:()=>C,BUN_GITHUB_RELEASES_API:()=>J6,ASSET_NAME_FOR_BVM:()=>Y6});import{join as r}from"path";import{spawnSync as f$}from"child_process";function q6(){let $=process.arch;if(w==="darwin"&&$==="x64")try{if(f$("sysctl",["-n","sysctl.proc_translated"],{encoding:"utf-8"}).stdout.trim()==="1")return"arm64"}catch(q){}return $}function Q6(){if(w==="win32")return!0;try{if(w==="darwin")return f$("sysctl",["-a"],{encoding:"utf-8"}).stdout.includes("AVX2");else if(w==="linux")return f$("cat",["/proc/cpuinfo"],{encoding:"utf-8"}).stdout.includes("avx2")}catch($){}return!0}function I$($){let q=w==="win32"?"windows":w,Q=e==="arm64"?"aarch64":"x64";return`bun-${q}-${Q}${!C$&&Q==="x64"?"-baseline":""}.zip`}var w,T,b$,e,C$,L,D$,x,A,R,G$,C,_,T$,I,J6="https://api.github.com/repos/oven-sh/bun/releases",K6="EricLLLLLL/bvm",Y6,X$="bvm (Bun Version Manager)",Z6,b6;var j=L$(()=>{w=process.platform,T=process.env.BVM_TEST_MODE==="true",b$=["v1.3.4","v1.2.23","v1.0.0","bun-v1.4.0-canary"];e=q6(),C$=Q6(),L=getBvmDir(),D$=r(L,"src"),x=r(L,"versions"),A=r(L,"bin"),R=r(L,"shims"),G$=r(L,"current"),C=r(L,"aliases"),_=r(L,"cache"),T$=r(L,"fingerprints.json"),I=w==="win32"?"bun.exe":"bun",Y6=w==="win32"?"bvm.exe":"bvm",Z6=process.env.BVM_CDN_URL||"https://cdn.jsdelivr.net/gh/EricLLLLLL/bvm",b6=[{name:"CLI Core",remotePath:"index.js",localPath:"src/index.js"},{name:"Windows Shim",remotePath:"bvm-shim.js",localPath:"bin/bvm-shim.js",platform:"win32"},{name:"Unix Shim",remotePath:"bvm-shim.sh",localPath:"bin/bvm-shim.sh",platform:"posix"}]});function c($){if(!$)return null;return $.match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/)?$:null}function $1($){let q=c($);return q?q.replace(/^v/,""):null}function K$($){if(!$)return null;let q=$.replace(/^v/,""),J=q.split(/[-+]/)[0].split(".").map(Number);if(J.length===0||J.some((K)=>isNaN(K)))return null;let Y=q.includes("-")?q.split("-")[1].split("+")[0]:void 0;return{major:J[0],minor:J[1],patch:J[2],pre:Y}}function R$($,q){if(!$||!q)return 0;if($.major!==q.major)return $.major-q.major;if($.minor!==q.minor)return $.minor-q.minor;if($.patch!==q.patch)return $.patch-q.patch;if($.pre&&!q.pre)return-1;if(!$.pre&&q.pre)return 1;if($.pre&&q.pre)return $.pre.localeCompare(q.pre);return 0}function q1($,q){let Q=K$($),J=K$(q);return R$(Q,J)}function Y$($,q){return q1(q,$)}function N$($,q){return q1($,q)>0}function Q1($,q){if(q==="*"||q===""||q==="latest")return!0;let Q=K$($);if(!Q)return!1;let J=q;if(q.startsWith("v"))J=q.substring(1);if($1($)===$1(q))return!0;let Y=J.split(".");if(Y.length===1){let K=Number(Y[0]);if(Q.major===K)return!0}else if(Y.length===2){let K=Number(Y[0]),b=Number(Y[1]);if(Q.major===K&&Q.minor===b)return!0}if(q.startsWith("~")){let K=K$(q.substring(1));if(!K)return!1;let b=K.patch??0;return Q.major===K.major&&Q.minor===K.minor&&Q.patch>=b}if(q.startsWith("^")){let K=K$(q.substring(1));if(!K)return!1;let b=K.patch??0,G=K.minor??0;if(K.major===0){if(Q.major!==0)return!1;if(Q.minor!==G)return!1;return Q.patch>=b}if(Q.major!==K.major)return!1;if(Q.minor<G)return!1;if(Q.minor===G&&Q.patch<b)return!1;return!0}return!1}import{readdir as X6,mkdir as W6,stat as J1,symlink as H6,unlink as K1,rm as Y1,readlink as U6}from"fs/promises";import{join as F$,dirname as z6,basename as y6}from"path";async function f($){try{await W6($,{recursive:!0})}catch(q){if(q.code==="EEXIST")try{if((await J1($)).isDirectory())return}catch{}throw q}}async function X($){try{return await J1($),!0}catch(q){if(q.code==="ENOENT")return!1;throw q}}async function Z1($,q){try{await K1(q)}catch(J){try{await Y1(q,{recursive:!0,force:!0})}catch(Y){}}let Q=process.platform==="win32"?"junction":"dir";await H6($,q,Q)}async function b1($){try{return await U6($)}catch(q){if(q.code==="ENOENT"||q.code==="EINVAL")return null;throw q}}async function W$($){await Y1($,{recursive:!0,force:!0})}async function l($){try{return await X6($)}catch(q){if(q.code==="ENOENT")return[];throw q}}async function M($){return await Bun.file($).text()}async function g($,q){await Bun.write($,q)}async function w$($,q,Q={}){let{backup:J=!0}=Q,Y=z6($);await f(Y);let K=`${$}.tmp-${Date.now()}`,b=`${$}.bak`;try{if(await g(K,q),J&&await X($))try{let{rename:W,unlink:y}=await import("fs/promises");if(await X(b))await y(b).catch(()=>{});await W($,b)}catch(W){}let{rename:G}=await import("fs/promises");try{await G(K,$)}catch(W){await Bun.write($,q),await K1(K).catch(()=>{})}}catch(G){let{unlink:W}=await import("fs/promises");throw await W(K).catch(()=>{}),G}}function U($){let q=$.trim();if(q.startsWith("bun-v"))q=q.substring(4);if(!q.startsWith("v")&&/^\d/.test(q))q=`v${q}`;return q}async function u(){return await f(x),(await l(x)).filter((q)=>c(U(q))).sort(Y$)}async function t(){if(process.env.BVM_ACTIVE_VERSION)return{version:U(process.env.BVM_ACTIVE_VERSION),source:"env"};let $=F$(process.cwd(),".bvmrc");if(await X($)){let b=(await M($)).trim();return{version:U(b),source:".bvmrc"}}let{getBvmDir:q}=await Promise.resolve().then(() => (j(),e$)),Q=q(),J=F$(Q,"current"),Y=F$(Q,"aliases");if(await X(J)){let{realpath:b}=await import("fs/promises");try{let G=await b(J);return{version:U(y6(G)),source:"current"}}catch(G){}}let K=F$(Y,"default");if(await X(K)){let b=(await M(K)).trim();return{version:U(b),source:"default"}}return{version:null,source:null}}function $$($,q){if(!$||q.length===0)return null;let Q=U($);if(q.includes(Q))return Q;if($.toLowerCase()==="latest")return q[0];if(/^\d+\.\d+\.\d+$/.test($.replace(/^v/,"")))return null;if(!/^[v\d]/.test($))return null;let Y=$.startsWith("v")?`~${$.substring(1)}`:`~${$}`,K=q.filter((b)=>Q1(b,Y));if(K.length>0)return K.sort(Y$)[0];return null}var k=L$(()=>{j()});class E${timer=null;frames=process.platform==="win32"?["-"]:["\u280B","\u2819","\u2839","\u2838","\u283C","\u2834","\u2826","\u2827","\u2807","\u280F"];frameIndex=0;text;isWindows=process.platform==="win32";constructor($){this.text=$}start($){if($)this.text=$;if(this.timer)return;if(this.isWindows){process.stdout.write(`${Z.cyan(">")} ${this.text}
`);return}this.timer=setInterval(()=>{process.stdout.write(`\r\x1B[K${Z.cyan(this.frames[this.frameIndex])} ${this.text}`),this.frameIndex=(this.frameIndex+1)%this.frames.length},80)}stop(){if(this.isWindows)return;if(this.timer)clearInterval(this.timer),this.timer=null,process.stdout.write("\r\x1B[K");process.stdout.write("\x1B[?25h")}succeed($){this.stop(),console.log(`${Z.green("  \u2713")} ${$||this.text}`)}fail($){this.stop(),console.log(`${Z.red("  \u2716")} ${$||this.text}`)}info($){this.stop(),console.log(`${Z.blue("  \u2139")} ${$||this.text}`)}update($){if(this.text=$,this.isWindows)console.log(Z.dim(`  ... ${this.text}`))}}class S${total;current=0;width=20;constructor($){this.total=$}start(){process.stdout.write("\x1B[?25l"),this.render()}update($,q){this.current=$,this.render(q)}stop(){process.stdout.write(`\x1B[?25h
`)}render($){let q=Math.min(1,this.current/this.total),Q=Math.round(this.width*q),J=this.width-Q,Y=process.platform==="win32",K=Y?"=":"\u2588",b=Y?"-":"\u2591",G=Z.green(K.repeat(Q))+Z.gray(b.repeat(J)),W=(q*100).toFixed(0).padStart(3," "),y=(this.current/1048576).toFixed(1),F=(this.total/1048576).toFixed(1),H=$?` ${$.speed}KB/s`:"";process.stdout.write(`\r\x1B[2K ${G} ${W}% | ${y}/${F}MB${H}`)}}var L6,O6=($)=>$.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),i=($,q,Q=$)=>(J)=>L6?$+J.replace(new RegExp(O6(q),"g"),Q)+q:J,Z;var N=L$(()=>{L6=!process.env.NO_COLOR,Z={red:i("\x1B[1;31m","\x1B[39m"),green:i("\x1B[1;32m","\x1B[39m"),yellow:i("\x1B[1;33m","\x1B[39m"),blue:i("\x1B[1;34m","\x1B[39m"),magenta:i("\x1B[1;35m","\x1B[39m"),cyan:i("\x1B[1;36m","\x1B[39m"),gray:i("\x1B[90m","\x1B[39m"),bold:i("\x1B[1m","\x1B[22m","\x1B[22m\x1B[1m"),dim:i("\x1B[2m","\x1B[22m","\x1B[22m\x1B[2m")}});async function z($,q,Q){if(process.platform==="win32"){console.log(Z.cyan(`> ${$}`));let K={start:(b)=>{if(b)console.log(Z.cyan(`> ${b}`))},stop:()=>{},succeed:(b)=>console.log(Z.green(`  \u2713 ${b}`)),fail:(b)=>console.log(Z.red(`  \u2716 ${b}`)),info:(b)=>console.log(Z.cyan(`  \u2139 ${b}`)),update:(b)=>console.log(Z.dim(`  ... ${b}`)),isSpinning:!1};try{return await q(K)}catch(b){let G=L1(b,Q?.failMessage);if(console.log(Z.red(`  \u2716 ${G}`)),process.env.BVM_DEBUG,console.log(Z.dim(`    Details: ${b.message}`)),b.code)console.log(Z.dim(`    Code: ${b.code}`));throw b.reported=!0,b}}let Y=new E$($);Y.start();try{let K=await q(Y);return Y.stop(),K}catch(K){let b=L1(K,Q?.failMessage);throw Y.fail(Z.red(b)),K.reported=!0,K}}function L1($,q){let Q=$ instanceof Error?$.message:String($);if(!q)return Q;if(typeof q==="function")return q($);return`${q}: ${Q}`}var D=L$(()=>{N()});var O1={};r$(O1,{resolveLocalVersion:()=>h,displayVersion:()=>v$});import{join as f6}from"path";async function h($){if($==="current"){let{version:Y}=await t();return Y}if($==="latest"){let Y=await u();if(Y.length>0)return Y[0];return null}let q=f6(C,$);if(await X(q))try{let Y=(await M(q)).trim();return U(Y)}catch{return null}let Q=U($),J=await u();return $$($,J)}async function v$($){await z(`Resolving version '${$}'...`,async()=>{let q=await h($);if(q)console.log(q);else throw Error("N/A")},{failMessage:`Failed to resolve version '${$}'`})}var Q$=L$(()=>{j();k();D()});import{parseArgs as Z4}from"util";var Z$={name:"bvm-core",version:"1.1.28",description:"The native version manager for Bun. Cross-platform, shell-agnostic, and zero-dependency.",main:"dist/index.js",bin:{bvm:"bin/bvm-npm.js"},publishConfig:{access:"public"},scripts:{dev:"bun run src/index.ts",build:"bun build src/index.ts --target=bun --outfile dist/index.js --minify && bun run scripts/sync-runtime.ts",test:"bun test",bvm:"bun run src/index.ts","bvm:sandbox":'mkdir -p "$PWD/.sandbox-home" && HOME="$PWD/.sandbox-home" bun run src/index.ts',release:"bun run scripts/check-integrity.ts && bun run build && bun run scripts/release.ts","check-integrity":"bun run scripts/check-integrity.ts","test:e2e:npm":"bun run scripts/verify-e2e-npm.ts","sync-runtime":"bun run scripts/sync-runtime.ts",postinstall:"node scripts/postinstall.js"},repository:{type:"git",url:"git+https://github.com/EricLLLLLL/bvm.git"},keywords:["bun","version-manager","cli","bvm","nvm","nvm-windows","fnm","nodenv","bun-nvm","version-switching"],files:["dist/index.js","dist/bvm-shim.sh","dist/bvm-shim.js","bin/bvm-npm.js","scripts/postinstall.js","install.sh","install.ps1","README.md"],author:"EricLLLLLL",license:"MIT",type:"commonjs",dependencies:{"cli-progress":"^3.12.0"},optionalDependencies:{"@oven/bun-darwin-aarch64":"^1.3.6","@oven/bun-darwin-x64":"^1.3.6","@oven/bun-linux-aarch64":"^1.3.6","@oven/bun-linux-x64":"^1.3.6","@oven/bun-windows-x64":"^1.3.6"},devDependencies:{"@types/bun":"^1.3.4","@types/cli-progress":"^3.11.6","@types/node":"^24.10.2",bun:"^1.3.6",esbuild:"^0.27.2",execa:"^9.6.1",typescript:"^5"},peerDependencies:{typescript:"^5"}};j();k();import{join as o,basename as h6,dirname as m6}from"path";j();k();N();import{join as k6}from"path";function G1($,q){if($==="darwin"){if(q==="arm64")return"@oven/bun-darwin-aarch64";if(q==="x64")return"@oven/bun-darwin-x64"}if($==="linux"){if(q==="arm64")return"@oven/bun-linux-aarch64";if(q==="x64")return"@oven/bun-linux-x64"}if($==="win32"){if(q==="x64")return"@oven/bun-windows-x64"}return null}function X1($,q,Q){let J=Q;if(!J.endsWith("/"))J+="/";let Y=$.startsWith("@"),K=$;if(Y){let G=$.split("/");if(G.length===2)K=G[1]}let b=`${K}-${q}.tgz`;return`${J}${$}/-/${b}`}N();async function d($,q={}){let{cwd:Q,env:J,prependPath:Y,stdin:K="inherit",stdout:b="inherit",stderr:G="inherit"}=q,W={...process.env,...J};if(Y){let H=W.PATH||"",B=process.platform==="win32"?";":":";W.PATH=`${Y}${B}${H}`}let F=await Bun.spawn({cmd:$,cwd:Q,env:W,stdin:K,stdout:b,stderr:G}).exited;if((F??0)!==0)throw Error(`${Z.red("Command failed")}: ${$.join(" ")} (code ${F})`);return F??0}async function a($,q={}){let{timeout:Q=5000,...J}=q,Y=new AbortController,K=setTimeout(()=>Y.abort(),Q);try{let b=await fetch($,{...J,signal:Y.signal});return clearTimeout(K),b}catch(b){if(clearTimeout(K),b.name==="AbortError")throw Error(`Request to ${$} timed out after ${Q}ms`);throw b}}async function w6($,q=2000){if($.length===0)throw Error("No URLs to race");if($.length===1)return $[0];return new Promise((Q,J)=>{let Y=0,K=!1;$.forEach((b)=>{a(b,{method:"HEAD",timeout:q}).then((G)=>{if(G.ok&&!K)K=!0,Q(b);else if(!K){if(Y++,Y===$.length)J(Error("All requests failed"))}}).catch(()=>{if(!K){if(Y++,Y===$.length)J(Error("All requests failed"))}})})})}async function x6(){try{let $=await a("https://1.1.1.1/cdn-cgi/trace",{timeout:500});if(!$.ok)return null;let Q=(await $.text()).match(/loc=([A-Z]{2})/);return Q?Q[1]:null}catch($){return null}}var _$=null,x$={NPM:"https://registry.npmjs.org",TAOBAO:"https://registry.npmmirror.com",TENCENT:"https://mirrors.cloud.tencent.com/npm/"};async function q$(){if(_$)return _$;let $=await x6(),q=[];if($==="CN")q=[x$.TAOBAO,x$.TENCENT,x$.NPM];else q=[x$.NPM,x$.TAOBAO];try{let Q=await w6(q,2000);return _$=Q,Q}catch(Q){return q[0]}}k();var C6="bun-versions.json",N6=3600000;async function F6(){if(T)return[...b$];let $=k6(_,C6);try{if(await X($)){let Y=await M($),K=JSON.parse(Y);if(Date.now()-K.timestamp<N6&&Array.isArray(K.versions))return K.versions}}catch(Y){}let q=await q$(),Q=[q];if(q!=="https://registry.npmjs.org")Q.push("https://registry.npmjs.org");let J=null;for(let Y of Q){let K=`${Y.replace(/\/$/,"")}/bun`;try{let b=await a(K,{headers:{"User-Agent":X$,Accept:"application/vnd.npm.install-v1+json"},timeout:1e4});if(!b.ok)throw Error(`Status ${b.status}`);let G=await b.json();if(!G.versions)throw Error("Invalid response (no versions)");let W=Object.keys(G.versions);try{await f(_),await g($,JSON.stringify({timestamp:Date.now(),versions:W}))}catch(y){}return W}catch(b){J=b}}throw J||Error("Failed to fetch versions from any registry.")}async function j6(){if(T)return[...b$];return new Promise(($,q)=>{let Q=[];try{let J=Bun.spawn(["git","ls-remote","--tags","https://github.com/oven-sh/bun.git"],{stdout:"pipe",stderr:"pipe"}),Y=setTimeout(()=>{J.kill(),q(Error("Git operation timed out"))},1e4);new Response(J.stdout).text().then((b)=>{clearTimeout(Y);let G=b.split(`
`);for(let W of G){let y=W.match(/refs\/tags\/bun-v?(\d+\.\d+\.\d+.*)$/);if(y)Q.push(y[1])}$(Q)}).catch((b)=>{clearTimeout(Y),q(b)})}catch(J){q(Error(`Failed to run git: ${J.message}`))}})}async function W1(){if(T)return[...b$];try{let q=(await F6()).filter((Q)=>c(Q)).map((Q)=>({v:Q,parsed:K$(Q)}));return q.sort((Q,J)=>R$(J.parsed,Q.parsed)),q.map((Q)=>Q.v)}catch($){try{let q=await j6();if(q.length>0)return Array.from(new Set(q.filter((J)=>c(J)))).sort(Y$);throw Error("No versions found via Git")}catch(q){throw Error(`Failed to fetch versions. NPM: ${$.message}. Git: ${q.message}`)}}}async function H1($){if(T)return b$.includes($)||$==="latest";let q=await q$(),Q=$.replace(/^v/,""),J=`${q}/bun/${Q}`,Y=w==="win32"?"curl.exe":"curl",K=async()=>{try{return await d([Y,"-I","-f","-m","5","-s",J],{stdout:"ignore",stderr:"ignore"}),!0}catch(G){return!1}},b=new Promise((G)=>setTimeout(()=>G(!1),1e4));return Promise.race([K(),b])}async function U1(){if(T)return{latest:"1.1.20"};let q=`${await q$()}/-/package/bun/dist-tags`;try{let Q=await a(q,{headers:{"User-Agent":X$},timeout:5000});if(Q.ok)return await Q.json()}catch(Q){}return{}}async function z1($){let q=U($);if(!c(q))return console.error(Z.red(`Invalid version provided to findBunDownloadUrl: ${$}`)),null;if(T)return{url:`https://example.com/${I$(q)}`,foundVersion:q};let Y=G1(w==="win32"?"win32":w,e==="arm64"?"arm64":"x64");if(!Y)throw Error(`Unsupported platform/arch for NPM download: ${w}-${e}`);let K="";if(process.env.BVM_REGISTRY)K=process.env.BVM_REGISTRY;else if(process.env.BVM_DOWNLOAD_MIRROR)K=process.env.BVM_DOWNLOAD_MIRROR;else K=await q$();let b=q.replace(/^v/,"");return{url:X1(Y,b,K),foundVersion:q}}async function j$(){try{let q=(await q$()).replace(/\/$/,""),Q=await a(`${q}/-/package/bvm-core/dist-tags`,{headers:{"User-Agent":X$},timeout:5000});if(!Q.ok)return null;let Y=(await Q.json()).latest;if(!Y)return null;let K=await a(`${q}/bvm-core/${Y}`,{headers:{"User-Agent":X$},timeout:5000});if(K.ok){let b=await K.json();return{version:Y,tarball:b.dist.tarball,integrity:b.dist.integrity,shasum:b.dist.shasum}}}catch($){}return null}N();j();import{spawn as A6}from"child_process";async function y1($,q){if($.endsWith(".zip"))if(w==="win32")await d(["powershell","-Command",`Expand-Archive -Path "${$}" -DestinationPath "${q}" -Force`],{stdout:"ignore",stderr:"inherit"});else await d(["unzip","-o","-q",$,"-d",q],{stdout:"ignore",stderr:"inherit"});else if($.endsWith(".tar.gz")||$.endsWith(".tgz"))await new Promise((Q,J)=>{let Y=A6("tar",["-xzf",$,"-C",q],{stdio:"inherit",shell:!1});Y.on("close",(K)=>{if(K===0)Q();else J(Error(`tar exited with code ${K}`))}),Y.on("error",(K)=>J(K))});else throw Error(`Unsupported archive format: ${$}`)}import{chmod as p$}from"fs/promises";k();j();N();import{join as O,dirname as x1}from"path";import{homedir as v}from"os";import{mkdir as k1}from"fs/promises";import{chmod as k$}from"fs/promises";j();k();N();import{join as w1}from"path";k();import{join as B6,dirname as M6}from"path";async function A$(){let $=process.cwd();while(!0){let q=B6($,".bvmrc");if(await X(q))try{return(await Bun.file(q).text()).trim()}catch(J){return null}let Q=M6($);if(Q===$)break;$=Q}return null}Q$();D();async function H$($,q={}){let Q=$;if(!Q)Q=await A$()||void 0;if(!Q){if(!q.silent)console.error(Z.red("No version specified. Usage: bvm use <version>"));throw Error("No version specified.")}let J=async(Y)=>{let K=null,b=await h(Q);if(b)K=b;else{let F=(await u()).map((H)=>U(H));K=$$(Q,F)}if(!K)throw Error(`Bun version '${Q}' is not installed.`);let G=U(K),W=w1(x,G),y=w1(W,"bin",I);if(!await X(y))throw Error(`Version ${G} is not properly installed (binary missing).`);if(await Z1(W,G$),Y)Y.succeed(Z.green(`Now using Bun ${G} (immediate effect).`))};if(q.silent)await J();else await z(`Switching to Bun ${Q}...`,(Y)=>J(Y),{failMessage:()=>`Failed to switch to Bun ${Q}`})}var P$=`#!/bin/bash

# bvm-init.sh: Initializes bvm default version on shell startup

# Check if BVM_DIR is set
if [ -z "\${BVM_DIR}" ]; then
  return
fi

# Try to switch to the 'default' version silently.
"\${BVM_DIR}/bin/bvm" use default --silent >/dev/null 2>&1 || true
`;var u$=`# bvm-init.fish: Initializes bvm default version on shell startup

# Check if BVM_DIR is set
if not set -q BVM_DIR
  return
end

# Try to switch to the 'default' version silently.
eval "$BVM_DIR/bin/bvm" use default --silent >/dev/null 2>&1 || true
`;var V$=`#!/bin/bash
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
`;var g$=`const path = require('path');
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
`;var d$=`@echo off
set "BVM_DIR=%USERPROFILE%\\.bvm"
set "BUN_INSTALL=%BVM_DIR%\\current"

:: Fast-path: If no .bvmrc in current directory, run default directly
if not exist ".bvmrc" (
    "%BVM_DIR%\\runtime\\current\\bin\\bun.exe" %*
    exit /b %errorlevel%
)

:: Slow-path: Hand over to JS shim for version resolution
"%BVM_DIR%\\runtime\\current\\bin\\bun.exe" "%BVM_DIR%\\bin\\bvm-shim.js" "bun" %*

`;var h$=`@echo off
set "BVM_DIR=%USERPROFILE%\\.bvm"
set "BUN_INSTALL=%BVM_DIR%\\current"

if not exist ".bvmrc" (
    "%BVM_DIR%\\runtime\\current\\bin\\bun.exe" %*
    exit /b %errorlevel%
)

"%BVM_DIR%\\runtime\\current\\bin\\bun.exe" "%BVM_DIR%\\bin\\bvm-shim.js" "bunx" %*

`;var m$=`@echo off
set "BVM_DIR=%USERPROFILE%\\.bvm"
"%BVM_DIR%\\runtime\\current\\bin\\bun.exe" "%BVM_DIR%\\src\\index.js" %*
`;async function U$($=!0){if(await v6($),process.platform==="win32"){await P6($);return}let q=process.env.SHELL||"",Q="",J="";if(q.includes("zsh"))J="zsh",Q=O(v(),".zshrc");else if(q.includes("bash"))if(J="bash",process.platform==="darwin")if(await X(O(v(),".bashrc")))Q=O(v(),".bashrc");else Q=O(v(),".bash_profile");else Q=O(v(),".bashrc");else if(q.includes("fish"))J="fish",Q=O(v(),".config","fish","config.fish");else if(await X(O(v(),".zshrc")))J="zsh",Q=O(v(),".zshrc");else if(await X(O(v(),".config","fish","config.fish")))J="fish",Q=O(v(),".config","fish","config.fish");else if(await X(O(v(),".bashrc")))J="bash",Q=O(v(),".bashrc");else if(await X(O(v(),".bash_profile")))J="bash",Q=O(v(),".bash_profile");else{if($)console.log(Z.yellow(`Could not detect a supported shell (zsh, bash, fish). Please manually add ${A} to your PATH.`));return}let Y=O(A,"bvm-init.sh");await Bun.write(Y,P$),await k$(Y,493);let K=O(A,"bvm-init.fish");await Bun.write(K,u$),await k$(K,493);let b="";try{b=await Bun.file(Q).text()}catch(H){if(H.code==="ENOENT")await Bun.write(Q,""),b="";else throw H}let G="# >>> bvm initialize >>>",W="# <<< bvm initialize <<<",y=`${G}
# !! Contents within this block are managed by 'bvm setup' !!
export BVM_DIR="${L}"
export PATH="$BVM_DIR/shims:$BVM_DIR/bin:$BVM_DIR/current/bin:$PATH"
# Ensure current link exists for PATH consistency
if [ ! -L "$BVM_DIR/current" ] && [ -f "$BVM_DIR/aliases/default" ]; then
    ln -sf "$BVM_DIR/versions/$(cat "$BVM_DIR/aliases/default")" "$BVM_DIR/current"
fi
${W}`,F=`# >>> bvm initialize >>>
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
# <<< bvm initialize <<<`;if($)console.log(Z.cyan(`Configuring ${J} environment in ${Q}...`));try{let H=b,B=G.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),p=W.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),P=new RegExp(`${B}[\\s\\S]*?${p}`,"g");if(b.includes(G))H=b.replace(P,"").trim();let V=J==="fish"?F:y;if(H=(H?H+`

`:"")+V+`
`,H!==b){if(await Bun.write(Q,H),$)console.log(Z.green(`\u2713 Successfully updated BVM configuration in ${Q}`)),console.log(Z.gray("  (Moved configuration to the end of file to ensure PATH precedence)"))}if($)console.log(Z.yellow(`Please restart your terminal or run "source ${Q}" to apply changes.`));try{await H$("default",{silent:!0})}catch(m){}}catch(H){console.error(Z.red(`Failed to write to ${Q}: ${H.message}`))}}async function v6($){if($)console.log(Z.cyan("Refreshing shims and wrappers..."));if(!$)console.log(`[DEBUG] BIN_DIR: ${A}`),console.log(`[DEBUG] SHIMS_DIR: ${R}`);if(await k1(A,{recursive:!0}),await k1(R,{recursive:!0}),process.platform==="win32")await Bun.write(O(A,"bvm-shim.js"),g$),await Bun.write(O(A,"bvm.cmd"),m$),await Bun.write(O(R,"bun.cmd"),d$),await Bun.write(O(R,"bunx.cmd"),h$);else{let Q=O(A,"bvm-shim.sh");await Bun.write(Q,V$),await k$(Q,493);let J="",Y=O(L,"runtime","current","bin","bun"),K=O(D$,"index.js");if(process.env.BVM_INSTALL_SOURCE==="npm")J=`#!/bin/bash
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
exec "${Y}" "${K}" "$@"`;let b=O(A,"bvm");await Bun.write(b,J),await k$(b,493);for(let G of["bun","bunx"]){let W=`#!/bin/bash
export BVM_DIR="${L}"
exec "${L}/bin/bvm-shim.sh" "${G}" "$@"`,y=O(R,G);await Bun.write(y,W),await k$(y,493)}}}async function P6($=!0){let q=O(A),Q=O(R),J=O(L,"current","bin");if($)console.log(Z.cyan("Configuring Windows environment variables (Registry)..."));let Y=`
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
    `;try{let b=Bun.spawnSync({cmd:["powershell","-NoProfile","-Command",Y],stdout:"pipe",stderr:"pipe"}),G=b.stdout.toString().trim();if(b.success){if($)if(G==="SUCCESS")console.log(Z.green("\u2713 Successfully updated User PATH and BVM_DIR in Registry."));else console.log(Z.gray("\u2713 Environment variables are already up to date."))}else throw Error(b.stderr.toString())}catch(b){console.error(Z.red(`Failed to update environment variables: ${b.message}`))}let K="";try{if(K=Bun.spawnSync({cmd:["powershell","-NoProfile","-Command","echo $PROFILE.CurrentUserAllHosts"],stdout:"pipe"}).stdout.toString().trim(),K)Bun.spawnSync({cmd:["powershell","-NoProfile","-Command",`if (!(Test-Path "${x1(K)}")) { New-Item -ItemType Directory -Force -Path "${x1(K)}" }`],stderr:"pipe"}),await u6(K,!1)}catch(b){}if($)console.log(Z.yellow("Please restart your terminal or IDE to apply the new PATH."))}async function u6($,q=!0){let Q=`
# BVM Configuration
$env:BVM_DIR = "${L}"
$env:PATH = "$env:BVM_DIR\\shims;$env:BVM_DIR\\bin;$env:BVM_DIR\\current\\bin;$env:PATH"
# Auto-activate default version
if (Test-Path "$env:BVM_DIR\\bin\\bvm.cmd") {
    & "$env:BVM_DIR\\bin\\bvm.cmd" use default --silent *>$null
}
`;try{let J="";if(await X($))J=await Bun.file($).text();else await Bun.write($,"");if(J.includes("$env:BVM_DIR")){if(q)console.log(Z.gray("\u2713 Configuration is already up to date."));return}if(q)console.log(Z.cyan(`Configuring PowerShell environment in ${$}...`));if(await Bun.write($,J+`\r
${Q}`),q)console.log(Z.green(`\u2713 Successfully configured BVM path in ${$}`)),console.log(Z.yellow("Please restart your terminal to apply changes."))}catch(J){console.error(Z.red(`Failed to write to ${$}: ${J.message}`))}}N();j();k();Q$();D();import{join as C1}from"path";async function z$($,q,Q={}){let J=async(Y)=>{let K=await h(q);if(!K){if(!Q.silent)console.log(Z.blue(`Please install Bun ${q} first using: bvm install ${q}`));throw Error(`Bun version '${q}' is not installed. Cannot create alias.`)}let b=C1(x,K);if(!await X(b))throw Error(`Internal Error: Resolved Bun version ${K} not found.`);await f(C);let G=C1(C,$);if($!=="default"&&await X(G))throw Error(`Alias '${$}' already exists. Use 'bvm alias ${$} <new-version>' to update or 'bvm unalias ${$}' to remove.`);if(await g(G,`${K}
`),Y)Y.succeed(Z.green(`Alias '${$}' created for Bun ${K}.`))};if(Q.silent)await J();else await z(`Creating alias '${$}' for Bun ${q}...`,(Y)=>J(Y),{failMessage:`Failed to create alias '${$}'`})}D();j();k();N();import{join as n,dirname as N1}from"path";import{chmod as F1,unlink as V6}from"fs/promises";var __dirname="/Users/leiliao/MyWorkspace/bvm/src/commands",g6=($)=>`@echo off
set "BVM_DIR=%USERPROFILE%.bvm"
if exist "%BVM_DIR%\runtimecurrent\bin\bun.exe" (
    "%BVM_DIR%\runtimecurrent\bin\bun.exe" "%BVM_DIR%\bin\bvm-shim.js" "${$}" %*
) else (
    echo BVM Error: Bun runtime not found.
    exit /b 1
)`,d6=($)=>`#!/bin/bash
export BVM_DIR="${L}"
exec "${n(A,"bvm-shim.sh")}" "${$}" "$@"`;async function J$(){await f(R),await f(A);let $=w==="win32";try{let Q=n(N1(N1(__dirname)),"src","templates");if($){let J=await Bun.file(n(Q,"bvm-shim.js")).text();await Bun.write(n(A,"bvm-shim.js"),J)}else{let J=await Bun.file(n(Q,"bvm-shim.sh")).text(),Y=n(A,"bvm-shim.sh");await Bun.write(Y,J),await F1(Y,493)}}catch(Q){}let q=new Set(["bun","bunx"]);if(await X(x)){let Q=await l(x);for(let J of Q){if(J.startsWith("."))continue;let Y=n(x,J,"bin");if(await X(Y)){let K=await l(Y);for(let b of K){let G=b.replace(/\.(exe|ps1|cmd)$/i,"");if(G)q.add(G)}}}}for(let Q of q)if($){await Bun.write(n(R,`${Q}.cmd`),g6(Q));let J=n(R,`${Q}.ps1`);if(await X(J))await V6(J)}else{let J=n(R,Q);await Bun.write(J,d6(Q)),await F1(J,493)}console.log(Z.green(`\u2713 Regenerated ${q.size} shims in ${R}`))}import{rename as c6,rm as A1}from"fs/promises";async function c$($,q){try{await c6($,q)}catch(Q){await Bun.write(Bun.file(q),Bun.file($)),await A1($,{force:!0})}}async function j1($,q,Q,J){let Y=await fetch($);if(!Y.ok)throw Error(`Status ${Y.status}`);let K=+(Y.headers.get("Content-Length")||0),b=0,G=Y.body?.getReader();if(!G)throw Error("No response body");let W=Bun.file(q).writer(),y=w==="win32";Q.stop();let F=null,H=-1;if(!y)F=new S$(K||41943040),F.start();else console.log(`Downloading Bun ${J}...`);try{let B=Date.now();while(!0){let{done:p,value:P}=await G.read();if(p)break;if(W.write(P),b+=P.length,!y&&F){let V=(Date.now()-B)/1000,m=V>0?(b/1024/V).toFixed(0):"0";F.update(b,{speed:m})}else if(y&&K){let V=Math.floor(b/K*10);if(V>H)console.log(`  > ${V*10}%`),H=V}}if(await W.end(),!y&&F)F.stop();else console.log("  > 100% [Done]")}catch(B){try{W.end()}catch(p){}if(!y&&F)F.stop();else console.log("  > Download Failed");throw Q.start(),B}Q.start()}async function l$($,q={}){let Q=$,J=null,Y=!1;if(!Q)Q=await A$()||void 0;if(!Q){console.error(Z.red("No version specified and no .bvmrc found. Usage: bvm install <version>"));return}try{await z(`Finding Bun ${Q} release...`,async(K)=>{let b=null,G=U(Q);if(/^v?\d+\.\d+\.\d+$/.test(Q)&&!Q.includes("canary"))if(K.update(`Checking if Bun ${G} exists...`),await H1(G))b=G;else throw K.fail(Z.red(`Bun version ${G} not found on registry.`)),Error(`Bun version ${G} not found on registry.`);else if(Q==="latest"){K.update("Checking latest version...");let V=await U1();if(V.latest)b=U(V.latest);else throw Error('Could not resolve "latest" version.')}else throw K.fail(Z.yellow('Fuzzy matching (e.g. "1.1") is disabled for stability.')),console.log(Z.dim('  Please specify the exact version (e.g. "1.1.20") or "latest".')),console.log(Z.dim("  To see available versions, run: bvm ls-remote")),Error("Fuzzy matching disabled");if(!b)throw K.fail(Z.red(`Could not find a Bun release for '${Q}' compatible with your system.`)),Error(`Could not find a Bun release for '${Q}' compatible with your system.`);let W=await z1(b);if(!W)throw Error(`Could not find a Bun release for ${b} compatible with your system.`);let{url:y,mirrorUrl:F,foundVersion:H}=W,B=o(x,H),p=o(B,"bin"),P=o(p,I);if(await X(P))K.succeed(Z.green(`Bun ${H} is already installed.`)),J=H,Y=!0;else if(U(Bun.version)===H&&!T){K.info(Z.cyan(`Requested version ${H} matches current BVM runtime. Creating symlink...`)),await f(p);let m=process.execPath;try{let{symlink:s}=await import("fs/promises");await s(m,P)}catch(s){await Bun.write(Bun.file(P),Bun.file(m)),await p$(P,493)}K.succeed(Z.green(`Bun ${H} linked from local runtime.`)),J=H,Y=!0}else if(T)await f(p),await p6(P,H),J=H,Y=!0;else{K.update(`Downloading Bun ${H} to cache...`),await f(_);let m=o(_,`${H}-${h6(y)}`);if(await X(m))K.succeed(Z.green(`Using cached Bun ${H} archive.`));else{let E=`${m}.${Date.now()}.tmp`;try{await j1(y,E,K,H),await c$(E,m)}catch(s$){try{await A1(E,{force:!0})}catch{}if(K.update("Download failed, trying mirror..."),console.log(Z.dim(`
Debug: ${s$.message}`)),F){let i1=new URL(F).hostname;K.update(`Downloading from mirror (${i1})...`),await j1(F,E,K,H),await c$(E,m)}else throw s$}}K.update(`Extracting Bun ${H}...`),await f(B),await y1(m,B);let s="",B$=[o(B,I),o(B,"bin",I),o(B,"package","bin",I)],o1=await l(B);for(let E of o1)if(E.startsWith("bun-"))B$.push(o(B,E,I)),B$.push(o(B,E,"bin",I));for(let E of B$)if(await X(E)){s=E;break}if(!s)throw Error(`Could not find bun executable in ${B}`);if(await f(p),s!==P){await c$(s,P);let E=m6(s);if(E!==B&&E!==p)await W$(E)}await p$(P,493),K.succeed(Z.green(`Bun ${H} installed successfully.`)),J=H,Y=!0}},{failMessage:`Failed to install Bun ${Q}`})}catch(K){throw Error(`Failed to install Bun: ${K.message}`)}if(Y)await U$(!1);if(J)try{await H$(J,{silent:!0});let K=o(C,"default");if(!await X(K))await z$("default",J,{silent:!0})}catch(K){}if(await J$(),J)console.log(Z.cyan(`
\u2713 Bun ${J} installed and active.`)),console.log(Z.dim("  To verify, run: bun --version or bvm ls"))}async function p6($,q){let Q=q.replace(/^v/,""),J=`#!/usr/bin/env bash
set -euo pipefail
if [[ $# -gt 0 && "$1" == "--version" ]]; then echo "${Q}"; exit 0; fi
echo "Bun ${Q} stub invoked with: $@"
exit 0
`;await Bun.write($,J),await p$($,493)}N();k();D();async function B1(){await z("Fetching remote Bun versions...",async($)=>{let Q=(await W1()).filter((J)=>c(J)).filter((J)=>!J.includes("canary")).sort(Y$);if(Q.length===0)throw Error("No remote Bun versions found.");$.succeed(Z.green("Available remote Bun versions:")),Q.forEach((J)=>{console.log(`  ${U(J)}`)})},{failMessage:"Failed to fetch remote Bun versions"})}N();k();j();D();import{join as l6}from"path";async function M1(){await z("Fetching locally installed Bun versions...",async($)=>{let q=await u(),J=(await t()).version;if($.succeed(Z.green("Locally installed Bun versions:")),q.length===0)console.log("  (No versions installed yet)");else q.forEach((K)=>{if(K===J)console.log(`* ${Z.green(K)} ${Z.dim("(current)")}`);else console.log(`  ${K}`)});if(await X(C)){let K=await l(C);if(K.length>0){console.log(Z.green(`
Aliases:`));for(let b of K)try{let G=(await M(l6(C,b))).trim(),W=U(G),y=`-> ${Z.cyan(W)}`;if(W===J)y+=` ${Z.dim("(current)")}`;console.log(`  ${b} ${Z.gray(y)}`)}catch(G){}}}},{failMessage:"Failed to list local Bun versions"})}N();k();D();async function f1(){await z("Checking current Bun version...",async($)=>{let{version:q,source:Q}=await t();if(q)$.stop(),console.log(`${Z.green("\u2713")} Current Bun version: ${Z.green(q)} ${Z.dim(`(${Q})`)}`);else $.info(Z.blue("No Bun version is currently active.")),console.log(Z.yellow("Use 'bvm install <version>' to set a default, or create a .bvmrc file."))},{failMessage:"Failed to determine current Bun version"})}N();j();k();D();import{join as t$,basename as t6}from"path";import{unlink as n6}from"fs/promises";async function D1($){await z(`Attempting to uninstall Bun ${$}...`,async(q)=>{let Q=U($),J=t$(x,Q),Y=t$(J,"bin",I);if(!await X(Y))throw Error(`Bun ${$} is not installed.`);let K=!1;try{let b=t$(C,"default");if(await X(b)){let G=(await M(b)).trim();if(U(G)===Q)K=!0}}catch(b){}if(K)throw console.log(Z.yellow("Hint: Set a new default using 'bvm default <new_version>'")),Error(`Bun ${$} is currently set as default. Please set another default before uninstalling.`);try{let b=await b1(G$);if(b){if(U(t6(b))===Q)await n6(G$)}}catch(b){}await W$(J),q.succeed(Z.green(`Bun ${Q} uninstalled successfully.`)),await J$()},{failMessage:`Failed to uninstall Bun ${$}`})}N();j();k();D();import{join as o6}from"path";import{unlink as i6}from"fs/promises";async function T1($){await z(`Removing alias '${$}'...`,async(q)=>{let Q=o6(C,$);if(!await X(Q))throw Error(`Alias '${$}' does not exist.`);await i6(Q),q.succeed(Z.green(`Alias '${$}' removed successfully.`))},{failMessage:`Failed to remove alias '${$}'`})}N();j();k();Q$();D();import{join as n$}from"path";async function I1($,q){await z(`Preparing to run with Bun ${$}...`,async(Q)=>{let J=await h($);if(!J)J=U($);let Y=n$(x,J),K=n$(Y,"bin"),b=n$(K,I);if(!await X(b)){Q.fail(Z.red(`Bun ${$} (resolved: ${J}) is not installed.`)),console.log(Z.yellow(`You can install it using: bvm install ${$}`));return}Q.stop();try{await d([b,...q],{cwd:process.cwd(),prependPath:K}),process.exit(0)}catch(G){console.error(G.message),process.exit(1)}},{failMessage:`Failed to run command with Bun ${$}`})}N();j();k();Q$();D();import{join as o$}from"path";async function R1($,q,Q){await z(`Preparing environment for Bun ${$} to execute '${q}'...`,async(J)=>{let Y=await h($);if(!Y)Y=U($);let K=o$(x,Y),b=o$(K,"bin"),G=o$(b,I);if(!await X(G)){J.fail(Z.red(`Bun ${$} (resolved: ${Y}) is not installed.`)),console.log(Z.yellow(`You can install it using: bvm install ${$}`));return}J.stop();try{await d([q,...Q],{cwd:process.cwd(),prependPath:b}),process.exit(0)}catch(W){console.error(W.message),process.exit(1)}},{failMessage:`Failed to execute command with Bun ${$}'s environment`})}j();k();D();import{join as a6}from"path";async function E1($){await z("Resolving path...",async()=>{let q=null,Q="bun",{version:J}=await t();if(!$||$==="current"){if(q=J,!q)throw Error("No active Bun version found.")}else{let{resolveLocalVersion:K}=await Promise.resolve().then(() => (Q$(),O1));if(q=await K($),!q)if(J)q=J,Q=$;else throw Error(`Bun version or command '${$}' not found.`)}let Y=a6(x,q,"bin",Q==="bun"?I:Q);if(await X(Y))console.log(Y);else throw Error(`Command '${Q}' not found in Bun ${q}.`)},{failMessage:"Failed to resolve path"})}N();k();D();Q$();async function S1($){await z(`Resolving session version for Bun ${$}...`,async(q)=>{let Q=null,J=await h($);if(J)Q=J;else{let K=(await u()).map((b)=>U(b));Q=$$($,K)}if(!Q)throw Error(`Bun version '${$}' is not installed or cannot be resolved.`);let Y=U(Q);q.succeed(Z.green(`Bun ${Y} will be active in this session.`)),console.log(`export BVM_ACTIVE_VERSION=${Y}`),console.log(Z.dim("Run `eval $(bvm shell <version>)` or `export BVM_ACTIVE_VERSION=...` to activate."))},{failMessage:`Failed to set session version for Bun ${$}`})}N();j();k();D();import{join as s6}from"path";async function _1($){let q=s6(C,"default");if(!$)await z("Checking current default Bun version...",async(Q)=>{if(await X(q)){let J=await M(q);Q.succeed(Z.green(`Default Bun version: ${U(J.trim())}`))}else Q.info(Z.blue("No global default Bun version is set.")),console.log(Z.yellow("Use 'bvm default <version>' to set one."))},{failMessage:"Failed to retrieve default Bun version"});else await z(`Setting global default to Bun ${$}...`,async(Q)=>{let J=(await u()).map((K)=>U(K)),Y=$$($,J);if(!Y)throw Error(`Bun version '${$}' is not installed.`);await z$("default",Y,{silent:!0}),Q.succeed(Z.green(`\u2713 Default set to ${Y}. New terminals will now start with this version.`))},{failMessage:`Failed to set global default to Bun ${$}`})}j();k();N();D();import{unlink as r6}from"fs/promises";import{join as e6}from"path";async function v1(){await z("Deactivating current Bun version...",async($)=>{let q=e6(C,"default");if(await X(q))await r6(q),$.succeed(Z.green("Default Bun version deactivated.")),console.log(Z.gray("Run `bvm use <version>` to reactivate.")),await J$();else $.info("No default Bun version is currently active.")},{failMessage:"Failed to deactivate"})}Q$();j();k();N();D();async function P1($){if($==="dir"){console.log(_);return}if($==="clear"){await z("Clearing cache...",async(q)=>{await W$(_),await f(_),q.succeed(Z.green("Cache cleared."))},{failMessage:"Failed to clear cache"});return}console.error(Z.red(`Unknown cache command: ${$}`)),console.log("Usage: bvm cache dir | bvm cache clear")}N();j();D();k();import{join as S}from"path";import{tmpdir as $4}from"os";import{rm as u1,mkdir as V1}from"fs/promises";var __dirname="/Users/leiliao/MyWorkspace/bvm/src/commands",i$=Z$.version;async function g1(){let $=process.env.BVM_INSTALL_SOURCE;if($==="npm"||$==="bun"||__dirname.includes("node_modules")){await z(`Upgrading BVM via ${$||"package manager"}...`,async(Q)=>{let J=await q$(),Y=$==="bun"?"bun":"npm";Q.text=`Upgrading BVM via ${Y} using ${J}...`;try{await d([Y,"install","-g","bvm-core","--registry",J]),Q.succeed(Z.green(`BVM upgraded via ${Y} successfully.`))}catch(K){throw Error(`${Y} upgrade failed: ${K.message}`)}});return}try{await z("Checking for BVM updates...",async(Q)=>{let J=T?{version:process.env.BVM_TEST_LATEST_VERSION?.replace("v","")||i$,tarball:"https://example.com/bvm-test.tgz",shasum:"mock",integrity:"mock"}:await j$();if(!J)throw Error("Unable to determine the latest BVM version from NPM Registry.");let Y=J.version;if(!c(Y))throw Error(`Unrecognized version received: ${Y}`);if(!N$(Y,i$)){Q.succeed(Z.green(`BVM is already up to date (v${i$}).`)),console.log(Z.blue("You are using the latest version."));return}if(Q.text=`Updating BVM to v${Y}...`,T&&!process.env.BVM_TEST_REAL_UPGRADE){Q.succeed(Z.green("BVM updated successfully (test mode)."));return}Q.update("Downloading update package...");let K=S($4(),`bvm-upgrade-${Date.now()}`);await V1(K,{recursive:!0});let b=S(K,"bvm-core.tgz");if(T){await g(b,"mock-tarball");let W=S(K,"package","dist");await V1(W,{recursive:!0}),await g(S(W,"index.js"),"// new cli"),await g(S(W,"bvm-shim.sh"),"# new shim"),await g(S(W,"bvm-shim.js"),"// new shim")}else{let W=await a(J.tarball,{timeout:30000});if(!W.ok)throw Error(`Failed to download tarball: ${W.statusText}`);let y=await W.arrayBuffer();await w$(b,new Uint8Array(y)),Q.update("Extracting update...");try{await d(["tar","-xzf",b,"-C",K])}catch(F){throw Error('Failed to extract update package. Ensure "tar" is available.')}}Q.update("Applying updates...");let G=S(K,"package","dist");if(await X(S(G,"index.js")))await w$(S(L,"src","index.js"),await M(S(G,"index.js")));if(w!=="win32"&&await X(S(G,"bvm-shim.sh")))await w$(S(L,"bin","bvm-shim.sh"),await M(S(G,"bvm-shim.sh")));if(w==="win32"&&await X(S(G,"bvm-shim.js")))await w$(S(L,"bin","bvm-shim.js"),await M(S(G,"bvm-shim.js")));try{await u1(K,{recursive:!0,force:!0})}catch(W){}try{await u1(T$,{force:!0})}catch(W){}Q.update("Finalizing environment..."),await U$(!1),Q.succeed(Z.green(`BVM updated to v${Y} successfully.`)),console.log(Z.yellow("Please restart your terminal to apply changes."))},{failMessage:"Failed to upgrade BVM"})}catch(Q){throw Error(`Failed to upgrade BVM: ${Q.message}`)}}N();j();k();D();import{homedir as q4}from"os";import{join as Q4}from"path";async function d1(){await z("Gathering BVM diagnostics...",async()=>{let $={currentVersion:(await t()).version,installedVersions:await u(),aliases:await J4(),env:{BVM_DIR:L,BVM_BIN_DIR:A,BVM_SHIMS_DIR:R,BVM_VERSIONS_DIR:x,BVM_TEST_MODE:process.env.BVM_TEST_MODE,HOME:process.env.HOME||q4()}};K4($)})}async function J4(){if(!await X(C))return[];let $=await l(C),q=[];for(let Q of $){let J=Q4(C,Q);if(await X(J)){let Y=await Bun.file(J).text();q.push({name:Q,target:U(Y.trim())})}}return q}function K4($){if(console.log(Z.bold(`
System`)),console.log(`  OS: ${Z.cyan(w)}`),console.log(`  Arch: ${Z.cyan(e)} ${process.arch!==e?Z.yellow(`(Process: ${process.arch})`):""}`),console.log(`  AVX2: ${C$?Z.green("Supported"):Z.yellow("Not Supported (Baseline fallback enabled)")}`),console.log(Z.bold(`
Directories`)),console.log(`  BVM_DIR: ${Z.cyan($.env.BVM_DIR||"")}`),console.log(`  BIN_DIR: ${Z.cyan(A)}`),console.log(`  SHIMS_DIR: ${Z.cyan(R)}`),console.log(`  VERSIONS_DIR: ${Z.cyan(x)}`),console.log(Z.bold(`
Environment`)),console.log(`  HOME: ${$.env.HOME||"n/a"}`),console.log(`  BVM_TEST_MODE: ${$.env.BVM_TEST_MODE||"false"}`),console.log(Z.bold(`
Installed Versions`)),$.installedVersions.length===0)console.log("  (none installed)");else $.installedVersions.forEach((q)=>{let Q=q===$.currentVersion,J=Q?Z.green("*"):" ",Y=Q?Z.green(q):q,K=Q?Z.green(" (current)"):"";console.log(`  ${J} ${Y}${K}`)});if(console.log(Z.bold(`
Aliases`)),$.aliases.length===0)console.log("  (no aliases configured)");else $.aliases.forEach((q)=>{console.log(`  ${q.name} ${Z.gray("->")} ${Z.cyan(q.target)}`)});console.log(`
`+Z.green("Diagnostics complete."))}var a$=["install","uninstall","use","ls","ls-remote","current","alias","unalias","run","exec","which","cache","setup","upgrade","doctor","completion","deactivate","help"],h1={bash:`#!/usr/bin/env bash
_bvm_completions() {
  COMPREPLY=( $(compgen -W "${a$.join(" ")}" -- "\${COMP_WORDS[COMP_CWORD]}") )
}
complete -F _bvm_completions bvm
`,zsh:`#compdef bvm
_bvm() {
  local -a commands
  commands=( ${a$.join(" ")} )
  _describe 'command' commands
}
compdef _bvm bvm
`,fish:`complete -c bvm -f -a "${a$.join(" ")}"
`};function m1($){let q=h1[$];if(!q)throw Error(`Unsupported shell '${$}'. Supported shells: ${Object.keys(h1).join(", ")}`);console.log(q)}N();j();k();import{join as c1}from"path";N();var p1="update-check.json",Y4=86400000;async function l1(){if(process.env.CI||T)return;let $=c1(_,p1);try{if(await X($)){let q=await M($),Q=JSON.parse(q);if(Date.now()-Q.lastCheck<Y4)return}}catch(q){}try{let q=await j$();if(q){let Q=q.tagName.startsWith("v")?q.tagName.slice(1):q.tagName;await f(_),await g($,JSON.stringify({lastCheck:Date.now(),latestVersion:Q}))}}catch(q){}}async function t1(){if(process.env.CI||T)return null;let $=Z$.version,q=c1(_,p1);try{if(await X(q)){let Q=await M(q),J=JSON.parse(Q);if(J.latestVersion&&N$(J.latestVersion,$))return`
${Z.gray("Update available:")} ${Z.green(`v${J.latestVersion}`)} ${Z.dim(`(current: v${$})`)}
${Z.gray("Run")} ${Z.cyan("bvm upgrade")} ${Z.gray("to update.")}`}}catch(Q){}return null}class n1{commands={};helpEntries=[];name;versionStr;constructor($){this.name=$,this.versionStr=Z$.version}command($,q,Q={}){let J=$.split(" ")[0],Y={description:q,usage:`${this.name} ${$}`,action:async()=>{},aliases:Q.aliases};if(this.commands[J]=Y,this.helpEntries.push(`  ${$.padEnd(35)} ${q}`),Q.aliases)Q.aliases.forEach((b)=>{this.commands[b]=Y});let K={action:(b)=>{return Y.action=b,K},option:(b,G)=>K};return K}async run(){try{l1().catch(()=>{})}catch(b){}let{values:$,positionals:q}=Z4({args:Bun.argv.slice(2),strict:!1,allowPositionals:!0,options:{help:{type:"boolean",short:"h"},version:{type:"boolean",short:"v"},silent:{type:"boolean",short:"s"}}}),Q=q[0],J=!!($.silent||$.s),Y=!!($.version||$.v||$.help||$.h);if(!Q){if($.version||$.v)console.log(this.versionStr),process.exit(0);if($.help||$.h)this.showHelp(),process.exit(0);this.showHelp(),process.exit(1)}if($.help||$.h)this.showHelp(),process.exit(0);let K=this.commands[Q];if(!K)console.error(Z.yellow(`Unknown command '${Q}'`)),this.showHelp(),process.exit(0);try{if(await K.action(q.slice(1),$),!Y&&!J&&["ls","current","doctor","default"].includes(Q)){let b=await t1();if(b)console.log(b)}}catch(b){if(!b.reported)console.error(Z.red(`\u2716 ${b.message}`));process.exit(1)}}showHelp(){console.log(`Bun Version Manager (bvm) v${this.versionStr}`),console.log(`Built with Bun \xB7 Runs with Bun \xB7 Tested on Bun
`),console.log("Usage:"),console.log(`  ${this.name} <command> [flags]
`),console.log("Commands:"),console.log(this.helpEntries.join(`
`)),console.log(`
Global Flags:`),console.log("  --help, -h                     Show this help message"),console.log("  --version, -v                  Show version number"),console.log(`
Examples:`),console.log("  bvm install 1.0.0"),console.log("  bvm use 1.0.0"),console.log("  bvm run 1.0.0 index.ts")}}async function b4(){let $=new n1("bvm");$.command("rehash","Regenerate shims for all installed binaries").action(async()=>{await J$()}),$.command("install [version]","Install a Bun version and set as current").option("--global, -g","Install as a global tool (not just default)").action(async(q,Q)=>{await l$(q[0],{global:Q.global||Q.g})}),$.command("i [version]","Alias for install").action(async(q,Q)=>{await l$(q[0],{global:Q.global||Q.g})}),$.command("ls","List installed Bun versions",{aliases:["list"]}).action(async()=>{await M1()}),$.command("ls-remote","List all available remote Bun versions").action(async()=>{await B1()}),$.command("use <version>","Switch the active Bun version immediately (all terminals)").action(async(q)=>{if(!q[0])throw Error("Version is required");await H$(q[0])}),$.command("shell <version>","Switch Bun version for the current shell session").action(async(q)=>{if(!q[0])throw Error("Version is required");await S1(q[0])}),$.command("default [version]","Display or set the global default Bun version").action(async(q)=>{await _1(q[0])}),$.command("current","Display the currently active Bun version").action(async()=>{await f1()}),$.command("uninstall <version>","Uninstall a Bun version").action(async(q)=>{if(!q[0])throw Error("Version is required");await D1(q[0])}),$.command("alias <name> <version>","Create an alias for a Bun version").action(async(q)=>{if(!q[0]||!q[1])throw Error("Name and version are required");await z$(q[0],q[1])}),$.command("unalias <name>","Remove an existing alias").action(async(q)=>{if(!q[0])throw Error("Alias name is required");await T1(q[0])}),$.command("run <version> [...args]","Run a command with a specific Bun version").action(async(q)=>{let Q=q[0];if(!Q)throw Error("Version is required");let J=process.argv.indexOf("run"),Y=J!==-1?process.argv.slice(J+2):[];await I1(Q,Y)}),$.command("exec <version> <cmd> [...args]","Execute a command with a specific Bun version's environment").action(async(q)=>{let Q=q[0],J=q[1];if(!Q||!J)throw Error("Version and command are required");let Y=process.argv.indexOf("exec"),K=Y!==-1?process.argv.slice(Y+3):[];await R1(Q,J,K)}),$.command("which [version]","Display path to installed bun version").action(async(q)=>{await E1(q[0])}),$.command("deactivate","Undo effects of bvm on current shell").action(async()=>{await v1()}),$.command("version <spec>","Resolve the given description to a single local version").action(async(q)=>{if(!q[0])throw Error("Version specifier is required");await v$(q[0])}),$.command("cache <action>","Manage bvm cache").action(async(q)=>{if(!q[0])throw Error("Action is required");await P1(q[0])}),$.command("setup","Configure shell environment automatically").option("--silent, -s","Suppress output").action(async(q,Q)=>{await U$(!(Q.silent||Q.s))}),$.command("upgrade","Upgrade bvm to the latest version",{aliases:["self-update"]}).action(async()=>{await g1()}),$.command("doctor","Show diagnostics for Bun/BVM setup").action(async()=>{await d1()}),$.command("completion <shell>","Generate shell completion script (bash|zsh|fish)").action(async(q)=>{if(!q[0])throw Error("Shell name is required");m1(q[0])}),await $.run(),process.exit(0)}b4().catch(($)=>{console.error(Z.red(`
[FATAL ERROR] Unexpected Crash:`)),console.error($),process.exit(1)});
