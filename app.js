const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const cardRoutes = require('./routes/cardRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const ibirwaClientsRoutes = require('./routes/ibirwaClientsRoutes');
require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cardsDB').then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/cards', cardRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/ibirwa-clients', ibirwaClientsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
