function getApiErrorMessage(error, fallbackMessage = 'Something went wrong. Please try again.') {
  const responseData = error?.response?.data

  if (typeof responseData?.error === 'string') return responseData.error
  if (typeof responseData?.message === 'string') return responseData.message
  if (typeof error?.message === 'string' && error.message !== 'Network Error') return error.message
  if (error?.request) return 'Unable to reach PasteVault. Check that the backend is running and try again.'

  return fallbackMessage
}

export { getApiErrorMessage }
