/* RONIUM / EARTH — Designed and developed by Sandeep Pariyar. © 2026. */
import React,{useEffect,useRef} from 'react';
import * as THREE from 'three';
import {orbitPoint} from './orbits';

export default function Globe({active=true,selected='eu'}) {
 const mount=useRef(null);
 useEffect(()=>{
  const host=mount.current; if(!host) return;
  let width=host.clientWidth||600,height=host.clientHeight||600;
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6)); renderer.setSize(width,height);renderer.outputColorSpace=THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(42,width/height,.1,100);camera.position.set(0,0,6.25);
  scene.add(new THREE.AmbientLight(0x3c5b71,2));
  const key=new THREE.DirectionalLight(0x78d9ee,3.5);key.position.set(4,2,5);scene.add(key);
  const back=new THREE.DirectionalLight(0x2461ad,2);back.position.set(-4,-2,-3);scene.add(back);
  const group=new THREE.Group();scene.add(group);
  const mat=new THREE.MeshStandardMaterial({color:0x143147,roughness:0.85,metalness:0.24,wireframe:false});
  const globe=new THREE.Mesh(new THREE.SphereGeometry(1.65,64,48),mat);group.add(globe);
  const wire=new THREE.Mesh(new THREE.SphereGeometry(1.665,48,28),new THREE.MeshBasicMaterial({color:0x25566f,wireframe:true,transparent:true,opacity:0.21}));group.add(wire);
  const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(1.75,48,32),new THREE.MeshBasicMaterial({color:0x2bbbd0,transparent:true,opacity:0.07,side:THREE.BackSide}));group.add(atmosphere);
  const arcs=[];
  for(let i=0;i<3;i++){
   const pts=[]; for(let j=0;j<=240;j++){const p=orbitPoint(j/240*Math.PI*2,i*1.4,2.06,0.35+i*0.22);pts.push(new THREE.Vector3(...p));}
   const path=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:i===0?0x68e4ed:0x2d7387,transparent:true,opacity:i===0?0.75:0.35})); group.add(path);arcs.push(path);
  }
  const sats=[];
  for(let i=0;i<3;i++) {const node=new THREE.Mesh(new THREE.OctahedronGeometry(i===0?.069:.042),new THREE.MeshBasicMaterial({color:i===0?0xb5fcff:0x55a9b8}));group.add(node);sats.push(node);}
  let frame=0,raf=0, visible=true; const clock=new THREE.Clock();
  const draw=()=>{if(!visible)return;raf=requestAnimationFrame(draw);if(active&&!(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)){group.rotation.y+=0.0008;}
  const t=clock.getElapsedTime();sats.forEach((s,i)=>s.position.set(...orbitPoint(t*.12+i*2,i*1.4,2.06,.35+i*.22)));
  renderer.render(scene,camera);frame++;};
  const resize=()=>{width=host.clientWidth||600;height=host.clientHeight||600;camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height)};
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)draw();else cancelAnimationFrame(raf)});observer.observe(host);
  const ro=new ResizeObserver(resize);ro.observe(host);draw();
  return ()=>{observer.disconnect();ro.disconnect();cancelAnimationFrame(raf);group.traverse(o=>{o.geometry?.dispose();if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}});renderer.dispose();if(host.contains(renderer.domElement))host.removeChild(renderer.domElement);};
 },[active]);
 return <div ref={mount} className="globe-canvas" role="img" aria-label="Animated illustrative 3D Earth with three simulated orbit paths; not live satellite tracking"/>;
}
