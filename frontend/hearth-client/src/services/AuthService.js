import axios from 'axios'

const API_BASE_URL = 'http://localhost:5253/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hearth_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

const AuthService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (loginData) => api.post('/auth/login', loginData),
}

export default AuthService
