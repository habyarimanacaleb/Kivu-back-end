const Card = require('../models/cards');

exports.createCard = async (title, description, detailPage, filename) => {
  const imageUrl = `/uploads/cards/${req.file.filename}`;
  const newCard = new Card({
    title,
    description,
    detailPage,
    imageUrl,
  });
  await newCard.save();
  return newCard;
};
exports.getAllCards = async () => {
  const cards = await Card.find();
  return cards;
};