# Official media sources

Checked on 2026-08-25. The deployed site loads only the official project-page MP4 files or official YouTube embeds below. Downloaded working copies under `~/bp_demo` are not part of the site repository.

| Work | Player source | Type | Check |
|---|---|---|---|
| Metric3D v2 | `https://jugghm.github.io/Metric3Dv2/resource_new/media/demo_full.mp4` | Official project-page MP4 | `206 video/mp4` |
| RoboSnap | `https://robosnap.github.io/static/robosnap/videos/method/refinement_process_01.mp4` | Official project-page MP4 | `206 video/mp4` |
| PNCG | `https://xingbaji.github.io/PNCG_project_page/static/videos/demo_low_res.mp4` | Official project-page MP4 | `206 video/mp4` |
| SIM1 | `https://www.youtube-nocookie.com/embed/tsPLa-1Lygw?rel=0` | Official YouTube embed | `200 text/html` |
| ForceVLA2 | `https://www.youtube-nocookie.com/embed/FYOHljOEZz8?rel=0` | Official YouTube embed | `200 text/html` |
| GAUGE | `https://internrobotics.github.io/GAUGE/trials/slope-contact.mp4` | Official project-page MP4 | `206 video/mp4` |

Each work also has a separate paper or project-page link in `assets/projects.js`. If an official player source fails, the UI stops at the poster and offers that source page instead of silently switching to a local or third-party copy.

