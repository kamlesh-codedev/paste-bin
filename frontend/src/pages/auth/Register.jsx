import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import useAuth from '../../hooks/useAuth.js'
import { getApiErrorMessage } from '../../utils/apiError.js'

function getPasswordStrength(password) {
  if (!password) return { label: 'Choose a strong password', level: 0 }
  if (password.length < 8) return { label: 'Too short', level: 1 }
  if (password.length < 12 || !/[A-Z]/.test(password) || !/\d/.test(password)) return { label: 'Good', level: 2 }
  return { label: 'Strong password', level: 3 }
}

function Register() {
  const [formValues, setFormValues] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { register } = useAuth()
  const passwordStrength = getPasswordStrength(formValues.password)

  const handleChange = ({ target: { name, value } }) => {
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const username = formValues.username.trim()
    const email = formValues.email.trim()

    if (username.length < 3) {
      setError('Username must be at least 3 characters.')
      return
    }
    if (!email.includes('@')) {
      setError('Enter a valid email address.')
      return
    }
    if (formValues.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (formValues.password !== formValues.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const responseData = await register({ username, email, password: formValues.password })
      navigate('/login', {
        replace: true,
        state: { message: responseData.message || 'Account created. Please sign in.' },
      })
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to create your account. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="auth-card-heading">
        <p className="eyebrow">Start sharing</p>
        <h1>Create your account</h1>
        <p>Your next useful snippet deserves a better home.</p>
      </div>
      <ErrorMessage message={error} onDismiss={() => setError('')} />
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Username</span>
          <input name="username" value={formValues.username} onChange={handleChange} autoComplete="username" placeholder="developer" minLength="3" maxLength="64" required />
        </label>
        <label className="field">
          <span>Email address</span>
          <input name="email" type="email" value={formValues.email} onChange={handleChange} autoComplete="email" placeholder="you@example.com" required />
        </label>
        <label className="field">
          <span>Password</span>
          <span className="password-field">
            <input name="password" type={isPasswordVisible ? 'text' : 'password'} value={formValues.password} onChange={handleChange} autoComplete="new-password" placeholder="At least 8 characters" minLength="8" required />
            <button type="button" onClick={() => setIsPasswordVisible((visible) => !visible)}>{isPasswordVisible ? 'Hide' : 'Show'}</button>
          </span>
        </label>
        <div className="password-strength" aria-live="polite">
          <div className="strength-bars" aria-hidden="true">
            {[1, 2, 3].map((bar) => <span key={bar} className={bar <= passwordStrength.level ? `strength-${passwordStrength.level}` : ''} />)}
          </div>
          <span>{passwordStrength.label}</span>
        </div>
        <label className="field">
          <span>Confirm password</span>
          <input name="confirmPassword" type={isPasswordVisible ? 'text' : 'password'} value={formValues.confirmPassword} onChange={handleChange} autoComplete="new-password" placeholder="Enter it again" required />
        </label>
        <button className="button button-primary button-block" type="submit" disabled={isLoading}>
          {isLoading ? <LoadingSpinner label="Creating account" /> : 'Create account'}
        </button>
      </form>
      <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
    </>
  )
}

export default Register
