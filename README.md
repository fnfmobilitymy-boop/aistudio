# KENNY KITCHEN

A fictional contemporary fine-dining restaurant demo combining the four supplied visual references. Uses an oxblood / charcoal / warm ivory / muted champagne palette, local photographic-style media, English/Chinese interface switching with remembered language preference. No real business address, awards, reviews, opening hours or booking service are claimed.

## Run

Node.js 20.11+ (validated on Node 24).

```sh
npm ci --cache /tmp/kenny-npm-cache --no-audit --no-fund
npm run build:scene
npm run check
npm run dev
```

Default port 3000, overridden with `PORT`. This workspace is already isolated: use the existing checkout without a Git worktree unless requested. Built files can also be served statically. GitHub Pages workflow rebuilds the pinned Three.js bundle and publishes `index.html`, `app.js`, `style.css` and `assets/`.

## Reference mapping

1. Freshly food carousel (7.67 s): oversized food names behind a floating plate, animated decorative ingredients, coordinated lateral plate/title transitions, manual controls, swipe, optional autoplay and slide-specific background colours. Rebuilt using three new western dishes.
2. Ciao Energy 3D experience (40.83 s): circular product arrangement, floating selected product, metallic rings, drag/arrow selection, scroll-driven close-up and rotation. Now rebuilt with five real wine product packshots, preserving the original bottle labels, on transparent photographic planes in a Three.js carousel. This is spatially animated photography, not a full 360-degree bottle model. Product imagery is illustrative, not a statement of real restaurant stock.
3. BikeBear (61.97 s): large horizontal typography, reveal transition, hover rows and inset navigation. The earlier bear character has now been replaced throughout by a generated beef Wellington cutout with floating, scrolling rotation and a photographic close-up. No Wellington animation or model is loaded or included in the deployment.
4. Uptown Dumpling restaurant (100.67 s): cinematic restaurant film, serif/italic editorial headings, restrained cream layouts, menu, interior imagery, FAQ and reservation experience. Rebuilt for western fine dining.

This is a fusion of the selected visual and interaction mechanisms, not a frame-identical reproduction of four separate websites or their entire page sets. Food, wine objects, brand, copy, palette and combined sequence intentionally differ. Uploaded recordings are reference material; they are not used as restaurant footage.

## Features and interaction

- Three coordinated hero dishes, manual buttons, swipe, pause/resume autoplay.
- Silent cinematic dining, cooking and cocktail clips; user-initiated film dialogs with native controls.
- Food details and full menu with accessible keyboard-operated category tabs.
- Hover/touch tasting rows, navigation overlay with focus management and FAQ accordion.
- Five real bottle product images: Hunnu Premium and Jacob’s Creek Reeves Point, Classic Sémillon Chardonnay, Brut Cuvée and Trilogy Brut. Transparent images retain their bottle labels in a spatial carousel with arrows/dots/drag/raycast selection, scroll zoom and motion pause. The fallback also uses a real product image.
- EN / 中文 controls in the header, expanded navigation and dialogs; live text/attribute translation in language.js preserves event handlers, selected menu tabs, wine selection and typed form values. New copy should be added to that translation catalogue.
- Floating beef Wellington, scroll-controlled rotation/iris close-up, matching navigation artwork and an interactive Wellington dish detail. This is animated photographic artwork, not a rigged 3D food model.
- WhatsApp, Facebook and Instagram floating brand icons. They open a clearly labelled demo contact panel until real accounts are supplied; see `assets/kenny/social-links.json`.
- Transparent water-height simulation under pointer movement and finger swipes, falling droplets / expanding rings on tap, optional synthesized water sounds, a Canvas 2D fallback, reduced-motion handling and no interception of scrolling/clicks.
- Local reservation-intent form with validation. No network submission, personal-data persistence or actual reservation.
- Opt-in background music: an original 52-second piano/bass/brush lounge loop, subtle synthesized interaction cues, mute, volume and effects controls. No audio starts before the user enables it; playback pauses in background tabs. Only volume/effect and language preferences are stored locally, never automatic sound consent.
- Reduced-motion mode disables automatic carousel, floating motion, scroll pin durations and background video playback. Offscreen videos and inactive 3D rendering are paused.

## Social account setup

`assets/kenny/social-links.json` has intentionally empty fields because the user requested logo-only demo entries. Set `whatsapp` to an international number (country code, no leading zero; spaces or `+` are accepted), and use complete HTTPS Facebook/Instagram profile URLs in the corresponding fields. Valid settings turn the floating buttons into ordinary external links; no messages are sent automatically. Leaving a field empty keeps the honest demo panel.

## Media and attribution

All runtime images, videos, fonts, libraries, models and decoders are hosted locally.

- `assets/kenny/kenny-lounge.mp3`: original procedural lounge composition, rendered from `scripts/create-ambience.py` (NumPy + ffmpeg are only needed to regenerate it). UI cues are synthesized with Web Audio; no third-party music recording is used. Existing restaurant video files remain silent.
- `assets/kenny/tasting-plates.png`: AI-generated transparent triptych of steak, salmon and truffle tortellini, created for this demo. Equal thirds are displayed through CSS sprite positioning.
- `assets/kenny/wines/*.png`: original wine-product PNGs from `techiecoder2079/Wine-Shop-Website/images/product/` (products 2, 4, 5, 6 and 8). Photographic labels are not translated or replaced; Three.js UV coordinates select the existing transparent bounds. Commercial media rights are not independently verified.
- `assets/kenny/room.png`: AI-generated fine-dining concept interior. Not a photograph of an actual Kenny Kitchen location.
- `assets/kenny/chef-story.jpg`: restaurant interior reference from `codewithsadee/grilli/assets/images/about-banner.jpg`.
- Dining film/poster: `adrianhajdin/project_modern_ui_ux_restaurant/src/assets/meal.mp4`, silently transcoded.
- Cocktail film/leaves: `adrianhajdin/gsap_cocktails/public/videos/output.mp4`, `public/images/hero-left-leaf.png`, `public/images/hero-right-leaf.png`. Film silently transcoded for the web.
- Cooking film: `MathF94/freshly-restaurant/ressources/cooking.mp4`, 20-second silent excerpt from the public reference copy.
- `assets/kenny/beef-wellington.png`: AI-generated transparent Wellington cutout created for the requested character replacement. All earlier bear art, model, Lottie player and Draco runtime files have been removed from the current site.
- Cormorant Garamond and Manrope: Google Fonts, SIL OFL (license files in `assets/kenny/`). Archivo Black: `assets/ArchivoBlack-OFL.txt`.
- Three.js license retained in `assets/kenny/THREE-LICENSE.txt`. Wine scene bundle: `assets/kenny/cellar-scene.js`.

Media remains demonstration material. Independently confirm remaining third-party source-media commercial rights before commercial use. The user explicitly described Kenny Kitchen as an invented demo name.

## Validation

JavaScript syntax, reproducible bundle build, desktop/mobile layouts at 390/768/1440 widths, plate transitions, details-to-booking flow, full-menu tabs, tasting hover, WebGL cellar selection and drag, film playback, navigation, FAQ reduced-motion behaviour, opt-in music playback, mute, volume, effects preferences and silent reload were checked in Chromium. Social demo-to-booking flow, future configured social links, visible water rendering, touch scrolling, non-WebGL fallback, reduced motion and mobile floating-control separation were also verified. Validation demonstrates working interactions, not pixel identity with the reference videos.

Language validation: both locales, dynamic hero/menu/wine/detail text, form input preservation, reservation summary language, language persistence, and 320/390/768/1440 layouts are exercised. Bottle product images are checked for successful loading.
