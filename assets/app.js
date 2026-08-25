import { projects } from "./projects.js";

const projectGrid = document.querySelector("[data-project-grid]");
const player = document.querySelector("[data-player]");
const mediaWrap = document.querySelector("[data-player-media]");
const copyStatus = document.querySelector("[data-copy-status]");
const config = window.MYRIFORM_SITE_CONFIG || {};

let currentProjectId = null;
let lastTrigger = null;
let copyStatusTimer = null;
let playerHistoryEntry = false;

function mediaUrl(path) {
  if (!config.mediaBaseUrl) return "";
  return `${config.mediaBaseUrl.replace(/\/$/, "")}/${path}`;
}

function unavailableMedia(project) {
  return `<div class="media-unavailable">
    <img src="${project.poster}" alt="${project.cardTitle} 视频封面">
    <div>
      <strong>官方视频暂时无法加载</strong>
      <span>网络策略或源站限制可能阻止嵌入播放，请前往官方项目页观看。</span>
      <a href="${project.source}" target="_blank" rel="noopener noreferrer">前往官方项目页 ↗</a>
    </div>
  </div>`;
}

function playerMedia(project) {
  const useOfficial = config.mediaMode === "official";
  if (useOfficial && project.officialMedia?.type === "youtube") {
    return `<iframe
      src="${project.officialMedia.src}"
      title="${project.cardTitle} 官方视频"
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
  return `
    <article class="research-card" id="research-${project.id}" aria-labelledby="research-title-${project.id}">
      <div class="research-visual">
        <img
          src="${project.poster}"
          alt="${project.cardTitle} 研究视频封面"
          width="1600"
          height="900"
          loading="lazy"
        >
        <span class="research-tint"></span>
        <span class="research-status">${project.status}</span>
        <button class="watch-button" type="button" data-project="${project.id}">
          <span class="watch-play" aria-hidden="true">▶</span>
          <span><small>OFFICIAL VIDEO</small>观看视频 · ${project.duration}<span class="sr-only">：${project.cardTitle}</span></span>
        </button>
      </div>

      <div class="research-content">
        <div class="research-topline">
          <span class="research-index">${project.index}</span>
          <span class="research-capability">${project.capability} · ${project.capabilityCn}</span>
        </div>
        <h3 id="research-title-${project.id}">${project.cardTitle}</h3>
        <p class="formal-title">${project.formalTitle}</p>
        <p class="publication">${project.publication}</p>

        <div class="main-work">
          <span>主要工作</span>
          <p>${project.mainWork}</p>
        </div>

        <dl class="research-facts">
          <div>
            <dt>代表性结果</dt>
            <dd>${project.result}</dd>
          </div>
          <div>
            <dt>团队角色</dt>
            <dd>${project.role}</dd>
          </div>
        </dl>

        <div class="research-links">
          <a href="${project.paperUrl}" target="_blank" rel="noopener noreferrer">论文全文 <span>↗</span></a>
          <a href="${project.source}" target="_blank" rel="noopener noreferrer">官方项目页 <span>↗</span></a>
        </div>
      </div>
    </article>`;
}

function renderProjects() {
  projectGrid.innerHTML = projects.map(projectCard).join("");
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
  clearTimeout(copyStatusTimer);
  copyStatus.textContent = "";

  playerField("[data-player-index]", project.index);
  playerField("[data-player-kicker]", `${project.capability} · ${project.capabilityCn}`);
  playerField("[data-player-title]", project.cardTitle);
  playerField("[data-player-formal-title]", project.formalTitle);
  playerField("[data-player-description]", project.mainWork);
  playerField("[data-player-media-source]", `视频来源 · ${project.mediaSource}`);
  playerField("[data-player-publication]", project.publication);
  playerField("[data-player-role]", project.role);
  playerField("[data-player-result]", project.result);

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
  clearTimeout(copyStatusTimer);
  copyStatus.textContent = "";
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

function openAdjacentProject(direction) {
  const currentIndex = projects.findIndex((project) => project.id === currentProjectId);
  if (currentIndex < 0) return;
  const nextIndex = (currentIndex + direction + projects.length) % projects.length;
  openProject(projects[nextIndex].id);
}

async function copyProjectLink() {
  if (!currentProjectId) return;
  const url = new URL(window.location.href);
  url.searchParams.set("work", currentProjectId);

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url.toString());
    } else {
      const input = document.createElement("textarea");
      input.value = url.toString();
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    copyStatus.textContent = "链接已复制";
  } catch {
    copyStatus.textContent = "复制失败，请从浏览器地址栏复制";
  }

  copyStatusTimer = window.setTimeout(() => {
    copyStatus.textContent = "";
  }, 2400);
}

renderProjects();

projectGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-project]");
  if (button) openProject(button.dataset.project);
});

document.querySelector("[data-open-featured]").addEventListener("click", () => {
  openProject(projects.find((project) => project.featured)?.id || projects[0].id);
});

document.querySelector("[data-close-player]").addEventListener("click", () => closePlayer());
document.querySelector("[data-previous-project]").addEventListener("click", () => openAdjacentProject(-1));
document.querySelector("[data-next-project]").addEventListener("click", () => openAdjacentProject(1));
document.querySelector("[data-copy-link]").addEventListener("click", copyProjectLink);

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
const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

const initialProject = new URL(window.location.href).searchParams.get("work");
if (initialProject) openProject(initialProject, false);
