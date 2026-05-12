const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Job = require('./models/Job');

dotenv.config();

const jobs = [
  {
    title: 'Frontend Developer',
    company: 'JOHNTECH HUB',
    description: 'Build a dynamic portfolio and dashboard for client work.',
    category: 'Web Development',
    link: 'https://example.com',
    featured: true,
  },
  {
    title: 'UI/UX Designer',
    company: 'JOHNTECH HUB',
    description: 'Create modern interface designs and interactive prototypes.',
    category: 'UI/UX Design',
    link: 'https://example.com',
    featured: false,
  },
];

const seed = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI in .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await Job.deleteMany({});
  await Job.insertMany(jobs);
  console.log('Seeded database with sample jobs.');
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
