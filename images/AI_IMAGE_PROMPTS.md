# Upgrading the scenery to photorealistic AI images

The site currently uses hand-built vector scenes (`scene-hero.svg`, `scene-maasai-mara.svg`,
`scene-amboseli.svg`, `scene-diani.svg`). They load instantly and work offline, but when
you're ready for photorealistic images, generate them with any AI image tool (Gemini,
Midjourney, DALL·E, fal.ai) using the prompts below, save them with the SAME filename but
`.jpg` extension in this folder, and update the references:

- `css/styles.css` line ~241 (`.hero` background) → `scene-hero.jpg`
- `services.html` `.services-hero` style → `scene-maasai-mara.jpg`
- `js/experiences-live.js` `sceneFor()` → change `.svg` to `.jpg`
- `js/dashboard.js` and `js/booking.js` fallback images

Claude Code can regenerate these automatically via the `imagen` skill once a
`GEMINI_API_KEY` environment variable is set.

## Prompts (16:9, at least 1920x1080)

**scene-hero.jpg** — homepage hero:
> Golden sunrise over the Maasai Mara, hot air balloons drifting above endless savanna,
> a lone flat-top acacia tree silhouetted in the foreground, wildebeest herd in the
> middle distance, warm orange and purple sky, cinematic wide-angle photography,
> ultra realistic, high dynamic range

**scene-maasai-mara.jpg** — services hero + safari cards:
> Dramatic African sunset over the Maasai Mara savanna, huge orange sun on the horizon,
> silhouettes of elephants and a giraffe walking past an acacia tree, golden grass,
> National Geographic style wildlife photography, ultra realistic

**scene-amboseli.jpg** — Amboseli/photography cards:
> Elephant herd crossing the dusty plains of Amboseli National Park with snow-capped
> Mount Kilimanjaro towering in the background, soft morning light, clear blue sky,
> professional wildlife photography, ultra realistic

**scene-diani.jpg** — coastal/beach cards:
> Pristine Diani Beach in Kenya, powder-white sand, turquoise Indian Ocean, leaning
> coconut palm trees, traditional wooden dhow sailboat on the horizon, bright sunny
> day, travel magazine photography, ultra realistic

Keep each file under ~500 KB (compress with squoosh.app or `magick -quality 80`)
so the pages stay fast on safari-lodge Wi-Fi.
