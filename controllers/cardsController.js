const cardService = require('../services/cardService');

exports.createCard = async (req, res) => {
  try {
    const { title, description, detailPage } = req.body;

    // Validate required fields
    if (!title || !description || !detailPage) {
      return res.status(400).json({ message: 'Title, description, and detailPage fields are required.' });
    }

    // Validate uploaded file
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required.' });
    }

    // Save the card information to the database using the service
    const newCard = await cardService.createCard(title, description, detailPage, req.file.filename);

    console.log('New Card:', newCard); // Debugging statement

    res.status(201).json({ message: 'Card created successfully', card: newCard });
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllCards = async (req, res) => {
  try {
    const cards = await cardService.getAllCards();
    res.status(200).json(cards);
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
