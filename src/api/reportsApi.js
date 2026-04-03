import client from './client';

export const reportsApi = {
  monthlySummary: (params) =>
    client.get('/reports/monthly-summary', { params }).then((r) => r.data),

  topDestinations: (params) =>
    client.get('/reports/top-destinations', { params }).then((r) => r.data),
};
