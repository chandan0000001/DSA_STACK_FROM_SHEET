import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../config/Axios.config'

const VerifyEmail = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('Verifying your email...')

  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await axiosInstance.post(`/user/verify/${token}`)
        setStatus('success')
        setMessage(data?.message || 'Your email is verified.')

        setTimeout(() => {
          navigate('/')
        }, 2000)
      } catch (error) {
        setStatus('error')
        setMessage(
          error?.response?.data?.message ||
            'This verification link is invalid or expired. Please request a new one.'
        )
      }
    }

    if (!token) {
      setStatus('error')
      setMessage('Verification token is missing.')
      return
    }

    verify()
  }, [token, navigate])

  return (
    <div className='min-h-screen bg-black text-white flex items-center justify-center px-4'>
      <div className='w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 text-center shadow-2xl'>
        <p className='text-sm uppercase tracking-[0.3em] text-[#A4873E]'>Email Verification</p>
        <h1 className='mt-4 text-3xl font-bold'>
          {status === 'loading' && 'Checking your link'}
          {status === 'success' && 'You are verified'}
          {status === 'error' && 'Verification failed'}
        </h1>

        <p className='mt-4 text-white/70'>{message}</p>

        {status === 'loading' && (
          <div className='mt-8 flex justify-center'>
            <div className='h-10 w-10 animate-spin rounded-full border-4 border-white/15 border-t-[#A4873E]' />
          </div>
        )}

        {status === 'success' && (
          <p className='mt-6 text-sm text-white/50'>Redirecting you to the home page...</p>
        )}

        {status === 'error' && (
          <div className='mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center'>
            <Link
              to='/register'
              className='rounded-xl bg-[#A4873E] px-5 py-3 font-semibold text-white transition hover:brightness-110'
            >
              Register Again
            </Link>
            <Link
              to='/login'
              className='rounded-xl border border-white/15 px-5 py-3 font-semibold text-white/80 transition hover:bg-white/10'
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerifyEmail
