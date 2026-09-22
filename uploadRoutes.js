const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ dest: uploadDir });

router.post("/", upload.single("image"), (req, res) => {
  try {
    console.log("=== UPLOAD ===");
    console.log("File:", req.file ? req.file.filename : "NONE");

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided." });
    }

    const url = "http://localhost:5000/uploads/" + req.file.filename;

    res.status(200).json({ url: url });
  } catch (error) {
    console.error("ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;