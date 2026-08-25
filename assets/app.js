import { chapters, projects } from "./projects.js";

const chapterRail = document.querySelector("[data-chapter-rail]");
const filters = document.querySelector("[data-filters]");
const projectGrid = document.querySelector("[data-project-grid]");
const player = document.querySelector("[data-player]");
const mediaWrap = document.querySelector("[data-player-media]");
const config = window.MYRIFORM_SITE_CONFIG || {};

const chapterById = Object.fromEntries(chapters.map((chapter) => [chapter.id, chapter]));

function mediaUrl(path) {
  if (!config.mediaBaseUrl) return "";
  return `${config.mediaBaseUrl.replace(/\/$/, "")}/${path}`;
}

function playerMedia(project) {
  const useOfficial = config.mediaMode === "official";
  if (useOfficial && project.officialMedia?.type === "youtube") {
    return `<iframe
      src="${project.officialMedia.src}"
      title="${project.cardTitle} 官方视频"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
      referrerpolicy="strict-origin-when-cross-origin"
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

function unavailableMedia(project) {
  return `<div class="media-unavailable">
    <img src="${project.poster}" alt="${project.cardTitle} 视频封面" />
    <div>
      <strong>该视频暂无稳定的官方嵌入地址</strong>
      <span>可以继续查看论文 / 项目页，或在部署前接入自有媒体源。</span>
      <a href="${project.source}" target="_blank" rel="noreferrer">前往项目页 ↗</a>
    </div>
  </div>`;
}

function renderChapters() {
  chapterRail.innerHTML = chapters
    .map(
      (chapter) => `
        <li>
          <button type="button" data-chapter="${chapter.id}" aria-label="筛选${chapter.title}">
            <span>${chapter.number}</span>
            <strong>${chapter.label}</strong>
            <small>${chapter.title}</small>
          </button>
        </li>`,
    )
    .join("");

  filters.insertAdjacentHTML(
    "beforeend",
    chapters
      .map(
        (chapter) => `
          <button type="button" class="filter" data-filter="${chapter.id}">
            ${chapter.title} <span>01</span>
          </button>`,
      )
      .join(""),
  );
}

function projectCard(project) {
  const chapter = chapterById[project.chapter];
  return `
    <article class="project-card" data-project-card data-chapter="${project.chapter}">
      <button type="button" class="project-open" data-project="${project.id}" aria-label="播放 ${project.cardTitle}">
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

function setFilter(filter) {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === filter);
  });

  document.querySelectorAll("[data-project-card]").forEach((card) => {
    card.hidden = filter !== "all" && card.dataset.chapter !== filter;
  });
}

function playerField(selector, value) {
  const node = player.querySelector(selector);
  if (node) node.textContent = value;
}

function openProject(projectId, updateUrl = true) {
  const project = projects.find((item) => item.id === projectId);
  if (!project) return;

  playerField("[data-player-index]", project.index);
  playerField("[data-player-kicker]", project.kicker);
  playerField("[data-player-title]", project.title);
  playerField("[data-player-description]", project.description);
  playerField("[data-player-paper]", project.paper);
  playerField("[data-player-role]", project.role);
  playerField("[data-player-boundary]", project.boundary);
  const source = player.querySelector("[data-player-source]");
  source.href = project.source;

  mediaWrap.innerHTML = playerMedia(project);
  const activeVideo = mediaWrap.querySelector("[data-active-video]");
  if (activeVideo) {
    activeVideo.addEventListener("error", () => {
      mediaWrap.innerHTML = unavailableMedia(project);
    }, { once: true });
  }

  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set("work", project.id);
    window.history.replaceState({}, "", url);
  }

  player.showModal();
}

function closePlayer() {
  const video = mediaWrap.querySelector("video");
  if (video) video.pause();
  mediaWrap.innerHTML = "";
  player.close();
  const url = new URL(window.location.href);
  url.searchParams.delete("work");
  window.history.replaceState({}, "", url);
}

renderChapters();
renderProjects();

filters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (button) setFilter(button.dataset.filter);
});

chapterRail.addEventListener("click", (event) => {
  const button = event.target.closest("[data-chapter]");
  if (!button) return;
  setFilter(button.dataset.chapter);
  document.querySelector("#work").scrollIntoView({ behavior: "smooth" });
});

projectGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-project]");
  if (button) openProject(button.dataset.project);
});

document.querySelector("[data-open-featured]").addEventListener("click", () => {
  openProject(projects.find((project) => project.featured)?.id || projects[0].id);
});

document.querySelector("[data-close-player]").addEventListener("click", closePlayer);

player.addEventListener("click", (event) => {
  if (event.target === player) closePlayer();
});

player.addEventListener("cancel", (event) => {
  event.preventDefault();
  closePlayer();
});

const header = document.querySelector("[data-header]");
const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

const initialProject = new URL(window.location.href).searchParams.get("work");
if (initialProject) openProject(initialProject, false);
