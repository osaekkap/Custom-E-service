import client from './client';

export const nswApi = {
  retryFailed: () =>
    client.post('/declarations/nsw/retry-failed').then((r) => r.data),
};
