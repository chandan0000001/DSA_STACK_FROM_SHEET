import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axiosInstance from '../config/Axios.config.js'
import GoogleSignInButton from '../components/GoogleSignInButton'

const Register = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const warningMessage = location.state?.message

  const handleChange = (e) => {
    setError('')
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Basic client-side guards
    if (form.name.trim().length < 2) return setError('Name must be at least 2 characters')
    if (form.password.length < 6)    return setError('Password must be at least 6 characters')

    setLoading(true)
    try {
      await axiosInstance.post('/user/register', form)
      setDone(true) // show "check your email" screen
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="absolute top-0 w-full h-[300px] bg-gradient-to-r from-yellow-500/20 via-transparent to-yellow-500/20 blur-3xl" />
        <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-6 text-center">
          <div className="text-5xl">✉️</div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white">
            Check your inbox
          </h1>
          <p className="text-white/50">
            We sent a verification link to{' '}
            <span className="text-[#A4873E]">{form.email}</span>.
            Click it to activate your account.
          </p>
          <p className="text-white/30 text-sm">
            Didn't get it?{' '}
            <button
              className="text-[#A4873E] underline cursor-pointer"
              onClick={async () => {
                try {
                  await axiosInstance.post('/user/resend-verification', { email: form.email })
                  alert('Verification email resent!')
                } catch {
                  alert('Could not resend. Try again later.')
                }
              }}
            >
              Resend
            </button>
          </p>
          <button
            onClick={() => navigate('/login')}
            className="mt-2 text-white/50 text-sm hover:text-white transition"
          >
            ← Back to login
          </button>
        </div>
      </div>
    )
  }

  // ── Register form ──────────────────────────────────────────────────────────
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
            Hold on, what should we call you?
          </h1>
          <p className="text-white/50 mt-2">
            no weird nicknames… unless you want one.
          </p>
        </div>

        {/* Warning banner */}
        {warningMessage && (
          <div className="px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm text-center">
            {warningMessage}
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Name */}
        <div>
          <label className="text-white/60 text-sm">Name</label>
          <input
            type="text"
            name="name"
            placeholder="Don't be mysterious… what's your name?"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full mt-1 px-4 py-3 rounded-[20px] bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-[#A4873E] transition-colors"
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-white/60 text-sm">Email</label>
          <input
            type="email"
            name="email"
            placeholder="We need a way to find you… email?"
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
            placeholder="Don't make it '123456' please"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full mt-1 px-4 py-3 rounded-[20px] bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-[#A4873E] transition-colors"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-full bg-[#A4873E] transition text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating account…' : 'Register'}
        </button>

        <div className="flex items-center gap-3 text-white/25">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs uppercase tracking-[0.3em]">or</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <GoogleSignInButton label='Sign up with Google' />

        {/* Footer */}
        <p className="text-center text-white/50 text-sm">
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-[#A4873E] cursor-pointer hover:underline"
          >
            Login Now
          </span>
        </p>
      </form>
    </div>
  )
}

export default Register
