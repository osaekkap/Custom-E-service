import client from './client';

export const cmsApi = {
  // Public
  getLandingPage: () => client.get('/cms/landing-page').then(r => r.data),

  // Admin — Theme
  getTheme: () => client.get('/cms/theme').then(r => r.data),
  updateTheme: (data) => client.put('/cms/theme', data).then(r => r.data),

  // Admin — Sections
  getSections: () => client.get('/cms/sections').then(r => r.data),
  updateSection: (id, data) => client.put(`/cms/sections/${id}`, data).then(r => r.data),
  reorderSections: (items) => client.put('/cms/sections/reorder', { items }).then(r => r.data),

  // Admin — Cards
  createCard: (sectionId, data) => client.post(`/cms/sections/${sectionId}/cards`, data).then(r => r.data),
  updateCard: (sectionId, cardId, data) => client.put(`/cms/sections/${sectionId}/cards/${cardId}`, data).then(r => r.data),
  deleteCard: (sectionId, cardId) => client.delete(`/cms/sections/${sectionId}/cards/${cardId}`).then(r => r.data),
  reorderCards: (sectionId, items) => client.put(`/cms/sections/${sectionId}/cards/reorder`, { items }).then(r => r.data),
};
