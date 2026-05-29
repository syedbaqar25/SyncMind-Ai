import api from './api'

export const meetingService = {
  list: (params) => api.get('/meetings', { params }).then((res) => res.data),
  get: (id) => api.get(`/meetings/${id}`).then((res) => res.data),
  upload: (formData, onUploadProgress) =>
    api.post('/meetings', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    }).then((res) => res.data),
  update: (id, payload) => api.put(`/meetings/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/meetings/${id}`).then((res) => res.data),
  process: (id) => api.post(`/meetings/${id}/process`).then((res) => res.data),
  transcript: (id) => api.get(`/meetings/${id}/transcript`).then((res) => res.data),
  summary: (id) => api.get(`/meetings/${id}/summary`).then((res) => res.data),
  actionItems: (id) => api.get(`/meetings/${id}/action-items`).then((res) => res.data),
  ask: (id, question) => api.post(`/meetings/${id}/ask`, { question }).then((res) => res.data),
  search: (params) => api.get('/meetings/search', { params }).then((res) => res.data),
}
