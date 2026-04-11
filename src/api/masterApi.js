import client from './client';

export const masterApi = {
  // HS Codes
  listHsCodes: (params) =>
    client.get('/master/hs-codes', { params }).then((r) => r.data),
  createHsCode: (data) =>
    client.post('/master/hs-codes', data).then((r) => r.data),
  updateHsCode: (id, data) =>
    client.patch(`/master/hs-codes/${id}`, data).then((r) => r.data),
  deleteHsCode: (id) =>
    client.delete(`/master/hs-codes/${id}`).then((r) => r.data),

  // Exporters
  listExporters: () =>
    client.get('/master/exporters').then((r) => r.data),
  createExporter: (data) =>
    client.post('/master/exporters', data).then((r) => r.data),
  updateExporter: (id, data) =>
    client.patch(`/master/exporters/${id}`, data).then((r) => r.data),
  deleteExporter: (id) =>
    client.delete(`/master/exporters/${id}`).then((r) => r.data),

  // Consignees
  listConsignees: (params) =>
    client.get('/master/consignees', { params }).then((r) => r.data),
  createConsignee: (data) =>
    client.post('/master/consignees', data).then((r) => r.data),
  updateConsignee: (id, data) =>
    client.patch(`/master/consignees/${id}`, data).then((r) => r.data),
  deleteConsignee: (id) =>
    client.delete(`/master/consignees/${id}`).then((r) => r.data),

  // Brokers
  listBrokers: () =>
    client.get('/master/brokers').then((r) => r.data),
  createBroker: (data) =>
    client.post('/master/brokers', data).then((r) => r.data),
  updateBroker: (id, data) =>
    client.patch(`/master/brokers/${id}`, data).then((r) => r.data),
  deleteBroker: (id) =>
    client.delete(`/master/brokers/${id}`).then((r) => r.data),

  // Privileges
  listPrivileges: () =>
    client.get('/master/privileges').then((r) => r.data),
  createPrivilege: (data) =>
    client.post('/master/privileges', data).then((r) => r.data),
  updatePrivilege: (id, data) =>
    client.patch(`/master/privileges/${id}`, data).then((r) => r.data),
  deletePrivilege: (id) =>
    client.delete(`/master/privileges/${id}`).then((r) => r.data),
};
