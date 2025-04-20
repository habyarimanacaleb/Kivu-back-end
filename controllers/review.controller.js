// controllers/reviewController.js

const Review = require("../models/review.model");
const { sendEmail } = require("./emailController");

exports.createReview = async (req, res) => {
  try {
    const { name, email, comment, rating } = req.body;

    // Save the review to the database
    const newReview = await Review.create({
      name,
      email,
      comment,
      rating,
    });

    // Compose email content
    const subject = "📝 New Review Submitted on Ibirwa Kivu Bike Tours!";
    const html = `
      <h3>New Review Alert!</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Rating:</strong> ${rating} ⭐</p>
      <p><strong>Message:</strong> ${comment}</p>
    `;

    // Send email to admin
    await sendEmail(process.env.ADMIN_EMAIL, subject, "", html);

    res.status(201).json({
      message: "Review submitted successfully and notification sent to admin.",
      review: newReview,
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};


// Read All
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Read One
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.status(200).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update
exports.updateReview = async (req, res) => {
  try {
    const updated = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Review not found" });
    res.json({ message: "Review updated", updated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete
exports.deleteReview = async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Review not found" });
    res.json({ message: "Review deleted", deleted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
