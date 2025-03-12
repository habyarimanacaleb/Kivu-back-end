require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const compression = require("compression");

// Import routes
const galleryRoutes = require("./routes/galleryRoutes");
const ibirwaClientsRoutes = require("./routes/ibirwaClientsRoutes");
const contactRoutes = require("./routes/contactRoutes");
const serviceRoutes = require("./routes/ServiceRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// ** Ensure directories exist **
const publicDir = path.join(__dirname, "public");
const uploadsDir = path.join(publicDir, "uploads");

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// ** Middleware **
app.use(compression()); // Improve performance
app.use(bodyParser.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://ibirwa-kivu-bike-tours.netlify.app",
    ],
    methods: ["POST", "PUT", "GET", "DELETE", "OPTIONS", "HEAD"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use("/uploads", express.static(uploadsDir));
app.options("*", cors());

// Serve static files
app.use(express.static("public"));

// ** Session Configuration **
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: NODE_ENV === "production" }, // Secure in production
  })
);

// ** MongoDB Connection **
const MONGO_URI =
  NODE_ENV === "production"
    ? process.env.MONGO_URI
    : process.env.MONGO_DEV_URI || "mongodb://127.0.0.1:27017/cardsDB";

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(`Connected to MongoDB (${NODE_ENV})`))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1); // Exit process on failure
  });

// ** Routes **
app.use("/api/gallery", galleryRoutes);
app.use("/api/ibirwa-clients", ibirwaClientsRoutes);
app.use("/api", contactRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/users", userRoutes);

// ** Start Server **
app.listen(PORT, () => {
  console.log(
    "-------------------------------------------------------------------------------"
  );
  console.log(
    "-------------------------------------------------------------------------------"
  );
  console.log(
    "-------------------------------            -----------------------------"
  );
  console.log(
    `🚀 Server running in ${NODE_ENV} mode on http://localhost:${PORT}`
  );
  console.log(
    "-------------------------------------------------------------------------------"
  );
  console.log(
    "-------------------                    -----------------------------------------------"
  );
});
