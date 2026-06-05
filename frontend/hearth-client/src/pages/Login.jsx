import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import FormField from '../components/FormField'
import { useAuth } from '../context/useAuth'
import AuthLayout from '../layouts/AuthLayout'
import AuthService from '../services/AuthService'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await AuthService.login(formData)
      login(response.data)
      toast.success('Login successful. Welcome back.')
      navigate('/dashboard')
    } catch {
      const message = 'Invalid email or password.'
      setError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Sign in to Hearth"
      subtitle="Manage the quiet work of home from one place."
      footerText="New to Hearth?"
      footerLink="/register"
      footerLinkText="Create an account"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="form-alert">{error}</div>}
        <FormField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="current-password"
        />
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default Login
