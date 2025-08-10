
export async function uploadPDF(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://localhost:8000/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  const data = await response.json();

  return {
    fileId: data.fileId,
    fileUrl: data.fileUrl,
  };
}

export async function fetchUploadedFiles() {
  const res = await fetch('http://localhost:8000/api/files');
  if (!res.ok) throw new Error('Failed to fetch files');
  return res.json();
}
