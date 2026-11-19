# Coral Coast — GTA-Style Cover Maker

![gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)
![Rank](https://make.fun/badge/gta6-cover-art-01/musengbob/gta6-cover-art-01/rank.svg)
![Reward](https://make.fun/badge/gta6-cover-art-01/musengbob/gta6-cover-art-01/reward.svg)

An entry for the [gta6-cover-art-01 bounty on make.fun](https://make.fun/bounty/gta6-cover-art-01): build the best GTA 6 cover-art maker. Coral Coast turns six photos into a striking multi-panel cover — the way real GTA key art is composed — and exports it as a print-ready PNG in three sizes.

## What it makes

The default cover is the **Key Art** layout: a hero panel on the left (about 55% of the width) plus five stacked panels on the right — six distinct photos, never a duplicate. Over the art sits a massive gradient title (**CORAL COAST**, yellow → orange → pink, thick black outline, slight slant), a neon-pink script subtitle (**Vice Nights**), a starburst **ORIGINAL COVER ART** badge, five gold stars with a review quote, and a bottom strip with palm silhouettes, a tagline, fine-print credits and a barcode. Every photo gets a hard **Vice Sunset** grade: saturated, warm, vignetted, with halftone dots across the title band — key art, not snapshots.

## The editor

- **6 layouts** — Key Art, Hero + Strip, 2×2 Grid, 3-Column, Comic 5-Panel, Full-Bleed.
- **6 sample photos** — a boulevard portrait, a pier fisherman, an orange sports car, a coastal highway, a neon gas station at night, and a speedboat. Click any panel, then any photo, to swap it in.
- **Your own photos** — upload via the file picker or drag & drop straight onto the cover; each panel gets its own zoom, pan and flip.
- **Captions** — title, subtitle, tagline and review quote are all editable live.
- **5 grades** — Vice Sunset, Neon Night, Golden Hour, Miami Noir, Pastel Dawn.
- **4 effects** — halftone dots, film grain, vignette, sun flare.
- **Export** — 1080×1080, 1080×1350 and 1920×1080 PNG, one at a time or all three at once. The preview is the export: both go through the same canvas render path.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. Everything runs fully offline — no network request, no library, no photo ever leaves the browser.

## How it is built

- `app/index.html` — the editor shell: stage canvas, size tabs, control sidebar.
- `app/style.css` — the dark neon editor theme.
- `app/src/state.js` — the six samples, six layouts, five grades, and the default cover.
- `app/src/draw.js` — the canvas renderer: panels, grade, gradient title, poster furniture.
- `app/src/editor.js` — boots the app, wires every control, handles upload, drag & drop and PNG export.
- `app/samples/` — six photos: the two kit samples (`boulevard.jpg`, `pier.jpg`) plus four made for this entry with an image model (`car.jpg`, `coast.jpg`, `neon.jpg`, `boat.jpg`).
- `app/fonts/` — Anton, Bebas Neue and Pacifico, all under the SIL Open Font License 1.1 (see `app/fonts/OFL.txt`).
- `main.ts` — copies `app/` and `screenshots/` to `/output` and writes `dossier.json` for the judge.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

The app code is MIT (see `LICENSE`). The fonts are OFL 1.1. The four new sample photos were generated for this entry and are free to use.
