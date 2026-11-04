/* SRMJ home. Small and plain: slider, headline fit, word fit, print-on, swap. Scroll motion is CSS. */
(function(){
var root=document.documentElement,still=matchMedia('(prefers-reduced-motion:reduce)').matches;
var hero=document.getElementById('top'),dv=document.getElementById('div'),nw=hero.querySelector('.layer.new');
/* the faded state is a copy of the full poster: same markup, same positions */
var old=nw.cloneNode(true);old.className='layer old';old.setAttribute('aria-hidden','true');
old.querySelectorAll('[id]').forEach(function(e){e.removeAttribute('id')});
old.querySelectorAll('a').forEach(function(a){a.tabIndex=-1});
var oi=old.querySelector('.ph img');oi.src=oi.dataset.b;oi.srcset=oi.dataset.bset;oi.alt='';oi.removeAttribute('fetchpriority');
var fade={'#8F2A1C':'#B6A98F','#1F3A2D':'#8D8A78'};
old.querySelectorAll('.rd svg').forEach(function(s,i){s.querySelectorAll('path').forEach(function(p){var c=p.getAttribute('fill');if(i<2)p.setAttribute('fill',fade[c]||c);else p.setAttribute('fill','url(#ff)')});
 if(i==2)s.insertAdjacentHTML('afterbegin','<defs><linearGradient id="ff" gradientUnits="userSpaceOnUse" x1="0" y1="240" x2="0" y2="330"><stop offset="0" stop-color="#7A7563"/><stop offset="1" stop-color="#112619"/></linearGradient></defs>')});
hero.insertBefore(old,nw);

var cv=document.createElement('canvas').getContext('2d');
function tw(txt){cv.font='400 100px Anton';return cv.measureText(txt).width}
var mq=matchMedia('(max-width:760px)');
function fit(){
 var lines=mq.matches?['See it the','way guests','will.']:['See it the way guests will.'];
 var W=nw.querySelector('.hl').clientWidth;
 var m=Math.max.apply(0,lines.map(function(s){return tw(s.toUpperCase())}));
 var sA=100*(W-8)/m;
 hero.style.setProperty('--nl',lines.length);hero.style.setProperty('--lh',Math.round(sA*.92)+'px');hero.style.setProperty('--hs',sA.toFixed(1)+'px');
 hero.querySelectorAll('.hl').forEach(function(h){h.innerHTML=lines.map(function(s){return'<span>'+s+'</span>'}).join('')});
}
var p=50,nudged=0;
function set(v){p=Math.max(0,Math.min(100,v));hero.style.setProperty('--x',p+'%');dv.setAttribute('aria-valuenow',Math.round(p))}
var q=new URLSearchParams(location.search).get('x');set(q!==null?+q:50);
fit();
var ready=(document.fonts&&document.fonts.load)?Promise.all([document.fonts.load('400 100px Anton'),document.fonts.ready]):Promise.resolve();
ready.then(function(){fit();fitWord();
 if(q===null&&!still){var t0=performance.now();
  var step=function(t){if(nudged)return;var u=Math.min(1,(t-t0)/1100);set(50-9*Math.sin(Math.PI*u)*(1-.15*u));if(u<1)requestAnimationFrame(step);else set(50)};
  setTimeout(function(){requestAnimationFrame(step)},500)}});
addEventListener('resize',function(){fit();fitWord()});
dv.addEventListener('pointerdown',function(e){nudged=1;dv.setPointerCapture(e.pointerId);dv._g=1});
dv.addEventListener('pointermove',function(e){if(dv._g){var r=hero.getBoundingClientRect();set((e.clientX-r.left)/r.width*100)}});
dv.addEventListener('pointerup',function(){dv._g=0});dv.addEventListener('pointercancel',function(){dv._g=0});
dv.addEventListener('keydown',function(e){nudged=1;var s=e.shiftKey?10:2,m={ArrowLeft:-s,ArrowRight:s,ArrowDown:-s,ArrowUp:s};
 if(e.key in m){set(p+m[e.key]);e.preventDefault()}else if(e.key=='Home'){set(0);e.preventDefault()}else if(e.key=='End'){set(100);e.preventDefault()}});

/* the wall: word fits its column; prints on once; swap */
var word=document.getElementById('word');
function fitWord(){
 var wl=document.querySelector('.wl'),big=document.querySelector('.big'),mob=mq.matches;
 cv.font='400 100px Anton';var cap=cv.measureText('H').actualBoundingBoxAscent/100;
 [].forEach.call(word.children,function(sp){var f=100*(wl.clientWidth-(mob?0:44))/tw(sp.textContent.toUpperCase());
  sp.style.fontSize=f+'px';sp.dataset.h=f;
  var k=mob?1:Math.min(1.7,(big.offsetHeight*.6)/(cap*f));sp.style.transform='scaleY('+k.toFixed(3)+')'});
 word.style.height=mob?word.children[0].dataset.h+'px':'';
}
fitWord();
function print(){word.classList.remove('go');void word.offsetWidth;word.classList.add('go')}
if('IntersectionObserver' in window&&!still){var io=new IntersectionObserver(function(e){if(e[0].isIntersecting){io.disconnect();print()}},{threshold:.35});io.observe(document.querySelector('.wl'))}else word.classList.add('go');
var pin=document.getElementById('pin'),lab=document.getElementById('lab'),after=true;
pin.addEventListener('click',function(){after=!after;
 document.getElementById('bigA').classList.toggle('off',!after);document.getElementById('bigB').classList.toggle('off',after);
 document.getElementById('pinA').classList.toggle('off',after);document.getElementById('pinB').classList.toggle('off',!after);
 word.children[0].classList.toggle('on',after);word.children[1].classList.toggle('on',!after);
 var t=after?'See before':'See after';lab.textContent=t;
 pin.setAttribute('aria-label',t+': show the '+(after?'original':'edited')+' photo large');
 if(!still){print();pin.classList.remove('swing');void pin.offsetWidth;pin.classList.add('swing')}});

/* the closing stamp lands once */
var st=document.querySelector('.stamp');
if(st&&'IntersectionObserver' in window&&!still){var so=new IntersectionObserver(function(e){if(e[0].isIntersecting){so.disconnect();st.classList.add('go')}},{threshold:.6});so.observe(st)}
})();
