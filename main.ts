// Sunset Panels — a make.fun gta6-cover-art-01 entry (Node 22, standard library only).
// The app is plain static files under app/ (index.html + ES modules, no build step,
// no network request from the app itself: fonts live under app/fonts/, photos are
// local samples or the user's own files, never uploaded). This program is only the
// hand-in plumbing: it copies app/ and screenshots/ from beside this file into the
// output directory and writes /output/dossier.json, the summary the judge reads,
// using the vendored make.fun library. Nothing here draws the cover — that is
// app/src/cover.js, a deterministic canvas 2D renderer with 6 layouts, 5 colour
// grades, per-panel crop/zoom/pan/flip, 3 lettering styles and 4 toggleable effects.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Run it twice into two directories and diff them: the output is byte-identical.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes;
// the others refuse an entry the scorer would refuse (more than 4 screenshots or one
// over 256 KiB; more than 993 files in app/ or 48 MiB of app files in all, or a path
// under app/ over 1000 bytes: app/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json). These caps mirror the starter kit's so the entry
// passes the same gates the kit's check enforces; changing them here changes nothing
// about what the scorer accepts, so they stay exactly as the kit documents them.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
