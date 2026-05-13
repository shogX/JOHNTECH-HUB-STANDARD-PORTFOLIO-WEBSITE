
const API_BASE  = 'http://localhost:5001';
const header    = document.getElementById('site-header');
const hamburger = document.getElementById('hamburger');
const navMobile = document.getElementById('nav-mobile');
const navLinks  = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// jjjjjjohn Mobile menu toggle jjjjjjjjjjjjjjjjjjohn
hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  navMobile.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
});

// Close mobile menu when a link is clicked
navMobile.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navMobile.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
  });
});

// ── Active nav link on scroll ──────────────
const sections = document.querySelectorAll('section[id], .hero[id]');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === `#${entry.target.id}`
          );
        });
      }
    });
  },
  { threshold: 0.4 }
);

sections.forEach(section => observer.observe(section));


// ── Animate skill bars when section scrolls into view ──
const skillCards = document.querySelectorAll('.skill-card');

const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        skillObserver.unobserve(entry.target); // animate once only
      }
    });
  },
  { threshold: 0.25 }
);

skillCards.forEach(card => skillObserver.observe(card));

// ── Portfolio filter tabs ──────────────────────
const portfolioGrid = document.querySelector('.portfolio-grid');
const filterBtns = document.querySelectorAll('.filter-btn');

const normalizeJobCategory = (category) => {
  const value = (category || '').toLowerCase();
  if (value.includes('web')) return 'web';
  if (value.includes('design') || value.includes('ui') || value.includes('ux')) return 'design';
  if (value.includes('api') || value.includes('backend') || value.includes('node')) return 'api';
  return 'other';
};

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active button
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    const portCards = portfolioGrid.querySelectorAll('.port-card, .job-card');

    portCards.forEach(card => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.classList.remove('hidden');
        // Re-trigger entrance animation
        card.style.animation = 'none';
        card.offsetHeight; // reflow
        card.style.animation = '';
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// ── Live jobs from backend ─────────────────────
const renderJobs = (jobs) => {
  if (!portfolioGrid) return;
  portfolioGrid.querySelectorAll('.dynamic-job-card, .jobs-empty').forEach(card => card.remove());

  if (!jobs.length) {
    portfolioGrid.insertAdjacentHTML('afterbegin', '<div class="jobs-empty">No jobs found. Add a job in the dashboard to see it here.</div>');
    return;
  }

  const html = jobs.map(job => {
    const url = job.link ? job.link : '#';
    const badge = job.category ? job.category : 'Job';
    const featuredClass = job.featured ? 'port-badge--purple' : 'port-badge--pink';
    const category = normalizeJobCategory(job.category);
    const imageSrc = job.image
      ? job.image.startsWith('/')
        ? `${API_BASE}${job.image}`
        : job.image
      : 'https://via.placeholder.com/640x400?text=Project+Image';
    return `
      <article class="port-card dynamic-job-card" data-category="${category}">
        <div class="port-card-img-wrap">
          <img src="${imageSrc}" alt="${job.title} image" class="port-card-img" />
          ${job.link ? `<div class="port-card-overlay"><a href="${url}" target="_blank" rel="noopener" class="port-overlay-btn" aria-label="View project details"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg></a></div>` : ''}
        </div>
        <div class="port-card-body">
          <span class="port-badge ${featuredClass}">${badge}</span>
          <h3 class="port-card-title">${job.title}</h3>
          <p class="port-card-desc">${job.description}</p>
          <div class="job-card-meta">
            <span>${job.company || 'Unknown company'}</span>
            ${job.link ? `<a href="${url}" target="_blank" rel="noopener">View details</a>` : ''}
          </div>
        </div>
      </article>
    `;
  }).join('');

  portfolioGrid.insertAdjacentHTML('afterbegin', html);
};

const loadJobs = async () => {
  if (!portfolioGrid) return;
  portfolioGrid.querySelectorAll('.dynamic-job-card, .jobs-empty').forEach(card => card.remove());
  portfolioGrid.insertAdjacentHTML('afterbegin', '<div class="jobs-empty">Loading jobs...</div>');

  try {
    const response = await fetch(`${API_BASE}/api/jobs`);
    if (!response.ok) {
      throw new Error(`Unable to load jobs (${response.status})`);
    }
    const jobs = await response.json();
    renderJobs(jobs);
  } catch (error) {
    console.error(error);
    portfolioGrid.querySelectorAll('.dynamic-job-card, .jobs-empty').forEach(card => card.remove());
    portfolioGrid.insertAdjacentHTML('afterbegin', `<div class="jobs-empty">Unable to load jobs from the backend. ${error.message}</div>`);
  }
};

loadJobs();