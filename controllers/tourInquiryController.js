const TourInquiry = require("../models/tourInquiry.model");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // You can change this to Outlook, Yahoo, etc.
  auth: {
    user: process.env.ADMIN_EMAIL, // Admin email
    pass: process.env.ADMIN_EMAIL_PASSWORD, // App password (not your main email password)
  },
  tls: {
    rejectUnauthorized: false, // ✅ Allow self-signed certificates
  },
});

// Function to send an email notification
const sendEmailNotification = async (inquiry) => {
  const mailOptions = {
    from: inquiry.email,
    to: process.env.ADMIN_EMAIL, // Send the email to the admin
    subject: "New Tour Inquiry Received",
    text: `
      A new tour inquiry has been submitted:

      Name: ${inquiry.name || "Not provided"}
      Email: ${inquiry.email}
      Destination: ${inquiry.destination}
      No. of People: ${inquiry.paxNumber}
      Check-in Date: ${inquiry.checkinDate}
      Check-out Date: ${inquiry.checkoutDate}

      Please respond as soon as possible.
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Admin notified via email");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// Create a new tour inquiry
exports.createInquiry = async (req, res) => {
  try {
    const newInquiry = new TourInquiry(req.body);
    await newInquiry.save();

    // Send admin an email
    sendEmailNotification(newInquiry);

    res.status(201).json({
      message: "Inquiry submitted successfully!",
      inquiry: newInquiry,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllInquiries = async (req, res) => {
  try {
    const inquiries = await TourInquiry.find();
    res.status(200).json(inquiries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single tour inquiry by ID
exports.getInquiryById = async (req, res) => {
  try {
    const inquiry = await TourInquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });
    res.status(200).json(inquiry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a tour inquiry
exports.updateInquiry = async (req, res) => {
  try {
    const updatedInquiry = await TourInquiry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedInquiry)
      return res.status(404).json({ message: "Inquiry not found" });
    res
      .status(200)
      .json({ message: "Inquiry Updated suceessfully", updatedInquiry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.respondToInquiry = async (req, res) => {
  try {
    const inquiryId = req.params.id;
    const { responseMessage } = req.body;

    // Find the inquiry by ID
    const inquiry = await TourInquiry.findById(inquiryId);
    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    // Email details
    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: inquiry.email, // Send response to the user's email
      subject: "Response to Your Tour Inquiry",
      text: `
        Dear ${inquiry.name || "Customer"},

        Thank you for your inquiry about ${inquiry.destination} region.
        
        Our response:
        "${responseMessage}"

        Let us know if you have any further questions.

        Best regards,
        Ibirwa Kivu Bike Tours
      `,
    };

    // Send response email
    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ message: "Response sent successfully to the user!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a tour inquiry
exports.deleteInquiry = async (req, res) => {
  try {
    const deletedInquiry = await TourInquiry.findByIdAndDelete(req.params.id);
    if (!deletedInquiry)
      return res.status(404).json({ message: "Inquiry not found" });
    res
      .status(200)
      .json({ message: "Inquiry deleted successfully", deletedInquiry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
