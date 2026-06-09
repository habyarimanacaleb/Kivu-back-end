// ================= 1. SENTRY CAPTURE ENGINE INITIALIZATION =================
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN, // Your unique project key from Sentry dashboard
  environment: process.env.NODE_ENV || "development",
  tracesSampleRate: 1.0, // Tracks 100% of your API traffic performance pipelines
});

// ================= 2. ENVIRONMENT LAYER LOADER =================
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// ================= 3. DEPENDENCY IMPORTS =================
const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const compression = require('compression');
const http = require('http');                    // 👉 Imported native HTTP module
const { Server } = require('socket.io');         // 👉 Imported Socket.io engine
const connectDB = require('./config/db');
const logger = require('./utils/logger'); 
const helmet = require('helmet');                // For enhanced security headers
const morgan = require('morgan');                // For HTTP request logging
const { apiLimiter } = require('./middleware/rateLimiter');

// ================= 4. APPLICATION & COMPONENT INITIALIZATION =================
const app = express();                           // ✨ FIXED: Express instantiated before any middleware calls
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 👉 Create Native HTTP Server wrapped around the Express app layout instance
const server = http.createServer(app);

// 🚀 CRITICAL FOR CPANEL HOSTING: Tells Express to look at X-Forwarded-For headers for real user IPs
app.set('trust proxy', 1); 

// Global list of trusted client origins for unified security access control
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://ibirwa-kivu-bike-tours.netlify.app',
  'https://v2.ibirwakivubiketours.com',
  'https://www.ibirwakivubiketours.com'
];

// 👉 Initialize Socket.io cluster bound to your new HTTP server chassis
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'baggage', 'sentry-trace'],
    credentials: true
  }
});

// 👉 Attach your Live Socket Server instance straight onto the app framework instance
app.set("socketio", io);

// Basic socket authentication/connection confirmation monitoring log
io.on("connection", (socket) => {
  logger.info(`Terminal client pipeline linked to socket tunnel: ${socket.id}`);
  
  socket.on("disconnect", () => {
    logger.info(`Terminal client connection unlinked: ${socket.id}`);
  });
});


// ================= 5. SENTRY ERROR HANDLER INTERCEPTOR =================
// ✨ FIXED: Attached safely directly following app initialization matrix rules
Sentry.setupExpressErrorHandler(app);


// ================= 6. SECURITY & DEEP SYSTEM MIDDLEWARES =================
// ✨ FIXED: Shifted down here so they run safely against an active 'app' target instance
app.use(helmet());

// Use Morgan for logging HTTP requests in development mode
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Session middleware - Configured safely for production storage
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret',
  resave: false,
  saveUninitialized: false, // Changed to false to avoid saving empty sessions
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI, // 🚀 Uses your existing MongoDB connection string!
    collectionName: 'sessions',      // Creates a clean 'sessions' collection in MongoDB
    ttl: 24 * 60 * 60,               // Session expiration (1 day in seconds)
    crypto: {
      secret: process.env.SESSION_SECRET || 'default-secret' // Encrypts session data
    }
  }),
  cookie: { 
    secure: NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
  }
}));

// CORS configuration - Safely permitting preflight metadata validation passing layers
app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'baggage',        
    'sentry-trace'    
  ],
  credentials: true
}));

// Static files
app.use(express.static( path.join(__dirname, "public")));
app.use('/logs', express.static(path.join(__dirname, 'logs')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// API rate limiter applied globally to all API routes
app.use('/api', apiLimiter);


// ================= 7. ROUTING DISPATCH MATRIX =================
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/ibirwa-clients', require('./routes/ibirwaClientsRoutes'));
app.use("/api/ibirwa-clients/admin", require('./routes/governanceRoutes')); 
app.use('/api', require('./routes/contactRoutes'));
app.use('/api/services', require('./routes/ServiceRoutes'));
app.use('/api/inquiries', require('./routes/tourInquiry.routes'));
app.use("/api/reviews", require("./routes/review.routes"));
app.use("/api/blogs", require("./routes/blogRoutes"));


// ================= 8. ERROR TERMINAL LANDING ENGINE =================
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


// ================= 9. EXECUTION HOOKS LOOP =================
const startServer = async () => {
  try {
    await connectDB();
    
    // 👉 Trigger our HTTP socket wrapper instead of raw app listener
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
      console.log('\n-----------------------------------------------');
      console.log(`🚀 Real-Time Server running in ${NODE_ENV} mode at http://localhost:${PORT} `);
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