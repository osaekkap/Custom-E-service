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

  // B1: Job Assignment
  assign: (id, assignToId) =>
    client.patch(`/jobs/${id}/assign`, { assignToId }).then((r) => r.data),

  // B2: Approval Workflow
  requestApproval: (id, note) =>
    client.patch(`/jobs/${id}/request-approval`, { note }).then((r) => r.data),

  approve: (id, note) =>
    client.patch(`/jobs/${id}/approve`, { note }).then((r) => r.data),

  reject: (id, note) =>
    client.patch(`/jobs/${id}/reject`, { note }).then((r) => r.data),

  // Staff list for assignment dropdown
  listStaff: () =>
    client.get('/users', { params: { role: 'STAFF,TENANT_ADMIN,MANAGER' } }).then((r) => r.data),
};
