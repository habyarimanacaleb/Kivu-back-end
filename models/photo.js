const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    unique: true,
  },
  imageFile: {
    type: String,
    required: [true, 'Image is required'],
    validate: {
      validator: function (v) {
        return /^(http|https):\/\/[^ "]+$/.test(v); // Basic URL validation
      },
      message: (props) => `${props.value} is not a valid URL!`,
    },
  },
}
,
{
  timestamps: true,
}
);

const Photo = mongoose.model("Photo", photoSchema);

module.exports = Photo;
