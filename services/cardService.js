const Card = require("../models/cards");

exports.createCard = async (title, description, detailPage, filename) => {
  const imageUrl = `/uploads/${filename}`;
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
  return await Card.find().sort({ createdAt: -1 });
};
