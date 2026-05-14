const origin = typeof window !== 'undefined' && window.location && window.location.origin;
const isFile =
  !origin ||
  origin === 'null' ||
  (window.location && window.location.protocol === 'file:');
const API_BASE = window.API_BASE || (isFile ? 'http://localhost:5000' : origin);

const header = document.getElementById('site-header');
const hamburger = document.getElementById('hamburger');
const navMobile = document.getElementById('nav-mobile');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  navMobile.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
});

navMobile.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navMobile.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
  });
});

const sections = document.querySelectorAll('section[id], .hero[id]');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      }
    });
  },
  { threshold: 0.4 }
);

sections.forEach((section) => observer.observe(section));

const skillCards = document.querySelectorAll('.skill-card');

const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        skillObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.25 }
);

skillCards.forEach((card) => skillObserver.observe(card));

const portfolioGrid = document.querySelector('.portfolio-grid');
const portfolioFilters = document.getElementById('portfolio-filters');
const portfolioSearch = document.getElementById('portfolio-search');

const portfolioGalleryByJob = new Map();

const portfolioSkeletonCards = (n = 6) =>
  Array.from({ length: n })
    .map(
      () => `
  <article class="cms-portfolio-skel-card portfolio-skeleton-card cms-skeleton" aria-hidden="true">
    <div class="cms-skel-line cms-skeleton" style="height:100%;min-height:160px;border-radius:0;"></div>
    <div style="padding:16px;display:grid;gap:10px;">
      <div class="cms-skel-line cms-skeleton" style="width:40%;"></div>
      <div class="cms-skel-line cms-skeleton" style="width:85%;"></div>
      <div class="cms-skel-line cms-skeleton" style="width:70%;"></div>
    </div>
  </article>`
    )
    .join('');

const skillsSkeletonInner = () =>
  [1, 2, 3]
    .map(
      () => `
    <div class="skill-card skills-skeleton-card cms-skeleton">
      <div class="cms-skel-line cms-skeleton" style="width:44px;height:44px;border-radius:14px;"></div>
      <div class="cms-skel-line cms-skeleton" style="width:55%;height:18px;"></div>
      <div class="cms-skel-line cms-skeleton" style="width:100%;height:10px;"></div>
      <div class="cms-skel-line cms-skeleton" style="width:100%;height:10px;"></div>
      <div class="cms-skel-line cms-skeleton" style="width:90%;height:10px;"></div>
    </div>`
    )
    .join('');

const servicesSkeletonInner = () =>
  [1, 2, 3]
    .map(
      () => `
  <div class="svc-card services-skeleton-card cms-skeleton">
    <div class="cms-skel-line cms-skeleton" style="width:52px;height:52px;border-radius:16px;"></div>
    <div class="cms-skel-line cms-skeleton" style="width:60%;height:22px;"></div>
    <div class="cms-skel-line cms-skeleton" style="width:100%;height:12px;"></div>
    <div class="cms-skel-line cms-skeleton" style="width:95%;height:12px;"></div>
  </div>`
    )
    .join('');

const showSkillsSkeleton = () => {
  const grid = document.querySelector('.skills-inner .skills-grid') || document.querySelector('.skills-grid');
  if (grid) grid.innerHTML = skillsSkeletonInner();
};

const showServicesSkeleton = () => {
  const grid = document.querySelector('.services-inner .services-grid') || document.querySelector('.services-grid');
  if (grid) grid.innerHTML = servicesSkeletonInner();
};

const normalizeJobCategory = (category) => {
  const value = (category || '').toLowerCase();
  if (value.includes('web')) return 'web';
  if (value.includes('design') || value.includes('ui') || value.includes('ux')) return 'design';
  if (value.includes('api') || value.includes('backend') || value.includes('node')) return 'api';
  return 'other';
};

const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  if (url.startsWith('/')) return `${API_BASE}${url}`;
  return url;
};

