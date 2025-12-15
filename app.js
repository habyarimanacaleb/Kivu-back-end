// Load environment variables first
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const compression = require('compression');
const connectDB = require('./config/db');
const logger = require('./utils/logger'); // Optional

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';


// ================= MIDDLEWARE =================
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Session middleware (only if needed)
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://ibirwa-kivu-bike-tours.netlify.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Static files
app.use(express.static( path.join(__dirname, "public")));
app.use('/logs', express.static(path.join(__dirname, 'logs')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ================= ROUTES =================
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/ibirwa-clients', require('./routes/ibirwaClientsRoutes'));
app.use('/api', require('./routes/contactRoutes'));
app.use('/api/services', require('./routes/ServiceRoutes'));
app.use('/api/inquiries', require('./routes/tourInquiry.routes'));
app.use("/api/reviews", require("./routes/review.routes"));

// ================= ERROR HANDLING =================
app.get('/', (req, res) => {
  res.status(200).render('ServerSuccess');
});

// 404 page (any unmatched route)
app.use((req, res) => {
  res.status(404).render('ServerFailed');
});

app.use((err, req, res, next) => {
  logger.error(`Error: ${err.stack}`);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: NODE_ENV === 'development' ? err.stack : {}
  });
});

// ================= START SERVER =================
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
      console.log('\n-----------------------------------------------');
      console.log(`🚀 Server running in ${NODE_ENV} mode at http://localhost:${PORT} `);
      console.log('-----------------------------------------------\n');
    });

    process.on('unhandledRejection', (err) => {
      logger.error(`Unhandled Rejection: ${err}`);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    logger.error(`Server failed to start: ${error}`);
    process.exit(1);
  }
};

startServer();