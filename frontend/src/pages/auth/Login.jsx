import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import useAuth from '../../hooks/useAuth.js'
import { getApiErrorMessage } from '../../utils/apiError.js'

function Login() {
  const [formValues, setFormValues] = useState({ identifier: '', password: '' })
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const successMessage = location.state?.message

  const handleChange = ({ target: { name, value } }) => {
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const identifier = formValues.identifier.trim()

    if (!identifier || !formValues.password) {
      setError('Enter your username or email and password.')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      await login({ identifier, password: formValues.password })
      navigate(location.state?.from || '/dashboard', { replace: true })
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to sign in. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="auth-card-heading">
        <p className="eyebrow">Welcome back</p>
        <h1>Sign in to your vault</h1>
        <p>Manage your code snippets and shared notes in one place.</p>
      </div>
      {successMessage && <div className="alert alert-success" role="status"><span aria-hidden="true">✓</span><p>{successMessage}</p></div>}
      <ErrorMessage message={error} onDismiss={() => setError('')} />
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Username or email</span>
          <input name="identifier" type="text" value={formValues.identifier} onChange={handleChange} autoComplete="username" placeholder="you@example.com" required />
        </label>
        <label className="field">
          <span>Password</span>
          <span className="password-field">
            <input name="password" type={isPasswordVisible ? 'text' : 'password'} value={formValues.password} onChange={handleChange} autoComplete="current-password" placeholder="Enter your password" required />
            <button type="button" onClick={() => setIsPasswordVisible((visible) => !visible)}>
              {isPasswordVisible ? 'Hide' : 'Show'}
            </button>
          </span>
        </label>
        <label className="check-field">
          <input type="checkbox" name="remember" />
          <span>Remember me on this device</span>
        </label>
        <button className="button button-primary button-block" type="submit" disabled={isLoading}>
          {isLoading ? <LoadingSpinner label="Signing in" /> : 'Sign in'}
        </button>
      </form>
      <p className="auth-switch">New to PasteVault? <Link to="/register">Create an account</Link></p>
    </>
  )
}

export default Login
