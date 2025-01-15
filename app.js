const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const galleryRoutes = require('./routes/galleryRoutes');
const cardsRoutes = require('./routes/cardsRoutes');
const ibirwaClientsRoutes = require('./routes/ibirwaClientsRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure session
app.use(session({
  secret: process.env.SESSION_SECRET || 'ibirwa as secrete',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Routes
app.use('/api', galleryRoutes);
app.use('/api', cardsRoutes);
app.use('/api/ibirwa-clients', ibirwaClientsRoutes);

app.get('/dashboard', (req, res) => {
  res.send('Welcome to the Ibirwa API');
});

//Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
