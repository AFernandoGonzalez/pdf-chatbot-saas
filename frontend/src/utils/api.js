export async function syncUserWithBackend(firebaseUser) {
  if (!firebaseUser) return null;

  try {
    const token = await firebaseUser.getIdToken();

    const res = await fetch('http://localhost:8000/api/users/me', {
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

export async function uploadPDF(file, firebaseUser) {
  const token = await firebaseUser.getIdToken();
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:8000/api/upload', {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const data = await response.json();

  return {
    fileId: data.fileId,
    fileUrl: data.fileUrl,
  };
}

export async function fetchUploadedFiles(firebaseUser) {
  if (!firebaseUser) return [];
  const token = await firebaseUser.getIdToken();

  const res = await fetch('http://localhost:8000/api/files', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Failed to fetch files');

  return res.json();
}
