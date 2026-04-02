import client from './client';

export const billingApi = {
  listItems: (params) =>
    client.get('/billing/items', { params }).then((r) => r.data),

  listInvoices: (params) =>
    client.get('/billing/invoices', { params }).then((r) => r.data),

  getInvoice: (id) =>
    client.get(`/billing/invoices/${id}`).then((r) => r.data),

  createInvoice: (data) =>
    client.post('/billing/invoices', data).then((r) => r.data),

  updateInvoiceStatus: (id, status) =>
    client.patch(`/billing/invoices/${id}/status`, { status }).then((r) => r.data),
};
