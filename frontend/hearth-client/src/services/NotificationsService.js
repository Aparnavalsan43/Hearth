import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5253/api'

const notificationsApi = axios.create({
  baseURL: API_BASE_URL,
})

notificationsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('hearth_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

const NotificationsService = {
  getNotifications: () => notificationsApi.get('/notifications'),
  getUnreadCount: () => notificationsApi.get('/notifications/unread-count'),
  markAsRead: (id) => notificationsApi.put(`/notifications/${id}/mark-read`),
  markAllAsRead: () => notificationsApi.put('/notifications/mark-all-read'),
  deleteNotification: (id) => notificationsApi.delete(`/notifications/${id}`),
}

export default NotificationsService
