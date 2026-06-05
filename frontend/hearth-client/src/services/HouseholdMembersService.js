import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5253/api'

const householdMembersApi = axios.create({
  baseURL: API_BASE_URL,
})

householdMembersApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('hearth_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

const HouseholdMembersService = {
  getHouseholdMembers: () => householdMembersApi.get('/householdmembers'),
  createHouseholdMember: (member) => householdMembersApi.post('/householdmembers', member),
  deleteHouseholdMember: (id) => householdMembersApi.delete(`/householdmembers/${id}`),
}

export default HouseholdMembersService
