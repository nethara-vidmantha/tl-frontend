import client from './client';

export const workerApi = {
  getWorkers: (params = {}) => client.get('/workers', { params }),
  getWorkerById: (id, params = {}) => client.get(`/workers/${id}`, { params }),
  updateProfile: (data) => client.put('/workers/profile', data),
  toggleAvailability: (availability) => client.put('/workers/availability', { availability }),
  getCategories: () => client.get('/categories'),
  getDistricts: () => client.get('/districts')
};
