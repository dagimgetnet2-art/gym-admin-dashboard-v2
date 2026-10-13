import { api } from './client';

// Provider self-service. Every call below is `/api/v1/me/*`: documented in the V2 spec and the
// Postman collection but absent from Endpoints_Full.md, so each one is "unverified".
export const meApi = {
  profile: () => api.get('/api/v1/me/provider'),
  updateProfile: (body) => api.put('/api/v1/me/provider', body),
  availability: () => api.get('/api/v1/me/availability'),
  replaceAvailability: (availability) => api.put('/api/v1/me/availability', { availability }),
  packages: () => api.get('/api/v1/me/packages'),
  createPackage: (body) => api.post('/api/v1/me/packages', body),
  // Update/delete paths follow the "CRUD /me/packages" wording of the spec (assumed REST shape).
  updatePackage: (id, body) => api.put(`/api/v1/me/packages/${id}`, body),
  deletePackage: (id) => api.delete(`/api/v1/me/packages/${id}`),
  consultationPlan: () => api.get('/api/v1/me/consultation-plan'),
  updateConsultationPlan: (body) => api.put('/api/v1/me/consultation-plan', body),
  clients: () => api.get('/api/v1/me/clients'),
  earnings: () => api.get('/api/v1/me/earnings'),
  payouts: () => api.get('/api/v1/me/payouts'),
  requestPayout: (body) => api.post('/api/v1/me/payouts', body),
  badges: () => api.get('/api/v1/me/badges'),
  stats: () => api.get('/api/v1/me/stats'),
  streakLeaderboard: (gymId) => api.get(`/api/v1/gyms/${gymId}/leaderboard/streaks`),
};
