(()=>{"use strict";var e,n,t,r,a={10736:(e,n,t)=>{t.a(e,(async(e,r)=>{try{t.d(n,{K5:()=>g,LP:()=>y,XK:()=>w,o7:()=>l});var a,o,c=t(15847),_=e([c]);c=(_.then?(await _)():_)[0],function(e){e.UMBRAPERF_FILE_READING_FINISHED="UMBRAPERF_FILE_READING_FINISHED",e.STORE_RESULT="STORE_RESULT",e.STORE_QUERYPLAN_JSON="STORE_QUERYPLAN_JSON"}(a||(a={})),function(e){e.REGISTER_FILE="REGISTER_FILE",e.CALCULATE_CHART_DATA="CALCULATE_CHART_DATA"}(o||(o={}));var i,u=0,f={},s=void 0,b=void 0,d=self;function l(e,n){if(f[u]){var t=f[u],r=t.size-e,a=void 0;if(r>0){var o=Math.min(r,n);a=t.slice(e,e+o);var c=(new FileReaderSync).readAsArrayBuffer(a);return new Uint8Array(c)}}}function w(e){d.postMessage({messageId:201,type:a.UMBRAPERF_FILE_READING_FINISHED,data:e})}function g(e){var n;n=e?JSON.parse(e):{error:"no queryplan"},d.postMessage({messageId:201,type:a.STORE_QUERYPLAN_JSON,data:{queryPlanData:n}})}function y(e){e&&d.postMessage({messageId:201,type:a.STORE_RESULT,data:{requestId:s,chartData:e,backendQueryType:b,metaRequest:i}})}d.onmessage=function(e){if(e.type){var n=e.data.type,t=e.data.data;switch(n){case o.REGISTER_FILE:u++,f[u]=t,c.xy(f[u].size);break;case o.CALCULATE_CHART_DATA:s=t.requestId,i=t.metaRequest,b=t.backendQueryType,c.Sz(t.backendQuery)}}},r()}catch(h){r(h)}}))},15847:(e,n,t)=>{t.a(e,(async(e,r)=>{try{t.d(n,{Sz:()=>o.Sz,xy:()=>o.xy});var a=t(64156),o=t(74297),c=e([o,a]);[o,a]=c.then?(await c)():c,(0,o.lI)(a),r()}catch(e){r(e)}}))},74297:(e,n,t)=>{t.a(e,(async(e,r)=>{try{t.d(n,{BZ:()=>z,Bn:()=>L,D1:()=>N,DI:()=>Y,FJ:()=>ee,Gu:()=>P,J1:()=>X,KN:()=>W,Mq:()=>$,NL:()=>U,O9:()=>G,OL:()=>te,PR:()=>C,Py:()=>_e,Qn:()=>ce,Sz:()=>A,T2:()=>ae,T6:()=>x,VA:()=>oe,VF:()=>J,Wz:()=>I,bk:()=>S,cA:()=>D,cl:()=>M,dE:()=>T,gX:()=>ne,hH:()=>Z,hW:()=>j,h_:()=>O,jF:()=>K,lI:()=>_,nq:()=>re,qv:()=>q,s:()=>k,tM:()=>Q,tn:()=>H,vU:()=>V,xN:()=>B,xy:()=>h,yc:()=>F});var a=t(10736),o=e([a]);let c;function _(e){c=e}a=(o.then?(await o)():o)[0];const i=new Array(128).fill(void 0);function u(e){return i[e]}i.push(void 0,null,!0,!1);let f=i.length;function s(e){e<132||(i[e]=f,f=e)}function b(e){const n=u(e);return s(e),n}let d=new("undefined"==typeof TextDecoder?(0,module.require)("util").TextDecoder:TextDecoder)("utf-8",{ignoreBOM:!0,fatal:!0});d.decode();let l=null;function w(){return null!==l&&0!==l.byteLength||(l=new Uint8Array(c.memory.buffer)),l}function g(e,n){return e>>>=0,d.decode(w().subarray(e,e+n))}function y(e){f===i.length&&i.push(i.length+1);const n=f;return f=i[n],i[n]=e,n}function h(e){c.analyzeFile(e)}let p=0,m=new("undefined"==typeof TextEncoder?(0,module.require)("util").TextEncoder:TextEncoder)("utf-8");const E="function"==typeof m.encodeInto?function(e,n){return m.encodeInto(e,n)}:function(e,n){const t=m.encode(e);return n.set(t),{read:e.length,written:t.length}};function v(e,n,t){if(void 0===t){const t=m.encode(e),r=n(t.length,1)>>>0;return w().subarray(r,r+t.length).set(t),p=t.length,r}let r=e.length,a=n(r,1)>>>0;const o=w();let c=0;for(;c<r;c++){const n=e.charCodeAt(c);if(n>127)break;o[a+c]=n}if(c!==r){0!==c&&(e=e.slice(c)),a=t(a,r,r=c+3*e.length,1)>>>0;const n=w().subarray(a+c,a+r);c+=E(e,n).written,a=t(a,r,c,1)>>>0}return p=c,a}function A(e){const n=v(e,c.__wbindgen_malloc,c.__wbindgen_realloc),t=p;c.requestChartData(n,t)}function R(e,n){try{return e.apply(this,n)}catch(e){c.__wbindgen_exn_store(y(e))}}function T(e,n){return y((0,a.o7)(e,n))}function S(e){b(e)}function I(e,n){let t,r;try{t=e,r=n,(0,a.K5)(g(e,n))}finally{c.__wbindgen_free(t,r,1)}}function L(e,n){var t,r,o=(t=e,r=n,t>>>=0,w().subarray(t/1,t/1+r)).slice();c.__wbindgen_free(e,1*n,1),(0,a.LP)(o)}function F(e,n){return y(g(e,n))}function x(e){console.log(u(e))}function O(e){return y(u(e).crypto)}function q(e){const n=u(e);return"object"==typeof n&&null!==n}function D(e){return y(u(e).process)}function N(e){return y(u(e).versions)}function U(e){return y(u(e).node)}function P(e){return"string"==typeof u(e)}function k(){return R((function(){return y(module.require)}),arguments)}function C(e){return"function"==typeof u(e)}function M(e){return y(u(e).msCrypto)}function j(){return R((function(e,n){u(e).randomFillSync(b(n))}),arguments)}function J(){return R((function(e,n){u(e).getRandomValues(u(n))}),arguments)}function B(e,n){return y(new Function(g(e,n)))}function Q(){return R((function(e,n){return y(u(e).call(u(n)))}),arguments)}function z(e){return y(u(e))}function W(){return R((function(){return y(self.self)}),arguments)}function G(){return R((function(){return y(window.window)}),arguments)}function H(){return R((function(){return y(globalThis.globalThis)}),arguments)}function K(){return R((function(){return y(global.global)}),arguments)}function V(e){return void 0===u(e)}function X(){return R((function(e,n,t){return y(u(e).call(u(n),u(t)))}),arguments)}function Y(e){return y(u(e).buffer)}function Z(e,n,t){return y(new Uint8Array(u(e),n>>>0,t>>>0))}function $(e){return y(new Uint8Array(u(e)))}function ee(e,n,t){u(e).set(u(n),t>>>0)}function ne(e){return u(e).length}function te(e){return y(new Uint8Array(e>>>0))}function re(e,n,t){return y(u(e).subarray(n>>>0,t>>>0))}function ae(e){return u(e).byteLength}function oe(e,n){return u(e)[n>>>0]}function ce(e,n){throw new Error(g(e,n))}function _e(){return y(c.memory)}r()}catch(ie){r(ie)}}))},64156:(e,n,t)=>{t.a(e,(async(r,a)=>{try{var o,c,_=r([o=t(74297),c=t(10736)]),[o,c]=_.then?(await _)():_;await t.v(n,e.id,"c3bbec4abccbd85b5e7a",{"./shell_bg.js":{__wbg_readFileChunk_9d90d8bc24572d3c:o.dE,__wbindgen_object_drop_ref:o.bk,__wbg_notifyJsQueryPlan_63cc4b6910c3aa85:o.Wz,__wbg_sendJsQueryResult_f3396ee76a4c347f:o.Bn,__wbindgen_string_new:o.yc,__wbg_log_b103404cc5920657:o.T6,__wbg_crypto_1d1f22824a6a080c:o.h_,__wbindgen_is_object:o.qv,__wbg_process_4a72847cc503995b:o.cA,__wbg_versions_f686565e586dd935:o.D1,__wbg_node_104a2ff8d6ea03a2:o.NL,__wbindgen_is_string:o.Gu,__wbg_require_cca90b1a94a0255b:o.s,__wbindgen_is_function:o.PR,__wbg_msCrypto_eb05e62b530a1508:o.cl,__wbg_randomFillSync_5c9c955aa56b6049:o.hW,__wbg_getRandomValues_3aa56aa6edec874c:o.VF,__wbg_newnoargs_76313bd6ff35d0f2:o.xN,__wbg_call_1084a111329e68ce:o.tM,__wbindgen_object_clone_ref:o.BZ,__wbg_self_3093d5d1f7bcb682:o.KN,__wbg_window_3bcfc4d31bc012f8:o.O9,__wbg_globalThis_86b222e13bdf32ed:o.tn,__wbg_global_e5a3fe56f8be9485:o.jF,__wbindgen_is_undefined:o.vU,__wbg_call_89af060b4e1523f2:o.J1,__wbg_buffer_b7b08af79b0b0974:o.DI,__wbg_newwithbyteoffsetandlength_8a2cb9ca96b27ec9:o.hH,__wbg_new_ea1883e1e5e86686:o.Mq,__wbg_set_d1e79e2388520f18:o.FJ,__wbg_length_8339fcf5d8ecd12e:o.gX,__wbg_newwithlength_ec548f448387c968:o.OL,__wbg_subarray_7c2e3576afe181d1:o.nq,__wbg_byteLength_850664ef28f3e42f:o.T2,__wbg_getindex_43ea930a1286d573:o.VA,__wbindgen_throw:o.Qn,__wbindgen_memory:o.Py},"../../src/worker.ts":{notifyJsFinishedReading:c.XK}}),a()}catch(e){a(e)}}),1)}},o={};function c(e){var n=o[e];if(void 0!==n)return n.exports;var t=o[e]={id:e,exports:{}};return a[e](t,t.exports,c),t.exports}e="function"==typeof Symbol?Symbol("webpack queues"):"__webpack_queues__",n="function"==typeof Symbol?Symbol("webpack exports"):"__webpack_exports__",t="function"==typeof Symbol?Symbol("webpack error"):"__webpack_error__",r=e=>{e&&e.d<1&&(e.d=1,e.forEach((e=>e.r--)),e.forEach((e=>e.r--?e.r++:e())))},c.a=(a,o,c)=>{var _;c&&((_=[]).d=-1);var i,u,f,s=new Set,b=a.exports,d=new Promise(((e,n)=>{f=n,u=e}));d[n]=b,d[e]=e=>(_&&e(_),s.forEach(e),d.catch((e=>{}))),a.exports=d,o((a=>{var o;i=(a=>a.map((a=>{if(null!==a&&"object"==typeof a){if(a[e])return a;if(a.then){var o=[];o.d=0,a.then((e=>{c[n]=e,r(o)}),(e=>{c[t]=e,r(o)}));var c={};return c[e]=e=>e(o),c}}var _={};return _[e]=e=>{},_[n]=a,_})))(a);var c=()=>i.map((e=>{if(e[t])throw e[t];return e[n]})),u=new Promise((n=>{(o=()=>n(c)).r=0;var t=e=>e!==_&&!s.has(e)&&(s.add(e),e&&!e.d&&(o.r++,e.push(o)));i.map((n=>n[e](t)))}));return o.r?u:c()}),(e=>(e?f(d[t]=e):u(b),r(_)))),_&&_.d<0&&(_.d=0)},c.d=(e,n)=>{for(var t in n)c.o(n,t)&&!c.o(e,t)&&Object.defineProperty(e,t,{enumerable:!0,get:n[t]})},c.o=(e,n)=>Object.prototype.hasOwnProperty.call(e,n),c.v=(e,n,t,r)=>{var a=fetch(c.p+"static/wasm/"+t+".wasm"),o=()=>a.then((e=>e.arrayBuffer())).then((e=>WebAssembly.instantiate(e,r))).then((n=>Object.assign(e,n.instance.exports)));return a.then((n=>"function"==typeof WebAssembly.instantiateStreaming?WebAssembly.instantiateStreaming(n,r).then((n=>Object.assign(e,n.instance.exports)),(e=>{if("application/wasm"!==n.headers.get("Content-Type"))return console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",e),o();throw e})):o()))},c.p="/umbraperf/",c(10736)})();