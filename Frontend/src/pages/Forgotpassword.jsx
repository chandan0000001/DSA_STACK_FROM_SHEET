import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../config/Axios.config.js'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await axiosInstance.post('/user/forgot-password', { email })
      setDone(true)
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
          <div className="text-5xl">📬</div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white">
            Reset link sent
          </h1>
          <p className="text-white/50">
            If <span className="text-[#A4873E]">{email}</span> is registered,
            you'll get a reset link shortly. Check your spam too.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="mt-2 text-white/40 text-sm hover:text-white transition-colors"
          >
            ← Back to login
          </button>
        </div>
      </div>
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="absolute top-0 w-full h-[300px] bg-gradient-to-r from-yellow-500/20 via-transparent to-yellow-500/20 blur-3xl" />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md flex flex-col gap-6"
      >
        {/* Heading */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white">
            Forgot your password?
          </h1>
          <p className="text-white/50 mt-2">
            no worries, happens to the best of us.
          </p>
        </div>

        {/* Error */}
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
            placeholder="The one you signed up with"
            value={email}
            onChange={(e) => { setError(''); setEmail(e.target.value) }}
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
          {loading ? 'Sending…' : 'Send Reset Link'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="text-center text-white/40 text-sm hover:text-white transition-colors"
        >
          ← Back to login
        </button>
      </form>
    </div>
  )
}

export default ForgotPassword