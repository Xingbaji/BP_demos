import { projects } from "./projects.js";

const projectGrid = document.querySelector("[data-project-grid]");
const player = document.querySelector("[data-player]");
const mediaWrap = document.querySelector("[data-player-media]");
const config = window.MYRIFORM_SITE_CONFIG || {};

let currentProjectId = null;
let lastTrigger = null;
let playerHistoryEntry = false;

function mediaUrl(path) {
  if (!config.mediaBaseUrl) return "";
  return `${config.mediaBaseUrl.replace(/\/$/, "")}/${path}`;
}

function unavailableMedia(project) {
  return `<div class="media-unavailable">
    <img src="${project.poster}" alt="${project.cardTitle} 视频封面">
    <div>
      <strong>视频暂时无法播放</strong>
      <span>请前往项目主页查看。</span>
      <a href="${project.source}" target="_blank" rel="noopener noreferrer">打开项目主页 ↗</a>
    </div>
  </div>`;
}

function playerMedia(project) {
  const useOfficial = config.mediaMode === "official";
  if (useOfficial && project.officialMedia?.type === "youtube") {
    return `<iframe
      src="${project.officialMedia.src}"
      title="${project.cardTitle} 研究视频"
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
      referrerpolicy="strict-origin-when-cross-origin"
      data-active-embed
    ></iframe>`;
  }

  const src = useOfficial && project.officialMedia?.type === "video"
    ? project.officialMedia.src
    : mediaUrl(project.video);

  if (!src) return unavailableMedia(project);

  return `<video controls autoplay playsinline poster="${project.poster}" preload="metadata" data-active-video>
    <source src="${src}" type="video/mp4">
    当前浏览器无法播放此视频。
  </video>`;
}

function projectCard(project) {
  const displayIndex = String(project.displayOrder).padStart(2, "0");
  return `
    <article class="project-card" id="research-${project.id}" aria-labelledby="research-title-${project.id}">
      <button class="project-media" type="button" data-project="${project.id}" aria-label="${displayIndex}，${project.stageLabel}，${project.duration}，观看 ${project.cardTitle} 研究 Demo">
        <img
          src="${project.poster}"
          alt=""
          width="1600"
          height="900"
          decoding="async"
          loading="lazy"
        >
        <span class="project-media-shade" aria-hidden="true"></span>
        <span class="project-stage" aria-hidden="true">${displayIndex} · ${project.stageLabel}</span>
        <span class="project-play" aria-hidden="true">▶</span>
        <span class="project-duration" aria-hidden="true">${project.duration}</span>
      </button>

      <div class="project-content">
        <div class="project-meta">
          <span>${project.stage}</span>
          <p>${project.publication}</p>
        </div>

        <h3 id="research-title-${project.id}">${project.cardTitle}</h3>
        <p class="project-route-proof">${project.routeProof}</p>
        <p class="project-topic">${project.topic}</p>

        <div class="project-actions">
          <button type="button" data-project="${project.id}">
            <span aria-hidden="true">▶</span> 观看 Demo<span class="sr-only">：${project.cardTitle}</span>
          </button>
          <a href="${project.paperUrl}" target="_blank" rel="noopener noreferrer">论文 <span>↗</span></a>
          <a href="${project.source}" target="_blank" rel="noopener noreferrer">项目主页 <span>↗</span></a>
        </div>
      </div>
    </article>`;
}

function renderProjects() {
  projectGrid.innerHTML = [...projects]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map(projectCard)
    .join("");
}

function playerField(selector, value) {
  const node = player.querySelector(selector);
  if (node) node.textContent = value;
}

function updateProjectUrl(projectId, mode = "replace") {
  const url = new URL(window.location.href);
  if (projectId) url.searchParams.set("work", projectId);
  else url.searchParams.delete("work");
  const state = projectId ? { myriformPlayer: true } : {};
  if (mode === "push") window.history.pushState(state, "", url);
  else window.history.replaceState(state, "", url);
}

function attachMediaFallback(project) {
  const showFallback = () => {
    if (currentProjectId === project.id) mediaWrap.innerHTML = unavailableMedia(project);
  };
  const activeVideo = mediaWrap.querySelector("[data-active-video]");
  const activeEmbed = mediaWrap.querySelector("[data-active-embed]");

  activeVideo?.addEventListener("error", showFallback, { once: true });
  activeVideo?.querySelector("source")?.addEventListener("error", showFallback, { once: true });
  activeEmbed?.addEventListener("error", showFallback, { once: true });
}

function openProject(projectId, updateUrl = true) {
  const project = projects.find((item) => item.id === projectId);
  if (!project) return;

  const wasOpen = player.open;
  if (!wasOpen) lastTrigger = document.activeElement;
  currentProjectId = project.id;

  playerField("[data-player-stage]", project.stage);
  playerField("[data-player-publication]", `${project.publication} · ${project.publicationType}`);
  playerField("[data-player-title]", project.cardTitle);
  playerField("[data-player-topic]", project.topic);
  playerField("[data-player-route-proof]", project.routeProof);
  playerField("[data-player-formal-title]", project.formalTitle);
  playerField("[data-player-description]", project.mainWork);
  playerField("[data-player-media-source]", `视频来源：${project.mediaSource}`);
  playerField("[data-player-result]", project.result);
  playerField("[data-player-role]", project.role);

  const source = player.querySelector("[data-player-source]");
  const paperLink = player.querySelector("[data-player-paper-link]");
  source.href = project.source;
  paperLink.href = project.paperUrl;
  paperLink.hidden = !project.paperUrl;

  mediaWrap.innerHTML = playerMedia(project);
  attachMediaFallback(project);

  if (updateUrl) {
    updateProjectUrl(project.id, wasOpen ? "replace" : "push");
    playerHistoryEntry = true;
  }
  if (!wasOpen) player.showModal();
  player.scrollTop = 0;
}

function closePlayer(updateUrl = true) {
  if (!player.open) return;
  mediaWrap.querySelector("video")?.pause();
  mediaWrap.innerHTML = "";
  currentProjectId = null;
  player.close();

  if (updateUrl) {
    if (playerHistoryEntry) {
      playerHistoryEntry = false;
      window.history.back();
    } else {
      updateProjectUrl(null);
    }
  }

  if (lastTrigger instanceof HTMLElement && lastTrigger.isConnected) {
    window.requestAnimationFrame(() => lastTrigger.focus());
  }
}

renderProjects();

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-project]");
  if (button) openProject(button.dataset.project);
});

document.querySelector("[data-close-player]").addEventListener("click", () => closePlayer());

player.addEventListener("click", (event) => {
  if (event.target === player) closePlayer();
});

player.addEventListener("cancel", (event) => {
  event.preventDefault();
  closePlayer();
});

window.addEventListener("popstate", () => {
  const projectId = new URL(window.location.href).searchParams.get("work");
  if (projectId) {
    playerHistoryEntry = Boolean(window.history.state?.myriformPlayer);
    openProject(projectId, false);
  } else {
    playerHistoryEntry = false;
    closePlayer(false);
  }
});

const header = document.querySelector("[data-header]");
const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

const initialProject = new URL(window.location.href).searchParams.get("work");
if (initialProject) openProject(initialProject, false);
