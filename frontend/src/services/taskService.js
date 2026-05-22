import api from './api'

export const taskService = {
  list: (params) => api.get('/tasks', { params }).then((res) => res.data),
  myTasks: () => api.get('/tasks/my-tasks').then((res) => res.data),
  overdue: (workspaceId) => api.get('/tasks/overdue', { params: { workspaceId } }).then((res) => res.data),
  update: (id, payload) => api.put(`/tasks/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/tasks/${id}`).then((res) => res.data),
}