const escapeHtml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const wrapHighlights = (text, words) => {
  if (!text) return '';
  if (!words || !words.length) return escapeHtml(text);
  const pattern = new RegExp(
    `(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
    'gi'
  );
  return escapeHtml(text).replace(pattern, '<span class="gradient-word">$1</span>');
};

let activePortfolioFilter = 'all';

const applyPortfolioFilter = () => {
  if (!portfolioGrid) return;
  const q = (portfolioSearch && portfolioSearch.value ? portfolioSearch.value : '').toLowerCase().trim();
  const portCards = portfolioGrid.querySelectorAll('.port-card, .job-card');

  portCards.forEach((card) => {
    const cat = card.dataset.category || 'other';
    const hay = `${card.dataset.title || ''} ${card.dataset.desc || ''} ${card.dataset.tech || ''}`.toLowerCase();
    const matchesFilter = activePortfolioFilter === 'all' || cat === activePortfolioFilter;
    const matchesSearch = !q || hay.includes(q);
    if (matchesFilter && matchesSearch) {
      card.classList.remove('hidden');
      card.style.animation = 'none';
      card.offsetHeight;
      card.style.animation = '';
    } else {
      card.classList.add('hidden');
    }
  });
};

const wirePortfolioFilters = () => {
  if (!portfolioFilters) return;
  portfolioFilters.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      portfolioFilters.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activePortfolioFilter = btn.dataset.filter || 'all';
      applyPortfolioFilter();
    });
  });
};

if (portfolioSearch) {
  portfolioSearch.addEventListener('input', () => {
    applyPortfolioFilter();
  });
}

const trackJobView = async (id) => {
  if (!id) return;
  try {
    await fetch(`${API_BASE}/api/jobs/${id}/view`, { method: 'POST' });
  } catch {
    /* ignore */
  }
};

let portfolioLightboxEl = null;
let portfolioLightboxState = { jobId: null, images: [], title: '', index: 0 };

const ensurePortfolioLightbox = () => {
  if (portfolioLightboxEl) return portfolioLightboxEl;
  const root = document.createElement('div');
  root.id = 'portfolio-lightbox';
  root.className = 'portfolio-lightbox';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = `
    <div class="portfolio-lightbox__backdrop" data-lbx-close="1"></div>
    <div class="portfolio-lightbox__panel">
      <div class="portfolio-lightbox__head">
        <h3 class="portfolio-lightbox__title" id="portfolio-lbx-title"></h3>
        <button type="button" class="portfolio-lightbox__close" aria-label="Close gallery" data-lbx-close="1">&times;</button>
      </div>
      <div class="portfolio-lightbox__stage">
        <button type="button" class="portfolio-lightbox__nav portfolio-lightbox__nav--prev" aria-label="Previous image" data-lbx-prev="1"><i class="fas fa-chevron-left"></i></button>
        <img class="portfolio-lightbox__img" id="portfolio-lbx-img" alt="" />
        <button type="button" class="portfolio-lightbox__nav portfolio-lightbox__nav--next" aria-label="Next image" data-lbx-next="1"><i class="fas fa-chevron-right"></i></button>
      </div>
      <div class="portfolio-lightbox__meta">
        <span id="portfolio-lbx-counter"></span>
        <span>Click outside or press Esc to close</span>
      </div>
      <div class="portfolio-lightbox__thumbs" id="portfolio-lbx-thumbs"></div>
    </div>`;
  document.body.appendChild(root);
  portfolioLightboxEl = root;

  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-lbx-close]')) closePortfolioLightbox();
    if (e.target.closest('[data-lbx-prev]')) shiftPortfolioLightbox(-1);
    if (e.target.closest('[data-lbx-next]')) shiftPortfolioLightbox(1);
  });

  root.querySelector('#portfolio-lbx-thumbs').addEventListener('click', (e) => {
    const t = e.target.closest('.portfolio-lightbox__thumb');
    if (!t) return;
    const idx = Number(t.dataset.slide || 0);
    if (!Number.isNaN(idx)) showPortfolioLightboxSlide(idx);
  });

  return root;
};

const updatePortfolioLightboxUi = () => {
  if (!portfolioLightboxEl) return;
  const { images, title, index } = portfolioLightboxState;
  const img = portfolioLightboxEl.querySelector('#portfolio-lbx-img');
  const ttl = portfolioLightboxEl.querySelector('#portfolio-lbx-title');
  const ctr = portfolioLightboxEl.querySelector('#portfolio-lbx-counter');
  const prev = portfolioLightboxEl.querySelector('[data-lbx-prev]');
  const next = portfolioLightboxEl.querySelector('[data-lbx-next]');
  const thumbs = portfolioLightboxEl.querySelector('#portfolio-lbx-thumbs');
  const cur = images[index];
  if (img) {
    img.src = cur || '';
    img.alt = title ? `${title} — image ${index + 1}` : `Image ${index + 1}`;
  }
  if (ttl) ttl.textContent = title || 'Project gallery';
  if (ctr) ctr.textContent = `${index + 1} / ${Math.max(images.length, 1)}`;
  if (prev) prev.disabled = index <= 0;
  if (next) next.disabled = index >= images.length - 1;
  if (thumbs) {
    thumbs.innerHTML = images
      .map(
        (src, i) =>
          `<img class="portfolio-lightbox__thumb${i === index ? ' is-active' : ''}" src="${escapeHtml(
            src
          )}" data-slide="${i}" alt="" />`
      )
      .join('');
  }
};

