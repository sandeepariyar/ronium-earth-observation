// RONIUM / EARTH — Sandeep Pariyar, 2026.
import {defineConfig} from 'vite';
import {resolve} from 'node:path';

export default defineConfig({
  base:'./',
  build:{rollupOptions:{input:{main:resolve(import.meta.dirname,'index.html'),console:resolve(import.meta.dirname,'console/index.html')}}}
});
