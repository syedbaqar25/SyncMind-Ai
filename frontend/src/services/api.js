import axios from 'axios'
import { API_URL } from '../utils/constants'
import { useAuthStore } from '../store/authStore'

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const { refreshToken, setTokens, logout } = useAuthStore.getState()

    if (error.response?.status === 401 && refreshToken && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken })
        setTokens(response.data.data)
        originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        logout()
      }
    }

    return Promise.reject(error)
  },
)

export default api
