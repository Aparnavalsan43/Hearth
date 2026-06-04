import axios from 'axios'

const API_BASE_URL = 'http://localhost:5253/api'

const choresApi = axios.create({
  baseURL: API_BASE_URL,
})

choresApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('hearth_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

const ChoresService = {
  getChores: () => choresApi.get('/chores'),
  createChore: (chore) => choresApi.post('/chores', chore),
  updateChore: (id, chore) => choresApi.put(`/chores/${id}`, chore),
  deleteChore: (id) => choresApi.delete(`/chores/${id}`),
}

export default ChoresService