const showPortfolioLightboxSlide = (idx) => {
  const max = portfolioLightboxState.images.length - 1;
  portfolioLightboxState.index = Math.max(0, Math.min(max, idx));
  updatePortfolioLightboxUi();
};

const shiftPortfolioLightbox = (delta) => {
  showPortfolioLightboxSlide(portfolioLightboxState.index + delta);
};

const openPortfolioLightbox = (jobId, startIndex = 0) => {
  const payload = portfolioGalleryByJob.get(jobId);
  if (!payload || !payload.images.length) return;
  ensurePortfolioLightbox();
  portfolioLightboxState = {
    jobId,
    images: payload.images,
    title: payload.title || '',
    index: Math.max(0, Math.min(payload.images.length - 1, startIndex)),
  };
  portfolioLightboxEl.classList.add('is-open');
  portfolioLightboxEl.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  updatePortfolioLightboxUi();
};

const closePortfolioLightbox = () => {
  if (!portfolioLightboxEl) return;
  portfolioLightboxEl.classList.remove('is-open');
  portfolioLightboxEl.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  portfolioLightboxState = { jobId: null, images: [], title: '', index: 0 };
};

const onPortfolioLightboxKeydown = (e) => {
  if (!portfolioLightboxEl || !portfolioLightboxEl.classList.contains('is-open')) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    closePortfolioLightbox();
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    shiftPortfolioLightbox(-1);
  }
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    shiftPortfolioLightbox(1);
  }
};

document.addEventListener('keydown', onPortfolioLightboxKeydown);

const wirePortfolioLightbox = () => {
  if (!portfolioGrid) return;
  portfolioGrid.addEventListener('click', (e) => {
    const openBtn = e.target.closest('.port-gallery-open');
    if (openBtn) {
      e.preventDefault();
      e.stopPropagation();
      const id = openBtn.getAttribute('data-job-id');
      const start = Number(openBtn.getAttribute('data-slide-start') || 0);
      openPortfolioLightbox(id, start);
      return;
    }
    const th = e.target.closest('.port-mini-gallery img[data-slide]');
    if (th) {
      e.preventDefault();
      e.stopPropagation();
      const card = th.closest('[data-job-id]');
      const id = card?.getAttribute('data-job-id');
      const slide = Number(th.getAttribute('data-slide') || 0);
      if (id) openPortfolioLightbox(id, slide);
    }
  });
};

wirePortfolioLightbox();

