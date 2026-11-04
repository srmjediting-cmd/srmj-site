// Home page: drives the "Lights on" reveal from scroll position. Without the .anim class (reduced motion) nothing runs.
(function () {
  var root = document.documentElement, rv = document.querySelector('.reveal'), head = document.querySelector('.site-head');
  if (!rv) return;
  var hh = 73;
  var track = rv.querySelector('.rv-track'), stick = rv.querySelector('.rv-stick'), photo = rv.querySelector('.rv-photo');
  var tb = rv.querySelector('.tb'), ta = rv.querySelector('.ta'), body = document.body;
  var G = {}, ticking = false, last = '';
  function c(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ss(x) { x = c(x); return x * x * (3 - 2 * x); }
  function measure() {
    hh = head.offsetHeight; rv.style.setProperty('--hh', hh + 'px');
    if (!root.classList.contains('anim')) return;
    var vw = innerWidth, sw = stick.offsetWidth, sh = stick.offsetHeight;
    var gxAbs = Math.max(0, (vw - 1320) / 2) + Math.max(20, 0.045 * vw), gx = gxAbs - (vw - sw) / 2;
    rv.style.setProperty('--gx', gx + 'px');
    var Wp = photo.offsetWidth, Hp = photo.offsetHeight, phone = vw <= 720, s, tx = 0, ty = 0;
    if (phone) {
      s = (sw - 2 * gx) / Wp; ty = 16 + Hp * s / 2 - sh / 2;
      rv.style.setProperty('--ey', (16 + Hp * s + 24) + 'px');
    } else {
      s = Math.min(0.9 * sh / Hp, 0.6 * sw / Wp); tx = gx + Wp * s / 2 - sw / 2;
      rv.style.setProperty('--ex', (gx + Wp * s + 56) + 'px');
    }
    var fx = phone ? 0.52 : 0.5;  // phone crop: recliner and sofa sit near the middle of the frame
    G = { sw: sw, sh: sh, Wp: Wp, Hp: Hp, ox: (Wp - sw) * fx, tx0: (0.5 - fx) * (Wp - sw), s: s, tx: tx, ty: ty, soft: 0.14 * sw, wB: tb.offsetWidth, hB: tb.offsetHeight, wA: ta.offsetWidth };
    rv.style.setProperty('--pw', sw + 'px'); rv.style.setProperty('--soft', G.soft + 'px');
  }
  measure();
  if (!root.classList.contains('anim')) return;
  function draw() {
    ticking = false;
    var r = track.getBoundingClientRect(), run = r.height - G.sh;
    var p = run > 0 ? c((hh - r.top) / run) : 0;
    var hf = ss(p / 0.12), wp = ss((p - 0.16) / 0.54), q = ss((p - 0.74) / 0.2), t = ss((p - 0.86) / 0.12);
    var travel = G.sw + G.soft + 0.05 * G.sw, E = wp * travel;            // edge position, stage pixels
    var ob = 1 - c((E - (G.sw - 16 - G.wB)) / G.wB), oa = c((E - G.soft * 0.5 - 16) / G.wA);
    if (wp >= 1) { ob = 0; oa = 1; }
    var s = 1 + (G.s - 1) * q, tx = G.tx0 + (G.tx - G.tx0) * q, ty = G.ty * q;
    var pl = G.sw / 2 + tx - G.Wp * s / 2, pt = G.sh / 2 + ty - G.Hp * s / 2, pr = pl + G.Wp * s;
    var ax = Math.max(pl, 0) + 16, ay = Math.max(pt, 0) + 16, bx = Math.min(pr, G.sw) - 16 - G.wB;
    var v = [hf, 1 - hf, G.ox + E, wp > 0 && wp < 1 ? c(wp * 12) * c((1 - wp) * 12) : 0, q, t, ob, oa, s, tx, ty, ax, ay, bx].map(function (n) { return +n.toFixed(3); });
    var key = v.join();
    if (key === last) return;
    last = key;
    var set = function (k, val) { rv.style.setProperty(k, val); };
    set('--hf', v[0]); set('--dim', v[1]); set('--e', v[2] + 'px'); set('--sw', v[3]); set('--t', v[5]);
    set('--ob', v[6]); set('--oa', v[7]); set('--s', v[8]); set('--tx', v[9] + 'px'); set('--ty', v[10] + 'px');
    ta.style.transform = 'translate(' + v[11] + 'px,' + v[12] + 'px)'; tb.style.transform = 'translate(' + v[13] + 'px,' + v[12] + 'px)';
    body.style.setProperty('--k', v[4]);
    rv.classList.toggle('hoff', hf > 0.98);
    rv.classList.toggle('on', t > 0.05);
    rv.classList.toggle('done', wp >= 1);
    body.classList.toggle('paper', q > 0.5);
  }
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(draw); } }
  addEventListener('scroll', tick, { passive: true });
  addEventListener('resize', function () { measure(); last = ''; tick(); });
  draw();
})();
