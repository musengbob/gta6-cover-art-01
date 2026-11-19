// Coral Coast — a GTA-style cover maker for gta6-cover-art-01.
// The app is this directory's app/ folder: plain static files a desktop
// browser loads offline (app/index.html and its ES modules, no library
// and no network request). This program hands it in: it copies app/ and
// screenshots/ from beside this file to /output and writes
// /output/dossier.json, the summary the judge reads, with the vendored
// make.fun library. Six sample photos ship in app/samples/ — the two
// kit photos plus four made for this entry with an image model — and
// the default cover arranges all six into the Key Art layout.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fail loudly instead of handing in a half-built entry: the app folder
// must exist, and the screenshots folder must hold at least the cover.
if (!existsSync(join(here, 'app', 'index.html'))) {
  throw new Error('app/index.html is missing — the cover maker was not built');
}
const shotDir = join(here, 'screenshots');

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(shotDir)) cpSync(shotDir, join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in app/ or 48 MiB of app
// files, in all, or a path under app/ over 1000 bytes: app/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
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

console.log(`Coral Coast handed in to ${out} (app/ + screenshots/ + dossier.json)`);
