import client from './client';

export const jobsApi = {
  list: (params) =>
    client.get('/jobs', { params }).then((r) => r.data),

  get: (id) =>
    client.get(`/jobs/${id}`).then((r) => r.data),

  create: (data) =>
    client.post('/jobs', data).then((r) => r.data),

  update: (id, data) =>
    client.patch(`/jobs/${id}`, data).then((r) => r.data),

  updateStatus: (id, status) =>
    client.patch(`/jobs/${id}/status`, { status }).then((r) => r.data),
};
