const fs = require("fs");
const path = require("path");

const publicDir = path.join(__dirname, "../public");
const uploadsDir = path.join(publicDir, "uploads");

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log("Uploads directory created.");
} else {
  console.log("Uploads directory already exists.");
}
