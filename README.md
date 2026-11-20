# Coral Coast — GTA-Style Cover Maker

![gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)
![Rank](https://make.fun/badge/gta6-cover-art-01/musengbob/gta6-cover-art-01/rank.svg)
![Reward](https://make.fun/badge/gta6-cover-art-01/musengbob/gta6-cover-art-01/reward.svg)

An entry for the [gta6-cover-art-01 bounty on make.fun](https://make.fun/bounty/gta6-cover-art-01): build the best GTA 6 cover-art maker. Coral Coast turns photos into a striking multi-panel cover — the way real GTA key art is composed — and exports it as a print-ready PNG in three sizes.

## What it makes

The default cover is the **Cast Seven** layout: a seven-panel cast poster. Seven distinct faces fill the grid — a central hero close-up that pops out of its frame with a hard drop shadow, six face panels around it — and every panel carries a role tag plus a place, a time and a one-line sub-caption. Over the art sits a massive striped retro-chrome title (**CORAL COAST**, pink/yellow/purple stripes inside the letters, extruded offset shadows), centred so it overlaps the hero's face, a neon-pink script subtitle (**Vice Nights**), five gold stars with a review quote, a gold seal, a **VOL. 01** box, a starburst **ORIGINAL COVER ART** badge, a barcode, **COMING SOON**, and a bottom strip with palm silhouettes, the tagline (**SEVEN LIVES · ONE HARBOR · NO WAY BACK**) and a full billing block naming the whole cast. Every photo gets a hard **Vice Sunset** grade: saturated, warm, vignetted, with halftone dots across the title band — key art, not snapshots.

## The cast

The default cover never repeats a photo. The seven panels, in order:

| Panel | Role | Photo | Sub-caption |
|---|---|---|---|
| Hero (centre, pop-out) | THE DRIVER | `boulevard.jpg` — woman leaning on a convertible at sunset | OCEAN DRIVE · 6:42 PM · LOOKING FOR TROUBLE |
| Top left | THE BOSS | `boss.jpg` | BISCAYNE BAY · 7:15 PM · HE OWNS THE HARBOR |
| Top right | THE RIDER | `rider.jpg` | COLLINS AVE · 11:48 PM · NEVER LOOKS BACK |
| Middle left | THE MECHANIC | `mechanic.jpg` | LITTLE HAVANA · 9:03 AM · SHE BUILDS THE GETAWAY |
| Middle right | THE CAPTAIN | `pier.jpg` — fisherman at Sunset Pier | SUNSET PIER · 5:27 PM · KNOWS EVERY CURRENT |
| Bottom left | THE LOOKOUT | `lookout.jpg` | DOWNTOWN ROOFTOP · 8:19 PM · SEES EVERYTHING COMING |
| Bottom right | THE WHEELMAN | `wheelman.jpg` | OCEAN DRIVE · 6:44 PM · FOOT DOWN, NO BRAKES |

The billing block in the bottom strip is computed from this cast, so the poster always names the people on it.

## Face-aware crop

Portraits are cropped around the face, never around the middle of the frame — no headless panels, no neck-cropped torsos. Each panel stores a focal point that defaults to the face zone of its photo. The editor shows a **Face-aware crop** toggle per panel, focal-point sliders, and lets you drag directly on the cover to move the focal point. Swapping in another portrait re-anchors the crop on that photo's face; scenery photos keep a plain centre crop.

## The editor

- **7 layouts** — Cast Seven (default), Key Art, Hero + Strip, 2×2 Grid, 3-Column, Comic 5-Panel, Full-Bleed.
- **11 sample photos** — the seven cast portraits above plus four scenery shots: an orange sports car (`car.jpg`), a coastal highway (`coast.jpg`), a neon gas station at night (`neon.jpg`), and a speedboat (`boat.jpg`). Click any panel, then any photo, to swap it in. A photo already on the cover is marked in-use.
- **Your own photos** — upload via the file picker or drag & drop straight onto the cover; each panel gets its own zoom, pan, flip and focal point.
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

- `app/index.html` — the editor shell: stage canvas, size tabs, cast roster, control sidebar.
- `app/style.css` — the dark neon editor theme.
- `app/src/state.js` — the eleven samples, seven layouts, five grades, the cast with its role tags, and the default Cast Seven cover.
- `app/src/draw.js` — the canvas renderer: panels, face-aware crop, pop-out hero, striped retro-chrome title, role tags, billing block and poster furniture.
- `app/src/editor.js` — boots the app, wires every control, handles upload, drag & drop, focal dragging and PNG export.
- `app/samples/` — eleven photos: the two kit samples (`boulevard.jpg`, `pier.jpg`) plus nine made for this entry with an image model (`car.jpg`, `coast.jpg`, `neon.jpg`, `boat.jpg`, and the five new cast portraits `boss.jpg`, `rider.jpg`, `mechanic.jpg`, `lookout.jpg`, `wheelman.jpg`).
- `app/fonts/` — Anton, Bebas Neue and Pacifico, all under the SIL Open Font License 1.1 (see `app/fonts/OFL.txt`).
- `main.ts` — copies `app/` and `screenshots/` to `/output` and writes `dossier.json` for the judge.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

The app code is MIT (see `LICENSE`). The fonts are OFL 1.1. The nine new sample photos were generated for this entry and are free to use.
