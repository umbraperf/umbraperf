(()=>{"use strict";var e,n,t,r,a,o={30012:(e,n,t)=>{var r=([r,a])=>t.v(n,e.id,"4ac08828dd3fbe757042",{"./shell_bg.js":{__wbg_readFileChunk_56a1e9751a373fb9:r.NJ,__wbindgen_object_drop_ref:r.ug,__wbindgen_string_new:r.h4,__wbg_sendJsQueryResult_d57def84ef75ea27:r.A0,__wbg_notifyJsQueryPlan_e0dd6619b19d8a06:r.Gh,__wbg_log_9a99fb1af846153b:r.a,__wbg_now_0d452136c0f61bcc:r.Id,__wbg_buffer_9e184d6f785de5ed:r.zP,__wbg_length_2d56cb37075fcfb1:r.uQ,__wbg_new_e8101319e4cf95fc:r.td,__wbg_set_e8ae7b27314e8b98:r.Ct,__wbg_byteLength_e0515bc94cfc5dee:r.PY,__wbg_getindex_7c7d1e6c5ee4b1df:r.X9,__wbindgen_throw:r.Or,__wbindgen_memory:r.oH},"../../src/worker":{notifyJsFinishedReading:a.sD}});t.a(e,(e=>{var n=e([t(28837),t(63879)]);return n.then?n.then(r):r(n)}),1)},28837:(e,n,t)=>{t.a(e,(async r=>{t.d(n,{Mu:()=>y,E6:()=>w,NJ:()=>E,ug:()=>m,h4:()=>A,A0:()=>R,Gh:()=>T,a:()=>v,Id:()=>S,zP:()=>I,uQ:()=>x,td:()=>L,Ct:()=>O,PY:()=>D,X9:()=>P,Or:()=>F,oH:()=>U});var a=t(63879),o=t(30012);e=t.hmd(e);var i=r([o,a]);[o,a]=i.then?await i:i;const u=new Array(32).fill(void 0);function c(e){return u[e]}u.push(void 0,null,!0,!1);let s=u.length;let _=new("undefined"==typeof TextDecoder?(0,e.require)("util").TextDecoder:TextDecoder)("utf-8",{ignoreBOM:!0,fatal:!0});_.decode();let f=null;function d(){return null!==f&&f.buffer===o.memory.buffer||(f=new Uint8Array(o.memory.buffer)),f}function b(e,n){return _.decode(d().subarray(e,e+n))}function l(e){s===u.length&&u.push(u.length+1);const n=s;return s=u[n],u[n]=e,n}function y(e){o.analyzeFile(e)}let g=0,h=new("undefined"==typeof TextEncoder?(0,e.require)("util").TextEncoder:TextEncoder)("utf-8");const p="function"==typeof h.encodeInto?function(e,n){return h.encodeInto(e,n)}:function(e,n){const t=h.encode(e);return n.set(t),{read:e.length,written:t.length}};function w(e){var n=function(e,n,t){if(void 0===t){const t=h.encode(e),r=n(t.length);return d().subarray(r,r+t.length).set(t),g=t.length,r}let r=e.length,a=n(r);const o=d();let i=0;for(;i<r;i++){const n=e.charCodeAt(i);if(n>127)break;o[a+i]=n}if(i!==r){0!==i&&(e=e.slice(i)),a=t(a,r,r=i+3*e.length);const n=d().subarray(a+i,a+r);i+=p(e,n).written}return g=i,a}(e,o.__wbindgen_malloc,o.__wbindgen_realloc),t=g;o.requestChartData(n,t)}function E(e,n){return l((0,a.pI)(e,n))}function m(e){!function(e){const n=c(e);(function(e){e<36||(u[e]=s,s=e)})(e)}(e)}function A(e,n){return l(b(e,n))}function R(e,n){var t,r,i=(t=e,r=n,d().subarray(t/1,t/1+r)).slice();o.__wbindgen_free(e,1*n),(0,a.sX)(i)}function T(e,n){try{(0,a.V9)(b(e,n))}finally{o.__wbindgen_free(e,n)}}function v(e){console.log(c(e))}function S(){return Date.now()}function I(e){return l(c(e).buffer)}function x(e){return c(e).length}function L(e){return l(new Uint8Array(c(e)))}function O(e,n,t){c(e).set(c(n),t>>>0)}function D(e){return c(e).byteLength}function P(e,n){return c(e)[n>>>0]}function F(e,n){throw new Error(b(e,n))}function U(){return l(o.memory)}}))},63879:(e,n,t)=>{t.a(e,(async e=>{t.d(n,{pI:()=>b,sD:()=>l,V9:()=>y,sX:()=>g});var r,a,o=t(28837),i=e([o]);o=(i.then?await i:i)[0],function(e){e.UMBRAPERF_FILE_READING_FINISHED="UMBRAPERF_FILE_READING_FINISHED",e.STORE_RESULT="STORE_RESULT",e.STORE_QUERYPLAN_JSON="STORE_QUERYPLAN_JSON"}(r||(r={})),function(e){e.REGISTER_FILE="REGISTER_FILE",e.CALCULATE_CHART_DATA="CALCULATE_CHART_DATA",e.TEST="TEST"}(a||(a={}));var u,c=0,s={},_=void 0,f=void 0,d=self;function b(e,n){if(s[c]){var t=s[c],r=t.size-e,a=void 0;if(r>0){var o=Math.min(r,n);a=t.slice(e,e+o);var i=(new FileReaderSync).readAsArrayBuffer(a);return new Uint8Array(i)}}}function l(e){d.postMessage({messageId:201,type:r.UMBRAPERF_FILE_READING_FINISHED,data:e})}function y(e){var n;n=e?JSON.parse(e):{error:"no queryplan"},d.postMessage({messageId:201,type:r.STORE_QUERYPLAN_JSON,data:{queryPlanData:n}})}function g(e){e&&d.postMessage({messageId:201,type:r.STORE_RESULT,data:{requestId:_,chartData:e,backendQueryType:f,metaRequest:u}})}d.onmessage=function(e){if(e.type){var n=e.data.type,t=e.data.data;switch(n){case a.REGISTER_FILE:c++,s[c]=t,o.Mu(s[c].size);break;case a.CALCULATE_CHART_DATA:_=t.requestId,u=t.metaRequest,f=t.backendQueryType,o.E6(t.backendQuery)}}}}))}},i={};function u(e){var n=i[e];if(void 0!==n)return n.exports;var t=i[e]={id:e,loaded:!1,exports:{}};return o[e](t,t.exports,u),t.loaded=!0,t.exports}e="function"==typeof Symbol?Symbol("webpack then"):"__webpack_then__",n="function"==typeof Symbol?Symbol("webpack exports"):"__webpack_exports__",t=e=>{e&&(e.forEach((e=>e.r--)),e.forEach((e=>e.r--?e.r++:e())))},r=e=>!--e.r&&e(),a=(e,n)=>e?e.push(n):r(n),u.a=(o,i,u)=>{var c,s,_,f=u&&[],d=o.exports,b=!0,l=!1,y=(n,t,r)=>{l||(l=!0,t.r+=n.length,n.map(((n,a)=>n[e](t,r))),l=!1)},g=new Promise(((e,n)=>{_=n,s=()=>(e(d),t(f),f=0)}));g[n]=d,g[e]=(e,n)=>{if(b)return r(e);c&&y(c,e,n),a(f,e),g.catch(n)},o.exports=g,i((o=>{if(!o)return s();var i,u;c=(o=>o.map((o=>{if(null!==o&&"object"==typeof o){if(o[e])return o;if(o.then){var i=[];o.then((e=>{u[n]=e,t(i),i=0}));var u={[e]:(e,n)=>(a(i,e),o.catch(n))};return u}}return{[e]:e=>r(e),[n]:o}})))(o);var _=new Promise(((e,t)=>{(i=()=>e(u=c.map((e=>e[n])))).r=0,y(c,i,t)}));return i.r?_:u})).then(s,_),b=!1},u.d=(e,n)=>{for(var t in n)u.o(n,t)&&!u.o(e,t)&&Object.defineProperty(e,t,{enumerable:!0,get:n[t]})},u.hmd=e=>((e=Object.create(e)).children||(e.children=[]),Object.defineProperty(e,"exports",{enumerable:!0,set:()=>{throw new Error("ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: "+e.id)}}),e),u.o=(e,n)=>Object.prototype.hasOwnProperty.call(e,n),u.p="/umbraperf/",u.v=(e,n,t,r)=>{var a=fetch(u.p+"static/wasm/"+t+".wasm");return"function"==typeof WebAssembly.instantiateStreaming?WebAssembly.instantiateStreaming(a,r).then((n=>Object.assign(e,n.instance.exports))):a.then((e=>e.arrayBuffer())).then((e=>WebAssembly.instantiate(e,r))).then((n=>Object.assign(e,n.instance.exports)))},u(63879)})();