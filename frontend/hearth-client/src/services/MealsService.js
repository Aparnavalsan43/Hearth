import axios from 'axios'

// const API_BASE_URL = 'http://localhost:5253/api'
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5253/api'

const mealsApi = axios.create({
  baseURL: API_BASE_URL,
})

mealsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('hearth_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

const MealsService = {
  getMeals: () => mealsApi.get('/meals'),
  createMeal: (meal) => mealsApi.post('/meals', meal),
  updateMeal: (id, meal) => mealsApi.put(`/meals/${id}`, meal),
  deleteMeal: (id) => mealsApi.delete(`/meals/${id}`),
}

export default MealsService
