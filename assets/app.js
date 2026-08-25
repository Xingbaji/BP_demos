import { chapters, projects } from "./projects.js";

const chapterRail = document.querySelector("[data-chapter-rail]");
const filters = document.querySelector("[data-filters]");
const resultsStatus = document.querySelector("[data-results-status]");
const projectGrid = document.querySelector("[data-project-grid]");
const player = document.querySelector("[data-player]");
const mediaWrap = document.querySelector("[data-player-media]");
const copyStatus = document.querySelector("[data-copy-status]");
const config = window.MYRIFORM_SITE_CONFIG || {};

const chapterById = Object.fromEntries(chapters.map((chapter) => [chapter.id, chapter]));
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
    <img src="${project.poster}" alt="${project.cardTitle} 视频封面" />
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
    <source src="${src}" type="video/mp4" />
    当前浏览器无法播放此视频。
  </video>`;
}

function renderChapters() {
  chapterRail.innerHTML = chapters
    .map(
      (chapter) => `
        <li>
          <button type="button" data-chapter="${chapter.id}" aria-pressed="false">
            <span>${chapter.number}</span>
            <strong>${chapter.label}</strong>
            <small>${chapter.title}</small>
          </button>
        </li>`,
    )
    .join("");
}

function renderFilters() {
  const filterButtons = chapters.map((chapter) => {
    const count = projects.filter((project) => project.chapter === chapter.id).length;
    return `<button type="button" class="filter" data-filter="${chapter.id}" aria-pressed="false">
      ${chapter.title} <span>${String(count).padStart(2, "0")}</span>
    </button>`;
  });

  filters.innerHTML = `
    <button type="button" class="filter is-active" data-filter="all" aria-pressed="true">
      全部 <span>${String(projects.length).padStart(2, "0")}</span>
    </button>
    ${filterButtons.join("")}`;
}

function projectCard(project) {
  const chapter = chapterById[project.chapter];
  return `
    <article class="project-card" data-project-card data-chapter="${project.chapter}">
      <button type="button" class="project-open" data-project="${project.id}">
        <span class="project-media">
          <img src="${project.poster}" alt="${project.cardTitle} 视频封面" width="1600" height="900" loading="lazy" />
          <span class="project-tint"></span>
          <span class="project-play" aria-hidden="true">▶</span>
          <span class="project-duration">${project.duration}</span>
          <span class="project-status">${project.status}</span>
        </span>
        <span class="project-copy">
          <span class="project-number">${project.index}</span>
          <span class="project-body">
            <span class="project-chapter">${chapter.label} · ${chapter.title}</span>
            <strong>${project.cardTitle}</strong>
            <span class="project-title">${project.title}</span>
          </span>
          <span class="project-arrow" aria-hidden="true">↗</span>
        </span>
      </button>
    </article>`;
}

function renderProjects() {
  projectGrid.innerHTML = projects.map(projectCard).join("");
}

function setFilter(requestedFilter) {
  const filter = requestedFilter === "all" || chapterById[requestedFilter]
    ? requestedFilter
    : "all";
  const visibleProjects = projects.filter(
    (project) => filter === "all" || project.chapter === filter,
  );

  document.querySelectorAll("[data-filter]").forEach((button) => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  chapterRail.querySelectorAll("button[data-chapter]").forEach((button) => {
    const isActive = button.dataset.chapter === filter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  document.querySelectorAll("[data-project-card]").forEach((card) => {
    card.hidden = filter !== "all" && card.dataset.chapter !== filter;
  });

  resultsStatus.textContent = filter === "all"
    ? `显示全部 ${visibleProjects.length} 项`
    : `${chapterById[filter].title} · ${visibleProjects.length} 项`;
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
  playerField("[data-player-kicker]", project.kicker);
  playerField("[data-player-title]", project.title);
  playerField("[data-player-description]", project.description);
  playerField("[data-player-media-source]", `视频来源 · ${project.mediaSource}`);
  playerField("[data-player-paper]", project.paper);
  playerField("[data-player-role]", project.role);
  playerField("[data-player-boundary]", project.boundary);

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

renderChapters();
renderFilters();
renderProjects();
setFilter("all");

filters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (button) setFilter(button.dataset.filter);
});

chapterRail.addEventListener("click", (event) => {
  const button = event.target.closest("[data-chapter]");
  if (!button) return;
  setFilter(button.dataset.chapter);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelector("#work").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
});

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
