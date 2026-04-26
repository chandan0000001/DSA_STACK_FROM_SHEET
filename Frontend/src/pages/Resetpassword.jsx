import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../config/Axios.config.js'

const ResetPassword = () => {
  const { token } = useParams()          // from /reset-password/:token
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleChange = (e) => {
    setError('')
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password.length < 6) return setError('Password must be at least 6 characters')
    if (form.password !== form.confirm) return setError('Passwords do not match')

    setLoading(true)
    try {
      await axiosInstance.post(`/user/reset-password/${token}`, { password: form.password })
      setDone(true)
    } catch (err) {
      setError(err?.response?.data?.message || 'Link is invalid or expired. Please request a new one.')
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
          <div className="text-5xl">🔓</div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white">
            Password updated
          </h1>
          <p className="text-white/50">
            Your password has been reset. You can now log in with your new password.
          </p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="w-full py-3 rounded-full bg-[#A4873E] text-black font-semibold"
          >
            Go to Login
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
            Set a new password
          </h1>
          <p className="text-white/50 mt-2">
            make it something you'll actually remember.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* New password */}
        <div>
          <label className="text-white/60 text-sm">New Password</label>
          <input
            type="password"
            name="password"
            placeholder="At least 6 characters"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full mt-1 px-4 py-3 rounded-[20px] bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-[#A4873E] transition-colors"
          />
        </div>

        {/* Confirm password */}
        <div>
          <label className="text-white/60 text-sm">Confirm Password</label>
          <input
            type="password"
            name="confirm"
            placeholder="Same as above"
            value={form.confirm}
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
          {loading ? 'Updating…' : 'Reset Password'}
        </button>
      </form>
    </div>
  )
}

export default ResetPassword