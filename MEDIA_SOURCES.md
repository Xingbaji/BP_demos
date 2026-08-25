# Official media sources

Checked on 2026-08-25. Video is supporting material for the research page. The deployed site loads only the official project-page MP4 files or official YouTube embeds below. Downloaded working copies under `~/bp_demo` are not part of the site repository.

| Work | Player source | Type | Check |
|---|---|---|---|
| Metric3D v2 | `https://jugghm.github.io/Metric3Dv2/resource_new/media/demo_full.mp4` | Official project-page MP4 | `206 video/mp4` |
| RoboSnap | `https://www.youtube-nocookie.com/embed/82KTBSiscYM?rel=0` | Official YouTube embed | `200 text/html` |
| PNCG | `https://xingbaji.github.io/PNCG_project_page/static/videos/demo_low_res.mp4` | Official project-page MP4 | `206 video/mp4` |
| SIM1 | `https://www.youtube-nocookie.com/embed/tsPLa-1Lygw?rel=0` | Official YouTube embed | `200 text/html` |
| ForceVLA2 | `https://www.youtube-nocookie.com/embed/FYOHljOEZz8?rel=0` | Official YouTube embed | `200 text/html` |
| GAUGE | `https://internrobotics.github.io/GAUGE/trials/slope-contact.mp4` | Official project-page MP4 | `206 video/mp4` |

Each work also has separate paper and project-page links in `assets/projects.js`; both are visible on the research card and in the player. Direct-MP4 failures trigger the poster fallback. Cross-origin iframe playback errors are not always observable in JavaScript, so the official project-page and paper links remain available independently of video playback.

## Poster provenance

The six local posters are lightweight 1600 × 900 navigation thumbnails derived from the corresponding official research media. They are not presented as MYRIFORM-owned results; rights remain with the original publication teams.

| Work | Frame source | Approx. frame | Local SHA-256 |
|---|---|---:|---|
| Metric3D v2 | Official `demo_full.mp4` listed above | `00:10` | `41ccc37ea9b62b1e2001c0bd078470fd00d3ac05632d4b27b47d58ad00062f90` |
| RoboSnap | Official YouTube `82KTBSiscYM` | `00:06` | `ee007c4a0ad330cf7b0b583684ff62bb86326c1752d0105962736aff488d8efb` |
| PNCG | Official `demo_low_res.mp4` listed above | `00:22` | `6803ed9fd842c9744026da6bebf1dbcc5384e86550b894565f9159f317e0cef3` |
| SIM1 | Official SIM1 project media working copy | related simulation segment | `93c827d1c9571df1c6bb81bbb1157081820994c69432edfbbad169262f3fb699` |
| ForceVLA2 | Official YouTube `FYOHljOEZz8` | `01:34` | `b6cdfddcd41450659b9ff7dadb2e2576393f81e4dc687504a42a84ee8b30e87f` |
| GAUGE | Official `slope-contact.mp4` listed above | `00:03` | `c4ce2aa33437825163ebca5731573c72d618542bf340aa1fb28876b7232bfc6a` |

The GAUGE player is one `Slope Contact` physical trial from the 22-category benchmark scope; it is not a complete benchmark reel or a pass-count claim.
