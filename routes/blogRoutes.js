const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload"); 
const blogController = require("../controllers/blogController");
const verifyAdmin = require("../middleware/adminAuth");

const blogUploadFields = upload.fields([
  { name: "mainImage", maxCount: 1 },
  { name: "gallery", maxCount: 4 }
]);

// 100% Free Public Interactions (No signup barrier)
router.get("/", blogController.getAllBlogs);
router.get("/:id", blogController.getBlogById);
router.post("/:id/comments", blogController.addAnonymousComment);
router.post("/:id/toggle-like", blogController.toggleBlogLike);

// Protected Dashboard Points (Requires Admin Login Header)
router.post("/", verifyAdmin, blogUploadFields, blogController.createBlog);
router.put("/:id", verifyAdmin, blogUploadFields, blogController.updateBlog);
router.delete("/:id", verifyAdmin, blogController.deleteBlog);

module.exports = router;