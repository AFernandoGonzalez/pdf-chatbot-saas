import parsePDF from "../services/pdfParser.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { saveToPinecone } from "../services/pineconeService.js";
import { uploadFileToR2 } from "../services/r2Service.js";
import PDFFile from "../models/PDFFile.js";
import { v4 as uuidv4 } from 'uuid';


export const handleUpload = async (req, res) => {
  const userId = req.user?.uid;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { buffer: fileBuffer, originalname, mimetype } = req.file;
    const fileName = `${Date.now()}-${originalname}`;
    const fileId = uuidv4();

    if (mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Only PDFs are supported" });
    }


    await uploadFileToR2(fileBuffer, fileName, mimetype);
    const publicUrl = `https://pub-2d3a5bfbfb3a40efa9a5a087b2c28b0b.r2.dev/${fileName}`;

    const text = await parsePDF(fileBuffer);

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const chunks = await splitter.splitText(text);
    await saveToPinecone(fileId, chunks, originalname, userId);


    await PDFFile.findOneAndUpdate(
      { fileId },
      { fileId, fileName, originalName: originalname, fileUrl: publicUrl, status: "processing", uid: userId },
      { upsert: true, new: true }
    );

    res.json({ fileId, fileUrl: publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
};

export const handleImageUpload = async (req, res) => {
  const userId = req.user.uid;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { buffer: fileBuffer, originalname, mimetype } = req.file;
    const fileName = `${Date.now()}-${originalname}`;
    const fileId = uuidv4();

    await uploadFileToR2(fileBuffer, fileName, mimetype);
    const publicUrl = `https://pub-2d3a5bfbfb3a40efa9a5a087b2c28b0b.r2.dev/${fileName}`;

    await PDFFile.findOneAndUpdate(
      { fileId },
      {
        fileId,
        fileName,
        originalName: originalname,
        fileUrl: publicUrl,
        status: "uploaded",
        type: mimetype,
        uid: userId,
      },
      { upsert: true, new: true }
    );

    res.json({ fileId, fileUrl: publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Image upload failed" });
  }
};
