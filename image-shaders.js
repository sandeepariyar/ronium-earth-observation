/* RONIUM / EARTH — Designed and developed by Sandeep Pariyar. © 2026. */
// Transparent WebGL light overlays, limited to two editorial images.
const targets=[document.querySelector('.compare-tile:nth-child(2)'),document.querySelector('.case-hero')].filter(Boolean);
for(const [index,host] of targets.entries()){
 const canvas=document.createElement('canvas');canvas.className='image-shader';canvas.setAttribute('aria-hidden','true');host.append(canvas);
 const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:false});if(!gl){canvas.remove();continue;}
 const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s};
 const vertex=compile(gl.VERTEX_SHADER,'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}');
 const fragment=compile(gl.FRAGMENT_SHADER,`precision mediump float;
 uniform vec2 resolution;uniform float time;uniform float mode;
 void main(){vec2 uv=gl_FragCoord.xy/resolution;
 float scan=exp(-pow((uv.x-fract(time*.09))/0.018,2.));
 float contours=pow(.5+.5*sin(uv.x*38.+uv.y*26.+sin(uv.y*17.+time*.22)*2.),22.);
 float mask=smoothstep(.0,.16,uv.y)*smoothstep(1.,.82,uv.y);
 float a=mix(scan*.19,contours*.075,mode)*mask;
 gl_FragColor=vec4(.25,.86,.95,a);}`);
 const program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS)){canvas.remove();continue;}gl.useProgram(program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 const p=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0);
 const res=gl.getUniformLocation(program,'resolution'),time=gl.getUniformLocation(program,'time');gl.uniform1f(gl.getUniformLocation(program,'mode'),index);
 let visible=false,frame=0,t=0,last=0;
 const size=()=>{canvas.width=Math.round(host.clientWidth);canvas.height=Math.round(host.clientHeight);gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(res,canvas.width,canvas.height)};new ResizeObserver(size).observe(host);size();
 function draw(now){frame=0;if(!visible||document.hidden||window.roniumMotionPaused){last=0;return;}
   t+=last?Math.min(now-last,50)/1000:0;last=now;
   // The animated GIF supplies the scan when playing; avoid doubling it.
   canvas.style.opacity=host.querySelector('img')?.getAttribute('src')?.endsWith('.gif')?'0':'1';
   gl.uniform1f(time,t);gl.drawArrays(gl.TRIANGLES,0,6);frame=requestAnimationFrame(draw);
 }
 const start=()=>{if(visible&&!frame&&!window.roniumMotionPaused)frame=requestAnimationFrame(draw)};
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else{cancelAnimationFrame(frame);frame=0;last=0;}},{threshold:.05}).observe(host);
 addEventListener('ronium-motion-change',start);document.addEventListener('visibilitychange',start);
}
