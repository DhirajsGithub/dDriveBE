const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
  name: { type: String },
  path: { type: String, required: true },
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Folder",
    required: true,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Image", ImageSchema);
