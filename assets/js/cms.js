const origin = typeof window !== 'undefined' && window.location && window.location.origin;
const isFile =
  !origin ||
  origin === 'null' ||
  (window.location && window.location.protocol === 'file:');
const API_BASE = window.API_BASE || (isFile ? 'http://localhost:5000' : origin);

const authHeaders = (json = true) => {
  const token = localStorage.getItem('cms_token');
  const h = {};
  if (json) h['Content-Type'] = 'application/json';
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
};

const getSettings = async () => {
  const r = await fetch(`${API_BASE}/api/settings`);
  if (!r.ok) throw new Error('Failed to load settings');
  return r.json();
};

const putSettings = async (patch) => {
  const r = await fetch(`${API_BASE}/api/cms/settings`, {
    method: 'PUT',
    headers: authHeaders(true),
    body: JSON.stringify(patch),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.message || 'Save failed');
  }
  return r.json();
};

let aboutCardsDraft = [];

const CMS_DRAFT_PREFIX = 'johntech_cms_draft:';
const DRAFTABLE_TABS = new Set(['hero', 'about', 'contact', 'footer', 'social', 'settings', 'portfolio']);

const cmsStackSkeleton = (n = 5) =>
  Array.from({ length: n })
    .map(
      () =>
        '<div class="cms-skeleton dash-skeleton-line" style="height:52px;border-radius:12px;margin-bottom:10px;max-width:100%;"></div>'
    )
    .join('');

const wireReorderDrag = (host) => {
  if (!host) return;
  let dragEl = null;
  host.querySelectorAll('[draggable="true"]').forEach((row) => {
    row.addEventListener('dragstart', (e) => {
      dragEl = row;
      row.style.opacity = '0.55';
      try {
        e.dataTransfer.effectAllowed = 'move';
      } catch {
        /* ignore */
      }
    });
    row.addEventListener('dragend', () => {
      row.style.opacity = '1';
      dragEl = null;
    });
    row.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (!dragEl || dragEl === row) return;
      const rect = row.getBoundingClientRect();
      const before = e.clientY < rect.top + rect.height / 2;
      if (before) host.insertBefore(dragEl, row);
      else host.insertBefore(dragEl, row.nextSibling);
    });
  });
};

const draftTimers = new Map();
const debounceDraftSave = (tabId) => {
  clearTimeout(draftTimers.get(tabId));
  draftTimers.set(
    tabId,
    setTimeout(() => {
      persistTabDraft(tabId);
      draftTimers.delete(tabId);
    }, 800)
  );
};

function collectTabDraft(tabId) {
  const root = document.getElementById(`tab-${tabId}`);
  if (!root) return null;
  const fields = {};
  const checks = {};
  root.querySelectorAll('input:not([type="file"])').forEach((el) => {
    if (!el.id || el.type === 'hidden') return;
    if (el.type === 'checkbox') {
      checks[el.id] = el.checked;
    } else if (el.type !== 'radio') {
      fields[el.id] = el.value;
    }
  });
  root.querySelectorAll('textarea, select').forEach((el) => {
    if (el.id) fields[el.id] = el.value;
  });
  const payload = { v: 1, t: Date.now(), fields, checks };
  if (tabId === 'about' && aboutCardsDraft.length) {
    payload.aboutCards = JSON.parse(JSON.stringify(aboutCardsDraft));
  }
  return payload;
}

function persistTabDraft(tabId) {
  if (!DRAFTABLE_TABS.has(tabId)) return;
  const payload = collectTabDraft(tabId);
  if (!payload) return;
  const hasText = Object.keys(payload.fields).some((k) => String(payload.fields[k] || '').trim());
  const hasCheck = Object.keys(payload.checks).some((k) => payload.checks[k]);
  const hasAbout = tabId === 'about' && payload.aboutCards && payload.aboutCards.length;
  if (!hasText && !hasCheck && !hasAbout) return;
  localStorage.setItem(`${CMS_DRAFT_PREFIX}${tabId}`, JSON.stringify(payload));
}

function applyTabDraft(tabId) {
  if (!DRAFTABLE_TABS.has(tabId)) return;
  const raw = localStorage.getItem(`${CMS_DRAFT_PREFIX}${tabId}`);
  if (!raw) return;
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return;
  }
  const root = document.getElementById(`tab-${tabId}`);
  if (!root) return;
  Object.entries(payload.fields || {}).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el && 'value' in el) el.value = val ?? '';
  });
  Object.entries(payload.checks || {}).forEach(([id, checked]) => {
    const el = document.getElementById(id);
    if (el && el.type === 'checkbox') el.checked = Boolean(checked);
  });
  if (tabId === 'about' && payload.aboutCards) {
    aboutCardsDraft = payload.aboutCards;
    window.CMS.renderAboutCardsEditor();
  }
}

