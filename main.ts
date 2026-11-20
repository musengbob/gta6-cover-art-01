// Coral Coast, round 5 — hand-in for the gta6-cover-art-01 bounty.
//
// The entry itself is the app/ directory next to this file: static HTML
// plus ES modules, no libraries and no network calls, so a desktop
// browser runs it fully offline. Eleven sample photos ship inside
// app/samples/ — the two kit photos and nine generated for this entry —
// and the default cover is the Cast Seven cast poster: seven distinct
// faces, a pop-out hero, a striped retro-chrome title and full poster
// furniture. This script's only job is to stage that app, together with
// the screenshots/ folder, into the output directory and to write the
// dossier.json summary the judge reads, using the vendored make.fun
// helper. It refuses to hand in a half-built entry: a missing
// app/index.html stops it with an error instead of a silent bad build.
//
// Local run: `node serve.ts`, then open http://localhost:8080.
// Hand-in outside the grader container (MAKEFUN_OUTPUT_DIR stands in
// for the container's /output):
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

// Directory of this file, and the destination for the staged entry.
const root = fileURLToPath(new URL('.', import.meta.url));
const dest = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function requireEntry(relative: string, why: string): void {
  if (!existsSync(join(root, relative))) {
    throw new Error(`${relative} is missing — ${why}`);
  }
}

// The editor shell must be present, or there is nothing to hand in.
requireEntry(join('app', 'index.html'), 'the cover maker was not built');

// Stage the app and the screenshots into the output directory.
mkdirSync(dest, { recursive: true });
cpSync(join(root, 'app'), join(dest, 'app'), { recursive: true });
mkdirSync(join(dest, 'screenshots'), { recursive: true });
const shots = join(root, 'screenshots');
if (existsSync(shots)) {
  cpSync(shots, join(dest, 'screenshots'), { recursive: true });
}

// Dossier limits mirror the scorer's own caps, so the dossier refuses
// an entry the scorer would refuse: at most 4 screenshots and none over
// 256 KiB; at most 993 files under app/ totalling 48 MiB, with no app
// path over 1000 bytes. Only text_max_bytes changes the dossier bytes;
// the rest are gates.
const dossier = buildDossier(dest, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(dest, 'dossier.json'), dossier);

console.log(`Coral Coast handed in to ${dest} (app/ + screenshots/ + dossier.json)`);
