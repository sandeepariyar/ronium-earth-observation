/* RONIUM / EARTH — Designed and developed by Sandeep Pariyar. © 2026. */
import './motion.js';
import './image-shaders.js';
import * as THREE from 'three';
window.THREE=THREE;
for(const load of [()=>import('./shader-bg.js'),()=>import('./hero-globe.js'),()=>import('./constellation.js'),()=>import('./interactions.js')]) {try {await load()} catch(e) {console.warn('Visual layer unavailable:',e)}}
