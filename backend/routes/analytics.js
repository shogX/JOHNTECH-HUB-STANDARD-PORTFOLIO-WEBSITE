const express = require('express');
const Job = require('../models/Job');
const Message = require('../models/Message');
const Skill = require('../models/Skill');
const Service = require('../models/Service');
const Settings = require('../models/Settings');

const router = express.Router();

router.get('/summary', async (req, res) => {
  try {
    const [totalProjects, totalMessages, settings, skills, services, topProjects] = await Promise.all([
      Job.countDocuments(),
      Message.countDocuments(),
      Settings.findOne().lean(),
      Skill.find().lean(),
      Service.find().lean(),
      Job.find({ views: { $gt: 0 } }).sort({ views: -1 }).limit(5).select('title views featured').lean(),
    ]);

    const visits = settings?.stats?.siteVisits || 0;
    const skillsByCategory = skills.reduce((acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalProjects,
      totalMessages,
      portfolioVisits: visits,
      topProjects,
      skillsByCategory,
      totalServices: services.length,
      totalSkills: skills.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load analytics', error: error.message });
  }
});

module.exports = router;
