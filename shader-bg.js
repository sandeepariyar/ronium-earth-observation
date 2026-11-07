/* RONIUM / EARTH — Designed and developed by Sandeep Pariyar. © 2026. */
/* WebGL shader background — subtle noise field + radial scan */
(function(){
  const container = document.getElementById('shader-bg');
  if(!container) return;

  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  container.appendChild(canvas);

  const gl = canvas.getContext('webgl', { antialias:true, premultipliedAlpha:false });
  if(!gl){ container.style.background = '#06090d'; return; }

  const vsrc = `
    attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }
  `;
  const fsrc = `
    precision highp float;
    uniform vec2 uRes;
    uniform float uTime;
    uniform vec2 uMouse;

    // hash + noise
    float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
    float noise(vec2 p){
      vec2 i = floor(p); vec2 f = fract(p);
      float a = hash(i);
      float b = hash(i+vec2(1.0,0.0));
      float c = hash(i+vec2(0.0,1.0));
      float d = hash(i+vec2(1.0,1.0));
      vec2 u = f*f*(3.0-2.0*f);
      return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
    }
    float fbm(vec2 p){
      float v=0.0; float a=0.5;
      for(int i=0;i<5;i++){ v += a*noise(p); p *= 2.0; a *= 0.5; }
      return v;
    }

    void main(){
      vec2 uv = gl_FragCoord.xy / uRes.xy;
      vec2 p = uv - 0.5;
      p.x *= uRes.x/uRes.y;

      // slow drifting noise
      float n = fbm(p*2.4 + vec2(uTime*0.05, uTime*0.03));

      // radial pulse originating from mouse
      vec2 mo = uMouse - vec2(0.5, 0.5);
      mo.x *= uRes.x/uRes.y;
      float d = length(p - mo);
      float pulse = sin(d*22.0 - uTime*1.6) * 0.5 + 0.5;
      pulse *= smoothstep(0.9, 0.0, d);

      // scan line
      float scan = smoothstep(0.0, 0.02, abs(mod(uv.y + uTime*0.06, 1.0) - 0.5));
      scan = 1.0 - scan;

      // colors
      vec3 bg = vec3(0.024, 0.035, 0.05);
      vec3 sig = vec3(0.30, 0.79, 0.94); // #4cc9f0
      vec3 rad = vec3(0.49, 1.0, 0.42);  // #7cff6b

      vec3 col = bg;
      col += n * 0.08;
      col += pulse * sig * 0.14;
      col += scan * sig * 0.02;

      // vignette
      float vig = smoothstep(1.1, 0.2, length(uv - 0.5));
      col *= vig;

      // subtle grain
      col += (hash(gl_FragCoord.xy + uTime*17.0) - 0.5) * 0.012;

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function compile(type, src){
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){ console.error(gl.getShaderInfoLog(s)); }
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsrc));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fsrc));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1,  -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, 'uRes');
  const uTime = gl.getUniformLocation(prog, 'uTime');
  const uMouse = gl.getUniformLocation(prog, 'uMouse');

  let mouseX = 0.5, mouseY = 0.5;
  window.addEventListener('pointermove', (e)=>{
    mouseX = e.clientX / window.innerWidth;
    mouseY = 1.0 - (e.clientY / window.innerHeight);
  });

  function resize(){
    const dpr = Math.min(window.devicePixelRatio, 1.5);
    canvas.width = container.clientWidth * dpr;
    canvas.height = container.clientHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  const t0 = performance.now();
  let motionTime=0, lastFrame=performance.now();
  function tick(){
    const now=performance.now();if(!window.roniumMotionPaused)motionTime+=Math.min(now-lastFrame,50);lastFrame=now;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, motionTime/1000);
    gl.uniform2f(uMouse, mouseX, mouseY);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(tick);
  }
  tick();
})();
