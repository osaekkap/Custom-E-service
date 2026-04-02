import client from './client';

export const productsApi = {
  list: (params) =>
    client.get('/products', { params }).then((r) => r.data),

  get: (id) =>
    client.get(`/products/${id}`).then((r) => r.data),

  create: (data) =>
    client.post('/products', data).then((r) => r.data),

  update: (id, data) =>
    client.patch(`/products/${id}`, data).then((r) => r.data),

  delete: (id) =>
    client.delete(`/products/${id}`).then((r) => r.data),
};
