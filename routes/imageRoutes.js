require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const Image = require("../models/Image");
const Folder = require("../models/Folder");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const UPLOADS_DIR = path.join(__dirname, "../uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post("/", upload.single("image"), async (req, res) => {
  const { folderId } = req.body;
  const token = req.headers.authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const folder = await Folder.findById(folderId);

    if (folder.user.toString() !== decoded.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const image = new Image({
      name: req.file.originalname,
      path: req.file.path,
      folder: folderId,
      user: decoded.userId,
    });

    await image.save();
    res.status(201).json(image);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
