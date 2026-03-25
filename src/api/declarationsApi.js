import client from './client';

export const declarationsApi = {
  listByJob: (jobId) =>
    client.get(`/jobs/${jobId}/declarations`).then((r) => r.data),

  get: (id) =>
    client.get(`/declarations/${id}`).then((r) => r.data),

  create: (jobId, data) =>
    client.post(`/jobs/${jobId}/declarations`, data).then((r) => r.data),

  update: (id, data) =>
    client.patch(`/declarations/${id}`, data).then((r) => r.data),

  addItem: (id, data) =>
    client.post(`/declarations/${id}/items`, data).then((r) => r.data),

  updateItem: (id, itemId, data) =>
    client.patch(`/declarations/${id}/items/${itemId}`, data).then((r) => r.data),

  removeItem: (id, itemId) =>
    client.delete(`/declarations/${id}/items/${itemId}`).then((r) => r.data),

  submit: (id) =>
    client.post(`/declarations/${id}/submit`).then((r) => r.data),

  getNswStatus: (id) =>
    client.get(`/declarations/${id}/nsw-status`).then((r) => r.data),
};
