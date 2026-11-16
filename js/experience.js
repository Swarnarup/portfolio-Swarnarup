async function loadJSON(path) {
  const res = await fetch(path);
  return res.json();
}

function getExperienceId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id") || "arista";
}

function renderHeader(content) {
  const el = document.getElementById("site-header");
  el.innerHTML =
    `<p class="eyebrow">${content.header.company} &nbsp;&middot;&nbsp; ${content.header.team}</p>` +
    `<h1>${content.hero.line1}<br><em>${content.hero.line2}</em></h1>` +
    `<p class="subtitle">${content.hero.description}</p>`;
}

function renderPaper(paper) {
  if (!paper) return;
  const el = document.getElementById("paper-section");
  const collabs = (paper.collaborators || [])
    .map(c => `<span class="chip">${c}</span>`)
    .join("");

  el.innerHTML =
    `<div class="paper-card">` +
      `<div class="paper-label">Published paper</div>` +
      `<div class="paper-title">${paper.title}</div>` +
      `<div class="paper-venue">${paper.venue}</div>` +
      (collabs ? `<div class="paper-collabs"><div class="paper-collabs-label">Collaborators</div><div class="chips">${collabs}</div></div>` : "") +
      (paper.url ? `<a class="paper-link" href="${paper.url}" target="_blank" rel="noopener">Read paper &rarr;</a>` : "") +
    `</div>`;
}

function renderChapter(entry, index) {
  const dotClass = entry.dotFilled ? "dot filled" : "dot";
  let body = "";

  if (entry.modules && entry.modules.length) {
    body =
      `<div class="crossmodule" id="crossmodule-card">` +
        `<div class="crossmodule-label">${entry.modulesLabel || "Modules touched"}</div>` +
        `<div class="module-grid">` +
          entry.modules.map(m => `<div class="module-pill">${m}</div>`).join("") +
        `</div>` +
      `</div>`;
  } else if (entry.tags && entry.tags.length) {
    body =
      `<div class="chips">` +
        entry.tags.map(t => `<span class="chip">${t}</span>`).join("") +
      `</div>`;
  }

  return (
    `<div class="chapter" data-delay="${index * 100}">` +
      `<div class="${dotClass}"></div>` +
      `<div class="chapter-meta"><span class="tag ${entry.color}">${entry.period}</span></div>` +
      `<div class="chapter-title">${entry.title}</div>` +
      `<div class="chapter-desc">${entry.description}</div>` +
      body +
    `</div>`
  );
}

function renderTimeline(experiences) {
  const container = document.getElementById("timeline");
  container.insertAdjacentHTML(
    "beforeend",
    experiences.map((e, i) => renderChapter(e, i)).join("")
  );
}

function renderFooter(footer) {
  const el = document.getElementById("site-footer");
  el.innerHTML =
    `<span class="footer-left">${footer.left}</span>` +
    `<span class="footer-right">${footer.right}</span>`;
}

function initAnimations() {
  const chapters = document.querySelectorAll(".chapter");
  const spineFill = document.getElementById("spine-fill");
  const timeline = document.querySelector(".timeline");
  const crossmoduleCard = document.getElementById("crossmodule-card");

  const chapterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      setTimeout(() => el.classList.add("visible"), parseInt(el.dataset.delay || 0));
      chapterObs.unobserve(el);
    });
  }, { threshold: 0.12 });
  chapters.forEach(c => chapterObs.observe(c));

  if (crossmoduleCard) {
    const pills = crossmoduleCard.querySelectorAll(".module-pill");
    const pillObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        pills.forEach((pill, i) => setTimeout(() => pill.classList.add("pop"), i * 55));
        pillObs.disconnect();
      });
    }, { threshold: 0.25 });
    pillObs.observe(crossmoduleCard);
  }

  if (timeline && spineFill) {
    const spineObs = new IntersectionObserver(() => {
      spineFill.style.height = "100%";
      spineObs.disconnect();
    }, { threshold: 0.01 });
    spineObs.observe(timeline);
  }
}

async function init() {
  const id = getExperienceId();
  const base = `data/${id}`;

  const [content, timeline] = await Promise.all([
    loadJSON(`${base}/content.json`),
    loadJSON(`${base}/timeline.json`),
  ]);

  renderHeader(content);
  renderPaper(content.paper);
  renderTimeline(timeline);
  renderFooter(content.footer);
  if (content.meta && content.meta.title) document.title = content.meta.title;
  initAnimations();
}

init();
