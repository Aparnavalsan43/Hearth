import axios from 'axios'

// const API_BASE_URL = 'http://localhost:5253/api'
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5253/api'

const remindersApi = axios.create({
  baseURL: API_BASE_URL,
})

remindersApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('hearth_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

const RemindersService = {
  getReminders: () => remindersApi.get('/reminders'),
  createReminder: (reminder) => remindersApi.post('/reminders', reminder),
  updateReminder: (id, reminder) => remindersApi.put(`/reminders/${id}`, reminder),
  deleteReminder: (id) => remindersApi.delete(`/reminders/${id}`),
}

export default RemindersService
