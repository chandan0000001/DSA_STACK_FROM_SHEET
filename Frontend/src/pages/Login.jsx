import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../config/Axios.config.js'
import { useAuth } from '../context/auth.context'
import GoogleSignInButton from '../components/GoogleSignInButton'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setError('')
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await axiosInstance.post('/user/login', form)
      login(res.data.user)
      navigate('/problems', { replace: true })
    } catch (err) {
      const msg = err?.response?.data?.message || 'Something went wrong. Please try again.'

      // If email not verified, give a helpful nudge
      if (err?.response?.status === 403) {
        setError('Please verify your email before logging in. Check your inbox.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">

      {/* Glow Background */}
      <div className="absolute top-0 w-full h-[300px] bg-gradient-to-r from-yellow-500/20 via-transparent to-yellow-500/20 blur-3xl" />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md flex flex-col gap-6"
      >
        {/* Heading */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white">
            You're back. Let's go.
          </h1>
          <p className="text-white/50 mt-2">
            don't worry, we didn't solve without you.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Email */}
        <div>
          <label className="text-white/60 text-sm">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Email too"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full mt-1 px-4 py-3 rounded-[20px] bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-[#A4873E] transition-colors"
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-white/60 text-sm">Password</label>
          <input
            type="password"
            name="password"
            placeholder="You haven't told me this"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full mt-1 px-4 py-3 rounded-[20px] bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-[#A4873E] transition-colors"
          />
          {/* Forgot password */}
          <div className="text-right mt-1">
            <span
              onClick={() => navigate('/forgot-password')}
              className="text-white/30 text-xs cursor-pointer hover:text-[#A4873E] transition-colors"
            >
              Forgot password?
            </span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-full bg-[#A4873E] transition text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging in…' : 'Login'}
        </button>

        <div className="flex items-center gap-3 text-white/25">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs uppercase tracking-[0.3em]">or</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <GoogleSignInButton label='Continue with Google' />

        {/* Footer */}
        <p className="text-center text-white/50 text-sm">
          Don't have an account?{' '}
          <span
            onClick={() => navigate('/register')}
            className="text-[#A4873E] cursor-pointer hover:underline"
          >
            Register Now
          </span>
        </p>
      </form>
    </div>
  )
}

export default Login
