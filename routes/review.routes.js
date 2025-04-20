// routes/review.routes.js
const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");

/**
 * @route   POST /api/reviews
 * @desc    Create a new review
 */
router.post("/", reviewController.createReview);

/**
 * @route   GET /api/reviews
 * @desc    Get all reviews
 */
router.get("/", reviewController.getAllReviews);

/**
 * @route   GET /api/reviews/:id
 * @desc    Get a single review by ID
 */
router.get("/:id", reviewController.getReviewById);

/**
 * @route   PUT /api/reviews/:id
 * @desc    Update a review by ID
 */
router.put("/:id", reviewController.updateReview);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete a review by ID
 */
router.delete("/:id", reviewController.deleteReview);

module.exports = router;
