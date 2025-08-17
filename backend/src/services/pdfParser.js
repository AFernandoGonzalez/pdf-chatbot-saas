import pdfParse from 'pdf-parse';

export default async function parsePDF(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}
