import client from './client';

export const notificationsApi = {
  list: (params) =>
    client.get('/notifications', { params }).then((r) => r.data),

  getUnreadCount: () =>
    client.get('/notifications/unread-count').then((r) => r.data),

  markAsRead: (id) =>
    client.patch(`/notifications/${id}/read`).then((r) => r.data),

  markAllAsRead: () =>
    client.patch('/notifications/read-all').then((r) => r.data),
};
