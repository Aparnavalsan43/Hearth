import axios from 'axios'

const API_BASE_URL = 'http://localhost:5253/api'

const shoppingApi = axios.create({
  baseURL: API_BASE_URL,
})

shoppingApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('hearth_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

const ShoppingService = {
  getShoppingItems: () => shoppingApi.get('/shoppingitems'),
  createShoppingItem: (item) => shoppingApi.post('/shoppingitems', item),
  updateShoppingItem: (id, item) => shoppingApi.put(`/shoppingitems/${id}`, item),
  deleteShoppingItem: (id) => shoppingApi.delete(`/shoppingitems/${id}`),
}

export default ShoppingService
