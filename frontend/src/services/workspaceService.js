import api from './api'

export const workspaceService = {
  create: (payload) => api.post('/workspaces', payload).then((res) => res.data),
  list: () => api.get('/workspaces').then((res) => res.data),
  get: (id) => api.get(`/workspaces/${id}`).then((res) => res.data),
  update: (id, payload) => api.put(`/workspaces/${id}`, payload).then((res) => res.data),
  remove: (id, confirmation) => api.delete(`/workspaces/${id}`, { data: { confirmation } }).then((res) => res.data),
  members: (id) => api.get(`/workspaces/${id}/members`).then((res) => res.data),
  invite: (id, email) => api.post(`/workspaces/${id}/invite`, { email }).then((res) => res.data),
  updateMember: (id, uid, role) => api.put(`/workspaces/${id}/members/${uid}`, { role }).then((res) => res.data),
  removeMember: (id, uid) => api.delete(`/workspaces/${id}/members/${uid}`).then((res) => res.data),
}
