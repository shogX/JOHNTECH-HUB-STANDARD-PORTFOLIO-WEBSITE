const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const nodeEnv = process.env.NODE_ENV || 'development';
const mongoUri = process.env.MONGODB_URI?.trim();
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
  : [];

if (!mongoUri) {
  console.error('Missing MONGODB_URI in environment variables.');
  process.exit(1);
}

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Security middleware
app.enable('trust proxy');
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(morgan(nodeEnv === 'production' ? 'combined' : 'dev'));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
  skip: (req) => nodeEnv !== 'production', // Skip in development
});

if (nodeEnv === 'production' && allowedOrigins.length > 0) {
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('CORS policy: Origin not allowed'));
      },
      credentials: true,
    })
  );
} else {
  app.use(cors());
}

// Rate limiting (only in production)
if (nodeEnv === 'production') {
  app.use('/api', apiLimiter);
}

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Models
const Job = require('./models/Job');

// Routes
const jobsRouter = require('./routes/jobs');
const heroRouter = require('./routes/hero');
const aboutRouter = require('./routes/about');
const skillsRouter = require('./routes/skills');
const servicesRouter = require('./routes/services');
const contactRouter = require('./routes/contact');
const footerRouter = require('./routes/footer');
const socialRouter = require('./routes/social');
const settingsRouter = require('./routes/settings');

app.use('/api/jobs', jobsRouter);
app.use('/api/cms/hero', heroRouter);
app.use('/api/cms/about', aboutRouter);
app.use('/api/cms/skills', skillsRouter);
app.use('/api/cms/services', servicesRouter);
app.use('/api/cms/contact', contactRouter);
app.use('/api/cms/footer', footerRouter);
app.use('/api/cms/social', socialRouter);
app.use('/api/cms/settings', settingsRouter);

// Simple root homepage
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>JOHNTECH HUB Backend</title>
        <style>
          body { background: #0f172a; color: #e2e8f0; font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
          .page { text-align: center; max-width: 560px; padding: 24px; }
          a { color: #7c3aed; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="page">
          <h1>JOHNTECH HUB Backend</h1>
          <p>Your API is running successfully.</p>
          <p>Use the following endpoints:</p>
          <ul style="text-align:left; display:inline-block;">
            <li><a href="/api/ping">/api/ping</a></li>
            <li><a href="/api/jobs">/api/jobs</a></li>
          </ul>
        </div>
      </body>
    </html>
  `);
});

// Simple health check
app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Connect to MongoDB and start server
mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  });
