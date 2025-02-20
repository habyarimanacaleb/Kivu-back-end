require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const cardRoutes = require("./routes/cardRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const ibirwaClientsRoutes = require("./routes/ibirwaClientsRoutes");
const contactRoutes = require("./routes/contactRoutes");
const app = express();
const cors = require("cors");
const session = require("express-session");

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://habyarimanacaleb.github.io/ibirwa-kivu-bike-tours",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, //(e.g., 1 day)
    },
  })
);
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cardsDB")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/cards", cardRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/ibirwa-clients", ibirwaClientsRoutes);
app.use("/api", contactRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