const renderPortfolioFilters = (filters) => {
  if (!portfolioFilters) return;
  const list =
    Array.isArray(filters) && filters.length
      ? filters
      : [
          { slug: 'all', label: 'All' },
          { slug: 'web', label: 'Web Development' },
          { slug: 'design', label: 'UI/UX Design' },
          { slug: 'api', label: 'API / Backend' },
        ];
  const sorted = [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  portfolioFilters.innerHTML = sorted
    .map(
      (f, idx) =>
        `<button type="button" class="filter-btn${idx === 0 ? ' active' : ''}" data-filter="${escapeHtml(
          f.slug
        )}">${escapeHtml(f.label)}</button>`
    )
    .join('');
  activePortfolioFilter = sorted[0]?.slug || 'all';
  wirePortfolioFilters();
  applyPortfolioFilter();
};

const renderJobs = (jobs) => {
  if (!portfolioGrid) return;
  portfolioGrid.querySelectorAll('.dynamic-job-card, .jobs-empty, .portfolio-skeleton-card').forEach((card) => card.remove());
  portfolioGalleryByJob.clear();

  const visibleJobs = (jobs || []).filter((job) => !job.status || job.status === 'published');

  if (!visibleJobs.length) {
    portfolioGrid.insertAdjacentHTML(
      'afterbegin',
      '<div class="jobs-empty">No projects found. Add a project in the dashboard to see it here.</div>'
    );
    return;
  }

  const html = visibleJobs
    .map((job) => {
      const primaryUrl = job.liveUrl || job.link || '';
      const url = primaryUrl || '#';
      const badge = job.status && job.status !== 'published' ? job.status : job.category || 'Project';
      const featuredClass = job.featured ? 'port-badge--purple' : 'port-badge--pink';
      const category = normalizeJobCategory(job.category);
      const imageSrc = job.image ? resolveMediaUrl(job.image) : 'https://via.placeholder.com/640x400?text=Project+Image';
      const gallery = Array.isArray(job.gallery) ? job.gallery.map(resolveMediaUrl).filter(Boolean) : [];
      const main = imageSrc;
      const rest = gallery.filter((g) => g && g !== main);
      const uniqueImages = [main, ...rest].filter(Boolean);
      portfolioGalleryByJob.set(String(job._id), { title: job.title || '', images: uniqueImages });

      const tech = Array.isArray(job.technologies) ? job.technologies : [];
      const techHtml = tech
        .map(
          (t) =>
            `<span class="port-badge port-badge--pink" style="margin:4px 4px 0 0;display:inline-block;">${escapeHtml(
              t
            )}</span>`
        )
        .join('');
      const overlayParts = [];
      if (job.githubUrl) {
        overlayParts.push(
          `<a href="${escapeHtml(job.githubUrl)}" target="_blank" rel="noopener" class="port-overlay-btn" data-view="${job._id}" aria-label="GitHub"><i class="fab fa-github"></i></a>`
        );
      }
      if (job.liveUrl || job.link) {
        overlayParts.push(
          `<a href="${escapeHtml(job.liveUrl || job.link)}" target="_blank" rel="noopener" class="port-overlay-btn" data-view="${job._id}" aria-label="Live preview"><i class="fas fa-arrow-up-right-from-square"></i></a>`
        );
      }
      const overlayDefault = `<a href="${escapeHtml(
        url
      )}" target="_blank" rel="noopener" class="port-overlay-btn" data-view="${job._id}" aria-label="View project details"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg></a>`;
      const overlayInner = overlayParts.length ? overlayParts.join('') : job.link ? overlayDefault : '';
      const overlayHtml = overlayInner ? `<div class="port-card-overlay">${overlayInner}</div>` : '';

      const extras = uniqueImages.slice(1);
      const thumbs =
        extras.length > 0
          ? `<div class="port-mini-gallery" style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap;">${extras
              .slice(0, 4)
              .map((src, i) => {
                const slideIdx = i + 1;
                return `<img src="${escapeHtml(src)}" alt="" data-slide="${slideIdx}" style="width:56px;height:40px;object-fit:cover;border-radius:10px;border:1px solid rgba(148,163,184,0.25);cursor:pointer;" />`;
              })
              .join('')}</div>`
          : '';

      const galleryBtn =
        uniqueImages.length > 0
          ? `<button type="button" class="port-gallery-open" data-job-id="${job._id}" data-slide-start="0">${
              uniqueImages.length > 1 ? `Gallery (${uniqueImages.length})` : 'View image'
            }</button>`
          : '';

      return `
      <article class="port-card dynamic-job-card" data-job-id="${job._id}" data-category="${category}" data-title="${escapeHtml(
        job.title || ''
      )}" data-desc="${escapeHtml(job.description || '')}" data-tech="${escapeHtml(tech.join(' '))}">
        <div class="port-card-img-wrap">
          <img src="${imageSrc}" alt="${escapeHtml(job.title || '')} image" class="port-card-img" />
          ${overlayHtml}
        </div>
        <div class="port-card-body">
          <span class="port-badge ${featuredClass}">${escapeHtml(badge)}</span>
          <h3 class="port-card-title">${escapeHtml(job.title || '')}</h3>
          <p class="port-card-desc">${escapeHtml(job.description || '')}</p>
          ${techHtml ? `<div style="margin-top:8px;">${techHtml}</div>` : ''}
          ${thumbs}
          ${galleryBtn}
          <div class="job-card-meta">
            <span>${escapeHtml(job.company || '')}</span>
            ${
              primaryUrl || job.link
                ? `<a href="${escapeHtml(job.liveUrl || job.link)}" target="_blank" rel="noopener" data-view="${
                    job._id
                  }">View details</a>`
                : ''
            }
          </div>
        </div>
      </article>`;
    })
    .join('');

  portfolioGrid.insertAdjacentHTML('afterbegin', html);

  portfolioGrid.querySelectorAll('[data-view]').forEach((el) => {
    el.addEventListener('click', () => {
      const id = el.getAttribute('data-view');
      trackJobView(id);
    });
  });

  applyPortfolioFilter();
};

const loadJobs = async () => {
  if (!portfolioGrid) return;
  portfolioGrid.querySelectorAll('.dynamic-job-card, .jobs-empty, .portfolio-skeleton-card').forEach((card) => card.remove());
  portfolioGrid.insertAdjacentHTML('afterbegin', portfolioSkeletonCards(6));

  try {
    const response = await fetch(`${API_BASE}/api/jobs`);
    if (!response.ok) {
      throw new Error(`Unable to load jobs (${response.status})`);
    }
    const jobs = await response.json();
    renderJobs(jobs);
  } catch (error) {
    console.error(error);
    portfolioGrid.querySelectorAll('.dynamic-job-card, .jobs-empty, .portfolio-skeleton-card').forEach((card) => card.remove());
    portfolioGrid.insertAdjacentHTML(
      'afterbegin',
      `<div class="jobs-empty">Unable to load jobs from the backend. ${error.message}</div>`
    );
  }
};

const renderSkills = (skills) => {
  const grid = document.querySelector('.skills-grid');
  if (!grid) return;

  const groups = ['Development', 'UI/UX Design', 'Frameworks & Tools'];
  const visible = (skills || []).filter((s) => s.visible !== false);
  const byCat = groups.map((g) => ({
    title: g,
    items: visible.filter((s) => s.category === g).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  }));

  grid.innerHTML = byCat
    .map((group) => {
      const icon = group.items[0]?.icon || 'code';
      const iconTone =
        group.title === 'UI/UX Design'
          ? 'skill-icon--design'
          : group.title === 'Frameworks & Tools'
            ? 'skill-icon--video'
            : 'skill-icon--dev';
      const bars = group.items
        .map((skill) => {
          const ms = skill.animationMs || 900;
          return `
        <div class="skill-bar-item">
          <div class="skill-bar-header"><span>${escapeHtml(skill.title)}</span><span class="skill-pct skill-pct--${escapeHtml(
            skill.colorType || 'purple'
          )}">${escapeHtml(skill.percentage)}%</span></div>
          <div class="skill-bar-track">
            <div class="skill-bar-fill skill-fill--${escapeHtml(skill.colorType || 'purple')}" style="--w:${escapeHtml(
              String(skill.percentage)
            )}%; transition-duration:${escapeHtml(String(ms))}ms;"></div>
          </div>
        </div>`;
        })
        .join('');

      return `
      <div class="skill-card">
        <div class="skill-card-icon ${iconTone}">
          <i class="fas fa-${escapeHtml(icon)}"></i>
        </div>
        <h3 class="skill-card-title">${escapeHtml(group.title)}</h3>
        <div class="skill-bars">${bars || '<p class="skills-subtitle">No skills in this group yet.</p>'}</div>
      </div>`;
    })
    .join('');

  document.querySelectorAll('.skill-card').forEach((card) => skillObserver.observe(card));
};

const loadSkills = async () => {
  showSkillsSkeleton();
  try {
    const response = await fetch(`${API_BASE}/api/cms/skills`);
    if (!response.ok) {
      throw new Error(`Unable to load skills (${response.status})`);
    }
    const skills = await response.json();
    renderSkills(skills);
  } catch (error) {
    console.error('Error loading skills:', error);
    const grid = document.querySelector('.skills-inner .skills-grid') || document.querySelector('.skills-grid');
    if (grid) {
      grid.innerHTML =
        '<div class="skill-card"><p class="skills-subtitle">Unable to load skills. Check that the API is running.</p></div>';
    }
  }
};

const renderServices = (services) => {
  const servicesGrid = document.querySelector('.services-grid');
  if (!servicesGrid) return;

  servicesGrid.innerHTML = '';

  const list = (services || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (!list.length) {
    servicesGrid.insertAdjacentHTML('afterbegin', '<p class="services-empty">No services found.</p>');
    return;
  }

  list.forEach((service, index) => {
    const colorClass = service.colorType === 'pink' ? 'svc-icon--pink' : 'svc-icon--purple';
    const glowClass = service.colorType === 'pink' ? 'svc-card-glow--pink' : 'svc-card-glow--purple';
    const featuresHtml = (service.features || []).map((feature) => `<li>${escapeHtml(feature)}</li>`).join('');
    const num = String(index + 1).padStart(2, '0');

    const html = `
      <div class="svc-card${service.featured ? ' svc-card--featured' : ''}">
        <div class="svc-card-glow ${glowClass}"></div>
        <div class="svc-card-top">
          <div class="svc-icon ${colorClass}">
            <i class="fas fa-${escapeHtml(service.icon || 'code')}"></i>
          </div>
          <span class="svc-number">${num}</span>
        </div>
        <h3 class="svc-title">${escapeHtml(service.title)}</h3>
        <p class="svc-desc">${escapeHtml(service.description)}</p>
        <ul class="svc-list">${featuresHtml}</ul>
        <a href="${escapeHtml(service.buttonLink || '#contact')}" class="svc-link">Learn More <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="12 5 19 12 12 19"></polyline><line x1="5" y1="12" x2="19" y2="12"></line></svg></a>
      </div>`;
    servicesGrid.insertAdjacentHTML('beforeend', html);
  });
};

const loadServices = async () => {
  showServicesSkeleton();
  try {
    const response = await fetch(`${API_BASE}/api/cms/services`);
    if (!response.ok) {
      throw new Error(`Unable to load services (${response.status})`);
    }
    const services = await response.json();
    renderServices(services);
  } catch (error) {
    console.error('Error loading services:', error);
    const servicesGrid = document.querySelector('.services-inner .services-grid') || document.querySelector('.services-grid');
    if (servicesGrid) {
      servicesGrid.innerHTML = '<p class="services-empty">Unable to load services. Check that the API is running.</p>';
    }
  }
};

const applySocialLinks = (socials) => {
  if (!socials) return;
  const map = [
    ['GitHub', socials.github],
    ['LinkedIn', socials.linkedin],
    ['Instagram', socials.instagram],
    ['Facebook', socials.facebook],
    ['Twitter / X', socials.twitter],
    ['TikTok', socials.tiktok],
    ['YouTube', socials.youtube],
  ];
  document.querySelectorAll('.socials .s-btn').forEach((btn) => {
    const title = btn.getAttribute('title');
    const match = map.find(([label]) => label === title);
    if (match && match[1]) {
      btn.setAttribute('href', match[1]);
    }
  });
};

const renderAboutCards = (cards) => {
  const host = document.querySelector('.about-right');
  if (!host) return;
  const list = Array.isArray(cards) ? cards.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : [];
  if (!list.length) return;

  host.innerHTML = list
    .map(
      (card) => `
    <div class="service-card">
      <div class="service-icon">
        <i class="fas fa-${escapeHtml(card.icon || 'code')}"></i>
      </div>
      <div>
        <h4 class="service-title">${escapeHtml(card.title || '')}</h4>
        <p class="service-desc">${escapeHtml(card.description || '')}</p>
      </div>
    </div>`
    )
    .join('');
};

const renderAboutPills = (pills) => {
  const wrap = document.querySelector('.about-pills');
  if (!wrap || !Array.isArray(pills)) return;
  wrap.innerHTML = pills.map((p) => `<span class="pill">${escapeHtml(p)}</span>`).join('');
};

const applySectionVisibility = (sectionsCfg) => {
  if (!sectionsCfg) return;
  const map = {
    hero: document.querySelector('.hero'),
    about: document.getElementById('about'),
    skills: document.getElementById('skills'),
    portfolio: document.getElementById('portfolio'),
    services: document.getElementById('services'),
    contact: document.getElementById('contact'),
    footer: document.querySelector('.footer'),
  };
  Object.entries(map).forEach(([key, el]) => {
    if (!el) return;
    if (sectionsCfg[key] === false) {
      el.classList.add('hidden');
    } else {
      el.classList.remove('hidden');
    }
  });
};

const applySectionOrder = (order) => {
  if (!Array.isArray(order) || !order.length) return;
  const map = {
    hero: document.querySelector('.hero'),
    about: document.getElementById('about'),
    skills: document.getElementById('skills'),
    portfolio: document.getElementById('portfolio'),
    services: document.getElementById('services'),
    contact: document.getElementById('contact'),
    footer: document.querySelector('.footer'),
  };
  const parent = document.body;
  order.forEach((key) => {
    const el = map[key];
    if (el) parent.appendChild(el);
  });
  const scene = document.getElementById('cms-scene');
  if (scene) parent.appendChild(scene);
};

const applySettings = (settings) => {
  if (!settings) return;

  if (settings.siteTitle) {
    document.title = settings.siteTitle;
  }

  if (settings.metaDescription) {
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', settings.metaDescription);
  }
  if (settings.metaKeywords) {
    const meta = document.querySelector('meta[name="keywords"]');
    if (meta) meta.setAttribute('content', settings.metaKeywords);
  }
  if (settings.googleAnalyticsId) {
    const existing = document.getElementById('ga4');
    if (!existing) {
      const s = document.createElement('script');
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(settings.googleAnalyticsId)}`;
      document.head.appendChild(s);
      const inline = document.createElement('script');
      inline.id = 'ga4';
      inline.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${settings.googleAnalyticsId}');`;
      document.head.appendChild(inline);
    }
  }

  if (settings.favicon) {
    const link = document.querySelector('link[rel="icon"]');
    if (link) link.setAttribute('href', resolveMediaUrl(settings.favicon));
  }
  if (settings.logo) {
    const img = document.getElementById('site-logo-img');
    if (img) img.setAttribute('src', resolveMediaUrl(settings.logo));
  }

  if (settings.primaryColor || settings.secondaryColor) {
    const root = document.documentElement;
    if (settings.primaryColor) root.style.setProperty('--cms-primary', settings.primaryColor);
    if (settings.secondaryColor) root.style.setProperty('--cms-secondary', settings.secondaryColor);
  }

  if (settings.hero) {
    const h = settings.hero;
    const tag = document.getElementById('cms-hero-tagline');
    if (tag) tag.textContent = h.tagline || '';
    const heading = document.getElementById('cms-hero-heading');
    if (heading) {
      const prefix = (h.headingPrefix || "Hi, I'm").replace(/\n/g, ' ').trim();
      heading.innerHTML = `${escapeHtml(prefix)} <span class="hero-gradient-text">${escapeHtml(h.name || '')}</span>`;
    }
    const sub = document.getElementById('cms-hero-sub');
    if (sub) sub.textContent = h.subtext || '';
    const bg = document.querySelector('.hero-bg-img');
    if (bg && h.bgImage) bg.src = resolveMediaUrl(h.bgImage);
    const heroImg = document.querySelector('.hero-orb img');
    if (heroImg && h.image) heroImg.src = resolveMediaUrl(h.image);
    const primary = document.getElementById('cms-hero-primary-cta');
    if (primary) {
      primary.innerHTML = `${escapeHtml(h.primaryCtaText || 'View My Work')} <span class="btn-arrow">→</span>`;
      primary.setAttribute('href', h.primaryCtaLink || '#portfolio');
    }
    const resume = document.getElementById('cms-hero-resume-btn');
    if (resume) {
      resume.textContent = h.resumeButtonText || 'Download Resume';
      resume.href = resolveMediaUrl(h.resumeLink || '#');
    }
    const orb = document.getElementById('cms-hero-orb-label');
    if (orb) orb.textContent = h.orbLabel || orb.textContent;

    const scene = document.getElementById('cms-scene');
    if (scene) {
      if (h.backgroundEffects === false) {
        scene.style.opacity = '0.15';
        scene.style.pointerEvents = 'none';
      } else {
        scene.style.opacity = '';
        scene.style.pointerEvents = '';
      }
    }

    const tagHost = document.getElementById('cms-hero-tags');
    if (tagHost) {
      if (Array.isArray(h.floatingTags) && h.floatingTags.length) {
        tagHost.innerHTML = h.floatingTags
          .map((t) => `<span class="pill" style="margin:0;">${escapeHtml(t)}</span>`)
          .join('');
      } else {
        tagHost.innerHTML = '';
      }
    }
  }

  if (settings.about) {
    const a = settings.about;
    const heading = document.querySelector('.about .section-heading h2');
    if (heading) {
      heading.innerHTML = `${escapeHtml(a.sectionTitle || 'About')} <span class="gradient-word">${escapeHtml(
        a.sectionGradientWord || 'Me'
      )}</span>`;
    }
    const nameEl = document.querySelector('.about-name');
    if (nameEl) {
      const emoji = a.greetingEmoji || '👋';
      nameEl.innerHTML = `Hi, I'm <span class="gradient-word">${escapeHtml(a.name || '')}</span> ${emoji}`;
    }
    const paras = document.querySelectorAll('.about-para');
    const words = a.highlightedWords || [];
    if (paras[0]) paras[0].innerHTML = wrapHighlights(a.bio1 || '', words);
    if (paras[1]) paras[1].innerHTML = wrapHighlights(a.bio2 || '', words);
    renderAboutPills(a.pills || []);
    renderAboutCards(a.cards || []);
  }

  if (settings.skillsSection?.subtitle) {
    const el = document.getElementById('cms-skills-subtitle');
    if (el) el.textContent = settings.skillsSection.subtitle;
  }

  if (settings.portfolioSection) {
    const p = settings.portfolioSection;
    const sub = document.getElementById('cms-portfolio-subtitle');
    if (sub) sub.textContent = p.subtitle || sub.textContent;
    const gh = document.getElementById('cms-github-cta');
    if (gh && p.githubProfileUrl) gh.setAttribute('href', p.githubProfileUrl);
    const ght = document.getElementById('cms-github-cta-text');
    if (ght && p.githubCtaText) ght.textContent = p.githubCtaText;
    renderPortfolioFilters(p.filters || []);
  } else {
    renderPortfolioFilters();
  }

  if (settings.servicesSection?.subtitle) {
    const el = document.getElementById('cms-services-subtitle');
    if (el) el.textContent = settings.servicesSection.subtitle;
  }

  if (settings.contact) {
    const c = settings.contact;
    const emailLink = document.getElementById('contact-email-link');
    if (emailLink) {
      emailLink.textContent = c.email || emailLink.textContent;
      emailLink.href = `mailto:${c.email || ''}`;
    }
    const phone = document.getElementById('contact-phone-text');
    if (phone) phone.textContent = c.phone || phone.textContent;
    const loc = document.getElementById('contact-location-text');
    if (loc) loc.textContent = c.location || c.address || loc.textContent;

    const eyebrow = document.getElementById('cms-contact-eyebrow');
    if (eyebrow) {
      eyebrow.innerHTML = `<span class="eyebrow-dot"></span> ${escapeHtml(c.eyebrow || '')}`;
    }
    const heading = document.getElementById('cms-contact-heading');
    if (heading) {
      const grad = c.headingGradientWord || 'Touch';
      const base = (c.heading || 'Get In Touch').replace(new RegExp(`${grad}$`), '').trim();
      heading.innerHTML = `${escapeHtml(base)} <span class="grad-text">${escapeHtml(grad)}</span>`;
    }
    const intro = document.getElementById('cms-contact-intro');
    if (intro) intro.textContent = c.intro || intro.textContent;

    const cvTitle = document.querySelector('.cv-card-inner .card-title');
    if (cvTitle && c.cvCardTitle) cvTitle.textContent = c.cvCardTitle;

    const cvBtn = document.getElementById('cms-cv-btn');
    if (cvBtn) {
      cvBtn.textContent = c.cvButtonText || 'Download My CV';
      const resume = settings.hero?.resumeLink;
      if (resume) {
        cvBtn.onclick = () => {
          window.open(resolveMediaUrl(resume), '_blank');
        };
      }
    }

    const wa = document.getElementById('cms-wa-btn');
    if (wa && c.whatsapp) {
      wa.onclick = () => {
        window.open(`https://wa.me/${String(c.whatsapp).replace(/\D/g, '')}`, '_blank');
      };
    }
  }

  if (settings.footer) {
    const f = settings.footer;
    const desc = document.querySelector('.footer .left-text p');
    if (desc) desc.textContent = f.description || desc.textContent;
    const copy = document.querySelector('.copy-right');
    if (copy) copy.innerHTML = `&copy; ${escapeHtml(f.copyright || '')}`;
    const credit = document.querySelector('.footer-2 p');
    if (credit && f.creditLine) credit.textContent = f.creditLine;

    const nav = document.querySelector('.footer .nav-bar ul');
    if (nav && Array.isArray(f.links) && f.links.length) {
      const sorted = f.links.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      nav.innerHTML = sorted
        .map((l) => `<li><a href="${escapeHtml(l.href)}">${escapeHtml(l.label)}</a></li>`)
        .join('');
    }

    const tagsHost = document.querySelector('.footer .right-text .all-span');
    if (tagsHost && Array.isArray(f.serviceTags) && f.serviceTags.length) {
      tagsHost.innerHTML = f.serviceTags.map((t) => `<span>${escapeHtml(t)}</span>`).join('');
    }

    const ql = document.querySelector('.footer .nav-bar h2');
    if (ql && f.quickLinksTitle) ql.textContent = f.quickLinksTitle;
    const st = document.querySelector('.footer .right-text h2');
    if (st && f.servicesColumnTitle) st.textContent = f.servicesColumnTitle;
  }

  applySocialLinks(settings.socials);
  applySectionVisibility(settings.sections);
  applySectionOrder(settings.sectionOrder || []);

  if (settings.darkMode === false) {
    document.body.classList.add('cms-light');
  } else {
    document.body.classList.remove('cms-light');
  }
};

