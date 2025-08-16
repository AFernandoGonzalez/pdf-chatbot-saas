import { PDFLoader } from 'langchain/document_loaders/fs/pdf.js';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export async function loadAndChunkPDF(filePath) {
  const loader = new PDFLoader(filePath);
  const docs = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunkedDocs = await splitter.splitDocuments(docs);

  return chunkedDocs;
}
