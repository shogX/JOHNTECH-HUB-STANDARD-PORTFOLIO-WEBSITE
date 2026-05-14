const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
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

app.enable('trust proxy');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(morgan(nodeEnv === 'production' ? 'combined' : 'dev'));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
  skip: (req) => nodeEnv !== 'production',
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

if (nodeEnv === 'production') {
  app.use('/api', apiLimiter);
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const { requireAuth } = require('./middleware/auth');

const authRouter = require('./routes/auth');
const jobsRouter = require('./routes/jobs');
const skillsRouter = require('./routes/skills');
const servicesRouter = require('./routes/services');
const messagesRouter = require('./routes/messages');
const settingsRouter = require('./routes/settings');
const analyticsRouter = require('./routes/analytics');
const analyticsVisitRouter = require('./routes/analyticsVisit');
const { router: mediaRouter } = require('./routes/media');

app.use('/api/auth', authRouter);
app.use('/api/analytics', analyticsVisitRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/cms/skills', skillsRouter);
app.use('/api/cms/services', servicesRouter);
app.use('/api/cms/settings', settingsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/cms/analytics', requireAuth, analyticsRouter);
app.use('/api/cms/media', requireAuth, mediaRouter);

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
            <li><a href="/api/settings">/api/settings</a></li>
          </ul>
        </div>
      </body>
    </html>
  `);
});

app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

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