const loadCMSContent = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/settings`);
    const settings = await response.json();
    if (!settings) return;
    applySettings(settings);
  } catch (err) {
    console.error('CMS Load Error:', err);
    renderPortfolioFilters();
  }
};

const recordVisit = async () => {
  if (sessionStorage.getItem('cms_visit_tracked')) return;
  sessionStorage.setItem('cms_visit_tracked', '1');
  try {
    await fetch(`${API_BASE}/api/analytics/visit`, { method: 'POST' });
  } catch {
    /* ignore */
  }
};

async function handleSend() {
  const btn = document.getElementById('send-btn');
  const data = {
    name: document.getElementById('f-name').value,
    email: document.getElementById('f-email').value,
    subject: document.getElementById('f-subject').value,
    message: document.getElementById('f-message').value,
  };

  if (btn) btn.disabled = true;
  try {
    const res = await fetch(`${API_BASE}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      document.getElementById('form-content').style.display = 'none';
      document.getElementById('success-view').style.display = 'flex';
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.message || 'Unable to send message.');
    }
  } catch (err) {
    alert('Error sending message.');
  } finally {
    if (btn) btn.disabled = false;
  }
}

window.handleSend = handleSend;

window.resetForm = function resetForm() {
  document.getElementById('form-content').style.display = 'block';
  document.getElementById('success-view').style.display = 'none';
};

recordVisit();
loadCMSContent();
loadJobs();
loadSkills();
loadServices();
