var app=function(){"use strict";function t(){}const e=t=>t;function n(t){return t()}function o(){return Object.create(null)}function l(t){t.forEach(n)}function i(t){return"function"==typeof t}function s(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function r(t,e,n,o){return t[1]&&o?function(t,e){for(const n in e)t[n]=e[n];return t}(n.ctx.slice(),t[1](o(e))):n.ctx}const c="undefined"!=typeof window;let a=c?()=>window.performance.now():()=>Date.now(),u=c?t=>requestAnimationFrame(t):t;const d=new Set;function m(t){d.forEach(e=>{e.c(t)||(d.delete(e),e.f())}),0!==d.size&&u(m)}function f(t){let e;return 0===d.size&&u(m),{promise:new Promise(n=>{d.add(e={c:t,f:n})}),abort(){d.delete(e)}}}function g(t,e){t.appendChild(e)}function p(t,e,n){t.insertBefore(e,n||null)}function h(t){t.parentNode.removeChild(t)}function v(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function $(t){return document.createElement(t)}function w(t){return document.createTextNode(t)}function b(){return w(" ")}function y(){return w("")}function x(t,e,n,o){return t.addEventListener(e,n,o),()=>t.removeEventListener(e,n,o)}function _(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function k(t,e){e=""+e,t.data!==e&&(t.data=e)}function C(t,e){(null!=e||t.value)&&(t.value=e)}function S(t,e){for(let n=0;n<t.options.length;n+=1){const o=t.options[n];if(o.__value===e)return void(o.selected=!0)}}const M=new Set;let T,A=0;function q(t,e,n,o,l,i,s,r=0){const c=16.666/o;let a="{\n";for(let t=0;t<=1;t+=c){const o=e+(n-e)*i(t);a+=100*t+`%{${s(o,1-o)}}\n`}const u=a+`100% {${s(n,1-n)}}\n}`,d=`__svelte_${function(t){let e=5381,n=t.length;for(;n--;)e=(e<<5)-e^t.charCodeAt(n);return e>>>0}(u)}_${r}`,m=t.ownerDocument;M.add(m);const f=m.__svelte_stylesheet||(m.__svelte_stylesheet=m.head.appendChild($("style")).sheet),g=m.__svelte_rules||(m.__svelte_rules={});g[d]||(g[d]=!0,f.insertRule(`@keyframes ${d} ${u}`,f.cssRules.length));const p=t.style.animation||"";return t.style.animation=`${p?`${p}, `:""}${d} ${o}ms linear ${l}ms 1 both`,A+=1,d}function L(t,e){const n=(t.style.animation||"").split(", "),o=n.filter(e?t=>t.indexOf(e)<0:t=>-1===t.indexOf("__svelte")),l=n.length-o.length;l&&(t.style.animation=o.join(", "),A-=l,A||u(()=>{A||(M.forEach(t=>{const e=t.__svelte_stylesheet;let n=e.cssRules.length;for(;n--;)e.deleteRule(n);t.__svelte_rules={}}),M.clear())}))}function D(t){T=t}function I(t){(function(){if(!T)throw new Error("Function called outside component initialization");return T})().$$.on_mount.push(t)}const E=[],P=[],j=[],B=[],G=Promise.resolve();let F=!1;function H(t){j.push(t)}let R=!1;const N=new Set;function O(){if(!R){R=!0;do{for(let t=0;t<E.length;t+=1){const e=E[t];D(e),W(e.$$)}for(E.length=0;P.length;)P.pop()();for(let t=0;t<j.length;t+=1){const e=j[t];N.has(e)||(N.add(e),e())}j.length=0}while(E.length);for(;B.length;)B.pop()();F=!1,R=!1,N.clear()}}function W(t){if(null!==t.fragment){t.update(),l(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(H)}}let U;function z(){return U||(U=Promise.resolve(),U.then(()=>{U=null})),U}function Y(t,e,n){t.dispatchEvent(function(t,e){const n=document.createEvent("CustomEvent");return n.initCustomEvent(t,!1,!1,e),n}(`${e?"intro":"outro"}${n}`))}const J=new Set;let X;function Q(){X={r:0,c:[],p:X}}function V(){X.r||l(X.c),X=X.p}function Z(t,e){t&&t.i&&(J.delete(t),t.i(e))}function K(t,e,n,o){if(t&&t.o){if(J.has(t))return;J.add(t),X.c.push(()=>{J.delete(t),o&&(n&&t.d(1),o())}),t.o(e)}}const tt={duration:0};function et(n,o,l){let s,r,c=o(n,l),u=!1,d=0;function m(){s&&L(n,s)}function g(){const{delay:o=0,duration:l=300,easing:i=e,tick:g=t,css:p}=c||tt;p&&(s=q(n,0,1,l,o,i,p,d++)),g(0,1);const h=a()+o,v=h+l;r&&r.abort(),u=!0,H(()=>Y(n,!0,"start")),r=f(t=>{if(u){if(t>=v)return g(1,0),Y(n,!0,"end"),m(),u=!1;if(t>=h){const e=i((t-h)/l);g(e,1-e)}}return u})}let p=!1;return{start(){p||(L(n),i(c)?(c=c(),z().then(g)):g())},invalidate(){p=!1},end(){u&&(m(),u=!1)}}}function nt(t,e){K(t,1,1,()=>{e.delete(t.key)})}function ot(t,e,n,o,l,i,s,r,c,a,u,d){let m=t.length,f=i.length,g=m;const p={};for(;g--;)p[t[g].key]=g;const h=[],v=new Map,$=new Map;for(g=f;g--;){const t=d(l,i,g),r=n(t);let c=s.get(r);c?o&&c.p(t,e):(c=a(r,t),c.c()),v.set(r,h[g]=c),r in p&&$.set(r,Math.abs(g-p[r]))}const w=new Set,b=new Set;function y(t){Z(t,1),t.m(r,u,s.has(t.key)),s.set(t.key,t),u=t.first,f--}for(;m&&f;){const e=h[f-1],n=t[m-1],o=e.key,l=n.key;e===n?(u=e.first,m--,f--):v.has(l)?!s.has(o)||w.has(o)?y(e):b.has(l)?m--:$.get(o)>$.get(l)?(b.add(o),y(e)):(w.add(l),m--):(c(n,s),m--)}for(;m--;){const e=t[m];v.has(e.key)||c(e,s)}for(;f;)y(h[f-1]);return h}function lt(t){t&&t.c()}function it(t,e,o){const{fragment:s,on_mount:r,on_destroy:c,after_update:a}=t.$$;s&&s.m(e,o),H(()=>{const e=r.map(n).filter(i);c?c.push(...e):l(e),t.$$.on_mount=[]}),a.forEach(H)}function st(t,e){const n=t.$$;null!==n.fragment&&(l(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function rt(t,e){-1===t.$$.dirty[0]&&(E.push(t),F||(F=!0,G.then(O)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function ct(e,n,i,s,r,c,a=[-1]){const u=T;D(e);const d=n.props||{},m=e.$$={fragment:null,ctx:null,props:c,update:t,not_equal:r,bound:o(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(u?u.$$.context:[]),callbacks:o(),dirty:a};let f=!1;if(m.ctx=i?i(e,d,(t,n,...o)=>{const l=o.length?o[0]:n;return m.ctx&&r(m.ctx[t],m.ctx[t]=l)&&(m.bound[t]&&m.bound[t](l),f&&rt(e,t)),n}):[],m.update(),f=!0,l(m.before_update),m.fragment=!!s&&s(m.ctx),n.target){if(n.hydrate){const t=function(t){return Array.from(t.childNodes)}(n.target);m.fragment&&m.fragment.l(t),t.forEach(h)}else m.fragment&&m.fragment.c();n.intro&&Z(e.$$.fragment),it(e,n.target,n.anchor),O()}D(u)}class at{$destroy(){st(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(){}}function ut(e){let n;return{c(){n=$("div"),n.innerHTML='<h4 class="svelte-v5o3tc">Alexis Boni</h4>',_(n,"class","logoContainer svelte-v5o3tc")},m(t,e){p(t,n,e)},p:t,i:t,o:t,d(t){t&&h(n)}}}class dt extends at{constructor(t){super(),ct(this,t,null,ut,s,{})}}function mt(e){let n,o,l;return{c(){n=$("span"),o=w("_"),_(n,"class",l="prompt "+e[0]+" svelte-13fc01u")},m(t,e){p(t,n,e),g(n,o)},p(t,[e]){1&e&&l!==(l="prompt "+t[0]+" svelte-13fc01u")&&_(n,"class",l)},i:t,o:t,d(t){t&&h(n)}}}function ft(t,e,n){let{time:o=250}=e,l="";return setInterval(()=>{n(0,l="visible"==l?"invisible":"visible")},o),t.$set=t=>{"time"in t&&n(1,o=t.time)},[l,o]}class gt extends at{constructor(t){super(),ct(this,t,ft,mt,s,{time:1})}}function pt(n){let o,s,r,c,u;return{c(){o=$("span"),s=w(n[1])},m(t,e){p(t,o,e),g(o,s),u=!0},p(t,e){(!u||2&e)&&k(s,t[1])},i(t){u||(H(()=>{c&&c.end(1),r||(r=et(o,vt,{})),r.start()}),u=!0)},o(n){r&&r.invalidate(),c=function(n,o,s){let r,c=o(n,s),u=!0;const d=X;function m(){const{delay:o=0,duration:i=300,easing:s=e,tick:m=t,css:g}=c||tt;g&&(r=q(n,1,0,i,o,s,g));const p=a()+o,h=p+i;H(()=>Y(n,!1,"start")),f(t=>{if(u){if(t>=h)return m(0,1),Y(n,!1,"end"),--d.r||l(d.c),!1;if(t>=p){const e=s((t-p)/i);m(1-e,e)}}return u})}return d.r+=1,i(c)?z().then(()=>{c=c(),m()}):m(),{end(t){t&&c.tick&&c.tick(1,0),u&&(r&&L(n,r),u=!1)}}}(o,$t,{}),u=!1},d(t){t&&h(o),t&&c&&c.end()}}}function ht(t){let e,n,o,l,i,s,r,c,a,u,d,m,f,v,y,x,k=t[0]&&pt(t);const C=new gt({});return{c(){e=$("div"),n=$("h3"),n.textContent="Hello",o=b(),l=$("h1"),i=w("I'm\n    "),k&&k.c(),s=b(),lt(C.$$.fragment),r=b(),c=$("div"),a=$("div"),u=$("p"),u.innerHTML="\n        I&#39;m a 34 years old IT Professional with over 10 years of hands-on\n        experience.\n        <br>\n        I&#39;m currently learning skills about webdev, devOps, kubernetes, gamedev,\n        music production and linux.\n        <br>\n        I&#39;m a self-hosted, DIY and FOSS ethusiast and always looking for fun\n        projects.\n      ",m=b(),f=$("a"),f.innerHTML='<button style="width: 150px">Contact Me!</button>',v=b(),y=$("a"),y.innerHTML='<button style="width: 150px">Blog</button>',_(f,"href","mailto:mail@aboni.dev"),_(f,"class","svelte-1tme8cg"),_(y,"href","https://blog.aboni.dev"),_(y,"target","__blank"),_(y,"class","svelte-1tme8cg"),_(a,"class","column"),_(c,"class","row"),_(e,"class","container svelte-1tme8cg")},m(t,d){p(t,e,d),g(e,n),g(e,o),g(e,l),g(l,i),k&&k.m(l,null),g(l,s),it(C,l,null),g(e,r),g(e,c),g(c,a),g(a,u),g(a,m),g(a,f),g(a,v),g(a,y),x=!0},p(t,[e]){t[0]?k?(k.p(t,e),Z(k,1)):(k=pt(t),k.c(),Z(k,1),k.m(l,s)):k&&(Q(),K(k,1,1,()=>{k=null}),V())},i(t){x||(Z(k),Z(C.$$.fragment,t),d||H(()=>{d=et(u,vt,{}),d.start()}),x=!0)},o(t){K(k),K(C.$$.fragment,t),x=!1},d(t){t&&h(e),k&&k.d(),st(C)}}}function vt(t,{speed:e=50}){const n=t.textContent;return{duration:n.length*e,tick:e=>{const o=~~(n.length*e);t.textContent=n.slice(0,o)}}}function $t(t,{speed:e=50}){const n=t.textContent.length*e;getComputedStyle(t).opacity;return{duration:n,delay:300,css:t=>"\n                  background-color: #9b4dca; \n                  color: #FFFFFF; \n                "}}function wt(t,e,n){let o=!1,l=["a web developer","a network administrator and engineer","a game developer","a devOps engineer","a music maker","Linux, OSS, and DIY enthusiast"],i=l[0],s=0;return I(()=>{n(0,o=!0),setTimeout(()=>{n(0,o=!1)},3800),setInterval(()=>{!function(){s>=l.length-1&&(s=-1);s++,n(1,i=l[s])}(),n(0,o=!0),setTimeout(()=>{n(0,o=!1)},3500)},6e3)}),[o,i]}class bt extends at{constructor(t){super(),ct(this,t,wt,ht,s,{})}}const yt=[{id:12,title:"Pomodolfo",description:"Extremely simple multiplatform pomodoro timer for desktop.",category:"App Development",skills:["Svelte","Electron","Bulma","Butler"],img:"img/pomodolfo.png",url:"https://baj.itch.io/pomodolfo",icon:"img/pomodolfo-icon.png"},{id:11,title:"Svelte Static Blog Generator",description:"Static blog generator powered by svelte, sapper and tailwindcss .",category:"App Development",skills:["Svelte","Sapper","TailwindCSS","Travis"],img:"img/blog.png",url:"https://github.com/ajboni/svelte-sapper-static-blog",icon:"img/icons8-pencil-64.png"},{id:10,title:"TXTdit",description:"TXTDIT is an open-source featurless themeable text editor. Main features: No text formatting, Multiple Themes, Import/export. Autosave. No more features",category:"App Development",skills:["Svelte","CSS","Travis","Github Pages","CI/CD"],img:"img/txtdit.png",url:"https://github.com/ajboni/txtdit",icon:"img/icons8-pencil-64.png"},{id:1,title:"Scram (WIP)",description:"Slot Car Race Manager, server, and racer database for DIY slot car racer track controlled by Arduino. A rather complex project combining several technologies that I was interested in learning.",category:"App Development",skills:["React","Mobx","GraphQL","Hasura","Postgres","CI/CD","Python","Arduino","SocketIO","Flask"],img:"img/scram.png",url:"https://github.com/ajboni/slot-car-race-manager",icon:"img/icons8-car-64.png"},{id:2,title:"Speechr",description:"Speechr is a collaborative design and development tool for easy and organised game development.",category:"App Development",skills:["React","Mobx","Electron","Pouchdb","Couchdb","CI/CD"],img:"img/speechr.png",url:"https://baj.itch.io/speechr",icon:"img/speechr-icon.png"},{id:3,title:"How To Cope With Boredom and Loneliness",description:"A free Steam game I've made with @poffle as Point Bleep Studios",category:"Game Development",skills:["C#","Unity","Soundtrack","Steamworks"],img:"img/htc.png",url:"https://store.steampowered.com/app/797390/How_To_Cope_With_Boredom_and_Loneliness/",icon:"img/icons8-steam-96.png"},{id:4,title:"Personal Portfolio Website",description:"Landing page for my portfolio (this site). A great excuse to learn about Svelte.",category:"Web Development",skills:["Svelte","Milligram","CI/CD"],img:"img/portfolio.png",url:"https://github.com/ajboni/webpage",icon:"img/icons8-web-design-96.png"},{id:5,title:"Speechr Website",description:"Landing page for Speechr app, made with react, bootrap and semantic UI",category:"Web Development",skills:["React","Semantic-ui","Bootstrap"],img:"img/speechr-site.png",url:"https://github.com/ajboni/speechr-website",icon:"img/icons8-web-design-96.png"},{id:6,title:"The Mind Of Marlo",description:"A Steam game I've made with @poffle as Point Bleep Studios",category:"Game Development",skills:["C#","Unity","Soundtrack","Steamworks"],img:"img/mom.png",url:"https://store.steampowered.com/app/722870/The_Mind_of_Marlo/",icon:"img/icons8-steam-96.png"},{id:7,title:"Anotador de Truco Simple ",description:"Really simple, free, no-ads and open source anottation tool for the popular argentinean game 'Truco'",category:"Game Development",skills:["Godot","GDScript","Google Play"],img:"img/anotador_truco.png",url:"https://play.google.com/store/apps/details?id=anotador.de.truco.simple&hl=es_419",icon:"img/google_play.png"},{id:8,title:"Arduino Midi Foot Controller",description:"A simple midi (foot) controller for Arduino Uno  ",category:"App Development",skills:["C++","Arduino","Electronics"],img:"img/controller.jpg",url:"https://github.com/ajboni/ArduinoMidiFootController",icon:"img/icons8-github-100.png"},{id:9,title:"Point Bleep Studios Games",description:"Under the name of Point Bleep Studios, @poffle and I developed several games that can be played for free at itch.io ",category:"Game Development",skills:["C#","Unity","Soundtrack"],img:"img/pbs.png",url:"https://pointbleepstudios.itch.io/",icon:"img/icons8-control-96.png"}];function xt(t,e,n){const o=t.slice();return o[1]=e[n],o}function _t(t){let e,n,o,l=t[1]+"";return{c(){e=$("div"),n=w(l),o=b(),_(e,"class","skill svelte-1ni1q5n")},m(t,l){p(t,e,l),g(e,n),g(e,o)},p(t,e){1&e&&l!==(l=t[1]+"")&&k(n,l)},d(t){t&&h(e)}}}function kt(e){let n,o,l,i,s,r,c,a,u,d,m,f,y,x,C,S,M,T,A,q,L,D=e[0].title+"",I=e[0].description+"",E=e[0].skills,P=[];for(let t=0;t<E.length;t+=1)P[t]=_t(xt(e,E,t));return{c(){n=$("div"),o=$("div"),l=$("img"),r=b(),c=$("a"),a=w(D),d=b(),m=$("div"),f=$("a"),y=$("img"),M=b(),T=$("div"),A=w(I),q=b(),L=$("div");for(let t=0;t<P.length;t+=1)P[t].c();l.src!==(i=e[0].icon)&&_(l,"src",i),_(l,"alt",s=""),_(l,"class","svelte-1ni1q5n"),_(c,"href",u=e[0].url),_(c,"target","__blank"),_(c,"class","svelte-1ni1q5n"),_(o,"class","title svelte-1ni1q5n"),y.src!==(x=e[0].img)&&_(y,"src",x),_(y,"alt",C=e[0].title),_(y,"class","svelte-1ni1q5n"),_(f,"href",S=e[0].url),_(f,"target","__blank"),_(m,"class","img svelte-1ni1q5n"),_(T,"class","description svelte-1ni1q5n"),_(L,"class","skills svelte-1ni1q5n"),_(n,"class","card svelte-1ni1q5n")},m(t,e){p(t,n,e),g(n,o),g(o,l),g(o,r),g(o,c),g(c,a),g(n,d),g(n,m),g(m,f),g(f,y),g(n,M),g(n,T),g(T,A),g(n,q),g(n,L);for(let t=0;t<P.length;t+=1)P[t].m(L,null)},p(t,[e]){if(1&e&&l.src!==(i=t[0].icon)&&_(l,"src",i),1&e&&D!==(D=t[0].title+"")&&k(a,D),1&e&&u!==(u=t[0].url)&&_(c,"href",u),1&e&&y.src!==(x=t[0].img)&&_(y,"src",x),1&e&&C!==(C=t[0].title)&&_(y,"alt",C),1&e&&S!==(S=t[0].url)&&_(f,"href",S),1&e&&I!==(I=t[0].description+"")&&k(A,I),1&e){let n;for(E=t[0].skills,n=0;n<E.length;n+=1){const o=xt(t,E,n);P[n]?P[n].p(o,e):(P[n]=_t(o),P[n].c(),P[n].m(L,null))}for(;n<P.length;n+=1)P[n].d(1);P.length=E.length}},i:t,o:t,d(t){t&&h(n),v(P,t)}}}function Ct(t,e,n){let{item:o}=e;return t.$set=t=>{"item"in t&&n(0,o=t.item)},[o]}class St extends at{constructor(t){super(),ct(this,t,Ct,kt,s,{item:0})}}function Mt(t){let e,n,o,l,i,s,c;const a=t[1].default,u=function(t,e,n,o){if(t){const l=r(t,e,n,o);return t[0](l)}}(a,t,t[0],null);return{c(){e=$("div"),n=$("div"),n.innerHTML='<hr class="svelte-19iv3y9">',o=b(),l=$("div"),u&&u.c(),i=b(),s=$("div"),s.innerHTML='<hr class="svelte-19iv3y9">',_(n,"class","column"),_(l,"class","column"),_(s,"class","column"),_(e,"class","row svelte-19iv3y9")},m(t,r){p(t,e,r),g(e,n),g(e,o),g(e,l),u&&u.m(l,null),g(e,i),g(e,s),c=!0},p(t,[e]){u&&u.p&&1&e&&u.p(r(a,t,t[0],null),function(t,e,n,o){if(t[2]&&o){const l=t[2](o(n));if(void 0===e.dirty)return l;if("object"==typeof l){const t=[],n=Math.max(e.dirty.length,l.length);for(let o=0;o<n;o+=1)t[o]=e.dirty[o]|l[o];return t}return e.dirty|l}return e.dirty}(a,t[0],e,null))},i(t){c||(Z(u,t),c=!0)},o(t){K(u,t),c=!1},d(t){t&&h(e),u&&u.d(t)}}}function Tt(t,e,n){let{$$slots:o={},$$scope:l}=e;return t.$set=t=>{"$$scope"in t&&n(0,l=t.$$scope)},[l,o]}class At extends at{constructor(t){super(),ct(this,t,Tt,Mt,s,{})}}function qt(t,e,n){const o=t.slice();return o[12]=e[n],o[14]=n,o}function Lt(t,e,n){const o=t.slice();return o[9]=e[n],o[11]=n,o}function Dt(t){let e;return{c(){e=$("h2"),e.textContent="Personal Projects",_(e,"class","svelte-13wwovk")},m(t,n){p(t,e,n)},d(t){t&&h(e)}}}function It(t){let e,n,o,l,i,s=[],r=new Map,c=t[11]+3>=t[0].length&&Et(t);function a(...e){return t[8](t[11],...e)}let u=t[0].filter(a);const d=t=>t[12].id;for(let e=0;e<u.length;e+=1){let n=qt(t,u,e),o=d(n);r.set(o,s[e]=jt(o,n))}let m=t[11]+3>=t[0].length&&Bt(t);return{c(){e=$("div"),c&&c.c(),n=b();for(let t=0;t<s.length;t+=1)s[t].c();o=b(),m&&m.c(),l=b(),_(e,"class","row svelte-13wwovk")},m(t,r){p(t,e,r),c&&c.m(e,null),g(e,n);for(let t=0;t<s.length;t+=1)s[t].m(e,null);g(e,o),m&&m.m(e,null),g(e,l),i=!0},p(i,u){if((t=i)[11]+3>=t[0].length?c?c.p(t,u):(c=Et(t),c.c(),c.m(e,n)):c&&(c.d(1),c=null),1&u){const n=t[0].filter(a);Q(),s=ot(s,u,d,1,t,n,r,e,nt,jt,o,qt),V()}t[11]+3>=t[0].length?m?m.p(t,u):(m=Bt(t),m.c(),m.m(e,l)):m&&(m.d(1),m=null)},i(t){if(!i){for(let t=0;t<u.length;t+=1)Z(s[t]);i=!0}},o(t){for(let t=0;t<s.length;t+=1)K(s[t]);i=!1},d(t){t&&h(e),c&&c.d();for(let t=0;t<s.length;t+=1)s[t].d();m&&m.d()}}}function Et(t){let e,n=t[0].length%3==1&&Pt();return{c(){n&&n.c(),e=y()},m(t,o){n&&n.m(t,o),p(t,e,o)},p(t,o){t[0].length%3==1?n||(n=Pt(),n.c(),n.m(e.parentNode,e)):n&&(n.d(1),n=null)},d(t){n&&n.d(t),t&&h(e)}}}function Pt(t){let e;return{c(){e=$("div"),_(e,"class","column column-25 svelte-13wwovk")},m(t,n){p(t,e,n)},d(t){t&&h(e)}}}function jt(t,e){let n,o,l;const i=new St({props:{item:e[12]}});return{key:t,first:null,c(){n=$("div"),lt(i.$$.fragment),o=b(),_(n,"class","column svelte-13wwovk"),this.first=n},m(t,e){p(t,n,e),it(i,n,null),g(n,o),l=!0},p(t,e){const n={};1&e&&(n.item=t[12]),i.$set(n)},i(t){l||(Z(i.$$.fragment,t),l=!0)},o(t){K(i.$$.fragment,t),l=!1},d(t){t&&h(n),st(i)}}}function Bt(t){let e,n=t[0].length%3==1&&Gt();return{c(){n&&n.c(),e=y()},m(t,o){n&&n.m(t,o),p(t,e,o)},p(t,o){t[0].length%3==1?n||(n=Gt(),n.c(),n.m(e.parentNode,e)):n&&(n.d(1),n=null)},d(t){n&&n.d(t),t&&h(e)}}}function Gt(t){let e;return{c(){e=$("div"),_(e,"class","column column-25 svelte-13wwovk")},m(t,n){p(t,e,n)},d(t){t&&h(e)}}}function Ft(t,e){let n,o,l,i=(e[11]+1)%3==1&&It(e);return{key:t,first:null,c(){n=y(),i&&i.c(),o=y(),this.first=n},m(t,e){p(t,n,e),i&&i.m(t,e),p(t,o,e),l=!0},p(t,e){(t[11]+1)%3==1?i?(i.p(t,e),Z(i,1)):(i=It(t),i.c(),Z(i,1),i.m(o.parentNode,o)):i&&(Q(),K(i,1,1,()=>{i=null}),V())},i(t){l||(Z(i),l=!0)},o(t){K(i),l=!1},d(t){t&&h(n),i&&i.d(t),t&&h(o)}}}function Ht(t){let e,n,o,i,s,r,c,a,u,d,m,f,v,w,y,k,M,T,A=[],q=new Map;const L=new At({props:{$$slots:{default:[Dt]},$$scope:{ctx:t}}});let D=t[0];const I=t=>t[9].id;for(let e=0;e<D.length;e+=1){let n=Lt(t,D,e),o=I(n);q.set(o,A[e]=Ft(o,n))}return{c(){e=$("div"),lt(L.$$.fragment),n=b(),o=$("div"),i=$("div"),s=b(),r=$("div"),c=$("input"),a=b(),u=$("div"),d=$("select"),m=$("option"),m.textContent="All",f=$("option"),f.textContent="Text",v=$("option"),v.textContent="Tags",w=b(),y=$("div"),k=b();for(let t=0;t<A.length;t+=1)A[t].c();_(i,"class","column column-20 svelte-13wwovk"),_(c,"placeholder","Search..."),_(r,"class","column column-40 svelte-13wwovk"),m.__value="All",m.value=m.__value,f.__value="Text",f.value=f.__value,v.__value="Tags",v.value=v.__value,_(d,"id","ageRangeField"),void 0===t[2]&&H(()=>t[7].call(d)),_(u,"class","column column-25 svelte-13wwovk"),_(y,"class","column column-20 svelte-13wwovk"),_(o,"class","row svelte-13wwovk"),_(e,"class","container svelte-13wwovk")},m(h,$,b){p(h,e,$),it(L,e,null),g(e,n),g(e,o),g(o,i),g(o,s),g(o,r),g(r,c),C(c,t[1]),g(o,a),g(o,u),g(u,d),g(d,m),g(d,f),g(d,v),S(d,t[2]),g(o,w),g(o,y),g(e,k);for(let t=0;t<A.length;t+=1)A[t].m(e,null);M=!0,b&&l(T),T=[x(c,"input",t[6]),x(c,"input",t[3]),x(d,"change",t[7]),x(d,"change",t[3])]},p(t,[n]){const o={};if(32768&n&&(o.$$scope={dirty:n,ctx:t}),L.$set(o),2&n&&c.value!==t[1]&&C(c,t[1]),4&n&&S(d,t[2]),1&n){const o=t[0];Q(),A=ot(A,n,I,1,t,o,q,e,nt,Ft,null,Lt),V()}},i(t){if(!M){Z(L.$$.fragment,t);for(let t=0;t<D.length;t+=1)Z(A[t]);M=!0}},o(t){K(L.$$.fragment,t);for(let t=0;t<A.length;t+=1)K(A[t]);M=!1},d(t){t&&h(e),st(L);for(let t=0;t<A.length;t+=1)A[t].d();l(T)}}}function Rt(t,e,n){let o=yt,l="",i="All",s=[],r=3-o.length%3;for(let t=0;t<r;t++)s.push(t);return[o,l,i,function(t){if(t.target.value.length>0)switch(i){case"Text":n(0,o=yt.filter(t=>t.description.toLowerCase().includes(l.toLowerCase())||t.title.toLowerCase().includes(l.toLowerCase())));break;case"Tags":n(0,o=yt.filter(t=>t.skills.join("|").toLowerCase().includes(l.toLowerCase())));break;default:n(0,o=yt.filter(t=>t.description.toLowerCase().includes(l.toLowerCase())||t.title.toLowerCase().includes(l.toLowerCase())||t.skills.join("|").toLowerCase().includes(l.toLowerCase())))}else n(0,o=yt)},s,r,function(){l=this.value,n(1,l)},function(){i=function(t){const e=t.querySelector(":checked")||t.options[0];return e&&e.__value}(this),n(2,i)},(t,e,n)=>n<t+3&&n>=t]}class Nt extends at{constructor(t){super(),ct(this,t,Rt,Ht,s,{})}}const Ot=[{id:1,title:"E-mail",url:"mailto:mail@aboni.dev",img:"./img/icons8-email-sign-100.png"},{id:11,title:"Blog",url:"https://blog.aboni.dev",img:"./img/icons8-blog-96.png"},{id:2,title:"Github",url:"https://github.com/ajboni/",img:"./img/icons8-github-100.png"},{id:3,title:"Gitlab",url:"https://gitlab.com/ajboni",img:"./img/icons8-gitlab-100.png"},{id:5,title:"Youtube",url:"https://www.youtube.com/channel/UCweBjZoA-EJ1i33CXcpghgQ",img:"./img/icons8-play-button-100.png"},{id:6,title:"Soundcloud",url:"https://soundcloud.com/ajboni",img:"./img/icons8-soundcloud-100.png"}];class Wt extends at{constructor(t){super(),ct(this,t,null,null,s,{})}}function Ut(t,e,n){const o=t.slice();return o[0]=e[n],o[2]=n,o}function zt(t){let e;return{c(){e=$("h2"),e.textContent="Contact me",_(e,"class","svelte-fe5hq9")},m(t,n){p(t,e,n)},d(t){t&&h(e)}}}function Yt(e){let n,o,l,i,s,r,c,a,u=e[0].title+"";return{c(){n=$("div"),o=$("a"),l=$("img"),r=w(u),a=b(),l.src!==(i=e[0].img)&&_(l,"src",i),_(l,"alt",s=e[0].title),_(o,"href",c=e[0].url),_(o,"target","__blank"),_(o,"class","svelte-fe5hq9"),_(n,"class","column")},m(t,e){p(t,n,e),g(n,o),g(o,l),g(o,r),g(n,a)},p:t,d(t){t&&h(n)}}}function Jt(t){let e,n,o,l,i;const s=new At({props:{$$slots:{default:[zt]},$$scope:{ctx:t}}});let r=Ot,c=[];for(let e=0;e<r.length;e+=1)c[e]=Yt(Ut(t,r,e));const a=new Wt({});return{c(){e=$("div"),lt(s.$$.fragment),n=b(),o=$("div");for(let t=0;t<c.length;t+=1)c[t].c();l=b(),lt(a.$$.fragment),_(o,"class","row svelte-fe5hq9"),_(e,"class","container svelte-fe5hq9")},m(t,r){p(t,e,r),it(s,e,null),g(e,n),g(e,o);for(let t=0;t<c.length;t+=1)c[t].m(o,null);g(e,l),it(a,e,null),i=!0},p(t,[e]){const n={};if(8&e&&(n.$$scope={dirty:e,ctx:t}),s.$set(n),0&e){let n;for(r=Ot,n=0;n<r.length;n+=1){const l=Ut(t,r,n);c[n]?c[n].p(l,e):(c[n]=Yt(l),c[n].c(),c[n].m(o,null))}for(;n<c.length;n+=1)c[n].d(1);c.length=r.length}},i(t){i||(Z(s.$$.fragment,t),Z(a.$$.fragment,t),i=!0)},o(t){K(s.$$.fragment,t),K(a.$$.fragment,t),i=!1},d(t){t&&h(e),st(s),v(c,t),st(a)}}}class Xt extends at{constructor(t){super(),ct(this,t,null,Jt,s,{})}}function Qt(e){let n,o,l,i,s,r,c,a,u,d,m,f,v,y,x,k,C,S,M;return{c(){n=$("footer"),o=$("div"),o.textContent="© Alexis Boni 2019",l=b(),i=$("div"),s=w("Made with\n    "),r=$("img"),a=b(),u=w(" with "),d=b(),m=$("a"),m.textContent="Svelte",f=w("\n    and\n    "),v=$("a"),v.textContent="Milligram",y=w("\n    - Icons from\n    "),x=$("img"),C=b(),S=$("a"),S.textContent="Icons8",M=w("\n    ."),_(o,"class","footer-copyright svelte-1qnri7w"),r.src!==(c="./img/icons8-heart-100.png")&&_(r,"src","./img/icons8-heart-100.png"),_(r,"alt","love"),_(r,"class","svelte-1qnri7w"),_(m,"href","https://svelte.dev/"),_(m,"alt","Svelte"),_(m,"class","svelte-1qnri7w"),_(v,"href","https://milligram.io/"),_(v,"alt","Milligram"),_(v,"class","svelte-1qnri7w"),x.src!==(k="./img/icons8-icons8-100.png")&&_(x,"src","./img/icons8-icons8-100.png"),_(x,"alt","icons8"),_(x,"class","svelte-1qnri7w"),_(S,"href","https://icons8.com"),_(S,"alt","Icons8"),_(S,"class","svelte-1qnri7w"),_(i,"class","footer-copyright svelte-1qnri7w"),_(n,"class","svelte-1qnri7w")},m(t,e){p(t,n,e),g(n,o),g(n,l),g(n,i),g(i,s),g(i,r),g(i,a),g(i,u),g(i,d),g(i,m),g(i,f),g(i,v),g(i,y),g(i,x),g(i,C),g(i,S),g(i,M)},p:t,i:t,o:t,d(t){t&&h(n)}}}class Vt extends at{constructor(t){super(),ct(this,t,null,Qt,s,{})}}const Zt=["Network Planning, Cisco CCNA level: Routing and switching","Router/Firewall administration","Widows/Linux Server Administration","Virtualization with VMWare and Proxmox","Technology implementation of essential enterprise solutions (Directory services, antivirus , backup services,  policies etc)","Software and Hardware Logging and monitoring","Project Management and Team Leader","Tech Support (Software and Hardware)","Equipment Configuration and commisioning"],Kt=["Javascript, HTML,CSS","ReactJS, Svelte","Mobx","Antd, TailwindCSS, Bulma","Game Development with Unity 3D and Godot Engine","Python, c#, vba, excel, php","Devops, kubernetes, docker, IaaC"],te=["4 Years of English-Spanish translation specializing in computer science and technical translation","Successfully finished Cisco CCNA official course (certification pending)","Music and Audio Production, Mixing and Mastering.","English level, written: bilingual, spoken: medium"];function ee(t,e,n){const o=t.slice();return o[0]=e[n],o}function ne(t,e,n){const o=t.slice();return o[0]=e[n],o}function oe(t,e,n){const o=t.slice();return o[0]=e[n],o}function le(t){let e;return{c(){e=$("h2"),e.textContent="Skills",_(e,"class","svelte-1fysxq7")},m(t,n){p(t,e,n)},d(t){t&&h(e)}}}function ie(e){let n,o,l,i=e[0]+"";return{c(){n=$("li"),o=w(i),l=b()},m(t,e){p(t,n,e),g(n,o),g(n,l)},p:t,d(t){t&&h(n)}}}function se(e){let n,o,l,i=e[0]+"";return{c(){n=$("li"),o=w(i),l=b()},m(t,e){p(t,n,e),g(n,o),g(n,l)},p:t,d(t){t&&h(n)}}}function re(e){let n,o,l,i=e[0]+"";return{c(){n=$("li"),o=w(i),l=b()},m(t,e){p(t,n,e),g(n,o),g(n,l)},p:t,d(t){t&&h(n)}}}function ce(t){let e,n,o,l,i,s,r,c,a,u,d,m,f,w,y,x,k,C,S;const M=new At({props:{$$slots:{default:[le]},$$scope:{ctx:t}}});let T=Zt,A=[];for(let e=0;e<T.length;e+=1)A[e]=ie(oe(t,T,e));let q=Kt,L=[];for(let e=0;e<q.length;e+=1)L[e]=se(ne(t,q,e));let D=te,I=[];for(let e=0;e<D.length;e+=1)I[e]=re(ee(t,D,e));return{c(){e=$("div"),lt(M.$$.fragment),n=b(),o=$("div"),l=$("div"),i=$("h3"),i.textContent="IT",s=b(),r=$("ul");for(let t=0;t<A.length;t+=1)A[t].c();c=b(),a=$("div"),u=$("div"),d=$("h3"),d.textContent="Dev",m=b(),f=$("ul");for(let t=0;t<L.length;t+=1)L[t].c();w=b(),y=$("div"),x=$("h3"),x.textContent="Misc",k=b(),C=$("ul");for(let t=0;t<I.length;t+=1)I[t].c();_(i,"class","svelte-1fysxq7"),_(l,"class","column card svelte-1fysxq7"),_(d,"class","svelte-1fysxq7"),_(u,"class","row card svelte-1fysxq7"),_(x,"class","svelte-1fysxq7"),_(y,"class","row card svelte-1fysxq7"),_(a,"class","column"),_(o,"class","row"),_(e,"class","container svelte-1fysxq7")},m(t,h){p(t,e,h),it(M,e,null),g(e,n),g(e,o),g(o,l),g(l,i),g(l,s),g(l,r);for(let t=0;t<A.length;t+=1)A[t].m(r,null);g(o,c),g(o,a),g(a,u),g(u,d),g(u,m),g(u,f);for(let t=0;t<L.length;t+=1)L[t].m(f,null);g(a,w),g(a,y),g(y,x),g(y,k),g(y,C);for(let t=0;t<I.length;t+=1)I[t].m(C,null);S=!0},p(t,[e]){const n={};if(128&e&&(n.$$scope={dirty:e,ctx:t}),M.$set(n),0&e){let n;for(T=Zt,n=0;n<T.length;n+=1){const o=oe(t,T,n);A[n]?A[n].p(o,e):(A[n]=ie(o),A[n].c(),A[n].m(r,null))}for(;n<A.length;n+=1)A[n].d(1);A.length=T.length}if(0&e){let n;for(q=Kt,n=0;n<q.length;n+=1){const o=ne(t,q,n);L[n]?L[n].p(o,e):(L[n]=se(o),L[n].c(),L[n].m(f,null))}for(;n<L.length;n+=1)L[n].d(1);L.length=q.length}if(0&e){let n;for(D=te,n=0;n<D.length;n+=1){const o=ee(t,D,n);I[n]?I[n].p(o,e):(I[n]=re(o),I[n].c(),I[n].m(C,null))}for(;n<I.length;n+=1)I[n].d(1);I.length=D.length}},i(t){S||(Z(M.$$.fragment,t),S=!0)},o(t){K(M.$$.fragment,t),S=!1},d(t){t&&h(e),st(M),v(A,t),v(L,t),v(I,t)}}}class ae extends at{constructor(t){super(),ct(this,t,null,ce,s,{})}}function ue(e){let n,o,l,i,s,r;const c=new dt({}),a=new bt({}),u=new ae({}),d=new Nt({}),m=new Xt({}),f=new Vt({});return{c(){lt(c.$$.fragment),n=b(),lt(a.$$.fragment),o=b(),lt(u.$$.fragment),l=b(),lt(d.$$.fragment),i=b(),lt(m.$$.fragment),s=b(),lt(f.$$.fragment)},m(t,e){it(c,t,e),p(t,n,e),it(a,t,e),p(t,o,e),it(u,t,e),p(t,l,e),it(d,t,e),p(t,i,e),it(m,t,e),p(t,s,e),it(f,t,e),r=!0},p:t,i(t){r||(Z(c.$$.fragment,t),Z(a.$$.fragment,t),Z(u.$$.fragment,t),Z(d.$$.fragment,t),Z(m.$$.fragment,t),Z(f.$$.fragment,t),r=!0)},o(t){K(c.$$.fragment,t),K(a.$$.fragment,t),K(u.$$.fragment,t),K(d.$$.fragment,t),K(m.$$.fragment,t),K(f.$$.fragment,t),r=!1},d(t){st(c,t),t&&h(n),st(a,t),t&&h(o),st(u,t),t&&h(l),st(d,t),t&&h(i),st(m,t),t&&h(s),st(f,t)}}}function de(t,e,n){let{name:o}=e;return t.$set=t=>{"name"in t&&n(0,o=t.name)},[o]}return new class extends at{constructor(t){super(),ct(this,t,de,ue,s,{name:0})}}({target:document.body,props:{name:"world"}})}();
//# sourceMappingURL=bundle.js.map
