/* RONIUM / EARTH — Designed and developed by Sandeep Pariyar. © 2026. */
/* Interactive constellation canvas — 48 nodes with orbital arcs + hover callouts */
(function(){
  const canvas = document.getElementById('constellation-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio, 2);

  let W, H, cx, cy, R;
  function resize(){
    const rect = canvas.parentElement.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W+'px'; canvas.style.height = H+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    cx = W/2; cy = H/2; R = Math.min(W,H) * 0.32;
  }
  resize();
  window.addEventListener('resize', resize);

  // Build fake global constellation of 48 nodes on 6 orbital planes
  const planes = 6;
  const perPlane = 8;
  const nodes = [];
  const ids = ["FI","US","JP","AU","BR","PT","DE","AE","NO","KR","ZA","UK","CA","IN","IT","MX"];
  let idx = 0;
  for(let p=0;p<planes;p++){
    const tilt = (p/planes) * Math.PI * 2;
    const wobble = (Math.sin(p*1.7)*0.15);
    for(let i=0;i<perPlane;i++){
      nodes.push({
        plane:p,
        angle: (i/perPlane)*Math.PI*2 + Math.random()*0.2,
        speed: 0.06 + p*0.008 + Math.random()*0.02,
        tilt, wobble,
        id: ids[idx%ids.length] + "-" + String(idx+1).padStart(2,'0'),
        active: Math.random() > 0.55,
      });
      idx++;
    }
  }
  const totalSats = nodes.length;

  let mouse = {x:-999, y:-999, over:null};
  canvas.addEventListener('pointermove', (e)=>{
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  canvas.addEventListener('pointerleave', ()=>{ mouse.x=-999; mouse.y=-999; mouse.over=null; });

  const startT = performance.now();

  function drawBackground(){
    ctx.clearRect(0,0,W,H);

    // radial grid rings
    ctx.strokeStyle = 'rgba(230,232,230,0.06)';
    ctx.lineWidth = 1;
    for(let i=1;i<=5;i++){
      ctx.beginPath();
      ctx.arc(cx, cy, (R*1.4) * (i/5), 0, Math.PI*2);
      ctx.stroke();
    }

    // crosshairs
    ctx.beginPath();
    ctx.moveTo(cx-R*1.5, cy); ctx.lineTo(cx+R*1.5, cy);
    ctx.moveTo(cx, cy-R*1.5); ctx.lineTo(cx, cy+R*1.5);
    ctx.stroke();

    // angular ticks
    ctx.fillStyle = 'rgba(230,232,230,0.35)';
    ctx.font = '10px "JetBrains Mono", monospace';
    for(let a=0; a<360; a+=15){
      const rad = a*Math.PI/180;
      const x1 = cx + Math.cos(rad) * (R*1.4);
      const y1 = cy + Math.sin(rad) * (R*1.4);
      const x2 = cx + Math.cos(rad) * (R*1.42);
      const y2 = cy + Math.sin(rad) * (R*1.42);
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      if(a%45===0){
        const tx = cx + Math.cos(rad) * (R*1.5);
        const ty = cy + Math.sin(rad) * (R*1.5);
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(String(a).padStart(3,'0'), tx, ty);
      }
    }

    // earth silhouette (dot cluster in center)
    const earthR = R * 0.72;
    // stipple ring
    ctx.fillStyle = 'rgba(76,201,240,0.5)';
    for(let i=0; i<420; i++){
      const a = (i/420)*Math.PI*2;
      const r = earthR * (0.98 + Math.sin(a*7 + performance.now()*0.0005)*0.008);
      const x = cx + Math.cos(a)*r;
      const y = cy + Math.sin(a)*r;
      ctx.fillRect(x, y, 1.4, 1.4);
    }
    // inner dot noise
    ctx.fillStyle = 'rgba(230,232,230,0.14)';
    for(let i=0;i<340;i++){
      const a = Math.random()*Math.PI*2;
      const rr = Math.sqrt(Math.random()) * earthR * 0.9;
      const x = cx + Math.cos(a)*rr;
      const y = cy + Math.sin(a)*rr;
      ctx.fillRect(x,y,1,1);
    }

    // scanning sweep
    const t = motionTime/1000;
    const sweepA = (t*0.6) % (Math.PI*2);
    const grad = ctx.createRadialGradient(cx,cy, earthR*0.2, cx,cy, R*1.4);
    grad.addColorStop(0, 'rgba(76,201,240,0)');
    grad.addColorStop(1, 'rgba(76,201,240,0)');
    ctx.save();
    ctx.translate(cx,cy);
    ctx.rotate(sweepA);
    const wedge = ctx.createLinearGradient(0,0, R*1.4, 0);
    wedge.addColorStop(0, 'rgba(76,201,240,0)');
    wedge.addColorStop(0.6, 'rgba(76,201,240,0.05)');
    wedge.addColorStop(0.98, 'rgba(76,201,240,0.28)');
    wedge.addColorStop(1, 'rgba(76,201,240,0)');
    ctx.fillStyle = wedge;
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.arc(0,0, R*1.4, -0.25, 0.02);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawOrbits(t){
    ctx.strokeStyle = 'rgba(76,201,240,0.14)';
    ctx.lineWidth = 1;
    for(let p=0;p<planes;p++){
      const rr = R * (0.95 + p*0.09);
      const tilt = (p/planes)*Math.PI*2;
      ctx.beginPath();
      for(let i=0;i<=120*(window.roniumConstellationProgress??1);i++){
        const a = (i/120)*Math.PI*2;
        // parametric ellipse tilted
        const x = Math.cos(a)*rr;
        const y = Math.sin(a)*rr* (0.28 + 0.72*Math.abs(Math.sin(tilt)));
        // rotate
        const c = Math.cos(tilt), s = Math.sin(tilt);
        const px = cx + x*c - y*s;
        const py = cy + x*s + y*c;
        if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
      }
      ctx.stroke();
    }
  }

  function drawSats(t){
    mouse.over = null;
    let bestD = 14;
    for(const n of nodes.slice(0,Math.ceil(nodes.length*(window.roniumConstellationProgress??1)))){
      const rr = R * (0.95 + n.plane*0.09);
      const a = n.angle + t*n.speed;
      const x = Math.cos(a)*rr;
      const y = Math.sin(a)*rr*(0.28 + 0.72*Math.abs(Math.sin(n.tilt)));
      const c = Math.cos(n.tilt), s = Math.sin(n.tilt);
      const px = cx + x*c - y*s;
      const py = cy + x*s + y*c;
      n._x = px; n._y = py;

      const d = Math.hypot(px - mouse.x, py - mouse.y);
      if(d < bestD){ bestD = d; mouse.over = n; }

      const color = n.active ? '#4cc9f0' : '#7cff6b';
      const glowColor = n.active ? 'rgba(76,201,240,0.35)' : 'rgba(124,255,107,0.35)';
      // glow
      ctx.fillStyle = glowColor;
      ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(px, py, 2.2, 0, Math.PI*2); ctx.fill();

      // trail line
      const back = 0.15;
      const a2 = a - back;
      const x2 = Math.cos(a2)*rr;
      const y2 = Math.sin(a2)*rr*(0.28 + 0.72*Math.abs(Math.sin(n.tilt)));
      const px2 = cx + x2*c - y2*s;
      const py2 = cy + x2*s + y2*c;
      const gg = ctx.createLinearGradient(px2,py2,px,py);
      gg.addColorStop(0, 'rgba(76,201,240,0)');
      gg.addColorStop(1, n.active ? 'rgba(76,201,240,0.4)' : 'rgba(124,255,107,0.4)');
      ctx.strokeStyle = gg; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(px2,py2); ctx.lineTo(px,py); ctx.stroke();
    }

    // hover callout
    if(mouse.over){
      const n = mouse.over;
      ctx.strokeStyle = '#4cc9f0'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(n._x, n._y, 12, 0, Math.PI*2); ctx.stroke();

      // label
      const lx = n._x + 20, ly = n._y - 8;
      ctx.fillStyle = 'rgba(6,9,13,0.85)';
      ctx.strokeStyle = '#4cc9f0';
      ctx.fillRect(lx, ly - 14, 150, 44);
      ctx.strokeRect(lx, ly - 14, 150, 44);
      ctx.fillStyle = '#4cc9f0';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText('◇ ' + n.id, lx + 8, ly);
      ctx.fillStyle = '#edeae1';
      ctx.fillText('ALT 570km · INCL '+(45+n.plane*8)+'°', lx + 8, ly + 14);
      ctx.fillStyle = n.active ? '#4cc9f0' : '#7cff6b';
      ctx.fillText(n.active ? '● TASKING' : '● IDLE', lx + 8, ly + 26);
    }
  }

  let motionTime=0, lastFrame=performance.now();
  function tick(){
    const now=performance.now();if(!window.roniumMotionPaused)motionTime+=Math.min(now-lastFrame,50);lastFrame=now;
    const t = (performance.now() - startT)/1000;
    drawBackground();
    drawOrbits(t);
    drawSats(t);
    requestAnimationFrame(tick);
  }
  tick();
})();
