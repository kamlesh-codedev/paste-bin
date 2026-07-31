const ACCESS_TOKEN_KEY = 'pastevault_access_token'

function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

function setAccessToken(accessToken) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
}

function removeAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

export { getAccessToken, removeAccessToken, setAccessToken }
