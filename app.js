require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const cardRoutes = require("./routes/cardRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const ibirwaClientsRoutes = require("./routes/ibirwaClientsRoutes");
const contactRoutes = require("./routes/contactRoutes");
const serviceRoutes = require("./routes/ServiceRoutes");
const userRoutes = require("./routes/userRoutes");
const app = express();
const publicDir = path.join(__dirname, "public");
const uploadsDir = path.join(publicDir, "uploads");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use(bodyParser.json());
app.use(
  cors({
    origin: ["https://ibirwa-kivu-bike-tours.netlify.app"],
    methods: ["POST", "PUT", "GET", "DELETE", "OPTIONS", "HEAD"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use("/uploads", express.static(uploadsDir));
app.options("*", cors());

app.use(express.static("public"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cardsDB")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/cards", cardRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/ibirwa-clients", ibirwaClientsRoutes);
app.use("/api", contactRoutes);
app.use("/api/services", serviceRoutes);

// Ensure the base URL for user routes is correctly set
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
