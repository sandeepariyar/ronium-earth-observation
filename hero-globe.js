/* RONIUM / EARTH — Designed and developed by Sandeep Pariyar. © 2026. */
/* Hero globe — Three.js wireframe globe + dot points + orbital rings + satellites */
(function(){
  const container = document.getElementById('hero-canvas');
  if(!container || !window.THREE) return;

  const THREE = window.THREE;
  let W = container.clientWidth, H = container.clientHeight;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x06090d, 0.06);

  const camera = new THREE.PerspectiveCamera(38, W/H, 0.1, 100);
  camera.position.set(0, 1.6, 10);
  camera.lookAt(0, 0.4, 0);

  const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // ── group that holds the globe and rotates
  const globe = new THREE.Group();
  scene.add(globe);
  globe.position.y = -0.4;

  const R = 2.6;

  // wireframe sphere (fine icosahedron)
  const wireGeo = new THREE.IcosahedronGeometry(R, 6);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x4cc9f0, wireframe: true, transparent:true, opacity:0.12
  });
  const wire = new THREE.Mesh(wireGeo, wireMat);
  globe.add(wire);

  // solid dark inner sphere so the wireframe reads as a hemisphere
  const innerGeo = new THREE.SphereGeometry(R * 0.99, 64, 64);
  const innerMat = new THREE.MeshBasicMaterial({ color: 0x080c11 });
  const inner = new THREE.Mesh(innerGeo, innerMat);
  globe.add(inner);

  // dotted surface (fibonacci sphere)
  const N = 2200;
  const dotPos = new Float32Array(N * 3);
  const dotColor = new Float32Array(N * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const col1 = new THREE.Color(0x4cc9f0);
  const col2 = new THREE.Color(0x7cffea);
  for(let i=0;i<N;i++){
    const y = 1 - (i / (N-1)) * 2;
    const r = Math.sqrt(1 - y*y);
    const th = golden * i;
    const x = Math.cos(th) * r;
    const z = Math.sin(th) * r;
    const rr = R * 1.005;
    dotPos[i*3] = x * rr;
    dotPos[i*3+1] = y * rr;
    dotPos[i*3+2] = z * rr;
    const c = Math.random() > 0.9 ? col2 : col1;
    dotColor[i*3] = c.r; dotColor[i*3+1] = c.g; dotColor[i*3+2] = c.b;
  }
  const dotsGeo = new THREE.BufferGeometry();
  dotsGeo.setAttribute('position', new THREE.BufferAttribute(dotPos, 3));
  dotsGeo.setAttribute('color', new THREE.BufferAttribute(dotColor, 3));
  const dotsMat = new THREE.PointsMaterial({
    size: 0.028, sizeAttenuation:true, vertexColors:true, transparent:true, opacity:.9, depthWrite:false
  });
  const dots = new THREE.Points(dotsGeo, dotsMat);
  globe.add(dots);

  // Land continents — highlight dots using simple lat/lon boxes to feel like continents
  // (Approximate blocks — enough to read as "earth" without a real texture.)
  const landMasks = [
    // [latMin,latMax,lonMin,lonMax]
    [-35, 72,  -12, 45],   // Africa + Europe
    [ 8,  72,   45, 145],  // Asia
    [-45,-10,  110,155],   // Australia
    [-56, 12, -82,-35],    // S America
    [ 15, 72, -168,-52],   // N America
    [-90,-60, -180,180],   // Antarctica hint
  ];
  const inLand = (lat, lon) => landMasks.some(([a,b,c,d]) => lat>=a && lat<=b && lon>=c && lon<=d);
  const landDotsPos = [];
  for(let i=0;i<8000;i++){
    // uniform sphere sample
    const u = Math.random(), v = Math.random();
    const theta = 2*Math.PI*u;
    const phi = Math.acos(2*v - 1);
    const lat = 90 - (phi * 180/Math.PI);
    const lon = (theta*180/Math.PI) - 180;
    if(!inLand(lat, lon)) continue;
    const x = Math.sin(phi)*Math.cos(theta);
    const y = Math.cos(phi);
    const z = Math.sin(phi)*Math.sin(theta);
    const rr = R * 1.008;
    landDotsPos.push(x*rr, y*rr, z*rr);
  }
  const landGeo = new THREE.BufferGeometry();
  landGeo.setAttribute('position', new THREE.Float32BufferAttribute(landDotsPos, 3));
  const landMat = new THREE.PointsMaterial({
    color: 0xedeae1, size: 0.032, sizeAttenuation:true, transparent:true, opacity:.9, depthWrite:false
  });
  const landDots = new THREE.Points(landGeo, landMat);
  globe.add(landDots);

  // equator ring
  const eqGeo = new THREE.RingGeometry(R*1.02, R*1.022, 128);
  const eqMat = new THREE.MeshBasicMaterial({ color:0x4cc9f0, side:THREE.DoubleSide, transparent:true, opacity:.35 });
  const eq = new THREE.Mesh(eqGeo, eqMat);
  eq.rotation.x = Math.PI/2;
  globe.add(eq);

  // meridians (longitude circles)
  for(let i=0;i<6;i++){
    const m = new THREE.Mesh(
      new THREE.RingGeometry(R*1.005, R*1.007, 128),
      new THREE.MeshBasicMaterial({color:0x4cc9f0, side:THREE.DoubleSide, transparent:true, opacity:.09})
    );
    m.rotation.y = (i/6) * Math.PI;
    globe.add(m);
  }

  // Orbits + satellites
  const orbitGroup = new THREE.Group();
  scene.add(orbitGroup);
  orbitGroup.position.copy(globe.position);

  function makeOrbit(radius, tiltX, tiltZ, color, satCount){
    const seg = 256;
    const pts = [];
    for(let i=0;i<=seg;i++){
      const t = (i/seg) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(t)*radius, 0, Math.sin(t)*radius));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color, transparent:true, opacity:.35 });
    const line = new THREE.Line(geo, mat);
    line.rotation.x = tiltX;
    line.rotation.z = tiltZ;
    orbitGroup.add(line);

    const sats = [];
    const satGeo = new THREE.SphereGeometry(0.05, 12, 12);
    const satMat = new THREE.MeshBasicMaterial({ color });
    for(let i=0;i<satCount;i++){
      const s = new THREE.Mesh(satGeo, satMat);
      const glowGeo = new THREE.SphereGeometry(0.12, 12, 12);
      const glowMat = new THREE.MeshBasicMaterial({ color, transparent:true, opacity:.28, depthWrite:false });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      s.add(glow);
      s.userData = { radius, tiltX, tiltZ, phase: (i/satCount)*Math.PI*2 + Math.random()*0.4 };
      orbitGroup.add(s);
      sats.push(s);
    }
    return sats;
  }
  const satsA = makeOrbit(R*1.6, 0.6, 0.2, 0x4cc9f0, 5);
  const satsB = makeOrbit(R*1.85, -0.4, 0.9, 0x7cffea, 4);
  const satsC = makeOrbit(R*2.1, 1.1, -0.3, 0x7cff6b, 3);
  const allSats = [...satsA, ...satsB, ...satsC];

  // scanning arc that sweeps around
  const arcGroup = new THREE.Group();
  globe.add(arcGroup);
  const arcMat = new THREE.MeshBasicMaterial({ color:0x4cc9f0, transparent:true, opacity:.14, side:THREE.DoubleSide, depthWrite:false });
  const arcGeo = new THREE.CircleGeometry(R*1.01, 64, 0, Math.PI*0.35);
  const arc = new THREE.Mesh(arcGeo, arcMat);
  arc.rotation.x = Math.PI/2;
  arcGroup.add(arc);

  // ambient stars
  const starN = 800;
  const starPos = new Float32Array(starN * 3);
  for(let i=0;i<starN;i++){
    const r = 40 + Math.random()*20;
    const u = Math.random(), v = Math.random();
    const theta = 2*Math.PI*u;
    const phi = Math.acos(2*v - 1);
    starPos[i*3]   = r*Math.sin(phi)*Math.cos(theta);
    starPos[i*3+1] = r*Math.cos(phi);
    starPos[i*3+2] = r*Math.sin(phi)*Math.sin(theta);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({ color:0xedeae1, size:0.06, transparent:true, opacity:.6, depthWrite:false });
  scene.add(new THREE.Points(starGeo, starMat));

  // mouse parallax
  let targetX = 0, targetY = 0, curX = 0, curY = 0;
  window.addEventListener('pointermove', (e) => {
    const nx = (e.clientX / window.innerWidth) - 0.5;
    const ny = (e.clientY / window.innerHeight) - 0.5;
    targetX = window.roniumMotionPaused?0:nx * 0.6;
    targetY = window.roniumMotionPaused?0:ny * 0.3;
  });

  // resize
  window.addEventListener('resize', () => {
    W = container.clientWidth; H = container.clientHeight;
    camera.aspect = W/H; camera.updateProjectionMatrix();
    renderer.setSize(W, H);
  });

  const drag = document.querySelector('.globe-drag');
  let dragX=0,dragY=0,pressed=false,px=0,py=0,lastRelease=0,spin=0,lastTime=performance.now();
  drag.addEventListener('pointerdown',e=>{pressed=true;px=e.clientX;py=e.clientY;drag.setPointerCapture(e.pointerId)});
  drag.addEventListener('pointermove',e=>{if(!pressed)return;dragX+=(e.clientX-px)*.008;dragY=Math.max(-.7,Math.min(.7,dragY+(e.clientY-py)*.005));px=e.clientX;py=e.clientY});
  const release=()=>{pressed=false;lastRelease=performance.now()};
  drag.addEventListener('pointerup',release);drag.addEventListener('pointercancel',release);
  drag.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')dragX-=.15;if(e.key==='ArrowRight')dragX+=.15;if(e.key==='ArrowUp')dragY-=.1;if(e.key==='ArrowDown')dragY+=.1;lastRelease=performance.now()});
  // animation
  const clock = new THREE.Clock();
  function tick(){
    const now=performance.now(), dt=Math.min((now-lastTime)/1000,.05);lastTime=now;
    const off=window.roniumMotionPaused;
    if(!off)spin+=dt;
    const t = spin;

    // globe rotation
    if(!pressed&&!off&&now-lastRelease>1800)dragX+=dt*.07;
    globe.rotation.y = dragX;
    globe.rotation.x = dragY + (off?0:Math.sin(t*0.15)*.08);

    // arc sweep
    arcGroup.rotation.y = t * 0.9;

    // satellites orbit
    for(const s of allSats){
      const {radius, tiltX, tiltZ, phase} = s.userData;
      const a = t*0.35 + phase;
      const x = Math.cos(a) * radius;
      const z = Math.sin(a) * radius;
      // apply rotation
      const cX = Math.cos(tiltX), sX = Math.sin(tiltX);
      const cZ = Math.cos(tiltZ), sZ = Math.sin(tiltZ);
      let X = x, Y = 0, Z = z;
      // rotate X axis
      const yTmp = Y*cX - Z*sX;
      const zTmp = Y*sX + Z*cX;
      Y = yTmp; Z = zTmp;
      // rotate Z axis
      const xTmp = X*cZ - Y*sZ;
      const yTmp2 = X*sZ + Y*cZ;
      X = xTmp; Y = yTmp2;
      s.position.set(X, Y, Z);
    }

    // parallax
    curX += (targetX - curX) * 0.05;
    curY += (targetY - curY) * 0.05;
    camera.position.x = curX * 1.4;
    camera.position.y = 1.6 + curY * -1.2;
    camera.lookAt(0, -0.2, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
})();
