import { PDFLoader } from 'langchain/document_loaders/fs/pdf.js';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export async function loadAndChunkPDF(filePath) {
  // Load PDF pages as LangChain Documents (pageContent + metadata)
  const loader = new PDFLoader(filePath);
  const docs = await loader.load();

  // Create a splitter for fine chunking with overlap
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  // Split each page into smaller chunks (returns array of Documents)
  const chunkedDocs = await splitter.splitDocuments(docs);

  return chunkedDocs; // array of Documents with page content + metadata
}
