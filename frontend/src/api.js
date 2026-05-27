import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://gimnasio-backend-18ar.onrender.com/api',
})

export default api
