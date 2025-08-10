import pdfParse from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { saveToPinecone } from "../services/pineconeService.js";
import { uploadFileToR2 } from "../services/r2Service.js";
import PDFFile from "../models/PDFFile.js";

export const handleUpload = async (req, res) => {
  try {
    const { buffer: fileBuffer, originalname, mimetype } = req.file;
    const fileName = `${Date.now()}-${originalname}`;
    const fileId = `${Date.now()}`;

    await uploadFileToR2(fileBuffer, fileName, mimetype);
    const publicUrl = `https://pub-2d3a5bfbfb3a40efa9a5a087b2c28b0b.r2.dev/${fileName}`;

    const data = await pdfParse(fileBuffer);
    const text = data.text;

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const chunks = await splitter.splitText(text);

    await saveToPinecone(fileId, chunks);

    await PDFFile.create({
      fileId,
      fileName,
      originalName: originalname,
      fileUrl: publicUrl,
    });

    res.json({ fileId, fileUrl: publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
};


// import pdfParse from 'pdf-parse';
// import chunkText from '../utils/chunkText.js';
// import { saveToPinecone } from '../services/pineconeService.js';
// import { uploadFileToR2 } from '../services/r2Service.js';
// import PDFFile from '../models/PDFFile.js';

// const parsePDF = async (buffer) => {
//   const data = await pdfParse(buffer);
//   return data.text;
// };

// export const handleUpload = async (req, res) => {
//   try {
//     const fileBuffer = req.file.buffer;
//     const originalName = req.file.originalname;
//     const mimeType = req.file.mimetype;
//     const fileName = `${Date.now()}-${originalName}`;
//     const fileId = `${Date.now()}`;
//     // console.log("Received file:", {
//     //   fileBuffer,
//     //   originalName,
//     //   mimeType,
//     //   fileName,
//     //   fileId,
//     // });

//     // ✅ Step 1: Upload PDF to R2
//     // const r2Url = await uploadFileToR2(fileBuffer, fileName, mimeType);
//     // console.log("File uploaded to R2:", r2Url);
//     await uploadFileToR2(fileBuffer, fileName, mimeType); // don't use r2Url here

//     const publicUrl = `https://pub-2d3a5bfbfb3a40efa9a5a087b2c28b0b.r2.dev/${fileName}`;

//     // ✅ Step 2: Parse the PDF text
//     const text = await parsePDF(fileBuffer);
//     // console.log("Parsed text from PDF:", text.slice(0, 100)); // Log first 100 chars for debugging

//     // ✅ Step 3: Chunk the text
//     const chunks = chunkText(text);
//     // console.log("Number of chunks created:", chunks.length);

//     // ✅ Step 4: Send plain text chunks to Pinecone
//     await saveToPinecone(fileId, chunks); // ONLY chunks (no embeddings)

//     await PDFFile.create({
//       fileId,
//       fileName,
//       originalName,
//       fileUrl: publicUrl,
//       // userId: req.user?.id, // if you use Firebase Auth or similar
//     });

//     // res.json({ fileId, r2Url });
//     res.json({
//       fileId,
//       // fileUrl: r2Url, // ← renamed here
//       fileUrl: publicUrl, // ← use public URL instead
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Upload failed' });
//   }
// };
