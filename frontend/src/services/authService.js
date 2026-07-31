import api from './api.js'
import { removeAccessToken, setAccessToken } from '../utils/storage.js'

async function register(credentials) {
  const response = await api.post('/auth/register', credentials)
  return response.data
}

async function login(credentials) {
  const response = await api.post('/auth/login', credentials)
  const responseData = response.data

  if (responseData.access_token) {
    setAccessToken(responseData.access_token)
  }

  return responseData
}

async function getCurrentUser() {
  const response = await api.get('/auth/me')
  return response.data
}

function logout() {
  removeAccessToken()
}

export { getCurrentUser, login, logout, register }
