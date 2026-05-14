const mongoose = require('mongoose');

const footerLinkSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    href: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const aboutCardSchema = new mongoose.Schema(
  {
    icon: { type: String, default: 'code' },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const portfolioFilterSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const settingsSchema = new mongoose.Schema(
  {
    siteTitle: { type: String, default: 'JOHNTECH HUB | Web Developer & UI/UX Designer' },
    siteDescription: { type: String, default: '' },
    favicon: { type: String, default: 'assets/images/JOHNTECH LOGO.PNG' },
    logo: { type: String, default: 'assets/images/JOHNTECH LOGO.PNG' },

    hero: {
      tagline: { type: String, default: 'FRONT END DEVELOPMENT • UI/UX DESIGNER • ReactJS' },
      headingPrefix: { type: String, default: "Hi,\n          I'm" },
      name: { type: String, default: 'JOHN' },
      subtext: {
        type: String,
        default:
          '<Web Developer />_ Freelancer Designer & Developer specializing in modern front-end experiences and UI/UX design.',
      },
      image: { type: String, default: 'assets/images/Hero-image.png' },
      resumeLink: { type: String, default: 'assets/JOHNTECH-Resume.pdf' },
      bgImage: { type: String, default: 'assets/images/photo-1579882392185-581038fbc8c5.jpg' },
      primaryCtaText: { type: String, default: 'View My Work' },
      primaryCtaLink: { type: String, default: '#portfolio' },
      resumeButtonText: { type: String, default: 'Download Resume' },
      orbLabel: { type: String, default: 'Freelancer Designer & Developer' },
      floatingTags: { type: [String], default: [] },
      backgroundEffects: { type: Boolean, default: true },
    },

    about: {
      sectionTitle: { type: String, default: 'About' },
      sectionGradientWord: { type: String, default: 'Me' },
      name: { type: String, default: 'JOHN' },
      greetingEmoji: { type: String, default: '👋' },
      bio1: {
        type: String,
        default:
          "I'm a student who specializes in Web Development. I also love Graphic Design. You can call me JOHNTECH!",
      },
      bio2: {
        type: String,
        default:
          "I'm currently working on some secret stuff. I'm currently learning Redux and TypeScript. I'm looking to collaborate on Frontend Web and UI Designs.",
      },
      highlightedWords: { type: [String], default: [] },
      pills: { type: [String], default: ['HTML/CSS', 'JavaScript', 'TypeScript', 'ReactJS', 'Redux'] },
      cards: { type: [aboutCardSchema], default: [] },
    },

    skillsSection: {
      subtitle: {
        type: String,
        default:
          'A diverse skillset across front-end development, UI/UX design, and modern JS frameworks',
      },
    },

    portfolioSection: {
      subtitle: {
        type: String,
        default:
          'A showcase of selected projects across front-end development, UI/UX design, and web apps',
      },
      githubProfileUrl: { type: String, default: '#' },
      githubCtaText: { type: String, default: 'View My GitHub Profile' },
      filters: {
        type: [portfolioFilterSchema],
        default: [
          { slug: 'all', label: 'All', order: 0 },
          { slug: 'web', label: 'Web Development', order: 1 },
          { slug: 'design', label: 'UI/UX Design', order: 2 },
          { slug: 'api', label: 'API / Backend', order: 3 },
        ],
      },
    },

    servicesSection: {
      subtitle: {
        type: String,
        default: 'Comprehensive front-end and design solutions tailored to your needs',
      },
    },

    contact: {
      email: { type: String, default: 'johnteche7@gmail.com' },
      phone: { type: String, default: '+234 913 396 6167' },
      address: { type: String, default: '' },
      location: { type: String, default: 'Lagos, Nigeria' },
      whatsapp: { type: String, default: '2348105631752' },
      eyebrow: { type: String, default: "Let's Collaborate" },
      heading: { type: String, default: 'Get In Touch' },
      headingGradientWord: { type: String, default: 'Touch' },
      intro: {
        type: String,
        default: "Let's have a talk on your projects. Need more information or want to get in touch?",
      },
      formIntro: { type: String, default: '' },
      cvCardTitle: { type: String, default: 'Download CV' },
      cvButtonText: { type: String, default: 'Download My CV' },
    },

    socials: {
      github: { type: String, default: '#' },
      linkedin: { type: String, default: '#' },
      instagram: { type: String, default: '#' },
      facebook: { type: String, default: '#' },
      twitter: { type: String, default: '#' },
      tiktok: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },

    footer: {
      description: {
        type: String,
        default: 'Creating exceptional digital experiences through design, development, video production',
      },
      copyright: { type: String, default: '2026 JOHNTECH All right reserved.' },
      creditLine: { type: String, default: 'Made with 🩷 by Olatunji Shogo John' },
      quickLinksTitle: { type: String, default: 'Quick Links' },
      servicesColumnTitle: { type: String, default: 'Services' },
      links: { type: [footerLinkSchema], default: [] },
      serviceTags: { type: [String], default: ['Web development', 'Graphic Design', 'Video Editing', 'Brand Identity', 'UI/UX Design'] },
    },

    primaryColor: { type: String, default: '#8b5cf6' },
    secondaryColor: { type: String, default: '#ec4899' },
    darkMode: { type: Boolean, default: true },

    metaDescription: { type: String, default: '' },
    metaKeywords: { type: String, default: '' },
    googleAnalyticsId: { type: String, default: '' },
    ogImage: { type: String, default: 'assets/images/preview.png' },

    sections: {
      hero: { type: Boolean, default: true },
      about: { type: Boolean, default: true },
      skills: { type: Boolean, default: true },
      portfolio: { type: Boolean, default: true },
      services: { type: Boolean, default: true },
      contact: { type: Boolean, default: true },
      footer: { type: Boolean, default: true },
    },

    sectionOrder: {
      type: [String],
      default: ['hero', 'about', 'skills', 'portfolio', 'services', 'contact', 'footer'],
    },

    stats: {
      siteVisits: { type: Number, default: 0 },
    },

    adminProfile: {
      displayName: { type: String, default: 'Admin' },
      email: { type: String, default: 'admin@johntechhub.com' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
