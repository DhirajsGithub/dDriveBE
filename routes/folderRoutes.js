require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const Folder = require("../models/Folder");
const Image = require("../models/Image");
const router = express.Router();

router.post("/", async (req, res) => {
  const { name, parent } = req.body;
  const token = req.headers.authorization.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const folder = new Folder({ name, parent, user: decoded.userId });
    await folder.save();
    res.status(201).json(folder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const folders = await Folder.find({ user: decoded.userId, parent: null });
    res.json(folders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const folder = await Folder.findOne({
      _id: req.params.id,
      user: decoded.userId,
    });

    if (!folder) return res.status(404).json({ message: "Folder not found" });
    const images = await Image.find({
      folder: folder._id,
      user: decoded.userId,
    });
    const subfolders = await Folder.find({
      parent: folder._id,
      user: decoded.userId,
    });

    res.json({ folder, images, subfolders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const folder = await Folder.findOne({
      _id: req.params.id,
      user: decoded.userId,
    });

    if (!folder) return res.status(404).json({ message: "Folder not found" });

    await Folder.deleteOne({ _id: folder._id });

    res.status(200).json({ message: "Folder deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
