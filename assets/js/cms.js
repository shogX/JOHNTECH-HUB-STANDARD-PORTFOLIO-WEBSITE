// CMS API endpoints configuration
const CMS_API = {
  hero: 'http://localhost:5001/api/cms/hero',
  about: 'http://localhost:5001/api/cms/about',
  skills: 'http://localhost:5001/api/cms/skills',
  services: 'http://localhost:5001/api/cms/services',
  contact: 'http://localhost:5001/api/cms/contact',
  footer: 'http://localhost:5001/api/cms/footer',
  social: 'http://localhost:5001/api/cms/social',
  settings: 'http://localhost:5001/api/cms/settings',
};

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Tab switching
  document.querySelectorAll('.cms-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      
      // Hide all tabs
      document.querySelectorAll('.cms-tab-content').forEach(t => t.classList.add('hidden'));
      
      // Deactivate all buttons
      document.querySelectorAll('.cms-tab-btn').forEach(b => b.classList.remove('active'));
      
      // Show selected tab
      const tabElement = document.getElementById(tabName === 'contact' ? 'tab-messages' : `tab-${tabName}`);
      if (tabElement) {
        tabElement.classList.remove('hidden');
        btn.classList.add('active');
        
        // Load data
        loadTabData(tabName);
      }
    });
  });
});

// Load tab data based on tab name
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
  }
};

// ===== HERO SECTION =====
const loadHeroData = async () => {
  try {
    const response = await fetch(CMS_API.hero);
    if (!response.ok) throw new Error('Failed to load hero data');
    
    const hero = await response.json();

    document.getElementById('hero-mainHeading').value = hero.mainHeading || '';
    document.getElementById('hero-nameText').value = hero.nameText || '';
    document.getElementById('hero-introText').value = hero.introText || '';
    document.getElementById('hero-description').value = hero.description || '';
    document.getElementById('hero-primaryButtonText').value = hero.buttons?.primary?.text || '';
    document.getElementById('hero-primaryButtonLink').value = hero.buttons?.primary?.link || '';
    document.getElementById('hero-backgroundEffect').checked = hero.backgroundEffect || false;
  } catch (error) {
    console.error('Error loading hero data:', error);
    alert('Failed to load hero data');
  }
};

