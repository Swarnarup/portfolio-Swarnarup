async function loadJSON(path) {
  const res = await fetch(path);
  return res.json();
}

function renderHeader(site) {
  const el = document.getElementById("landing-header");
  el.innerHTML =
    `<h1 class="landing-name">${site.name}</h1>` +
    `<p class="landing-tagline">${site.tagline}</p>`;
}

function renderCard(id, card, index) {
  return (
    `<a class="experience-card" href="experience.html?id=${id}" data-delay="${index * 120}">` +
      `<div class="card-top">` +
        `<span class="tag ${card.color}">${card.type}</span>` +
        `<span class="card-duration">${card.duration}</span>` +
      `</div>` +
      `<div class="card-title">${card.title}</div>` +
      `<div class="card-subtitle">${card.subtitle}</div>` +
    `</a>`
  );
}

function renderFooter(site) {
  const el = document.getElementById("site-footer");
  const socialHTML = (site.social || [])
    .map(s => `<a class="social-link" href="${s.url}" target="_blank" rel="noopener">${s.label}</a>`)
    .join("");

  el.innerHTML =
    `<span class="footer-left">${site.footer.left}</span>` +
    (socialHTML ? `<div class="social-links">${socialHTML}</div>` : `<span class="footer-right">${site.footer.right}</span>`);
}

function initAnimations() {
  const cards = document.querySelectorAll(".experience-card");
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      setTimeout(() => el.classList.add("visible"), parseInt(el.dataset.delay || 0));
      obs.unobserve(el);
    });
  }, { threshold: 0.1 });
  cards.forEach(c => obs.observe(c));
}

async function init() {
  const site = await loadJSON("data/site.json");
  const ids = site.experiences;

  const contents = await Promise.all(
    ids.map(id => loadJSON(`data/${id}/content.json`))
  );

  renderHeader(site);

  const el = document.getElementById("experience-list");
  el.innerHTML = contents.map((c, i) => renderCard(ids[i], c.card, i)).join("");

  renderFooter(site);
  if (site.name) document.title = site.name;
  initAnimations();
}

init();
