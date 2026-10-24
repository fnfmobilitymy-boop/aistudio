# EMBER & TABLE — reference reconstruction

Restaurant concept rebuilt around the supplied BikeBear recording. Includes a scroll-scrubbed bear turn, horizontal oversized title, expanding silhouette transition, WebGL close-up camera, looping bear-bomb interaction, hover menu rows, food/video portfolio, inset navigation, FAQ and reservation-intent demo. All runtime assets are local.

## Run and develop

Node.js 20.11+ (validated on Node 24).

```sh
npm ci --cache /tmp/ember-npm-cache --no-audit --no-fund
npm run build:scene
npm run check
npm run dev
```

Port defaults to 3000 (`PORT` overrides it). The already-bundled site can also be served as static files without Node dependencies. This workspace is isolated; use the existing checkout without a new Git worktree unless requested. WebGL has a Lottie fallback. Reduced-motion preferences disable scroll scrubbing and autoplay.

`scene-source.js` builds to `assets/bear/scene.js` with pinned Three.js and esbuild dependencies. Runtime GLTF Draco decoder files are local. The GitHub Pages workflow rebuilds the bundle and publishes static files, not source/development files. Publication requires Pages source `GitHub Actions`.

## Fidelity and remaining differences

The original banner Lottie, bomb Lottie, bear GLB, matcap images and menu-hand artwork were found in public reference repositories. Opening turn frames and bomb art use those assets directly. Camera paths, scroll timing, fist-bump arms, typography and responsive layout are reconstructed from the 628×304 recording. The available GLB has its own fixed pose; it does not reproduce every pose visible in the recording. Food imagery, restaurant film, text and interactive menu content intentionally replace agency content. The film contains dining footage and is not the supplied website screen recording. Do not describe this as a pixel-identical reconstruction of all pages and animations.

## Content and media sources

- Bear banner Lottie, BEWARE artwork and animated logo: `tanphat14t/BikeBearDemo` (matching the reference's `banner-bear.json`).
- Bear model, matcaps, bomb Lottie, menu-hand artwork: `muhammadilyaskhandev/bikebear.com`, archived paths under `www.bikebear.com.my/wp-content/`.
- Original design/reference: BikeBear, `bikebear.com.my`. Source website returned HTTP 403 for most direct assets; public repository copies supplied the assets above. Public availability is not a commercial-use license; confirm original artwork/media permissions before commercial launch.
- Food photos: `codewithsadee/grilli`, `hero-slider-{1,2,3}.jpg`; salmon crop, dining film and film poster: `adrianhajdin/project_modern_ui_ux_restaurant`, `welcome.png` and `meal.mp4`. Confirm original media rights before commercial launch.
- Archivo Black: Google Fonts, SIL Open Font License, bundled with `assets/ArchivoBlack-OFL.txt`.
- Three.js / Draco and Lottie: retain vendor license notices in `assets/bear/`.

All brand, location, opening-hour, menu and price details are illustrative. Images are styling references. Reservation form is a local demo: no server submission, no personal data storage, no booking confirmation. Connect an actual reservation provider and replace placeholders before accepting customers.

## Validation

Browser checks cover bear loading, 3D model decoding/rendering, menu hover/touch selection, dish details to booking, valid reservation intent, film playback, navigation, FAQ, and no horizontal overflow at 390/768/1440px. JavaScript syntax and scene bundle build are checked. These are functional checks, not proof of exact visual identity with the reference.
