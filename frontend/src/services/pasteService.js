import api from './api.js'

async function createPaste(pasteData) {
  const response = await api.post('/pastes', pasteData)
  return response.data
}

async function getPastes({ page = 1, perPage = 10 } = {}) {
  const response = await api.get('/pastes', {
    params: { page, per_page: perPage },
  })
  return response.data
}

async function getPaste(publicId) {
  const response = await api.get(`/pastes/${publicId}`)
  return response.data
}

async function updatePaste(publicId, pasteData) {
  const response = await api.put(`/pastes/${publicId}`, pasteData)
  return response.data
}

async function deletePaste(publicId) {
  const response = await api.delete(`/pastes/${publicId}`)
  return response.data
}

async function getPublicPaste(publicId) {
  const response = await api.get(`/pastes/public/${publicId}`)
  return response.data
}

export { createPaste, deletePaste, getPaste, getPastes, getPublicPaste, updatePaste }
