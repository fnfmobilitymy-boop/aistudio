# EMBER & TABLE

Restaurant concept inspired by the supplied visual reference: acid yellow, expressive typography, cinematic food video, animated marquees and editorial sections. Responsive Chinese/English interface, accessible menu tabs, video controls, navigation overlay and reservation-intent demo. No backend, no reservations sent, no personal data stored.

## Run

Node.js 20.11+ (validated with Node 24). No dependencies to install.

```sh
npm run dev
```

Serves on port 3000; override with `PORT`. `npm run check` checks JavaScript syntax. The server supports video range requests. This workspace is already isolated; use the existing checkout without creating a Git worktree.

## Content and media

All brand, menu, prices and opening-hour details are illustrative; replace before launch. The reservation form is a local demonstration only. Images are visual references rather than exact representations of menu items. Drinks currently use restaurant atmosphere images.

Local food imagery from `codewithsadee/grilli` (`assets/images/hero-slider-{1,2,3}.jpg`). Restaurant film and signature image from `adrianhajdin/project_modern_ui_ux_restaurant` (`src/assets/meal.mp4` and `welcome.png`), accessed via raw.githubusercontent.com. Film transcoded to a silent web-optimized MP4. Confirm original media rights before commercial publication. `salmon.jpg` is cropped from `welcome.png`. Barlow Condensed (Google Fonts, SIL Open Font License) is bundled locally; body text uses system font fallbacks. All assets are served locally.

## Launch requirements

Replace illustrative business information, confirm media licenses, and connect a real reservation service before accepting bookings. No credentials are needed to run this concept.
