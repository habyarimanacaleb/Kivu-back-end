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
const tourInquiryRoutes = require("./routes/tourInquiry.routes");
const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";
// ** Ensure directories exist **
const publicDir = path.join(__dirname, "public");
const uploadsDir = path.join(publicDir, "uploads");

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
// Set the view engine to EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// ** Middleware **
app.use(compression()); // Improve performance
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
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
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});
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
const mongoURI =
  process.env.MONGO_URI || "mongodb://localhost:27017/kivu-back-end";

mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

// ** Routes **
app.use("/api/gallery", galleryRoutes);
app.use("/api/ibirwa-clients", ibirwaClientsRoutes);
app.use("/api", contactRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/inquiries", tourInquiryRoutes);

// ** Global Error Handler **
app.use((err, req, res, next) => {
  console.error("An error occurred:", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: NODE_ENV === "development" ? err : {}, // Include stack trace in development
  });
});

// ** 404 Handler **
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ** Start Server **
app.listen(PORT, () => {
  console.log(
    "-------------------------------------------------------------------------------"
  );
  console.log(
    `🚀 Server running in ${NODE_ENV} mode on http://localhost:${PORT}`
  );
  console.log(
    "-------------------------------------------------------------------------------"
  );
});
