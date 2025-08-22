import pdf from 'pdf-parse/lib/pdf-parse.js';

/**
 * Enhanced PDF text extraction with proper encoding and error handling
 * @param {Buffer} pdfBuffer - The PDF file buffer
 * @returns {Promise<string>} - The extracted and cleaned text
 */
export default async function parsePDF(pdfBuffer) {
  try {
    if (!Buffer.isBuffer(pdfBuffer)) {
      throw new Error('Input must be a Buffer');
    }
    
    // Parse the PDF using pdf-parse with basic options
    const data = await pdf(pdfBuffer);

    if (!data || !data.text) {
      throw new Error('No text content found in PDF');
    }
    
    const text = data.text;

    // Clean and normalize the extracted text
    const cleanedText = text
      // Convert any Windows/Mac line endings to Unix style
      .replace(/\r\n?/g, '\n')
      // Replace multiple spaces/tabs with single space
      .replace(/[\t ]+/g, ' ')
      // Replace multiple newlines with double newline
      .replace(/\n{3,}/g, '\n\n')
      // Remove any non-printable characters except newlines
      .replace(/[^\S\n]+/g, ' ')
      // Clean up whitespace at start/end
      .trim();

    if (!cleanedText || cleanedText.length < 10) {
      throw new Error('Extracted text is too short or empty');
    }
    
    return cleanedText;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}
