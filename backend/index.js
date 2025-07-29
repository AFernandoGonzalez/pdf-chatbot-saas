const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// File upload config (save in /uploads folder)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// default route
app.get("/", (req, res) => {
  res.send("Welcome to the PDF Processing API");
});

// Upload endpoint
app.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    const dataBuffer = req.file.buffer;
    const pdfData = await pdfParse(dataBuffer);
    res.json({ text: pdfData.text });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to process PDF.");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
