import { api, clean } from './client';

export const sessionsApi = {
  list: async (status) => (await api.get('/api/sessions', clean({ status }))).sessions || [],
  review: (id, body) => api.post(`/api/sessions/${id}/review`, body),
  // V2 spec (E-32/E-33). Not in Endpoints_Full.md -> unverified.
  complete: (id) => api.post(`/api/v1/sessions/${id}/complete`),
  cancel: (id) => api.post(`/api/v1/sessions/${id}/cancel`),
};
