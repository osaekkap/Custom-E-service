import client from './client';

export const documentsApi = {
  list: (jobId) =>
    client.get(`/jobs/${jobId}/documents`).then((r) => r.data),

  upload: (jobId, file, docType = 'OTHER') => {
    const form = new FormData();
    form.append('file', file);
    form.append('docType', docType);
    return client.post(`/jobs/${jobId}/documents`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  delete: (jobId, docId) =>
    client.delete(`/jobs/${jobId}/documents/${docId}`).then((r) => r.data),

  refreshUrl: (jobId, docId) =>
    client.post(`/jobs/${jobId}/documents/${docId}/refresh-url`).then((r) => r.data),
};
