import fs from "fs";
import { createWorker } from "tesseract.js";

/**
 * Extract text from a PDF buffer using custom parsing + OCR fallback.
 * @param {Buffer} buffer - PDF file buffer
 * @param {Object} options - optional settings
 * @returns {Promise<string>} - extracted text
 */
export default async function parsePDF(buffer, options = {}) {
  let text = "";

  // --- Step 1: Try text-based extraction ---
  try {
    const pdfText = extractTextFromBuffer(buffer); // custom regex parser
    if (pdfText.trim().length > 50) {
      return pdfText;
    }
    // If extracted text is too short, assume scanned PDF
  } catch (err) {
    console.warn("Text extraction failed, falling back to OCR.", err);
  }

  // --- Step 2: OCR fallback ---
  text = await ocrPDF(buffer);
  return text;
}

/**
 * Minimal text extraction from PDF buffer
 * (works on simple, text-based PDFs)
 */
function extractTextFromBuffer(buffer) {
  const data = buffer.toString("utf8");
  // Remove binary junk and extract text-like sequences
  const text = data
    .replace(/[\x00-\x1F\x7F-\x9F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text;
}

/**
 * OCR extraction using Tesseract.js
 */
async function ocrPDF(buffer) {
  const worker = await createWorker({
    logger: (m) => console.log("OCR:", m.status, m.progress),
  });

  await worker.load();
  await worker.loadLanguage("eng");
  await worker.initialize("eng");

  // Save buffer temporarily
  const tmpPath = "./tmp.pdf";
  fs.writeFileSync(tmpPath, buffer);

  // NOTE: Tesseract.js works best with images.
  // Convert PDF pages to images using external lib or API if needed.
  // For now, assume single-page PDF converted manually.
  const { data: { text } } = await worker.recognize(tmpPath);

  await worker.terminate();
  fs.unlinkSync(tmpPath);

  return text;
}
