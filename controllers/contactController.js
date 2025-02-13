const Contact = require("../models/contact");

exports.createContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ message: "Name, email, and message are required." });
    }

    // Save the contact information to the database
    const newContact = new Contact({
      name,
      email,
      message,
    });
    await newContact.save();

    res.status(201).json({
      message: "Contact information submitted successfully",
      contact: newContact,
    });
  } catch (error) {
    console.error("Error submitting contact information:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.respondToContact = async (req, res) => {
  try {
    const { contactId, responseMessage } = req.body;

    // Validate required fields
    if (!contactId || !responseMessage) {
      return res
        .status(400)
        .json({ message: "Contact ID and response message are required." });
    }

    // Find the contact and update the response
    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    contact.responded = true;
    contact.responseMessage = responseMessage;
    await contact.save();

    res.status(200).json({ message: "Response sent successfully", contact });
  } catch (error) {
    console.error("Error responding to contact:", error);
    res.status(500).json({ message: "Server error" });
  }
};
