import { api, clean } from './client';

export const adminApi = {
  dashboard: async () => (await api.get('/api/admin/dashboard')).data,
  profile: async () => (await api.get('/api/admin/profile')).admin,
  users: async () => (await api.get('/api/admin/users')).users || [],
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
  // Staff (V2 envelope)
  staffList: (params) => api.get('/api/admin/staff', clean(params)),
  staffCreate: (body) => api.post('/api/admin/staff', body),
  staffUpdate: (id, body) => api.patch(`/api/admin/staff/${id}`, body),
  staffResetPassword: (id) => api.post(`/api/admin/staff/${id}/reset-password`),
  // Payout requests (E-62..E-64) are unverified: only in the V2 spec and Postman.
  payouts: (status) => api.get('/api/admin/payouts', clean({ status })),
  markPaid: (id, body) => api.post(`/api/admin/payouts/${id}/mark-paid`, body),
  reject: (id, body) => api.post(`/api/admin/payouts/${id}/reject`, body),

  
};
