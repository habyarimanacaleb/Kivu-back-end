const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const cardRoutes = require("./routes/cardRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const ibirwaClientsRoutes = require("./routes/ibirwaClientsRoutes");
const contactRoutes = require("./routes/contactRoutes");
const serviceRoutes = require("./routes/ServiceRoutes");
require("dotenv").config();

const app = express();

// Ensure the public/uploads directory exists
const publicDir = path.join(__dirname, "public");
const uploadsDir = path.join(publicDir, "uploads");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use(bodyParser.json());
const allowedOrigins = [`${process.env.CLIENT_URL}`, "http://localhost:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use("/uploads", express.static(uploadsDir));

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cardsDB")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/cards", cardRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/ibirwa-clients", ibirwaClientsRoutes);
app.use("/api", contactRoutes);
app.use("/api/services", serviceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