function clearTabDraft(tabId) {
  localStorage.removeItem(`${CMS_DRAFT_PREFIX}${tabId}`);
}

function draftSourceTabFromTarget(el) {
  const root = el?.closest?.(
    '#tab-hero, #tab-about, #tab-contact, #tab-footer, #tab-social, #tab-settings, #tab-portfolio'
  );
  if (!root || root.classList.contains('hidden')) return null;
  const tab = root.id.replace(/^tab-/, '');
  return DRAFTABLE_TABS.has(tab) ? tab : null;
}

const loadTabData = async (tabName) => {
  switch (tabName) {
    case 'hero':
      await CMS.loadHeroData();
      break;
    case 'about':
      await CMS.loadAboutData();
      break;
    case 'skills':
      await CMS.loadSkillsData();
      break;
    case 'services':
      await CMS.loadServicesData();
      break;
    case 'contact':
      await CMS.loadContactData();
      break;
    case 'footer':
      await CMS.loadFooterData();
      break;
    case 'social':
      await CMS.loadSocialData();
      break;
    case 'settings':
      await CMS.loadSettingsData();
      break;
    case 'portfolio':
      await CMS.loadPortfolioSectionData();
      break;
    case 'analytics':
      window.loadDashboardAnalytics?.();
      break;
    case 'media':
      await CMS.loadMediaLibrary();
      break;
    default:
      break;
  }
  if (DRAFTABLE_TABS.has(tabName)) applyTabDraft(tabName);
};

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.cms-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      document.querySelectorAll('.cms-tab-content').forEach((t) => t.classList.add('hidden'));
      document.querySelectorAll('.cms-tab-btn').forEach((b) => b.classList.remove('active'));
      const tabElement = document.getElementById(`tab-${tabName}`);
      if (tabElement) {
        tabElement.classList.remove('hidden');
        btn.classList.add('active');
        loadTabData(tabName);
      }
    });
  });

  document.addEventListener(
    'input',
    (e) => {
      const tab = draftSourceTabFromTarget(e.target);
      if (tab) debounceDraftSave(tab);
    },
    true
  );
  document.addEventListener(
    'change',
    (e) => {
      const tab = draftSourceTabFromTarget(e.target);
      if (tab) debounceDraftSave(tab);
    },
    true
  );
});

