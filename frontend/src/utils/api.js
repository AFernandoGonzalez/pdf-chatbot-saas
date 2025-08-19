const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

/**
 * Sync the logged-in Firebase user with your backend.
 */
export async function syncUserWithBackend(firebaseUser) {
  if (!firebaseUser) return null;

  try {
    const token = await firebaseUser.getIdToken();

    const res = await fetch(`${API_ENDPOINT}/api/users/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error('Backend user sync failed');

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error syncing user with backend:', err);
    return null;
  }
}

/**
 * Upload a PDF file
 */
export async function uploadPDF(file, user) {
  const fd = new FormData();
  fd.append('file', file);

  const idToken = await user.getIdToken();
  const res = await fetch(`${API_ENDPOINT}/api/upload/upload-pdf`, {
    method: 'POST',
    body: fd,
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Upload failed');
  return data;
}

/**
 * Upload an image file
 */
export async function uploadImage(file, firebaseUser) {
  const token = await firebaseUser.getIdToken();
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_ENDPOINT}/api/upload/upload-img`, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error('Upload failed');
  return response.json();
}

/**
 * Fetch all uploaded files for the user
 */
export async function fetchUploadedFiles(user) {
  const token = await user.getIdToken();
  const res = await fetch(`${API_ENDPOINT}/api/files`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch files');
  return res.json();
}

/**
 * Fetch a single file by ID
 */
export async function fetchFile(fileId, user) {
  const token = await user.getIdToken();
  const res = await fetch(`${API_ENDPOINT}/api/files/${fileId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch file');
  return res.json();
}

/**
 * Fetch summary and suggested questions for a PDF
 */
export async function fetchSummaryAndQuestions(pdfId, user) {
  const token = await user.getIdToken();
  const res = await fetch(`${API_ENDPOINT}/api/chat/file-info/${pdfId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 202) throw new Error('Failed to fetch summary/questions');
  return res;
}

/**
 * Fetch all chat messages for a PDF
 */
export async function fetchChatMessages(pdfId, user) {
  const token = await user.getIdToken();
  const res = await fetch(`${API_ENDPOINT}/api/chat/messages/${pdfId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch chat messages');
  return res.json();
}

/**
 * Send a new chat message
 */
export async function sendChatMessage({ pdfId, question, user }) {
  const token = await user.getIdToken();
  const res = await fetch(`${API_ENDPOINT}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ fileId: pdfId, question, userId: user.uid }),
  });
  if (!res.body) throw new Error('No response body from server');
  return res;
}
