# Accessibility notes (RONIUM)

Smoke tests under `tests/smoke.spec.js` run axe-core against the home page and mission console.

## Fixed in this pass

- **label-content-name-mismatch** on the hero globe control: the accessible name now includes the visible `DRAG TO EXPLORE` label (`index.html`).

## Known remaining findings (recorded, not hidden)

### color-contrast (serious) — home and console

axe reports **color-contrast** findings on:

- the editorial home page (`styles.css` / `motion.css`): muted mono labels, cyan signal accents, dim HUD copy (`--ink-mute` / `--ink-dim` on dark backgrounds);
- the mission console (`src/console/style.css`): muted parameter labels and disclaimers (for example `.muted`, `.sidebar-disclaimer`, `.control-block label`, `.under-console`).

These come from the intentional dark cinematic / ops-console palette. Changing the tokens would redesign the visual language, so they are recorded here rather than forced green in CI.

The smoke test still fails the build on any **other** serious or critical axe rule on either page.

Re-check after future palette work:

```sh
npm run build && npm run test:smoke
```
