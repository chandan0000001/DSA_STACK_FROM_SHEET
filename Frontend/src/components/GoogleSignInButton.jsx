import { useEffect, useRef, useState } from 'react'
import axiosInstance from '../config/Axios.config'
import { useAuth } from '../context/auth.context'
import { useNavigate } from 'react-router-dom'

const GoogleSignInButton = ({ label = 'Continue with Google' }) => {
  const buttonRef = useRef(null)
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState('')
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  useEffect(() => {
    if (!clientId || !window.google || !buttonRef.current) return

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        setError('')
        try {
          const res = await axiosInstance.post('/user/google', {
            credential: response.credential,
          })
          login(res.data.user)
          navigate('/problems', { replace: true })
        } catch (err) {
          setError(err?.response?.data?.message || 'Google sign-in failed. Please try again.')
        }
      },
    })

    buttonRef.current.innerHTML = ''
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'filled_black',
      size: 'large',
      text: label === 'Sign up with Google' ? 'signup_with' : 'signin_with',
      shape: 'pill',
      width: 320,
    })
  }, [clientId, label, login, navigate])

  if (!clientId) {
    return (
      <p className='text-center text-sm text-white/40'>
        Add `VITE_GOOGLE_CLIENT_ID` to enable Google sign-in locally.
      </p>
    )
  }

  return (
    <div className='flex flex-col items-center gap-3'>
      <div ref={buttonRef} />
      {error && (
        <div className='w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400'>
          {error}
        </div>
      )}
    </div>
  )
}

export default GoogleSignInButton
