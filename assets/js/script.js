/* ============================================
   JOHNTECH — script.js
   Handles: sticky header, mobile menu toggle,
            active nav link on scroll
   ============================================ */

const header    = document.getElementById('site-header');
const hamburger = document.getElementById('hamburger');
const navMobile = document.getElementById('nav-mobile');
const navLinks  = document.querySelectorAll('.nav-link');

// ── Sticky header on scroll ────────────────
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// ── Mobile menu toggle ─────────────────────
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
const filterBtns = document.querySelectorAll('.filter-btn');
const portCards  = document.querySelectorAll('.port-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active button
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

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