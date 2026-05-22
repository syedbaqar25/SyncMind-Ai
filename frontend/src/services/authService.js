import api from './api'

export const authService = {
  register: (payload) => api.post('/auth/register', payload).then((res) => res.data),
  login: (payload) => api.post('/auth/login', payload).then((res) => res.data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }).then((res) => res.data),
  me: () => api.get('/auth/me').then((res) => res.data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then((res) => res.data),
  resetPassword: (payload) => api.post('/auth/reset-password', payload).then((res) => res.data),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`).then((res) => res.data),
}
