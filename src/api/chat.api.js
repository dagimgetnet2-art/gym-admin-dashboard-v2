import { api, clean } from './client';

// E-70..E-73: unverified (V2 spec + Postman only).
export const chatApi = {
  threads: () => api.get('/api/v1/chats'),
  messages: (threadId, params) => api.get(`/api/v1/chats/${threadId}/messages`, clean(params)),
  send: (threadId, body) => api.post(`/api/v1/chats/${threadId}/messages`, { body }),
  markRead: (threadId) => api.post(`/api/v1/chats/${threadId}/read`),
};
