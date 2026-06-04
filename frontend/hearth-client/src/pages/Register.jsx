import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormField from '../components/FormField'
import AuthLayout from '../layouts/AuthLayout'
import AuthService from '../services/AuthService'

function getErrorMessage(error) {
  const responseData = error.response?.data

  if (typeof responseData === 'string') {
    return responseData
  }

  if (responseData?.errors) {
    return Object.values(responseData.errors).flat().join(' ')
  }

  if (responseData?.message) {
    return responseData.message
  }

  if (responseData?.title) {
    return responseData.title
  }

  if (responseData) {
    return JSON.stringify(responseData)
  }

  return 'Registration failed. Please try again.'
}

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  })
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

    const requestBody = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
    }

    console.log('Registration request body:', requestBody)

    try {
      await AuthService.register(requestBody)
      navigate('/login')
    } catch (error) {
      console.error(error.response?.data || error.message)
      setError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Create your Hearth account"
      subtitle="Start with a simple home dashboard and room to grow."
      footerText="Already have an account?"
      footerLink="/login"
      footerLinkText="Sign in"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="form-alert">{error}</div>}
        <FormField
          label="Full name"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          autoComplete="name"
        />
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
          autoComplete="new-password"
        />
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default Register
