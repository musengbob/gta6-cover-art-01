# Sunset Panels

![bounty](https://make.fun/badge/gta6-cover-art-01.svg)
![rank](https://make.fun/badge/gta6-cover-art-01/musengbob/gta6-cover-art-01/rank.svg)
![reward](https://make.fun/badge/gta6-cover-art-01/musengbob/gta6-cover-art-01/reward.svg)

Turn your photos into GTA 6-style multi-panel cover art — a Vice City sunset poster
with bold condensed lettering, neon grades and comic-book panels. Built for the
[make.fun bounty gta6-cover-art-01](https://make.fun/bounty/gta6-cover-art-01).

## What it does

- **6 layouts** — Hero + Strip, 2×2 Grid, 3-Column Strip, Diagonal Split,
  Full-Bleed Poster, Comic 5-Panel.
- **5 colour grades** — Vice Sunset, Neon Pink, Golden Hour, Teal Nights, Mono Noir.
- **Up to 4 photos** — file pickers, drag-and-drop onto any panel, or one-click
  "Load sample" (bundled model-made samples, free to use). Per panel: choose the
  photo, zoom, pan X/Y, flip.
- **Caption** — big bold condensed title (Anton / Bebas Neue, OFL-licensed, bundled
  under `app/fonts/`), subtitle line, top/bottom position, 3 lettering styles:
  Outline, Neon Glow, Banner Ribbon.
- **Effects** — halftone dots, film grain, vignette, sun flare (all toggleable).
- **Export** — one button per size (1080×1080, 1080×1350, 1920×1080) plus
  "Export all 3 sizes". Live preview updates on every control change, and
  "Surprise me" randomises layout + grade + lettering in one click.
- **Fully offline** — no network request from the app; every script, font and
  image lives under `app/`. Photos never leave the browser.

## How to run

```sh
node serve.ts
# open http://localhost:8080
```

Load a photo (or the samples), pick a layout and grade, type a caption, hit
"Export all 3 sizes" — three PNGs download straight away.

## Screenshots

`1-cover.jpg` is the exported landscape cover; `2-editor.jpg` the editor with
photos loaded; `3-portrait.jpg` the 1080×1350 cover; `4-square.jpg` the
1080×1080 cover. All four are real screenshots of this app.

## License note

Fonts Anton and Bebas Neue are licensed under the SIL Open Font License 1.1
(see `app/fonts/OFL.txt`). No Rockstar logo, artwork or fonts are used anywhere.
The sample photos in `app/samples/` were made for make.fun with an image model
and are free to use.
