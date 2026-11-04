/* SRMJ home. Small and plain: slider, headline fit, word fit, print-on, swap. Scroll motion is CSS. */
(function(){
var root=document.documentElement,still=matchMedia('(prefers-reduced-motion:reduce)').matches;
var hero=document.getElementById('top'),dv=document.getElementById('div'),nw=hero.querySelector('.layer.new');
/* the faded state is a copy of the full poster: same markup, same positions */
var old=nw.cloneNode(true);old.className='layer old';old.setAttribute('aria-hidden','true');
old.querySelectorAll('[id]').forEach(function(e){e.removeAttribute('id')});var rr=old.querySelector('.rays');if(rr)rr.remove();
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
 var k=0;hero.querySelectorAll('.hl').forEach(function(h){k=0;h.innerHTML=lines.map(function(s){return'<span>'+s.split(' ').map(function(w){return'<b class="w" style="--i:'+(k++)+'">'+w+'</b>'}).join(' ')+'</span>'}).join('')});
}
var p=50,nudged=0;
function set(v){p=Math.max(0,Math.min(100,v));hero.style.setProperty('--x',p+'%');dv.setAttribute('aria-valuenow',Math.round(p))}
var q=new URLSearchParams(location.search).get('x');set(q!==null?+q:50);
fit();
var ready=(document.fonts&&document.fonts.load)?Promise.all([document.fonts.load('400 100px Anton'),document.fonts.ready]):Promise.resolve();
ready.then(function(){fit();fitWord();
 if(!still){hero.classList.add('stampit');setTimeout(function(){hero.classList.remove('stampit')},700)}
 if(q===null&&!still){var t0=performance.now();
  var step=function(t){if(nudged)return;var u=Math.min(1,(t-t0)/1100);set(50-9*Math.sin(Math.PI*u)*(1-.15*u));if(u<1)requestAnimationFrame(step);else set(50)};
  setTimeout(function(){requestAnimationFrame(step)},500)}});
addEventListener('resize',function(){fit();fitWord()});
var dl=document.getElementById('dl');function gone(){if(dl)dl.classList.add('gone')}
dv.addEventListener('pointerdown',function(e){gone();nudged=1;dv.setPointerCapture(e.pointerId);dv._g=1});
dv.addEventListener('pointermove',function(e){if(dv._g){var r=hero.getBoundingClientRect();set((e.clientX-r.left)/r.width*100)}});
dv.addEventListener('pointerup',function(){dv._g=0});dv.addEventListener('pointercancel',function(){dv._g=0});
dv.addEventListener('keydown',function(e){gone();nudged=1;var s=e.shiftKey?10:2,m={ArrowLeft:-s,ArrowRight:s,ArrowDown:-s,ArrowUp:s};
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
var pin=document.getElementById('pin'),lab=document.getElementById('lab'),after=true,bigA=document.getElementById('bigA'),bigB=document.getElementById('bigB');
pin.addEventListener('click',function(){after=!after;
 var inc=after?bigA:bigB,out=after?bigB:bigA;
 inc.style.zIndex=2;out.style.zIndex=1;inc.classList.remove('off');
 setTimeout(function(){out.style.transition='none';out.classList.add('off');void out.offsetWidth;out.style.transition=''},still?0:700);
 document.getElementById('pinA').classList.toggle('off',after);document.getElementById('pinB').classList.toggle('off',!after);
 word.children[0].classList.toggle('on',after);word.children[1].classList.toggle('on',!after);
 var t=after?'See before':'See after';lab.textContent=t;
 pin.setAttribute('aria-label',t+': show the '+(after?'original':'edited')+' photo large');
 if(!still){print();pin.classList.remove('swing');void pin.offsetWidth;pin.classList.add('swing')}});

/* the closing stamp lands once */
var st=document.querySelector('.stamp');
if(st&&'IntersectionObserver' in window&&!still){var so=new IntersectionObserver(function(e){if(e[0].isIntersecting){so.disconnect();st.classList.add('go')}},{threshold:.6});so.observe(st)}

/* ---- one passive scroll loop: ridge sinks, sky steps toward dusk, ink fills the three lines ---- */
var wide=matchMedia('(min-width:761px)'),vh=innerHeight,busy=0,svgs=[].slice.call(hero.querySelectorAll('.rd svg')),SINK=[70,42,14],DUSK=[0,.14,.28,.42],lastStep=-1;
var lns=[].slice.call(document.querySelectorAll('.floor p.ln')),track=document.querySelector('.ltrack');
function clamp(v){return v<0?0:v>1?1:v}
function tick(){busy=0;var y=scrollY;
 if(!still&&y<vh*1.4){var p=clamp(y/(vh*1.2));svgs.forEach(function(s,i){s.style.transform='translate3d(0,'+(SINK[i%3]*p).toFixed(1)+'px,0)'});
  var u=clamp((y-vh*.15)/(vh*.75)),st=Math.min(3,Math.floor(u*4));if(st!==lastStep){lastStep=st;hero.style.setProperty('--dusk',DUSK[st])}}
 if(!still&&track){if(wide.matches){var r=track.getBoundingClientRect(),t=clamp(-r.top/(r.height-vh));
   lns.forEach(function(l,i){l.style.setProperty('--fill',(clamp((t-(.08+i*.25))/.2)*100).toFixed(1)+'%')})}
  else lns.forEach(function(l){l.style.removeProperty('--fill')})}}
function onS(){if(!busy){busy=1;requestAnimationFrame(tick)}}
addEventListener('scroll',onS,{passive:true});addEventListener('resize',function(){vh=innerHeight;onS()});tick();
/* ---- small once-only entrances and a paused-offscreen sky ---- */
if('IntersectionObserver' in window){
 new IntersectionObserver(function(e){hero.classList.toggle('off',!e[0].isIntersecting)}).observe(hero);
 var bw=document.querySelector('.big');if(bw)new IntersectionObserver(function(e,o){if(e[0].isIntersecting){bw.classList.add('in');o.disconnect()}},{threshold:.15}).observe(bw.parentNode);
 var pc=document.querySelector('.pct');if(pc)new IntersectionObserver(function(e,o){if(e[0].isIntersecting){pc.classList.add('in');o.disconnect()}},{threshold:.5}).observe(pc);
}
/* ---- FAQ: height animates where the browser can, plain open and close otherwise ---- */
[].forEach.call(document.querySelectorAll('.faq details'),function(d){var s=d.querySelector('summary'),a;
 s.addEventListener('click',function(e){if(still||!d.animate)return;e.preventDefault();if(a)a.cancel();var h0=d.offsetHeight;
  if(!d.open){d.open=true;var h1=d.offsetHeight;a=d.animate({height:[h0+'px',h1+'px']},{duration:220,easing:'ease'});a.onfinish=function(){a=null}}
  else{var h2=s.offsetHeight;a=d.animate({height:[h0+'px',h2+'px']},{duration:180,easing:'ease'});a.onfinish=function(){d.open=false;a=null}}})});
})();