const CMS = (window.CMS = {
  async loadHeroData() {
    try {
      const s = await getSettings();
      const h = s.hero || {};
      const set = (id, v) => {
        const el = document.getElementById(id);
        if (el) el.value = v ?? '';
      };
      set('hero-mainHeading', h.headingPrefix);
      set('hero-nameText', h.name);
      set('hero-introText', h.tagline);
      set('hero-description', h.subtext);
      set('hero-primaryButtonText', h.primaryCtaText);
      set('hero-primaryButtonLink', h.primaryCtaLink);
      set('hero-resumeButtonText', h.resumeButtonText);
      set('hero-resumeLink', h.resumeLink);
      set('hero-bgImage', h.bgImage);
      set('hero-orbImage', h.image);
      set('hero-orbLabel', h.orbLabel);
      set('hero-floatingTags', (h.floatingTags || []).join(', '));
      const fx = document.getElementById('hero-backgroundEffect');
      if (fx) fx.checked = h.backgroundEffects !== false;
    } catch (e) {
      console.error(e);
      alert(e.message || 'Failed to load hero');
    }
  },

  async saveHeroData() {
    try {
      const tags = (document.getElementById('hero-floatingTags')?.value || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      await putSettings({
        hero: {
          headingPrefix: document.getElementById('hero-mainHeading')?.value || '',
          name: document.getElementById('hero-nameText')?.value || '',
          tagline: document.getElementById('hero-introText')?.value || '',
          subtext: document.getElementById('hero-description')?.value || '',
          primaryCtaText: document.getElementById('hero-primaryButtonText')?.value || '',
          primaryCtaLink: document.getElementById('hero-primaryButtonLink')?.value || '',
          resumeButtonText: document.getElementById('hero-resumeButtonText')?.value || '',
          resumeLink: document.getElementById('hero-resumeLink')?.value || '',
          bgImage: document.getElementById('hero-bgImage')?.value || '',
          image: document.getElementById('hero-orbImage')?.value || '',
          orbLabel: document.getElementById('hero-orbLabel')?.value || '',
          floatingTags: tags,
          backgroundEffects: document.getElementById('hero-backgroundEffect')?.checked !== false,
        },
      });
      clearTabDraft('hero');
      alert('Hero section saved.');
    } catch (e) {
      console.error(e);
      alert(e.message || 'Failed to save hero');
    }
  },

  async loadAboutData() {
    try {
      const s = await getSettings();
      const a = s.about || {};
      const set = (id, v) => {
        const el = document.getElementById(id);
        if (el) el.value = v ?? '';
      };
      set('about-section-title', a.sectionTitle);
      set('about-section-gradient', a.sectionGradientWord);
      set('about-name', a.name);
      set('about-greeting-emoji', a.greetingEmoji);
      set('about-bio1', a.bio1);
      set('about-bio2', a.bio2);
      set('about-highlight-words', (a.highlightedWords || []).join(', '));
      set('about-techStack', (a.pills || []).join(', '));
      aboutCardsDraft = Array.isArray(a.cards) ? JSON.parse(JSON.stringify(a.cards)) : [];
      CMS.renderAboutCardsEditor();
    } catch (e) {
      console.error(e);
      alert(e.message || 'Failed to load about');
    }
  },

  renderAboutCardsEditor() {
    const host = document.getElementById('about-cards-editor');
    if (!host) return;
    if (!aboutCardsDraft.length) {
      host.innerHTML = '<p style="color:#94a3b8;">No cards. Use “Add card”.</p>';
      return;
    }
    host.innerHTML = aboutCardsDraft
      .map(
        (c, idx) => `
      <div style="border:1px solid rgba(148,163,184,0.2);border-radius:14px;padding:12px;margin-bottom:10px;display:grid;gap:8px;">
        <input data-i="${idx}" data-f="icon" class="about-card-inp" placeholder="FontAwesome icon (e.g. code)" value="${(c.icon || '').replace(/"/g, '&quot;')}" />
        <input data-i="${idx}" data-f="title" class="about-card-inp" placeholder="Title" value="${(c.title || '').replace(/"/g, '&quot;')}" />
        <textarea data-i="${idx}" data-f="description" class="about-card-inp" placeholder="Description" rows="2">${(c.description || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')}</textarea>
        <div style="display:flex;gap:8px;">
          <button type="button" class="status-pill" onclick="CMS.moveAboutCard(${idx},-1)">Up</button>
          <button type="button" class="status-pill" onclick="CMS.moveAboutCard(${idx},1)">Down</button>
          <button type="button" class="status-pill" style="border-color:rgba(239,68,68,0.35);color:#fecaca;" onclick="CMS.removeAboutCard(${idx})">Remove</button>
        </div>
      </div>`
      )
      .join('');
    host.querySelectorAll('.about-card-inp').forEach((inp) => {
      const sync = () => {
        const i = Number(inp.dataset.i);
        const f = inp.dataset.f;
        if (!aboutCardsDraft[i]) return;
        aboutCardsDraft[i][f] = inp.value;
      };
      inp.addEventListener('change', () => {
        sync();
        debounceDraftSave('about');
      });
      inp.addEventListener('input', () => {
        sync();
        debounceDraftSave('about');
      });
    });
  },

  addAboutCard() {
    aboutCardsDraft.push({ icon: 'code', title: 'New card', description: '', order: aboutCardsDraft.length });
    CMS.renderAboutCardsEditor();
    debounceDraftSave('about');
  },

  removeAboutCard(i) {
    aboutCardsDraft.splice(i, 1);
    CMS.renderAboutCardsEditor();
    debounceDraftSave('about');
  },

  moveAboutCard(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= aboutCardsDraft.length) return;
    const tmp = aboutCardsDraft[i];
    aboutCardsDraft[i] = aboutCardsDraft[j];
    aboutCardsDraft[j] = tmp;
    CMS.renderAboutCardsEditor();
    debounceDraftSave('about');
  },

  async saveAboutData() {
    try {
      const cards = aboutCardsDraft.map((c, order) => ({
        icon: c.icon || 'code',
        title: c.title || '',
        description: c.description || '',
        order,
      }));
      const highlights = (document.getElementById('about-highlight-words')?.value || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const pills = (document.getElementById('about-techStack')?.value || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      await putSettings({
        about: {
          sectionTitle: document.getElementById('about-section-title')?.value || '',
          sectionGradientWord: document.getElementById('about-section-gradient')?.value || '',
          name: document.getElementById('about-name')?.value || '',
          greetingEmoji: document.getElementById('about-greeting-emoji')?.value || '👋',
          bio1: document.getElementById('about-bio1')?.value || '',
          bio2: document.getElementById('about-bio2')?.value || '',
          highlightedWords: highlights,
          pills,
          cards,
        },
      });
      clearTabDraft('about');
      alert('About section saved.');
    } catch (e) {
      console.error(e);
      alert(e.message || 'Failed to save about');
    }
  },

  async loadSkillsData() {
    const skillsList = document.getElementById('skills-list');
    if (skillsList) skillsList.innerHTML = cmsStackSkeleton(5);
    try {
      const r = await fetch(`${API_BASE}/api/cms/skills`);
      if (!r.ok) throw new Error('Failed to load skills');
      const skills = await r.json();
      if (!skillsList) return;
      if (!skills.length) {
        skillsList.innerHTML = '<p style="color:#94a3b8;">No skills yet.</p>';
        return;
      }
      const sorted = skills.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      skillsList.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px;">
        <small style="color:#94a3b8;">Drag rows to reorder, then save.</small>
        <button type="button" class="status-pill" onclick="CMS.saveSkillsOrder()">Save order</button>
      </div>
      <div id="skills-reorder-host" style="display:grid;gap:10px;">
        ${sorted
          .map(
            (skill) => `
        <div draggable="true" data-skill-id="${skill._id}" style="cursor:grab;padding:12px;border-radius:12px;border:1px solid rgba(99,102,241,0.25);display:grid;gap:8px;">
          <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;">
            <div><strong>${skill.title}</strong><br/><small style="color:#94a3b8;">${skill.category} · ${skill.percentage}% · ${skill.colorType} · ${skill.icon || 'code'} · ${skill.animationMs || 900}ms · visible:${skill.visible !== false}</small></div>
            <button type="button" class="status-pill" onclick="CMS.deleteSkill('${skill._id}')" style="cursor:pointer;">Delete</button>
          </div>
          <button type="button" class="status-pill" onclick="CMS.editSkill('${skill._id}')" style="cursor:pointer;">Edit</button>
        </div>`
          )
          .join('')}
      </div>`;
      wireReorderDrag(document.getElementById('skills-reorder-host'));
    } catch (e) {
      console.error(e);
      if (skillsList) skillsList.innerHTML = '<p style="color:#fecaca;">Could not load skills.</p>';
    }
  },

  async saveSkillsOrder() {
    const host = document.getElementById('skills-reorder-host');
    if (!host) return;
    const rows = [...host.querySelectorAll('[data-skill-id]')];
    const skills = rows.map((el, order) => ({ id: el.dataset.skillId, order }));
    try {
      const r = await fetch(`${API_BASE}/api/cms/skills/reorder`, {
        method: 'PUT',
        headers: authHeaders(true),
        body: JSON.stringify({ skills }),
      });
      if (!r.ok) throw new Error('Reorder failed');
      alert('Skill order saved.');
      await CMS.loadSkillsData();
    } catch (e) {
      alert(e.message || 'Could not save order');
    }
  },

  async addSkill() {
    const title = prompt('Skill title');
    if (!title) return;
    const category = prompt('Category: Development | UI/UX Design | Frameworks & Tools', 'Development');
    if (!['Development', 'UI/UX Design', 'Frameworks & Tools'].includes(category)) {
      alert('Invalid category');
      return;
    }
    const percentage = Number(prompt('Percentage 0-100', '80'));
    if (Number.isNaN(percentage)) return;
    const colorType = prompt('Color: purple or pink', 'purple');
    const icon = prompt('FontAwesome icon name', 'code') || 'code';
    const animationMs = Number(prompt('Animation duration ms', '900')) || 900;
    try {
      const r = await fetch(`${API_BASE}/api/cms/skills`, {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify({ title, category, percentage, colorType, icon, animationMs, visible: true }),
      });
      if (!r.ok) throw new Error('Failed');
      await CMS.loadSkillsData();
    } catch (e) {
      alert(e.message);
    }
  },

  async editSkill(id) {
    const title = prompt('Title');
    if (title === null) return;
    const percentage = Number(prompt('Percentage'));
    if (Number.isNaN(percentage)) return;
    const category = prompt('Category', 'Development');
    const colorType = prompt('purple or pink', 'purple');
    const icon = prompt('Icon', 'code');
    const animationMs = Number(prompt('Animation ms', '900'));
    const visible = confirm('Visible on site? OK = yes, Cancel = hidden') ? true : false;
    try {
      const r = await fetch(`${API_BASE}/api/cms/skills/${id}`, {
        method: 'PUT',
        headers: authHeaders(true),
        body: JSON.stringify({ title, percentage, category, colorType, icon, animationMs, visible }),
      });
      if (!r.ok) throw new Error('Failed');
      await CMS.loadSkillsData();
    } catch (e) {
      alert(e.message);
    }
  },

  async deleteSkill(id) {
    if (!confirm('Delete skill?')) return;
    const r = await fetch(`${API_BASE}/api/cms/skills/${id}`, { method: 'DELETE', headers: authHeaders(false) });
    if (r.ok) await CMS.loadSkillsData();
  },

  async loadServicesData() {
    const servicesList = document.getElementById('services-list');
    if (servicesList) servicesList.innerHTML = cmsStackSkeleton(5);
    try {
      const r = await fetch(`${API_BASE}/api/cms/services`);
      if (!r.ok) throw new Error('Failed');
      const services = await r.json();
      if (!servicesList) return;
      if (!services.length) {
        servicesList.innerHTML = '<p style="color:#94a3b8;">No services yet.</p>';
        return;
      }
      const sorted = services.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      servicesList.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px;">
        <small style="color:#94a3b8;">Drag rows to reorder, then save.</small>
        <button type="button" class="status-pill" onclick="CMS.saveServicesOrder()">Save order</button>
      </div>
      <div id="services-reorder-host" style="display:grid;gap:10px;">
        ${sorted
          .map(
            (s) => `
        <div draggable="true" data-service-id="${s._id}" style="cursor:grab;padding:12px;border-radius:12px;border:1px solid rgba(99,102,241,0.25);display:flex;justify-content:space-between;gap:10px;">
          <div><strong>${s.title}</strong><br/><small style="color:#94a3b8;">${(s.description || '').slice(0, 120)}</small></div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <button type="button" class="status-pill" onclick="CMS.editService('${s._id}')">Edit</button>
            <button type="button" class="status-pill" onclick="CMS.deleteService('${s._id}')" style="color:#fecaca;">Delete</button>
          </div>
        </div>`
          )
          .join('')}
      </div>`;
      wireReorderDrag(document.getElementById('services-reorder-host'));
    } catch (e) {
      console.error(e);
      if (servicesList) servicesList.innerHTML = '<p style="color:#fecaca;">Could not load services.</p>';
    }
  },

  async saveServicesOrder() {
    const host = document.getElementById('services-reorder-host');
    if (!host) return;
    const rows = [...host.querySelectorAll('[data-service-id]')];
    const services = rows.map((el, order) => ({ id: el.dataset.serviceId, order }));
    try {
      const r = await fetch(`${API_BASE}/api/cms/services/reorder`, {
        method: 'PUT',
        headers: authHeaders(true),
        body: JSON.stringify({ services }),
      });
      if (!r.ok) throw new Error('Reorder failed');
      alert('Service order saved.');
      await CMS.loadServicesData();
    } catch (e) {
      alert(e.message || 'Could not save order');
    }
  },

  async addService() {
    const title = prompt('Title');
    if (!title) return;
    const description = prompt('Description');
    if (!description) return;
    const features = (prompt('Features (comma separated)', 'A,B,C') || '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
    const icon = prompt('FontAwesome icon', 'code') || 'code';
    const colorType = prompt('purple or pink', 'purple');
    const buttonLink = prompt('Button link', '#contact') || '#contact';
    try {
      const r = await fetch(`${API_BASE}/api/cms/services`, {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify({ title, description, features, icon, colorType, buttonLink }),
      });
      if (!r.ok) throw new Error('Failed');
      await CMS.loadServicesData();
    } catch (e) {
      alert(e.message);
    }
  },

  async editService(id) {
    const title = prompt('Title');
    if (title === null) return;
    const description = prompt('Description');
    if (description === null) return;
    const features = (prompt('Features comma separated') || '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
    const icon = prompt('Icon', 'code');
    const colorType = prompt('purple or pink', 'purple');
    const buttonLink = prompt('Button link', '#contact');
    try {
      const r = await fetch(`${API_BASE}/api/cms/services/${id}`, {
        method: 'PUT',
        headers: authHeaders(true),
        body: JSON.stringify({ title, description, features, icon, colorType, buttonLink }),
      });
      if (!r.ok) throw new Error('Failed');
      await CMS.loadServicesData();
    } catch (e) {
      alert(e.message);
    }
  },

  async deleteService(id) {
    if (!confirm('Delete service?')) return;
    const r = await fetch(`${API_BASE}/api/cms/services/${id}`, { method: 'DELETE', headers: authHeaders(false) });
    if (r.ok) await CMS.loadServicesData();
  },

  async loadContactData() {
    const messagesList = document.getElementById('messages-list');
    if (messagesList) messagesList.innerHTML = cmsStackSkeleton(4);
    try {
      const s = await getSettings();
      const c = s.contact || {};
      const set = (id, v) => {
        const el = document.getElementById(id);
        if (el) el.value = v ?? '';
      };
      set('contact-email', c.email);
      set('contact-phone', c.phone);
      set('contact-whatsapp', c.whatsapp);
      set('contact-address', c.address);
      set('contact-location', c.location);
      set('contact-eyebrow', c.eyebrow);
      set('contact-heading', c.heading);
      set('contact-heading-grad', c.headingGradientWord);
      set('contact-intro', c.intro);
      set('contact-cv-title', c.cvCardTitle);
      set('contact-cv-btn', c.cvButtonText);

      const messagesResponse = await fetch(`${API_BASE}/api/messages`, { headers: authHeaders(false) });
      if (!messagesList) return;
      if (messagesResponse.status === 401) {
        messagesList.innerHTML = '<p style="color:#94a3b8;">Sign in to view messages.</p>';
        return;
      }
      const messages = await messagesResponse.json();
      if (!messages.length) {
        messagesList.innerHTML = '<p style="color:#94a3b8;">No messages yet.</p>';
        return;
      }
      messagesList.innerHTML = messages
        .map(
          (msg) => `
        <div style="padding:12px;border-radius:12px;border:1px solid rgba(99,102,241,0.25);display:grid;gap:8px;">
          <div><strong>${msg.name}</strong> · <a href="mailto:${msg.email}">${msg.email}</a> · <span style="color:#94a3b8;">${msg.status || 'unread'}</span></div>
          <div><strong>Subject:</strong> ${msg.subject || '—'}</div>
          <div style="white-space:pre-wrap;">${(msg.message || '').replace(/</g, '&lt;')}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button type="button" class="status-pill" onclick="CMS.replyMessage('${msg.email}','${String(msg.subject || '').replace(/'/g, "\\'")}')">Reply</button>
            <button type="button" class="status-pill" onclick="CMS.markMessageRead('${msg._id}')">Mark read</button>
            <button type="button" class="status-pill" style="color:#fecaca;" onclick="CMS.deleteMessage('${msg._id}')">Delete</button>
          </div>
          <small style="color:#64748b;">${new Date(msg.createdAt || msg.updatedAt).toLocaleString()}</small>
        </div>`
        )
        .join('');
    } catch (e) {
      console.error(e);
      if (messagesList) messagesList.innerHTML = '<p style="color:#fecaca;">Could not load messages.</p>';
    }
  },
    window.location.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(`Re: ${subject || 'Portfolio'}`)}`;
  },

  async markMessageRead(id) {
    await fetch(`${API_BASE}/api/messages/${id}/read`, { method: 'PATCH', headers: authHeaders(false) });
    await CMS.loadContactData();
  },

  async deleteMessage(id) {
    if (!confirm('Delete message?')) return;
    await fetch(`${API_BASE}/api/messages/${id}`, { method: 'DELETE', headers: authHeaders(false) });
    await CMS.loadContactData();
  },

  async saveContactData() {
    try {
      await putSettings({
        contact: {
          email: document.getElementById('contact-email')?.value,
          phone: document.getElementById('contact-phone')?.value,
          whatsapp: document.getElementById('contact-whatsapp')?.value,
          address: document.getElementById('contact-address')?.value,
          location: document.getElementById('contact-location')?.value,
          eyebrow: document.getElementById('contact-eyebrow')?.value,
          heading: document.getElementById('contact-heading')?.value,
          headingGradientWord: document.getElementById('contact-heading-grad')?.value,
          intro: document.getElementById('contact-intro')?.value,
          cvCardTitle: document.getElementById('contact-cv-title')?.value,
          cvButtonText: document.getElementById('contact-cv-btn')?.value,
        },
      });
      clearTabDraft('contact');
      alert('Contact saved.');
    } catch (e) {
      alert(e.message);
    }
  },

  async loadFooterData() {
    const linksList = document.getElementById('links-list');
    if (linksList) linksList.innerHTML = cmsStackSkeleton(3);
    try {
      const s = await getSettings();
      const f = s.footer || {};
      const set = (id, v) => {
        const el = document.getElementById(id);
        if (el) el.value = v ?? '';
      };
      set('footer-description', f.description);
      set('footer-copyright', f.copyright);
      set('footer-credit', f.creditLine);
      set('footer-quick-title', f.quickLinksTitle);
      set('footer-services-title', f.servicesColumnTitle);
      set('footer-service-tags', (f.serviceTags || []).join(', '));

      if (!linksList) return;
      const links = f.links || [];
      if (!links.length) {
        linksList.innerHTML = '<p style="color:#94a3b8;">No links.</p>';
        return;
      }
      const sorted = links.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      linksList.innerHTML = sorted
        .map(
          (l) => `
        <div style="display:flex;justify-content:space-between;gap:10px;padding:10px;border:1px solid rgba(99,102,241,0.25);border-radius:12px;">
          <div><strong>${l.label}</strong><br/><small>${l.href}</small></div>
          <button type="button" class="status-pill" onclick="CMS.deleteFooterLink('${l._id}')">Delete</button>
        </div>`
        )
        .join('');
    } catch (e) {
      console.error(e);
    }
  },

  async saveFooterData() {
    try {
      const s = await getSettings();
      const f = s.footer || {};
      const tags = (document.getElementById('footer-service-tags')?.value || '')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
      await putSettings({
        footer: {
          ...f,
          description: document.getElementById('footer-description')?.value,
          copyright: document.getElementById('footer-copyright')?.value,
          creditLine: document.getElementById('footer-credit')?.value,
          quickLinksTitle: document.getElementById('footer-quick-title')?.value,
          servicesColumnTitle: document.getElementById('footer-services-title')?.value,
          serviceTags: tags,
        },
      });
      clearTabDraft('footer');
      alert('Footer saved.');
    } catch (e) {
      alert(e.message);
    }
  },

  async addFooterLink() {
    const label = prompt('Label');
    if (!label) return;
    const href = prompt('URL');
    if (!href) return;
    try {
      const s = await getSettings();
      const links = [...(s.footer?.links || [])];
      links.push({ label, href, order: links.length });
      await putSettings({ footer: { ...(s.footer || {}), links } });
      await CMS.loadFooterData();
    } catch (e) {
      alert(e.message);
    }
  },

  async deleteFooterLink(id) {
    if (!confirm('Delete link?')) return;
    const s = await getSettings();
    const links = (s.footer?.links || []).filter((l) => String(l._id) !== String(id));
    await putSettings({ footer: { ...(s.footer || {}), links } });
    await CMS.loadFooterData();
  },

  async loadSocialData() {
    try {
      const s = await getSettings();
      const soc = s.socials || {};
      const set = (id, v) => {
        const el = document.getElementById(id);
        if (el) el.value = v ?? '';
      };
      set('social-github', soc.github);
      set('social-linkedin', soc.linkedin);
      set('social-instagram', soc.instagram);
      set('social-facebook', soc.facebook);
      set('social-twitter', soc.twitter);
      set('social-tiktok', soc.tiktok);
      set('social-youtube', soc.youtube);
    } catch (e) {
      console.error(e);
    }
  },

  async saveSocialData() {
    try {
      await putSettings({
        socials: {
          github: document.getElementById('social-github')?.value,
          linkedin: document.getElementById('social-linkedin')?.value,
          instagram: document.getElementById('social-instagram')?.value,
          facebook: document.getElementById('social-facebook')?.value,
          twitter: document.getElementById('social-twitter')?.value,
          tiktok: document.getElementById('social-tiktok')?.value,
          youtube: document.getElementById('social-youtube')?.value,
        },
      });
      clearTabDraft('social');
      alert('Social links saved.');
    } catch (e) {
      alert(e.message);
    }
  },

  async loadPortfolioSectionData() {
    try {
      const s = await getSettings();
      const p = s.portfolioSection || {};
      const set = (id, v) => {
        const el = document.getElementById(id);
        if (el) el.value = v ?? '';
      };
      set('portfolio-subtitle', p.subtitle);
      set('portfolio-github-url', p.githubProfileUrl);
      set('portfolio-github-cta', p.githubCtaText);
      const ta = document.getElementById('portfolio-filters-json');
      if (ta) ta.value = JSON.stringify(p.filters || [], null, 2);
    } catch (e) {
      console.error(e);
    }
  },

  async savePortfolioSectionData() {
    try {
      let filters;
      try {
        filters = JSON.parse(document.getElementById('portfolio-filters-json')?.value || '[]');
      } catch {
        alert('Filters JSON invalid');
        return;
      }
      await putSettings({
        portfolioSection: {
          subtitle: document.getElementById('portfolio-subtitle')?.value,
          githubProfileUrl: document.getElementById('portfolio-github-url')?.value,
          githubCtaText: document.getElementById('portfolio-github-cta')?.value,
          filters,
        },
      });
      clearTabDraft('portfolio');
      alert('Portfolio section saved.');
    } catch (e) {
      alert(e.message);
    }
  },

  async loadSettingsData() {
    try {
      const s = await getSettings();
      const set = (id, v) => {
        const el = document.getElementById(id);
        if (el) el.value = v ?? '';
      };
      set('settings-siteTitle', s.siteTitle);
      set('settings-siteDescription', s.siteDescription);
      set('settings-primaryColor', s.primaryColor);
      set('settings-secondaryColor', s.secondaryColor);
      set('settings-metaDescription', s.metaDescription);
      set('settings-metaKeywords', s.metaKeywords);
      set('settings-ga', s.googleAnalyticsId);
      set('settings-favicon', s.favicon);
      set('settings-logo', s.logo);
      set('settings-skills-subtitle', s.skillsSection?.subtitle);
      set('settings-services-subtitle', s.servicesSection?.subtitle);
      set('settings-section-order', (s.sectionOrder || []).join(','));

      const chk = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.checked = Boolean(val);
      };
      chk('settings-darkMode', s.darkMode !== false);
      chk('sec-hero', s.sections?.hero !== false);
      chk('sec-about', s.sections?.about !== false);
      chk('sec-skills', s.sections?.skills !== false);
      chk('sec-portfolio', s.sections?.portfolio !== false);
      chk('sec-services', s.sections?.services !== false);
      chk('sec-contact', s.sections?.contact !== false);
      chk('sec-footer', s.sections?.footer !== false);
    } catch (e) {
      console.error(e);
    }
  },

  async saveSettingsData() {
    try {
      const order = (document.getElementById('settings-section-order')?.value || '')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
      await putSettings({
        siteTitle: document.getElementById('settings-siteTitle')?.value,
        siteDescription: document.getElementById('settings-siteDescription')?.value,
        primaryColor: document.getElementById('settings-primaryColor')?.value,
        secondaryColor: document.getElementById('settings-secondaryColor')?.value,
        metaDescription: document.getElementById('settings-metaDescription')?.value,
        metaKeywords: document.getElementById('settings-metaKeywords')?.value,
        googleAnalyticsId: document.getElementById('settings-ga')?.value,
        favicon: document.getElementById('settings-favicon')?.value,
        logo: document.getElementById('settings-logo')?.value,
        darkMode: document.getElementById('settings-darkMode')?.checked !== false,
        skillsSection: {
          subtitle: document.getElementById('settings-skills-subtitle')?.value,
        },
        servicesSection: {
          subtitle: document.getElementById('settings-services-subtitle')?.value,
        },
        sectionOrder: order.length ? order : undefined,
        sections: {
          hero: document.getElementById('sec-hero')?.checked,
          about: document.getElementById('sec-about')?.checked,
          skills: document.getElementById('sec-skills')?.checked,
          portfolio: document.getElementById('sec-portfolio')?.checked,
          services: document.getElementById('sec-services')?.checked,
          contact: document.getElementById('sec-contact')?.checked,
          footer: document.getElementById('sec-footer')?.checked,
        },
      });
      clearTabDraft('settings');
      alert('Settings saved.');
    } catch (e) {
      alert(e.message);
    }
  },

  async loadMediaLibrary() {
    const host = document.getElementById('media-list');
    if (!host) return;
    host.innerHTML = cmsStackSkeleton(6);
    try {
      const q = document.getElementById('media-search')?.value || '';
      const r = await fetch(`${API_BASE}/api/cms/media?q=${encodeURIComponent(q)}`, { headers: authHeaders(false) });
      if (!r.ok) throw new Error('Failed');
      const files = await r.json();
      if (!files.length) {
        host.innerHTML = '<p style="color:#94a3b8;">No files.</p>';
        return;
      }
      host.innerHTML = files
        .map(
          (f) => `
        <div style="display:flex;justify-content:space-between;gap:10px;padding:10px;border:1px solid rgba(99,102,241,0.25);border-radius:12px;align-items:center;">
          <div><a href="${API_BASE}${f.url}" target="_blank" rel="noopener">${f.filename}</a><br/><small style="color:#94a3b8;">${f.size} bytes</small></div>
          <button type="button" class="status-pill" onclick="CMS.deleteMedia('${f.filename.replace(/'/g, "\\'")}')">Delete</button>
        </div>`
        )
        .join('');
    } catch (e) {
      host.innerHTML = `<p style="color:#fecaca;">${e.message}</p>`;
    }
  },

  async uploadMedia() {
    const input = document.getElementById('media-file');
    if (!input || !input.files || !input.files[0]) return alert('Choose a file');
    const fd = new FormData();
    fd.append('file', input.files[0]);
    const r = await fetch(`${API_BASE}/api/cms/media`, { method: 'POST', headers: authHeaders(false), body: fd });
    if (!r.ok) return alert('Upload failed');
    input.value = '';
    await CMS.loadMediaLibrary();
  },

  async deleteMedia(filename) {
    if (!confirm('Delete file?')) return;
    await fetch(`${API_BASE}/api/cms/media/${encodeURIComponent(filename)}`, {
      method: 'DELETE',
      headers: authHeaders(false),
    });
    await CMS.loadMediaLibrary();
  },
});