const CMS = window.CMS = {
  loadHeroData: loadHeroData,

  saveHeroData: async () => {
    try {
      const heroData = {
        mainHeading: document.getElementById('hero-mainHeading').value,
        nameText: document.getElementById('hero-nameText').value,
        introText: document.getElementById('hero-introText').value,
        description: document.getElementById('hero-description').value,
        buttons: {
          primary: {
            text: document.getElementById('hero-primaryButtonText').value,
            link: document.getElementById('hero-primaryButtonLink').value,
          },
        },
        backgroundEffect: document.getElementById('hero-backgroundEffect').checked,
      };

      const response = await fetch(CMS_API.hero, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroData),
      });

      if (!response.ok) throw new Error('Failed to save');
      alert('Hero section saved successfully!');
    } catch (error) {
      console.error('Error saving hero data:', error);
      alert('Failed to save hero data');
    }
  },

  // ===== ABOUT SECTION =====
  loadAboutData: async () => {
    try {
      const response = await fetch(CMS_API.about);
      if (!response.ok) throw new Error('Failed to load about data');
      
      const about = await response.json();

      document.getElementById('about-section-title').value = about.sectionTitle || about.title || '';
      document.getElementById('about-section-gradient').value = about.sectionGradient || '';
      document.getElementById('about-name').value = about.name || '';
      document.getElementById('about-greeting-emoji').value = about.greetingEmoji || '';
      document.getElementById('about-bio1').value = about.bio1 || '';
      document.getElementById('about-bio2').value = about.bio2 || '';
      document.getElementById('about-highlight-words').value = (about.highlightWords || []).join(', ');
      document.getElementById('about-techStack').value = (about.techStack || []).join(', ');
    } catch (error) {
      console.error('Error loading about data:', error);
      alert('Failed to load about data');
    }
  },

  saveAboutData: async () => {
    try {
      const aboutData = {
        sectionTitle: document.getElementById('about-section-title').value,
        sectionGradient: document.getElementById('about-section-gradient').value,
        name: document.getElementById('about-name').value,
        greetingEmoji: document.getElementById('about-greeting-emoji').value,
        bio1: document.getElementById('about-bio1').value,
        bio2: document.getElementById('about-bio2').value,
        highlightWords: (document.getElementById('about-highlight-words').value || '').split(',').map(t => t.trim()).filter(t => t),
        techStack: (document.getElementById('about-techStack').value || '').split(',').map(t => t.trim()).filter(t => t),
      };

      const response = await fetch(CMS_API.about, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aboutData),
      });

      if (!response.ok) throw new Error('Failed to save');
      alert('About section saved successfully!');
    } catch (error) {
      console.error('Error saving about data:', error);
      alert('Failed to save about data');
    }
  },

  // ===== SKILLS SECTION =====
  loadSkillsData: async () => {
    try {
      const response = await fetch(CMS_API.skills);
      if (!response.ok) throw new Error('Failed to load skills');
      
      const skills = await response.json();
      const skillsList = document.getElementById('skills-list');
      
      if (!skillsList) return;

      if (skills.length === 0) {
        skillsList.innerHTML = '<p style="color: rgba(148, 163, 184, 0.7);">No skills yet. Click "Add Skill" to create one.</p>';
        return;
      }

      skillsList.innerHTML = skills.map(skill => `
        <div style="padding: 12px; background: rgba(99, 102, 241, 0.08); border-radius: 8px; border: 1px solid rgba(99, 102, 241, 0.2); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>${skill.title}</strong><br/>
            <small style="color: rgba(148, 163, 184, 0.7);">${skill.category} - ${skill.percentage}%</small>
          </div>
          <button type="button" onclick="CMS.deleteSkill('${skill._id}')" class="status-pill" style="cursor: pointer; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.24); padding: 6px 12px; border-radius: 8px; color: #fca5a5;">Delete</button>
        </div>
      `).join('');
    } catch (error) {
      console.error('Error loading skills:', error);
    }
  },

  addSkill: async () => {
    const title = prompt('Skill title (e.g., React, Node.js):');
    if (!title) return;

    const category = prompt('Category (frontend/backend/design):');
    if (!['frontend', 'backend', 'design'].includes(category)) {
      alert('Category must be frontend, backend, or design');
      return;
    }

    const percentage = prompt('Proficiency percentage (0-100):');
    if (!percentage || isNaN(percentage) || percentage < 0 || percentage > 100) {
      alert('Please enter a valid percentage');
      return;
    }

    try {
      const response = await fetch(CMS_API.skills, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          percentage: parseInt(percentage),
        }),
      });

      if (!response.ok) throw new Error('Failed to add skill');
      await CMS.loadSkillsData();
      alert('Skill added successfully!');
    } catch (error) {
      console.error('Error adding skill:', error);
      alert('Failed to add skill');
    }
  },

  deleteSkill: async (id) => {
    if (!confirm('Delete this skill?')) return;

    try {
      const response = await fetch(`${CMS_API.skills}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      await CMS.loadSkillsData();
    } catch (error) {
      console.error('Error deleting skill:', error);
      alert('Failed to delete skill');
    }
  },

  // ===== SERVICES SECTION =====
  loadServicesData: async () => {
    try {
      const response = await fetch(CMS_API.services);
      if (!response.ok) throw new Error('Failed to load services');
      
      const services = await response.json();
      const servicesList = document.getElementById('services-list');
      
      if (!servicesList) return;

      if (services.length === 0) {
        servicesList.innerHTML = '<p style="color: rgba(148, 163, 184, 0.7);">No services yet. Click "Add Service" to create one.</p>';
        return;
      }

      servicesList.innerHTML = services.map(service => `
        <div style="padding: 12px; background: rgba(99, 102, 241, 0.08); border-radius: 8px; border: 1px solid rgba(99, 102, 241, 0.2); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>${service.title}</strong><br/>
            <small style="color: rgba(148, 163, 184, 0.7);">${service.description}</small>
          </div>
          <button type="button" onclick="CMS.deleteService('${service._id}')" class="status-pill" style="cursor: pointer; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.24); padding: 6px 12px; border-radius: 8px; color: #fca5a5;">Delete</button>
        </div>
      `).join('');
    } catch (error) {
      console.error('Error loading services:', error);
    }
  },

  addService: async () => {
    const title = prompt('Service title:');
    if (!title) return;

    const description = prompt('Service description:');
    if (!description) return;

    try {
      const response = await fetch(CMS_API.services, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) throw new Error('Failed to add service');
      await CMS.loadServicesData();
      alert('Service added successfully!');
    } catch (error) {
      console.error('Error adding service:', error);
      alert('Failed to add service');
    }
  },

  deleteService: async (id) => {
    if (!confirm('Delete this service?')) return;

    try {
      const response = await fetch(`${CMS_API.services}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      await CMS.loadServicesData();
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service');
    }
  },

  // ===== CONTACT SECTION =====
  loadContactData: async () => {
    try {
      const response = await fetch(`${CMS_API.contact}/info`);
      if (!response.ok) throw new Error('Failed to load contact data');
      
      const contact = await response.json();

      document.getElementById('contact-email').value = contact.email || '';
      document.getElementById('contact-phone').value = contact.phone || '';
      document.getElementById('contact-whatsapp').value = contact.whatsapp || '';
      document.getElementById('contact-address').value = contact.address || '';
      document.getElementById('contact-location').value = contact.location || '';

      // Load messages
      const messagesResponse = await fetch(`${CMS_API.contact}/messages`);
      if (messagesResponse.ok) {
        const messages = await messagesResponse.json();
        const messagesList = document.getElementById('messages-list');
        
        if (messagesList) {
          if (messages.length === 0) {
            messagesList.innerHTML = '<p style="color: rgba(148, 163, 184, 0.7);">No messages yet.</p>';
          } else {
            messagesList.innerHTML = messages.map(msg => `
              <div style="padding: 12px; background: rgba(99, 102, 241, 0.08); border-radius: 8px; border: 1px solid rgba(99, 102, 241, 0.2);">
                <strong>${msg.name}</strong> (<a href="mailto:${msg.email}" style="color: #a5f3fc;">${msg.email}</a>)<br/>
                <small>${msg.message}</small><br/>
                <small style="color: rgba(148, 163, 184, 0.5);">Received: ${new Date(msg.timestamp).toLocaleString()}</small>
              </div>
            `).join('');
          }
        }
      }
    } catch (error) {
      console.error('Error loading contact data:', error);
    }
  },

  saveContactData: async () => {
    try {
      const contactData = {
        email: document.getElementById('contact-email').value,
        phone: document.getElementById('contact-phone').value,
        whatsapp: document.getElementById('contact-whatsapp').value,
        address: document.getElementById('contact-address').value,
        location: document.getElementById('contact-location').value,
      };

      const response = await fetch(`${CMS_API.contact}/info`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData),
      });

      if (!response.ok) throw new Error('Failed to save');
      alert('Contact information saved successfully!');
    } catch (error) {
      console.error('Error saving contact data:', error);
      alert('Failed to save contact data');
    }
  },

  // ===== FOOTER SECTION =====
  loadFooterData: async () => {
    try {
      const response = await fetch(CMS_API.footer);
      if (!response.ok) throw new Error('Failed to load footer data');
      
      const footer = await response.json();

      document.getElementById('footer-description').value = footer.description || '';
      document.getElementById('footer-copyright').value = footer.copyright || '';

      // Load footer links
      const linksList = document.getElementById('links-list');
      if (linksList) {
        if (!footer.links || footer.links.length === 0) {
          linksList.innerHTML = '<p style="color: rgba(148, 163, 184, 0.7);">No links yet. Click "Add Link" to create one.</p>';
        } else {
          linksList.innerHTML = footer.links.map(link => `
            <div style="padding: 12px; background: rgba(99, 102, 241, 0.08); border-radius: 8px; border: 1px solid rgba(99, 102, 241, 0.2); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong>${link.label}</strong><br/>
                <small style="color: rgba(148, 163, 184, 0.7);">${link.href}</small>
              </div>
              <button type="button" onclick="CMS.deleteFooterLink('${link._id}')" class="status-pill" style="cursor: pointer; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.24); padding: 6px 12px; border-radius: 8px; color: #fca5a5;">Delete</button>
            </div>
          `).join('');
        }
      }
    } catch (error) {
      console.error('Error loading footer data:', error);
    }
  },

  saveFooterData: async () => {
    try {
      const footerData = {
        description: document.getElementById('footer-description').value,
        copyright: document.getElementById('footer-copyright').value,
      };

      const response = await fetch(CMS_API.footer, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(footerData),
      });

      if (!response.ok) throw new Error('Failed to save');
      alert('Footer information saved successfully!');
    } catch (error) {
      console.error('Error saving footer data:', error);
      alert('Failed to save footer data');
    }
  },

  addFooterLink: async () => {
    const label = prompt('Link label:');
    if (!label) return;

    const href = prompt('Link URL:');
    if (!href) return;

    try {
      const response = await fetch(`${CMS_API.footer}/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, href }),
      });

      if (!response.ok) throw new Error('Failed to add link');
      await CMS.loadFooterData();
      alert('Link added successfully!');
    } catch (error) {
      console.error('Error adding link:', error);
      alert('Failed to add link');
    }
  },

  deleteFooterLink: async (id) => {
    if (!confirm('Delete this link?')) return;

    try {
      const response = await fetch(`${CMS_API.footer}/links/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      await CMS.loadFooterData();
    } catch (error) {
      console.error('Error deleting link:', error);
      alert('Failed to delete link');
    }
  },

  // ===== SOCIAL MEDIA SECTION =====
  loadSocialData: async () => {
    try {
      const response = await fetch(CMS_API.social);
      if (!response.ok) throw new Error('Failed to load social data');
      
      const social = await response.json();

      document.getElementById('social-github').value = social.github || '';
      document.getElementById('social-linkedin').value = social.linkedin || '';
      document.getElementById('social-instagram').value = social.instagram || '';
      document.getElementById('social-facebook').value = social.facebook || '';
      document.getElementById('social-twitter').value = social.twitter || '';
      document.getElementById('social-tiktok').value = social.tiktok || '';
      document.getElementById('social-youtube').value = social.youtube || '';
    } catch (error) {
      console.error('Error loading social data:', error);
    }
  },

  saveSocialData: async () => {
    try {
      const socialData = {
        github: document.getElementById('social-github').value,
        linkedin: document.getElementById('social-linkedin').value,
        instagram: document.getElementById('social-instagram').value,
        facebook: document.getElementById('social-facebook').value,
        twitter: document.getElementById('social-twitter').value,
        tiktok: document.getElementById('social-tiktok').value,
        youtube: document.getElementById('social-youtube').value,
      };

      const response = await fetch(CMS_API.social, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(socialData),
      });

      if (!response.ok) throw new Error('Failed to save');
      alert('Social media links saved successfully!');
    } catch (error) {
      console.error('Error saving social data:', error);
      alert('Failed to save social data');
    }
  },

  // ===== SETTINGS SECTION =====
  loadSettingsData: async () => {
    try {
      const response = await fetch(CMS_API.settings);
      if (!response.ok) throw new Error('Failed to load settings');
      
      const settings = await response.json();

      document.getElementById('settings-siteTitle').value = settings.siteTitle || '';
      document.getElementById('settings-siteDescription').value = settings.siteDescription || '';
      document.getElementById('settings-primaryColor').value = settings.primaryColor || '#8b5cf6';
      document.getElementById('settings-darkMode').checked = settings.darkMode !== false;
      document.getElementById('settings-metaDescription').value = settings.seo?.metaDescription || '';
      document.getElementById('settings-metaKeywords').value = settings.seo?.metaKeywords || '';
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  },

  saveSettingsData: async () => {
    try {
      const settingsData = {
        siteTitle: document.getElementById('settings-siteTitle').value,
        siteDescription: document.getElementById('settings-siteDescription').value,
        primaryColor: document.getElementById('settings-primaryColor').value,
        darkMode: document.getElementById('settings-darkMode').checked,
        seo: {
          metaDescription: document.getElementById('settings-metaDescription').value,
          metaKeywords: document.getElementById('settings-metaKeywords').value,
        },
      };

      const response = await fetch(CMS_API.settings, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData),
      });

      if (!response.ok) throw new Error('Failed to save');
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  },
};
