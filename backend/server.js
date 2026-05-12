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
});
app.use('/api', apiLimiter);

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

// Models
const Job = require('./models/Job');

// Routes
const jobsRouter = require('./routes/jobs');
app.use('/api/jobs', jobsRouter);

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
