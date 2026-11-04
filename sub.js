/* SRMJ sub pages: compare sliders and the trail buttons. */
(function(){
var still=matchMedia('(prefers-reduced-motion:reduce)').matches;
document.querySelectorAll('.cmp').forEach(function(cmp){
 var range=cmp.querySelector('input'),touched=false,dragging=false;
 function set(v){cmp.style.setProperty('--pos',v+'%')}
 function update(){set(range.value);range.setAttribute('aria-valuetext',range.value+' percent before, '+(100-range.value)+' percent after')}
 range.addEventListener('input',update);update();
 ['pointerdown','keydown','focus'].forEach(function(ev){range.addEventListener(ev,function(){touched=true})});
 function from(e){var r=cmp.getBoundingClientRect();range.value=Math.round(Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100)));update()}
 range.addEventListener('pointerdown',function(e){dragging=true;range.setPointerCapture(e.pointerId);from(e)});
 range.addEventListener('pointermove',function(e){if(dragging)from(e)});
 range.addEventListener('pointerup',function(){dragging=false});range.addEventListener('pointercancel',function(){dragging=false});
 if(still||!('IntersectionObserver' in window))return;
 /* one short sweep the first time a slider is seen, so people notice it can be dragged */
 var io=new IntersectionObserver(function(es){if(!es[0].isIntersecting)return;io.disconnect();var t0=null;
  function step(t){if(touched)return update();if(t0===null)t0=t;var k=Math.min((t-t0)/1200,1);set((50-16*Math.sin(k*Math.PI)).toFixed(2));if(k<1)requestAnimationFrame(step);else update()}
  setTimeout(function(){requestAnimationFrame(step)},300)},{threshold:.6});io.observe(cmp);
});
/* signpost: a marker slides to the tip being read */
var sp=document.querySelector('.signpost');
if(sp&&'IntersectionObserver' in window){var links=[].slice.call(sp.querySelectorAll('a')),tips=[].slice.call(document.querySelectorAll('.tip')),mk=document.createElement('i');mk.className='mk';mk.setAttribute('aria-hidden','true');sp.querySelector('ul').parentNode.insertBefore(mk,sp.firstChild);
 var cur=function(i){links.forEach(function(a,j){if(j===i)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')});var l=links[i];mk.style.height=l.offsetHeight+'px';mk.style.transform='translateY('+(l.parentNode.offsetTop)+'px)'};
 var vis={};cur(0);
 var io2=new IntersectionObserver(function(es){es.forEach(function(e){vis[e.target.id]=e.isIntersecting});for(var i=0;i<tips.length;i++)if(vis[tips[i].id]){cur(i);return}},{rootMargin:'-20% 0px -60% 0px'});tips.forEach(function(t){io2.observe(t)})}
/* once-only entrances: planks, ranger cards, trail signs */
if('IntersectionObserver' in window){
 var once=new IntersectionObserver(function(es,o){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');o.unobserve(e.target)}})},{threshold:.25});
 document.querySelectorAll('.parksign,.person,.stop').forEach(function(el){once.observe(el)});
}
var tr=document.querySelector('.trail');
if(tr){
 var step=function(d){var s=tr.querySelector('.stop');tr.scrollBy({left:d*(s?s.offsetWidth+60:600),behavior:still?'auto':'smooth'})};
 var pv=document.getElementById('tprev'),nx=document.getElementById('tnext');
 if(pv)pv.addEventListener('click',function(){step(-1)});if(nx)nx.addEventListener('click',function(){step(1)});
 /* mouse drag on the trail, never on a photo (photos have their own slider) */
 var sx=0,sl=0,on=false;
 tr.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||e.target.closest('.cmp'))return;on=true;sx=e.clientX;sl=tr.scrollLeft;tr.classList.add('drag');tr.setPointerCapture(e.pointerId)});
 tr.addEventListener('pointermove',function(e){if(on)tr.scrollLeft=sl-(e.clientX-sx)});
 var end=function(){on=false;tr.classList.remove('drag')};tr.addEventListener('pointerup',end);tr.addEventListener('pointercancel',end);
}

/* the dotted trail draws itself as you move along it */
var tin=document.querySelector('.trail-in');
if(tin&&tr&&!still){var busy=0,mqm=matchMedia('(max-width:760px)');
 var draw=function(){busy=0;var d;
  if(mqm.matches){var r=tin.getBoundingClientRect();d=(innerHeight*.85-r.top)/r.height}
  else d=(tr.scrollLeft+tr.clientWidth)/Math.max(1,tr.scrollWidth-tr.clientWidth*.7);
  tin.style.setProperty('--draw',Math.max(.08,Math.min(1,d)).toFixed(3))};
 var go=function(){if(!busy){busy=1;requestAnimationFrame(draw)}};
 tr.addEventListener('scroll',go,{passive:true});addEventListener('scroll',go,{passive:true});addEventListener('resize',go);draw()}
})();
