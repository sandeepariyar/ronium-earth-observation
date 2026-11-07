/* RONIUM / EARTH — Designed and developed by Sandeep Pariyar. © 2026. */
/* Scroll reveals, counters, kinetic type, live HUD, cursor */
(function(){
  // ── IntersectionObserver reveal ─────────────────────────
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.classList.add('on');
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal, .mask-reveal, .brief-headline').forEach(el => io.observe(el));

  // ── Number counters ─────────────────────────────────────
  const nio = new IntersectionObserver((entries)=>{
    entries.forEach(e => {
      if(!e.isIntersecting) return;
      const el = e.target;
      if(el.dataset.done) return;
      el.dataset.done = '1';
      const to = parseFloat(el.dataset.to);
      const dur = parseInt(el.dataset.dur || '1400', 10);
      const decimals = parseInt(el.dataset.dec || '0', 10);
      const startT = performance.now();
      function step(t){
        const p = Math.min(1, (t - startT)/dur);
        const eased = 1 - Math.pow(1-p, 3);
        const v = to * eased;
        el.textContent = v.toFixed(decimals);
        if(p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      nio.unobserve(el);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-counter]').forEach(el => nio.observe(el));

  // ── Split brief headline into words then chars ─────────
  document.querySelectorAll('.brief-headline').forEach(h => {
    const raw = h.innerHTML;
    // split on spaces preserving inline markup by splitting outerText into words? we split on text nodes only
    const words = h.textContent.trim().split(/\s+/);
    // Simple: reset innerHTML with each word wrapped
    h.innerHTML = words.map(w => {
      // preserve highlighted class from data attr — instead just check original markup for "em"
      return `<span class="word"><span>${w}&nbsp;</span></span>`;
    }).join(' ');
    // stagger
    h.querySelectorAll('.word > span').forEach((s, i) => {
      s.style.transitionDelay = (i * 60) + 'ms';
    });
  });

  // ── Live HUD ticker (fake coordinates + timestamps) ─────
  const hudEls = document.querySelectorAll('[data-hud]');
  function tickHud(){
    const now = new Date();
    const pad = (n,l=2)=> String(n).padStart(l,'0');
    const utc = `${now.getUTCFullYear()}-${pad(now.getUTCMonth()+1)}-${pad(now.getUTCDate())}T${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}Z`;
    // fake orbit params
    const lat = (Math.sin(now.getTime()/8000) * 89).toFixed(3);
    const lon = ((now.getTime()/60) % 360 - 180).toFixed(3);
    hudEls.forEach(el => {
      const k = el.dataset.hud;
      if(k === 'utc') el.textContent = utc;
      if(k === 'lat') el.textContent = (lat >= 0 ? '+' : '') + lat + '°';
      if(k === 'lon') el.textContent = (lon >= 0 ? '+' : '') + lon + '°';
      if(k === 'sat'){
        const ids = ['RONIUM-X34','RONIUM-X40','RONIUM-X31','RONIUM-X22','RONIUM-X17'];
        el.textContent = ids[Math.floor(now.getTime()/2000) % ids.length];
      }
    });
  }
  setInterval(tickHud, 500);
  tickHud();

  // ── Custom cursor ───────────────────────────────────────
  const cur = document.createElement('div');
  cur.className = 'cursor';
  document.body.appendChild(cur);
  const style = document.createElement('style');
  style.textContent = `
    .cursor{position:fixed; top:0; left:0; z-index:100; width:28px; height:28px;
      border:1px solid #4cc9f0; border-radius:50%; pointer-events:none;
      transform:translate(-50%,-50%); transition:width .2s, height .2s, background .2s, border-color .2s;
      mix-blend-mode:difference; opacity:0}
    .cursor.on{opacity:1}
    .cursor.big{width:56px; height:56px; background:rgba(76,201,240,.2)}
    .cursor::after{content:""; position:absolute; left:50%; top:50%; width:2px; height:2px; background:#4cc9f0; transform:translate(-50%,-50%); border-radius:50%}
    @media (hover: none){ .cursor{display:none} }
  `;
  document.head.appendChild(style);
  let cx = 0, cy = 0, tx = 0, ty = 0;
  window.addEventListener('pointermove', (e)=>{
    tx = e.clientX; ty = e.clientY;
    cur.classList.add('on');
  });
  window.addEventListener('pointerleave', ()=> cur.classList.remove('on'));
  document.querySelectorAll('a, button, .cap, .compare-tile, .reco').forEach(el=>{
    el.addEventListener('pointerenter', ()=> cur.classList.add('big'));
    el.addEventListener('pointerleave', ()=> cur.classList.remove('big'));
  });
  function tickCur(){
    cx += (tx - cx) * 0.22;
    cy += (ty - cy) * 0.22;
    cur.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
    requestAnimationFrame(tickCur);
  }
  tickCur();

  // ── Nav hide/show on scroll ─────────────────────────────
  const nav = document.querySelector('.nav');
  let lastY = 0;
  window.addEventListener('scroll', ()=>{
    const y = window.scrollY;
    if(nav){
      if(y > 80 && y > lastY){ nav.style.transform='translateY(-100%)'; }
      else { nav.style.transform='translateY(0)'; }
    }
    lastY = y;
  });
  if(nav) nav.style.transition = 'transform .3s cubic-bezier(.7,0,.2,1)';

  // ── Scramble text on hover for links ────────────────────
  const scrambleChars = "!<>-_\\/[]{}—=+*^?#________";
  function scramble(el, target){
    let start = el.textContent;
    const from = start;
    const to = target;
    const len = Math.max(from.length, to.length);
    let frame = 0;
    const queue = [];
    for(let i=0;i<len;i++){
      const f = from[i] || '';
      const t = to[i] || '';
      const startAt = Math.floor(Math.random()*20);
      const endAt = startAt + Math.floor(Math.random()*20);
      queue.push({f,t,startAt,endAt,char:''});
    }
    function update(){
      let out = '', done=0;
      for(let i=0;i<queue.length;i++){
        const q = queue[i];
        if(frame >= q.endAt){ done++; out += q.t; }
        else if(frame >= q.startAt){
          if(!q.char || Math.random()<.28) q.char = scrambleChars[Math.floor(Math.random()*scrambleChars.length)];
          out += q.char;
        } else { out += q.f; }
      }
      el.textContent = out;
      if(done < queue.length){ frame++; requestAnimationFrame(update); }
    }
    update();
  }
  document.querySelectorAll('[data-scramble]').forEach(el => {
    const orig = el.textContent;
    el.addEventListener('pointerenter', ()=> !window.roniumMotionPaused && scramble(el, orig));
  });

  // ── Progress rail on right side ─────────────────────────
  const prog = document.createElement('div');
  prog.className = 'scroll-progress';
  prog.innerHTML = `<div class="track"><div class="bar"></div></div><div class="lab"><span data-pct>00</span>%</div>`;
  document.body.appendChild(prog);
  const ps = document.createElement('style');
  ps.textContent = `
    .scroll-progress{position:fixed; right:24px; top:50%; transform:translateY(-50%); z-index:40;
      display:flex; flex-direction:column; align-items:center; gap:12px; pointer-events:none}
    .scroll-progress .track{width:1px; height:200px; background:rgba(230,232,230,.15); position:relative}
    .scroll-progress .bar{position:absolute; top:0; left:-1px; width:3px; background:#4cc9f0; height:0%}
    .scroll-progress .lab{font-family:"JetBrains Mono",monospace; font-size:10px; letter-spacing:.15em; color:#9aa0a6}
    @media (max-width:960px){ .scroll-progress{display:none} }
  `;
  document.head.appendChild(ps);
  const bar = prog.querySelector('.bar');
  const pctEl = prog.querySelector('[data-pct]');
  window.addEventListener('scroll', ()=>{
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = Math.min(100, Math.max(0, (window.scrollY / h) * 100));
    bar.style.height = p + '%';
    pctEl.textContent = String(Math.floor(p)).padStart(2,'0');
  });
})();
