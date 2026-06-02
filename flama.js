/* ============================================================
   KBr Flama'26 — interactions
   ============================================================ */
(function(){
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dict = window.FLAMA_I18N;

  /* ---------- i18n ---------- */
  function applyLang(lang){
    var t = dict[lang]; if(!t) return;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var k = el.getAttribute('data-i18n');
      if(t[k] != null) el.innerHTML = t[k];
    });
    document.querySelectorAll('.langs button').forEach(function(b){
      b.classList.toggle('on', b.getAttribute('data-lang') === lang);
    });
    try{ localStorage.setItem('flama_lang', lang); }catch(e){}
  }
  document.querySelectorAll('.langs button').forEach(function(b){
    b.addEventListener('click', function(){ applyLang(b.getAttribute('data-lang')); });
  });
  var saved = 'es';
  try{ saved = localStorage.getItem('flama_lang') || 'es'; }catch(e){}
  if(!dict[saved]) saved = 'es';
  applyLang(saved);

  /* ---------- progress + nav ---------- */
  var bar = document.getElementById('progress');
  var nav = document.querySelector('.nav');
  var links = [].slice.call(document.querySelectorAll('.nav__links a'));
  function onScroll(){
    var h = document.documentElement;
    var st = h.scrollTop || document.body.scrollTop;
    var max = h.scrollHeight - h.clientHeight;
    if(bar) bar.style.width = (max>0 ? (st/max*100) : 0).toFixed(2) + '%';
    if(nav) nav.classList.toggle('solid', st > window.innerHeight*0.6);
  }

  /* ---------- parallax ---------- */
  var px = [].slice.call(document.querySelectorAll('[data-parallax]'));
  function parallax(){
    if(reduce) return;
    var vh = window.innerHeight;
    px.forEach(function(el){
      var sp = parseFloat(el.getAttribute('data-parallax')) || 0.12;
      var r = el.getBoundingClientRect();
      var off = ((r.top + r.height/2) - vh/2) * sp * -1;
      el.style.transform = 'translate3d(0,'+off.toFixed(1)+'px,0)';
    });
  }
  var ticking=false;
  function tick(){ if(ticking) return; ticking=true; requestAnimationFrame(function(){ onScroll(); parallax(); ticking=false; }); }
  window.addEventListener('scroll', tick, {passive:true});
  window.addEventListener('resize', tick, {passive:true});

  /* ---------- reveals + active section ---------- */
  if('IntersectionObserver' in window){
    var rev = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); rev.unobserve(e.target); } });
    }, { threshold:0.12, rootMargin:'0px 0px -7% 0px' });
    document.querySelectorAll('.reveal').forEach(function(el){ rev.observe(el); });

    var map={}; links.forEach(function(a){ map[a.getAttribute('href').slice(1)]=a; });
    var sec = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){ links.forEach(function(l){ l.classList.remove('active'); }); if(map[e.target.id]) map[e.target.id].classList.add('active'); }
      });
    }, { rootMargin:'-45% 0px -50% 0px' });
    document.querySelectorAll('section[id]').forEach(function(s){ sec.observe(s); });
  } else {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
  }

  /* ---------- lightbox ---------- */
  var shots = [].slice.call(document.querySelectorAll('figure.shot'));
  var lb = document.getElementById('lb');
  var lbImg = lb.querySelector('img');
  var lbCap = lb.querySelector('.lb__cap');
  var idx = 0;
  function capHTML(fig){
    var c = fig.querySelector('figcaption');
    return c ? c.innerHTML : '';
  }
  function show(i){
    idx = (i + shots.length) % shots.length;
    var fig = shots[idx];
    var img = fig.querySelector('img');
    lbImg.src = img.getAttribute('data-full') || img.src;
    lbImg.alt = img.alt || '';
    lbCap.innerHTML = capHTML(fig);
  }
  function open(i){ show(i); lb.classList.add('open'); document.body.style.overflow='hidden'; }
  function close(){ lb.classList.remove('open'); document.body.style.overflow=''; lbImg.src=''; }
  shots.forEach(function(fig,i){ fig.addEventListener('click', function(){ open(i); }); });
  lb.querySelector('.lb__close').addEventListener('click', close);
  lb.querySelector('.lb__btn.prev').addEventListener('click', function(){ show(idx-1); });
  lb.querySelector('.lb__btn.next').addEventListener('click', function(){ show(idx+1); });
  lb.addEventListener('click', function(e){ if(e.target===lb) close(); });
  document.addEventListener('keydown', function(e){
    if(!lb.classList.contains('open')) return;
    if(e.key==='Escape') close();
    else if(e.key==='ArrowLeft') show(idx-1);
    else if(e.key==='ArrowRight') show(idx+1);
  });

  tick();
})();
