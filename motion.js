/* RONIUM / EARTH — Designed and developed by Sandeep Pariyar. © 2026. */
// Scroll updates are batched into a single frame; no wheel interception.
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const pause = document.createElement('button');
pause.className='motion-toggle'; pause.type='button';
pause.textContent='Pause motion'; pause.setAttribute('aria-pressed','false');
document.body.append(pause);
let paused=false;
const loops=[...document.querySelectorAll('[data-loop]')];
const visibleLoops=new Set();
const syncLoops=()=>loops.forEach(img=>{const next=!window.roniumMotionPaused&&img.dataset.paused!=='true'&&visibleLoops.has(img)?img.dataset.loop:img.dataset.still;if(img.getAttribute('src')!==next)img.src=next});
loops.forEach(img=>{const button=document.createElement('button');button.type='button';button.className='loop-toggle';button.textContent='Pause GIF';button.setAttribute('aria-pressed','false');img.parentElement.append(button);button.onclick=()=>{const stopped=img.dataset.paused!=='true';img.dataset.paused=String(stopped);button.textContent=stopped?'Play GIF':'Pause GIF';button.setAttribute('aria-pressed',String(stopped));syncLoops()}});
new IntersectionObserver(entries=>{entries.forEach(e=>e.isIntersecting?visibleLoops.add(e.target):visibleLoops.delete(e.target));syncLoops()},{threshold:.1}).observe(document.querySelector('[data-loop]')||document.querySelector('.compare-tile img'));
const sync=()=>{
  window.roniumMotionPaused=paused||reduce.matches;
  document.documentElement.classList.toggle('motion-off',window.roniumMotionPaused);
  pause.textContent=window.roniumMotionPaused?'Enable motion':'Pause motion';
  pause.setAttribute('aria-pressed',String(window.roniumMotionPaused));
  syncLoops();
  dispatchEvent(new Event('ronium-motion-change'));
  schedule();
};
pause.onclick=()=>{paused=!window.roniumMotionPaused;if(reduce.matches&&!paused){pause.textContent='Reduced motion enabled';return;}sync()};
reduce.addEventListener('change',sync);
const hero=document.querySelector('.hero');
const pictures=[...document.querySelectorAll('.compare-tile,.image-row .cell,.case-hero,.console-preview')];
const stage=document.querySelector('.constellation-stage');
const facts=[...document.querySelectorAll('.case-fact')];
const story=document.querySelector('.case');
const storyLabel=document.createElement('div');storyLabel.className='story-phase';storyLabel.textContent='01 / CONTEXT';
document.querySelector('.case-hero').append(storyLabel);
facts.forEach((el,i)=>{el.dataset.phase=['Context','Signal','Interpretation'][i]});
document.querySelectorAll('.chapter-head h2,.chapter-head .chapter-lede,.num,.footer-cell').forEach((el,i)=>{
  el.classList.add('motion-entry');el.style.setProperty('--entry-delay',`${i%2*100}ms`);
});
const entrance=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{
  if(isIntersecting){target.classList.add('entered');entrance.unobserve(target)}
}),{threshold:.12});
document.querySelectorAll('.motion-entry,.constellation-stage').forEach(el=>entrance.observe(el));
const clamp=(x)=>Math.max(0,Math.min(1,x));
let frame=0;
function schedule(){if(!frame)frame=requestAnimationFrame(update)}
function update(){
  frame=0;const off=window.roniumMotionPaused;const vh=innerHeight;
  const r=hero.getBoundingClientRect();const p=off?0:clamp(-r.top/r.height);
  hero.style.setProperty('--hero-rise',`${p*-100}px`);
  hero.style.setProperty('--hero-scale',String(1-p*.16));
  hero.style.setProperty('--hero-fade',String(1-p*.85));
  for(const el of pictures){const b=el.getBoundingClientRect();if(b.bottom<0||b.top>vh)continue;
    const depth=off?0:(clamp((vh-b.top)/(vh+b.height))-.5)*38;
    el.style.setProperty('--image-y',`${depth}px`);
  }
  const b=stage.getBoundingClientRect();window.roniumConstellationProgress=off?1:clamp((vh-b.top)/(vh*.8));
  const s=story.getBoundingClientRect();const phase=off?0:Math.min(2,Math.floor(clamp((vh*.45-s.top)/(s.height-vh*.45))*3));
  storyLabel.textContent=['01 / CONTEXT','02 / SIGNAL','03 / INTERPRETATION'][phase];
  facts.forEach((el,i)=>el.classList.toggle('current',i===phase));
}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);sync();
