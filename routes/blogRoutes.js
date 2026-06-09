const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload"); 
const blogController = require("../controllers/blogController");
const verifyAdmin = require("../middleware/adminAuth");
const resizeTourImage = require("../middleware/resizeImage");

const blogUploadFields = upload.fields([
  { name: "mainImage", maxCount: 1 },
  { name: "gallery", maxCount: 4 }
]);

// 100% Free Public Interactions (No signup barrier)
router.get("/", blogController.getAllBlogs);
router.get("/:id", blogController.getBlogById);          
router.get("/slug/:slug", blogController.getBlogBySlug);

// --- INTERACTIVE ANONYMOUS TRIPS ---
router.post("/:id/comments", blogController.addAnonymousComment);
router.post("/:id/toggle-like", blogController.toggleBlogLike);

// --- PROTECTED DASHBOARD MANAGEMENT GATEWAY ---
router.post("/", verifyAdmin, blogUploadFields,resizeTourImage, blogController.createBlog);
router.put("/:id", verifyAdmin, blogUploadFields, resizeTourImage, blogController.updateBlog);
router.delete("/:id", verifyAdmin, blogController.deleteBlog);

module.exports = router;