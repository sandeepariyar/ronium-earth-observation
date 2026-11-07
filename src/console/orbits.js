/* RONIUM / EARTH — Designed and developed by Sandeep Pariyar. © 2026. */
// This is an illustrative mission geometry, NOT satellite ephemerides or live tracking.
export function orbitPoint(t, phase = 0, radius = 2.05, tilt = 0.42) {
  const a=t+phase;
  return [Math.cos(a)*radius, Math.sin(a)*radius*Math.sin(tilt), Math.sin(a)*radius*Math.cos(tilt)];
}
export const missions = [
 { id:'eu',name:'North Sea',lat:55.3,lon:4.1,focus:'Maritime',detail:'Shipping lanes and offshore infrastructure'},
 { id:'br',name:'Rio Grande do Sul',lat:-30.03,lon:-51.23,focus:'Flood',detail:'Flood extent and impact workflow'},
 { id:'fi',name:'Northern Finland',lat:65.01,lon:25.47,focus:'Infrastructure',detail:'Regional asset and land monitoring'},
 { id:'ca',name:'Western Canada',lat:53.5,lon:-116.4,focus:'Wildfire',detail:'Smoke-obscured event response'}
];
