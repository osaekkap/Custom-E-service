import client from './client';

export const privilegeDocsApi = {
  upload: (file, dto) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(dto).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, value);
    });
    return client.post('/privilege-docs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  list: (params) =>
    client.get('/privilege-docs', { params }).then((r) => r.data),

  listByItem: (declarationItemId) =>
    client.get(`/privilege-docs/by-item/${declarationItemId}`).then((r) => r.data),

  remove: (id) =>
    client.delete(`/privilege-docs/${id}`).then((r) => r.data),
};
