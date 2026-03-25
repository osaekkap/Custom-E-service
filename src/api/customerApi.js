import client from './client';

export const customerApi = {
  /** GET /customers/my — ดูข้อมูลบริษัทตัวเอง */
  getMy: () => client.get('/customers/my').then((r) => r.data),

  /** PATCH /customers/my — บันทึกข้อมูลบริษัท */
  updateMy: (data) => client.patch('/customers/my', data).then((r) => r.data),

  /** GET /customers/my/users — รายชื่อผู้ใช้ในองค์กร */
  listUsers: () => client.get('/customers/my/users').then((r) => r.data),

  /** POST /customers/my/users — เชิญผู้ใช้ใหม่ */
  inviteUser: (data) => client.post('/customers/my/users', data).then((r) => r.data),

  /** PATCH /customers/my/users/:id — เปลี่ยน role */
  updateUserRole: (profileId, role) =>
    client.patch(`/customers/my/users/${profileId}`, { role }).then((r) => r.data),

  /** DELETE /customers/my/users/:id — ลบผู้ใช้ */
  removeUser: (profileId) =>
    client.delete(`/customers/my/users/${profileId}`).then((r) => r.data),
};
