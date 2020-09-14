var app=function(){"use strict";function e(){}const t=e=>e;function n(e){return e()}function o(){return Object.create(null)}function i(e){e.forEach(n)}function l(e){return"function"==typeof e}function s(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function r(e,t,n,o){return e[1]&&o?function(e,t){for(const n in t)e[n]=t[n];return e}(n.ctx.slice(),e[1](o(t))):n.ctx}const c="undefined"!=typeof window;let a=c?()=>window.performance.now():()=>Date.now(),u=c?e=>requestAnimationFrame(e):e;const d=new Set;function m(e){d.forEach(t=>{t.c(e)||(d.delete(t),t.f())}),0!==d.size&&u(m)}function g(e){let t;return 0===d.size&&u(m),{promise:new Promise(n=>{d.add(t={c:e,f:n})}),abort(){d.delete(t)}}}function p(e,t){e.appendChild(t)}function f(e,t,n){e.insertBefore(t,n||null)}function h(e){e.parentNode.removeChild(e)}function v(e,t){for(let n=0;n<e.length;n+=1)e[n]&&e[n].d(t)}function $(e){return document.createElement(e)}function w(e){return document.createTextNode(e)}function b(){return w(" ")}function y(){return w("")}function x(e,t,n,o){return e.addEventListener(t,n,o),()=>e.removeEventListener(t,n,o)}function k(e,t,n){null==n?e.removeAttribute(t):e.getAttribute(t)!==n&&e.setAttribute(t,n)}function C(e,t){t=""+t,e.data!==t&&(e.data=t)}function _(e,t){(null!=t||e.value)&&(e.value=t)}function S(e,t){for(let n=0;n<e.options.length;n+=1){const o=e.options[n];if(o.__value===t)return void(o.selected=!0)}}const A=new Set;let T,M=0;function j(e,t,n,o,i,l,s,r=0){const c=16.666/o;let a="{\n";for(let e=0;e<=1;e+=c){const o=t+(n-t)*l(e);a+=100*e+`%{${s(o,1-o)}}\n`}const u=a+`100% {${s(n,1-n)}}\n}`,d=`__svelte_${function(e){let t=5381,n=e.length;for(;n--;)t=(t<<5)-t^e.charCodeAt(n);return t>>>0}(u)}_${r}`,m=e.ownerDocument;A.add(m);const g=m.__svelte_stylesheet||(m.__svelte_stylesheet=m.head.appendChild($("style")).sheet),p=m.__svelte_rules||(m.__svelte_rules={});p[d]||(p[d]=!0,g.insertRule(`@keyframes ${d} ${u}`,g.cssRules.length));const f=e.style.animation||"";return e.style.animation=`${f?`${f}, `:""}${d} ${o}ms linear ${i}ms 1 both`,M+=1,d}function D(e,t){const n=(e.style.animation||"").split(", "),o=n.filter(t?e=>e.indexOf(t)<0:e=>-1===e.indexOf("__svelte")),i=n.length-o.length;i&&(e.style.animation=o.join(", "),M-=i,M||u(()=>{M||(A.forEach(e=>{const t=e.__svelte_stylesheet;let n=t.cssRules.length;for(;n--;)t.deleteRule(n);e.__svelte_rules={}}),A.clear())}))}function L(e){T=e}function q(e){(function(){if(!T)throw new Error("Function called outside component initialization");return T})().$$.on_mount.push(e)}const I=[],E=[],P=[],B=[],G=Promise.resolve();let W=!1;function F(e){P.push(e)}let H=!1;const N=new Set;function R(){if(!H){H=!0;do{for(let e=0;e<I.length;e+=1){const t=I[e];L(t),O(t.$$)}for(I.length=0;E.length;)E.pop()();for(let e=0;e<P.length;e+=1){const t=P[e];N.has(t)||(N.add(t),t())}P.length=0}while(I.length);for(;B.length;)B.pop()();W=!1,H=!1,N.clear()}}function O(e){if(null!==e.fragment){e.update(),i(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(F)}}let U;function z(){return U||(U=Promise.resolve(),U.then(()=>{U=null})),U}function Y(e,t,n){e.dispatchEvent(function(e,t){const n=document.createEvent("CustomEvent");return n.initCustomEvent(e,!1,!1,t),n}(`${t?"intro":"outro"}${n}`))}const J=new Set;let X;function Q(){X={r:0,c:[],p:X}}function V(){X.r||i(X.c),X=X.p}function Z(e,t){e&&e.i&&(J.delete(e),e.i(t))}function K(e,t,n,o){if(e&&e.o){if(J.has(e))return;J.add(e),X.c.push(()=>{J.delete(e),o&&(n&&e.d(1),o())}),e.o(t)}}const ee={duration:0};function te(n,o,i){let s,r,c=o(n,i),u=!1,d=0;function m(){s&&D(n,s)}function p(){const{delay:o=0,duration:i=300,easing:l=t,tick:p=e,css:f}=c||ee;f&&(s=j(n,0,1,i,o,l,f,d++)),p(0,1);const h=a()+o,v=h+i;r&&r.abort(),u=!0,F(()=>Y(n,!0,"start")),r=g(e=>{if(u){if(e>=v)return p(1,0),Y(n,!0,"end"),m(),u=!1;if(e>=h){const t=l((e-h)/i);p(t,1-t)}}return u})}let f=!1;return{start(){f||(D(n),l(c)?(c=c(),z().then(p)):p())},invalidate(){f=!1},end(){u&&(m(),u=!1)}}}function ne(e,t){K(e,1,1,()=>{t.delete(e.key)})}function oe(e,t,n,o,i,l,s,r,c,a,u,d){let m=e.length,g=l.length,p=m;const f={};for(;p--;)f[e[p].key]=p;const h=[],v=new Map,$=new Map;for(p=g;p--;){const e=d(i,l,p),r=n(e);let c=s.get(r);c?o&&c.p(e,t):(c=a(r,e),c.c()),v.set(r,h[p]=c),r in f&&$.set(r,Math.abs(p-f[r]))}const w=new Set,b=new Set;function y(e){Z(e,1),e.m(r,u,s.has(e.key)),s.set(e.key,e),u=e.first,g--}for(;m&&g;){const t=h[g-1],n=e[m-1],o=t.key,i=n.key;t===n?(u=t.first,m--,g--):v.has(i)?!s.has(o)||w.has(o)?y(t):b.has(i)?m--:$.get(o)>$.get(i)?(b.add(o),y(t)):(w.add(i),m--):(c(n,s),m--)}for(;m--;){const t=e[m];v.has(t.key)||c(t,s)}for(;g;)y(h[g-1]);return h}function ie(e){e&&e.c()}function le(e,t,o){const{fragment:s,on_mount:r,on_destroy:c,after_update:a}=e.$$;s&&s.m(t,o),F(()=>{const t=r.map(n).filter(l);c?c.push(...t):i(t),e.$$.on_mount=[]}),a.forEach(F)}function se(e,t){const n=e.$$;null!==n.fragment&&(i(n.on_destroy),n.fragment&&n.fragment.d(t),n.on_destroy=n.fragment=null,n.ctx=[])}function re(e,t){-1===e.$$.dirty[0]&&(I.push(e),W||(W=!0,G.then(R)),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function ce(t,n,l,s,r,c,a=[-1]){const u=T;L(t);const d=n.props||{},m=t.$$={fragment:null,ctx:null,props:c,update:e,not_equal:r,bound:o(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(u?u.$$.context:[]),callbacks:o(),dirty:a};let g=!1;if(m.ctx=l?l(t,d,(e,n,...o)=>{const i=o.length?o[0]:n;return m.ctx&&r(m.ctx[e],m.ctx[e]=i)&&(m.bound[e]&&m.bound[e](i),g&&re(t,e)),n}):[],m.update(),g=!0,i(m.before_update),m.fragment=!!s&&s(m.ctx),n.target){if(n.hydrate){const e=function(e){return Array.from(e.childNodes)}(n.target);m.fragment&&m.fragment.l(e),e.forEach(h)}else m.fragment&&m.fragment.c();n.intro&&Z(t.$$.fragment),le(t,n.target,n.anchor),R()}L(u)}class ae{$destroy(){se(this,1),this.$destroy=e}$on(e,t){const n=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return n.push(t),()=>{const e=n.indexOf(t);-1!==e&&n.splice(e,1)}}$set(){}}function ue(t){let n;return{c(){n=$("div"),n.innerHTML='<h4 class="svelte-v5o3tc">Alexis Boni</h4>',k(n,"class","logoContainer svelte-v5o3tc")},m(e,t){f(e,n,t)},p:e,i:e,o:e,d(e){e&&h(n)}}}class de extends ae{constructor(e){super(),ce(this,e,null,ue,s,{})}}function me(t){let n,o,i;return{c(){n=$("span"),o=w("_"),k(n,"class",i="prompt "+t[0]+" svelte-13fc01u")},m(e,t){f(e,n,t),p(n,o)},p(e,[t]){1&t&&i!==(i="prompt "+e[0]+" svelte-13fc01u")&&k(n,"class",i)},i:e,o:e,d(e){e&&h(n)}}}function ge(e,t,n){let{time:o=250}=t,i="";return setInterval(()=>{n(0,i="visible"==i?"invisible":"visible")},o),e.$set=e=>{"time"in e&&n(1,o=e.time)},[i,o]}class pe extends ae{constructor(e){super(),ce(this,e,ge,me,s,{time:1})}}function fe(n){let o,s,r,c,u;return{c(){o=$("span"),s=w(n[1])},m(e,t){f(e,o,t),p(o,s),u=!0},p(e,t){(!u||2&t)&&C(s,e[1])},i(e){u||(F(()=>{c&&c.end(1),r||(r=te(o,ve,{})),r.start()}),u=!0)},o(n){r&&r.invalidate(),c=function(n,o,s){let r,c=o(n,s),u=!0;const d=X;function m(){const{delay:o=0,duration:l=300,easing:s=t,tick:m=e,css:p}=c||ee;p&&(r=j(n,1,0,l,o,s,p));const f=a()+o,h=f+l;F(()=>Y(n,!1,"start")),g(e=>{if(u){if(e>=h)return m(0,1),Y(n,!1,"end"),--d.r||i(d.c),!1;if(e>=f){const t=s((e-f)/l);m(1-t,t)}}return u})}return d.r+=1,l(c)?z().then(()=>{c=c(),m()}):m(),{end(e){e&&c.tick&&c.tick(1,0),u&&(r&&D(n,r),u=!1)}}}(o,$e,{}),u=!1},d(e){e&&h(o),e&&c&&c.end()}}}function he(e){let t,n,o,i,l,s,r,c,a,u,d,m,g,v,y,x,C=e[0]&&fe(e);const _=new pe({});return{c(){t=$("div"),n=$("h3"),n.textContent="Hello",o=b(),i=$("h1"),l=w("I'm\n    "),C&&C.c(),s=b(),ie(_.$$.fragment),r=b(),c=$("div"),a=$("div"),u=$("p"),u.innerHTML="\n        I&#39;m an IT Professional with over 10 years of hands-on experience.\n        <br>\n        I&#39;m currently learning skills about webdev, devOps, kubernetes, gamedev,\n        music production and linux.\n        <br>\n        I&#39;m a self-hosted, Linux, DIY and FOSS ethusiast and always looking for\n        fun projects.\n      ",m=b(),g=$("a"),g.innerHTML='<button style="width: 150px">Contact Me!</button>',v=b(),y=$("a"),y.innerHTML='<button style="width: 150px">Blog</button>',k(g,"href","mailto:mail@aboni.dev"),k(g,"class","svelte-1tme8cg"),k(y,"href","https://blog.aboni.dev"),k(y,"target","__blank"),k(y,"class","svelte-1tme8cg"),k(a,"class","column"),k(c,"class","row"),k(t,"class","container svelte-1tme8cg")},m(e,d){f(e,t,d),p(t,n),p(t,o),p(t,i),p(i,l),C&&C.m(i,null),p(i,s),le(_,i,null),p(t,r),p(t,c),p(c,a),p(a,u),p(a,m),p(a,g),p(a,v),p(a,y),x=!0},p(e,[t]){e[0]?C?(C.p(e,t),Z(C,1)):(C=fe(e),C.c(),Z(C,1),C.m(i,s)):C&&(Q(),K(C,1,1,()=>{C=null}),V())},i(e){x||(Z(C),Z(_.$$.fragment,e),d||F(()=>{d=te(u,ve,{}),d.start()}),x=!0)},o(e){K(C),K(_.$$.fragment,e),x=!1},d(e){e&&h(t),C&&C.d(),se(_)}}}function ve(e,{speed:t=50}){const n=e.textContent;return{duration:n.length*t,tick:t=>{const o=~~(n.length*t);e.textContent=n.slice(0,o)}}}function $e(e,{speed:t=50}){const n=e.textContent.length*t;getComputedStyle(e).opacity;return{duration:n,delay:300,css:e=>"\n                  background-color: #9b4dca; \n                  color: #FFFFFF; \n                "}}function we(e,t,n){let o=!1,i=["IT infraestructure administrator","a web developer","a network administrator and engineer","a game developer","a devOps engineer","a music maker","Linux, OSS, and DIY enthusiast"],l=i[0],s=0;return q(()=>{n(0,o=!0),setTimeout(()=>{n(0,o=!1)},3800),setInterval(()=>{!function(){s>=i.length-1&&(s=-1);s++,n(1,l=i[s])}(),n(0,o=!0),setTimeout(()=>{n(0,o=!1)},3500)},6e3)}),[o,l]}class be extends ae{constructor(e){super(),ce(this,e,we,he,s,{})}}const ye=[{id:16,title:"Docurry",description:"A Spicy, Zero-Config Documentation Site Generator ",category:"App Development",skills:["Node.js","HTML","CSS"],img:"img/docurry.jpg",url:"https://github.com/ajboni/docurry",icon:"img/icons8-github-100.png"},{id:15,title:"Calvo",description:"A jalv based lv2 plugin rack for your terminal. ",category:"App Development",skills:["Node.js","jack","lv2","Linux"],img:"img/calvo.png",url:"https://github.com/ajboni/calvo",icon:"img/icons8-github-100.png"},{id:14,title:"Airwindows Cheatsheet",description:"Cheatsheet for airwindows plugins.",category:"Web Development",skills:["Svelte","Bulma","Travis"],img:"img/airwindows-cheatsheet.png",url:"https://github.com/ajboni/airwindows-cheatsheet",icon:"img/icons8-web-design-96.png"},{id:13,title:"Jardeco",description:"Landing page and e-commerce site for local garden shop.",category:"Web Development",skills:["Wordpress","WooCommerce","Elementor"],img:"img/jardeco.png",url:"https://jardeco.com.ar",icon:"img/icons8-web-design-96.png"},{id:12,title:"Pomodolfo",description:"Extremely simple multiplatform pomodoro timer for desktop.",category:"App Development",skills:["Svelte","Electron","Bulma","Butler"],img:"img/pomodolfo.png",url:"https://baj.itch.io/pomodolfo",icon:"img/pomodolfo-icon.png"},{id:11,title:"Svelte Static Blog Generator",description:"Static blog generator powered by svelte, sapper and tailwindcss .",category:"App Development",skills:["Svelte","Sapper","TailwindCSS","Travis"],img:"img/blog.png",url:"https://github.com/ajboni/svelte-sapper-static-blog",icon:"img/icons8-pencil-64.png"},{id:10,title:"TXTdit",description:"TXTDIT is an open-source featurless themeable text editor. Main features: No text formatting, Multiple Themes, Import/export. Autosave. No more features",category:"App Development",skills:["Svelte","CSS","Travis","Github Pages","CI/CD"],img:"img/txtdit.png",url:"https://github.com/ajboni/txtdit",icon:"img/icons8-pencil-64.png"},{id:1,title:"Scram (WIP)",description:"Slot Car Race Manager, server, and racer database for DIY slot car racer track controlled by Arduino. A rather complex project combining several technologies that I was interested in learning.",category:"App Development",skills:["React","Mobx","GraphQL","Hasura","Postgres","CI/CD","Python","Arduino","SocketIO","Flask"],img:"img/scram.png",url:"https://github.com/ajboni/slot-car-race-manager",icon:"img/icons8-car-64.png"},{id:2,title:"Speechr",description:"Speechr is a collaborative design and development tool for easy and organised game development.",category:"App Development",skills:["React","Mobx","Electron","Pouchdb","Couchdb","CI/CD"],img:"img/speechr.png",url:"https://baj.itch.io/speechr",icon:"img/speechr-icon.png"},{id:3,title:"How To Cope With Boredom and Loneliness",description:"A free Steam game I've made with @poffle as Point Bleep Studios",category:"Game Development",skills:["C#","Unity","Soundtrack","Steamworks"],img:"img/htc.png",url:"https://store.steampowered.com/app/797390/How_To_Cope_With_Boredom_and_Loneliness/",icon:"img/icons8-steam-96.png"},{id:4,title:"Personal Portfolio Website",description:"Landing page for my portfolio (this site). A great excuse to learn about Svelte.",category:"Web Development",skills:["Svelte","Milligram","CI/CD"],img:"img/portfolio.png",url:"https://github.com/ajboni/webpage",icon:"img/icons8-web-design-96.png"},{id:5,title:"Speechr Website",description:"Landing page for Speechr app, made with react, bootrap and semantic UI",category:"Web Development",skills:["React","Semantic-ui","Bootstrap"],img:"img/speechr-site.png",url:"https://github.com/ajboni/speechr-website",icon:"img/icons8-web-design-96.png"},{id:6,title:"The Mind Of Marlo",description:"A Steam game I've made with @poffle as Point Bleep Studios",category:"Game Development",skills:["C#","Unity","Soundtrack","Steamworks"],img:"img/mom.png",url:"https://store.steampowered.com/app/722870/The_Mind_of_Marlo/",icon:"img/icons8-steam-96.png"},{id:7,title:"Anotador de Truco Simple ",description:"Really simple, free, no-ads and open source anottation tool for the popular argentinean game 'Truco'",category:"Game Development",skills:["Godot","GDScript","Google Play"],img:"img/anotador_truco.png",url:"https://play.google.com/store/apps/details?id=anotador.de.truco.simple&hl=es_419",icon:"img/google_play.png"},{id:8,title:"Arduino Midi Foot Controller",description:"A simple midi (foot) controller for Arduino Uno  ",category:"App Development",skills:["C++","Arduino","Electronics"],img:"img/controller.jpg",url:"https://github.com/ajboni/ArduinoMidiFootController",icon:"img/icons8-github-100.png"},{id:9,title:"Point Bleep Studios Games",description:"Under the name of Point Bleep Studios, @poffle and I developed several games that can be played for free at itch.io ",category:"Game Development",skills:["C#","Unity","Soundtrack"],img:"img/pbs.png",url:"https://pointbleepstudios.itch.io/",icon:"img/icons8-control-96.png"}];function xe(e,t,n){const o=e.slice();return o[1]=t[n],o}function ke(e){let t,n,o,i=e[1]+"";return{c(){t=$("div"),n=w(i),o=b(),k(t,"class","skill svelte-1ni1q5n")},m(e,i){f(e,t,i),p(t,n),p(t,o)},p(e,t){1&t&&i!==(i=e[1]+"")&&C(n,i)},d(e){e&&h(t)}}}function Ce(t){let n,o,i,l,s,r,c,a,u,d,m,g,y,x,_,S,A,T,M,j,D,L=t[0].title+"",q=t[0].description+"",I=t[0].skills,E=[];for(let e=0;e<I.length;e+=1)E[e]=ke(xe(t,I,e));return{c(){n=$("div"),o=$("div"),i=$("img"),r=b(),c=$("a"),a=w(L),d=b(),m=$("div"),g=$("a"),y=$("img"),A=b(),T=$("div"),M=w(q),j=b(),D=$("div");for(let e=0;e<E.length;e+=1)E[e].c();i.src!==(l=t[0].icon)&&k(i,"src",l),k(i,"alt",s=""),k(i,"class","svelte-1ni1q5n"),k(c,"href",u=t[0].url),k(c,"target","__blank"),k(c,"class","svelte-1ni1q5n"),k(o,"class","title svelte-1ni1q5n"),y.src!==(x=t[0].img)&&k(y,"src",x),k(y,"alt",_=t[0].title),k(y,"class","svelte-1ni1q5n"),k(g,"href",S=t[0].url),k(g,"target","__blank"),k(m,"class","img svelte-1ni1q5n"),k(T,"class","description svelte-1ni1q5n"),k(D,"class","skills svelte-1ni1q5n"),k(n,"class","card svelte-1ni1q5n")},m(e,t){f(e,n,t),p(n,o),p(o,i),p(o,r),p(o,c),p(c,a),p(n,d),p(n,m),p(m,g),p(g,y),p(n,A),p(n,T),p(T,M),p(n,j),p(n,D);for(let e=0;e<E.length;e+=1)E[e].m(D,null)},p(e,[t]){if(1&t&&i.src!==(l=e[0].icon)&&k(i,"src",l),1&t&&L!==(L=e[0].title+"")&&C(a,L),1&t&&u!==(u=e[0].url)&&k(c,"href",u),1&t&&y.src!==(x=e[0].img)&&k(y,"src",x),1&t&&_!==(_=e[0].title)&&k(y,"alt",_),1&t&&S!==(S=e[0].url)&&k(g,"href",S),1&t&&q!==(q=e[0].description+"")&&C(M,q),1&t){let n;for(I=e[0].skills,n=0;n<I.length;n+=1){const o=xe(e,I,n);E[n]?E[n].p(o,t):(E[n]=ke(o),E[n].c(),E[n].m(D,null))}for(;n<E.length;n+=1)E[n].d(1);E.length=I.length}},i:e,o:e,d(e){e&&h(n),v(E,e)}}}function _e(e,t,n){let{item:o}=t;return e.$set=e=>{"item"in e&&n(0,o=e.item)},[o]}class Se extends ae{constructor(e){super(),ce(this,e,_e,Ce,s,{item:0})}}function Ae(e){let t,n,o,i,l,s,c;const a=e[1].default,u=function(e,t,n,o){if(e){const i=r(e,t,n,o);return e[0](i)}}(a,e,e[0],null);return{c(){t=$("div"),n=$("div"),n.innerHTML='<hr class="svelte-19iv3y9">',o=b(),i=$("div"),u&&u.c(),l=b(),s=$("div"),s.innerHTML='<hr class="svelte-19iv3y9">',k(n,"class","column"),k(i,"class","column"),k(s,"class","column"),k(t,"class","row svelte-19iv3y9")},m(e,r){f(e,t,r),p(t,n),p(t,o),p(t,i),u&&u.m(i,null),p(t,l),p(t,s),c=!0},p(e,[t]){u&&u.p&&1&t&&u.p(r(a,e,e[0],null),function(e,t,n,o){if(e[2]&&o){const i=e[2](o(n));if(void 0===t.dirty)return i;if("object"==typeof i){const e=[],n=Math.max(t.dirty.length,i.length);for(let o=0;o<n;o+=1)e[o]=t.dirty[o]|i[o];return e}return t.dirty|i}return t.dirty}(a,e[0],t,null))},i(e){c||(Z(u,e),c=!0)},o(e){K(u,e),c=!1},d(e){e&&h(t),u&&u.d(e)}}}function Te(e,t,n){let{$$slots:o={},$$scope:i}=t;return e.$set=e=>{"$$scope"in e&&n(0,i=e.$$scope)},[i,o]}class Me extends ae{constructor(e){super(),ce(this,e,Te,Ae,s,{})}}function je(e,t,n){const o=e.slice();return o[12]=t[n],o[14]=n,o}function De(e,t,n){const o=e.slice();return o[9]=t[n],o[11]=n,o}function Le(e){let t;return{c(){t=$("h2"),t.textContent="Personal Projects",k(t,"class","svelte-13wwovk")},m(e,n){f(e,t,n)},d(e){e&&h(t)}}}function qe(e){let t,n,o,i,l,s=[],r=new Map,c=e[11]+3>=e[0].length&&Ie(e);function a(...t){return e[8](e[11],...t)}let u=e[0].filter(a);const d=e=>e[12].id;for(let t=0;t<u.length;t+=1){let n=je(e,u,t),o=d(n);r.set(o,s[t]=Pe(o,n))}let m=e[11]+3>=e[0].length&&Be(e);return{c(){t=$("div"),c&&c.c(),n=b();for(let e=0;e<s.length;e+=1)s[e].c();o=b(),m&&m.c(),i=b(),k(t,"class","row svelte-13wwovk")},m(e,r){f(e,t,r),c&&c.m(t,null),p(t,n);for(let e=0;e<s.length;e+=1)s[e].m(t,null);p(t,o),m&&m.m(t,null),p(t,i),l=!0},p(l,u){if((e=l)[11]+3>=e[0].length?c?c.p(e,u):(c=Ie(e),c.c(),c.m(t,n)):c&&(c.d(1),c=null),1&u){const n=e[0].filter(a);Q(),s=oe(s,u,d,1,e,n,r,t,ne,Pe,o,je),V()}e[11]+3>=e[0].length?m?m.p(e,u):(m=Be(e),m.c(),m.m(t,i)):m&&(m.d(1),m=null)},i(e){if(!l){for(let e=0;e<u.length;e+=1)Z(s[e]);l=!0}},o(e){for(let e=0;e<s.length;e+=1)K(s[e]);l=!1},d(e){e&&h(t),c&&c.d();for(let e=0;e<s.length;e+=1)s[e].d();m&&m.d()}}}function Ie(e){let t,n=e[0].length%3==1&&Ee();return{c(){n&&n.c(),t=y()},m(e,o){n&&n.m(e,o),f(e,t,o)},p(e,o){e[0].length%3==1?n||(n=Ee(),n.c(),n.m(t.parentNode,t)):n&&(n.d(1),n=null)},d(e){n&&n.d(e),e&&h(t)}}}function Ee(e){let t;return{c(){t=$("div"),k(t,"class","column column-25 svelte-13wwovk")},m(e,n){f(e,t,n)},d(e){e&&h(t)}}}function Pe(e,t){let n,o,i;const l=new Se({props:{item:t[12]}});return{key:e,first:null,c(){n=$("div"),ie(l.$$.fragment),o=b(),k(n,"class","column svelte-13wwovk"),this.first=n},m(e,t){f(e,n,t),le(l,n,null),p(n,o),i=!0},p(e,t){const n={};1&t&&(n.item=e[12]),l.$set(n)},i(e){i||(Z(l.$$.fragment,e),i=!0)},o(e){K(l.$$.fragment,e),i=!1},d(e){e&&h(n),se(l)}}}function Be(e){let t,n=e[0].length%3==1&&Ge();return{c(){n&&n.c(),t=y()},m(e,o){n&&n.m(e,o),f(e,t,o)},p(e,o){e[0].length%3==1?n||(n=Ge(),n.c(),n.m(t.parentNode,t)):n&&(n.d(1),n=null)},d(e){n&&n.d(e),e&&h(t)}}}function Ge(e){let t;return{c(){t=$("div"),k(t,"class","column column-25 svelte-13wwovk")},m(e,n){f(e,t,n)},d(e){e&&h(t)}}}function We(e,t){let n,o,i,l=(t[11]+1)%3==1&&qe(t);return{key:e,first:null,c(){n=y(),l&&l.c(),o=y(),this.first=n},m(e,t){f(e,n,t),l&&l.m(e,t),f(e,o,t),i=!0},p(e,t){(e[11]+1)%3==1?l?(l.p(e,t),Z(l,1)):(l=qe(e),l.c(),Z(l,1),l.m(o.parentNode,o)):l&&(Q(),K(l,1,1,()=>{l=null}),V())},i(e){i||(Z(l),i=!0)},o(e){K(l),i=!1},d(e){e&&h(n),l&&l.d(e),e&&h(o)}}}function Fe(e){let t,n,o,l,s,r,c,a,u,d,m,g,v,w,y,C,A,T,M=[],j=new Map;const D=new Me({props:{$$slots:{default:[Le]},$$scope:{ctx:e}}});let L=e[0];const q=e=>e[9].id;for(let t=0;t<L.length;t+=1){let n=De(e,L,t),o=q(n);j.set(o,M[t]=We(o,n))}return{c(){t=$("div"),ie(D.$$.fragment),n=b(),o=$("div"),l=$("div"),s=b(),r=$("div"),c=$("input"),a=b(),u=$("div"),d=$("select"),m=$("option"),m.textContent="All",g=$("option"),g.textContent="Text",v=$("option"),v.textContent="Tags",w=b(),y=$("div"),C=b();for(let e=0;e<M.length;e+=1)M[e].c();k(l,"class","column column-20 svelte-13wwovk"),k(c,"placeholder","Search..."),k(r,"class","column column-40 svelte-13wwovk"),m.__value="All",m.value=m.__value,g.__value="Text",g.value=g.__value,v.__value="Tags",v.value=v.__value,k(d,"id","ageRangeField"),void 0===e[2]&&F(()=>e[7].call(d)),k(u,"class","column column-25 svelte-13wwovk"),k(y,"class","column column-20 svelte-13wwovk"),k(o,"class","row svelte-13wwovk"),k(t,"class","container svelte-13wwovk")},m(h,$,b){f(h,t,$),le(D,t,null),p(t,n),p(t,o),p(o,l),p(o,s),p(o,r),p(r,c),_(c,e[1]),p(o,a),p(o,u),p(u,d),p(d,m),p(d,g),p(d,v),S(d,e[2]),p(o,w),p(o,y),p(t,C);for(let e=0;e<M.length;e+=1)M[e].m(t,null);A=!0,b&&i(T),T=[x(c,"input",e[6]),x(c,"input",e[3]),x(d,"change",e[7]),x(d,"change",e[3])]},p(e,[n]){const o={};if(32768&n&&(o.$$scope={dirty:n,ctx:e}),D.$set(o),2&n&&c.value!==e[1]&&_(c,e[1]),4&n&&S(d,e[2]),1&n){const o=e[0];Q(),M=oe(M,n,q,1,e,o,j,t,ne,We,null,De),V()}},i(e){if(!A){Z(D.$$.fragment,e);for(let e=0;e<L.length;e+=1)Z(M[e]);A=!0}},o(e){K(D.$$.fragment,e);for(let e=0;e<M.length;e+=1)K(M[e]);A=!1},d(e){e&&h(t),se(D);for(let e=0;e<M.length;e+=1)M[e].d();i(T)}}}function He(e,t,n){let o=ye,i="",l="All",s=[],r=3-o.length%3;for(let e=0;e<r;e++)s.push(e);return[o,i,l,function(e){if(e.target.value.length>0)switch(l){case"Text":n(0,o=ye.filter(e=>e.description.toLowerCase().includes(i.toLowerCase())||e.title.toLowerCase().includes(i.toLowerCase())));break;case"Tags":n(0,o=ye.filter(e=>e.skills.join("|").toLowerCase().includes(i.toLowerCase())));break;default:n(0,o=ye.filter(e=>e.description.toLowerCase().includes(i.toLowerCase())||e.title.toLowerCase().includes(i.toLowerCase())||e.skills.join("|").toLowerCase().includes(i.toLowerCase())))}else n(0,o=ye)},s,r,function(){i=this.value,n(1,i)},function(){l=function(e){const t=e.querySelector(":checked")||e.options[0];return t&&t.__value}(this),n(2,l)},(e,t,n)=>n<e+3&&n>=e]}class Ne extends ae{constructor(e){super(),ce(this,e,He,Fe,s,{})}}const Re=[{id:1,title:"E-mail",url:"mailto:mail@aboni.dev",img:"./img/icons8-email-sign-100.png"},{id:11,title:"Blog",url:"https://blog.aboni.dev",img:"./img/icons8-blog-96.png"},{id:2,title:"Github",url:"https://github.com/ajboni/",img:"./img/icons8-github-100.png"},{id:3,title:"Gitlab",url:"https://gitlab.com/ajboni",img:"./img/icons8-gitlab-100.png"},{id:5,title:"Youtube",url:"https://www.youtube.com/channel/UCweBjZoA-EJ1i33CXcpghgQ",img:"./img/icons8-play-button-100.png"},{id:6,title:"Soundcloud",url:"https://soundcloud.com/ajboni",img:"./img/icons8-soundcloud-100.png"}];class Oe extends ae{constructor(e){super(),ce(this,e,null,null,s,{})}}function Ue(e,t,n){const o=e.slice();return o[0]=t[n],o[2]=n,o}function ze(e){let t;return{c(){t=$("h2"),t.textContent="Contact me",k(t,"class","svelte-fe5hq9")},m(e,n){f(e,t,n)},d(e){e&&h(t)}}}function Ye(t){let n,o,i,l,s,r,c,a,u=t[0].title+"";return{c(){n=$("div"),o=$("a"),i=$("img"),r=w(u),a=b(),i.src!==(l=t[0].img)&&k(i,"src",l),k(i,"alt",s=t[0].title),k(o,"href",c=t[0].url),k(o,"target","__blank"),k(o,"class","svelte-fe5hq9"),k(n,"class","column")},m(e,t){f(e,n,t),p(n,o),p(o,i),p(o,r),p(n,a)},p:e,d(e){e&&h(n)}}}function Je(e){let t,n,o,i,l;const s=new Me({props:{$$slots:{default:[ze]},$$scope:{ctx:e}}});let r=Re,c=[];for(let t=0;t<r.length;t+=1)c[t]=Ye(Ue(e,r,t));const a=new Oe({});return{c(){t=$("div"),ie(s.$$.fragment),n=b(),o=$("div");for(let e=0;e<c.length;e+=1)c[e].c();i=b(),ie(a.$$.fragment),k(o,"class","row svelte-fe5hq9"),k(t,"class","container svelte-fe5hq9")},m(e,r){f(e,t,r),le(s,t,null),p(t,n),p(t,o);for(let e=0;e<c.length;e+=1)c[e].m(o,null);p(t,i),le(a,t,null),l=!0},p(e,[t]){const n={};if(8&t&&(n.$$scope={dirty:t,ctx:e}),s.$set(n),0&t){let n;for(r=Re,n=0;n<r.length;n+=1){const i=Ue(e,r,n);c[n]?c[n].p(i,t):(c[n]=Ye(i),c[n].c(),c[n].m(o,null))}for(;n<c.length;n+=1)c[n].d(1);c.length=r.length}},i(e){l||(Z(s.$$.fragment,e),Z(a.$$.fragment,e),l=!0)},o(e){K(s.$$.fragment,e),K(a.$$.fragment,e),l=!1},d(e){e&&h(t),se(s),v(c,e),se(a)}}}class Xe extends ae{constructor(e){super(),ce(this,e,null,Je,s,{})}}function Qe(t){let n,o,i,l,s,r,c,a,u,d,m,g,v,y,x,C,_,S,A;return{c(){n=$("footer"),o=$("div"),o.textContent="© Alexis Boni 2019",i=b(),l=$("div"),s=w("Made with\n    "),r=$("img"),a=b(),u=w(" with "),d=b(),m=$("a"),m.textContent="Svelte",g=w("\n    and\n    "),v=$("a"),v.textContent="Milligram",y=w("\n    - Icons from\n    "),x=$("img"),_=b(),S=$("a"),S.textContent="Icons8",A=w("\n    ."),k(o,"class","footer-copyright svelte-1qnri7w"),r.src!==(c="./img/icons8-heart-100.png")&&k(r,"src","./img/icons8-heart-100.png"),k(r,"alt","love"),k(r,"class","svelte-1qnri7w"),k(m,"href","https://svelte.dev/"),k(m,"alt","Svelte"),k(m,"class","svelte-1qnri7w"),k(v,"href","https://milligram.io/"),k(v,"alt","Milligram"),k(v,"class","svelte-1qnri7w"),x.src!==(C="./img/icons8-icons8-100.png")&&k(x,"src","./img/icons8-icons8-100.png"),k(x,"alt","icons8"),k(x,"class","svelte-1qnri7w"),k(S,"href","https://icons8.com"),k(S,"alt","Icons8"),k(S,"class","svelte-1qnri7w"),k(l,"class","footer-copyright svelte-1qnri7w"),k(n,"class","svelte-1qnri7w")},m(e,t){f(e,n,t),p(n,o),p(n,i),p(n,l),p(l,s),p(l,r),p(l,a),p(l,u),p(l,d),p(l,m),p(l,g),p(l,v),p(l,y),p(l,x),p(l,_),p(l,S),p(l,A)},p:e,i:e,o:e,d(e){e&&h(n)}}}class Ve extends ae{constructor(e){super(),ce(this,e,null,Qe,s,{})}}const Ze=["Network Planning, Cisco CCNA level: Routing and switching","Router/Firewall administration","Widows/Linux Server Administration","Virtualization with VMWare and Proxmox","Technology implementation of essential enterprise solutions (Directory services, antivirus , backup services,  policies etc)","Software and Hardware Logging and monitoring","Project Management and Team Leader","Tech Support (Software and Hardware)","Equipment Configuration and commisioning"],Ke=["Javascript, HTML,CSS","Node.js, React.js, Svelte, Mobx","Wordpress, WooCommerce","Antd, TailwindCSS, Bulma, Bootstrap, MeterialUI","Game Development with Unity 3D and Godot Engine","Python, c#, vba, excel, php","Devops, kubernetes, docker, IaaC"],et=["4 Years of English-Spanish translation specializing in computer science and technical translation","Successfully finished Cisco CCNA official course (certification pending)","Music and Audio Production, Mixing and Mastering.","English level, written: bilingual, spoken: medium"];function tt(e,t,n){const o=e.slice();return o[0]=t[n],o}function nt(e,t,n){const o=e.slice();return o[0]=t[n],o}function ot(e,t,n){const o=e.slice();return o[0]=t[n],o}function it(e){let t;return{c(){t=$("h2"),t.textContent="Skills",k(t,"class","svelte-1fysxq7")},m(e,n){f(e,t,n)},d(e){e&&h(t)}}}function lt(t){let n,o,i,l=t[0]+"";return{c(){n=$("li"),o=w(l),i=b()},m(e,t){f(e,n,t),p(n,o),p(n,i)},p:e,d(e){e&&h(n)}}}function st(t){let n,o,i,l=t[0]+"";return{c(){n=$("li"),o=w(l),i=b()},m(e,t){f(e,n,t),p(n,o),p(n,i)},p:e,d(e){e&&h(n)}}}function rt(t){let n,o,i,l=t[0]+"";return{c(){n=$("li"),o=w(l),i=b()},m(e,t){f(e,n,t),p(n,o),p(n,i)},p:e,d(e){e&&h(n)}}}function ct(e){let t,n,o,i,l,s,r,c,a,u,d,m,g,w,y,x,C,_,S;const A=new Me({props:{$$slots:{default:[it]},$$scope:{ctx:e}}});let T=Ze,M=[];for(let t=0;t<T.length;t+=1)M[t]=lt(ot(e,T,t));let j=Ke,D=[];for(let t=0;t<j.length;t+=1)D[t]=st(nt(e,j,t));let L=et,q=[];for(let t=0;t<L.length;t+=1)q[t]=rt(tt(e,L,t));return{c(){t=$("div"),ie(A.$$.fragment),n=b(),o=$("div"),i=$("div"),l=$("h3"),l.textContent="IT",s=b(),r=$("ul");for(let e=0;e<M.length;e+=1)M[e].c();c=b(),a=$("div"),u=$("div"),d=$("h3"),d.textContent="Dev",m=b(),g=$("ul");for(let e=0;e<D.length;e+=1)D[e].c();w=b(),y=$("div"),x=$("h3"),x.textContent="Misc",C=b(),_=$("ul");for(let e=0;e<q.length;e+=1)q[e].c();k(l,"class","svelte-1fysxq7"),k(i,"class","column card svelte-1fysxq7"),k(d,"class","svelte-1fysxq7"),k(u,"class","row card svelte-1fysxq7"),k(x,"class","svelte-1fysxq7"),k(y,"class","row card svelte-1fysxq7"),k(a,"class","column"),k(o,"class","row"),k(t,"class","container svelte-1fysxq7")},m(e,h){f(e,t,h),le(A,t,null),p(t,n),p(t,o),p(o,i),p(i,l),p(i,s),p(i,r);for(let e=0;e<M.length;e+=1)M[e].m(r,null);p(o,c),p(o,a),p(a,u),p(u,d),p(u,m),p(u,g);for(let e=0;e<D.length;e+=1)D[e].m(g,null);p(a,w),p(a,y),p(y,x),p(y,C),p(y,_);for(let e=0;e<q.length;e+=1)q[e].m(_,null);S=!0},p(e,[t]){const n={};if(128&t&&(n.$$scope={dirty:t,ctx:e}),A.$set(n),0&t){let n;for(T=Ze,n=0;n<T.length;n+=1){const o=ot(e,T,n);M[n]?M[n].p(o,t):(M[n]=lt(o),M[n].c(),M[n].m(r,null))}for(;n<M.length;n+=1)M[n].d(1);M.length=T.length}if(0&t){let n;for(j=Ke,n=0;n<j.length;n+=1){const o=nt(e,j,n);D[n]?D[n].p(o,t):(D[n]=st(o),D[n].c(),D[n].m(g,null))}for(;n<D.length;n+=1)D[n].d(1);D.length=j.length}if(0&t){let n;for(L=et,n=0;n<L.length;n+=1){const o=tt(e,L,n);q[n]?q[n].p(o,t):(q[n]=rt(o),q[n].c(),q[n].m(_,null))}for(;n<q.length;n+=1)q[n].d(1);q.length=L.length}},i(e){S||(Z(A.$$.fragment,e),S=!0)},o(e){K(A.$$.fragment,e),S=!1},d(e){e&&h(t),se(A),v(M,e),v(D,e),v(q,e)}}}class at extends ae{constructor(e){super(),ce(this,e,null,ct,s,{})}}function ut(t){let n,o,i,l,s,r;const c=new de({}),a=new be({}),u=new at({}),d=new Ne({}),m=new Xe({}),g=new Ve({});return{c(){ie(c.$$.fragment),n=b(),ie(a.$$.fragment),o=b(),ie(u.$$.fragment),i=b(),ie(d.$$.fragment),l=b(),ie(m.$$.fragment),s=b(),ie(g.$$.fragment)},m(e,t){le(c,e,t),f(e,n,t),le(a,e,t),f(e,o,t),le(u,e,t),f(e,i,t),le(d,e,t),f(e,l,t),le(m,e,t),f(e,s,t),le(g,e,t),r=!0},p:e,i(e){r||(Z(c.$$.fragment,e),Z(a.$$.fragment,e),Z(u.$$.fragment,e),Z(d.$$.fragment,e),Z(m.$$.fragment,e),Z(g.$$.fragment,e),r=!0)},o(e){K(c.$$.fragment,e),K(a.$$.fragment,e),K(u.$$.fragment,e),K(d.$$.fragment,e),K(m.$$.fragment,e),K(g.$$.fragment,e),r=!1},d(e){se(c,e),e&&h(n),se(a,e),e&&h(o),se(u,e),e&&h(i),se(d,e),e&&h(l),se(m,e),e&&h(s),se(g,e)}}}function dt(e,t,n){let{name:o}=t;return e.$set=e=>{"name"in e&&n(0,o=e.name)},[o]}return new class extends ae{constructor(e){super(),ce(this,e,dt,ut,s,{name:0})}}({target:document.body,props:{name:"world"}})}();
//# sourceMappingURL=bundle.js.map
