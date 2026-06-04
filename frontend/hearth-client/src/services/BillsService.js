import axios from 'axios'

// const API_BASE_URL = 'http://localhost:5253/api'
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5253/api'

const billsApi = axios.create({
  baseURL: API_BASE_URL,
})

billsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('hearth_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

const BillsService = {
  getBills: () => billsApi.get('/bills'),
  createBill: (bill) => billsApi.post('/bills', bill),
  updateBill: (id, bill) => billsApi.put(`/bills/${id}`, bill),
  deleteBill: (id) => billsApi.delete(`/bills/${id}`),
}

export default BillsService
