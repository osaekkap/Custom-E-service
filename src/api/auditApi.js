import client from './client';

export const auditApi = {
  /** GET /audit-logs — รายการ audit log ของบริษัท */
  list: (params = {}) =>
    client.get('/audit-logs', { params }).then((r) => r.data),
};
