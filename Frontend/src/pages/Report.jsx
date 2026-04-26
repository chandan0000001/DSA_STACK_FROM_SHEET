import React, { useState } from 'react'

const REPORT_TYPES = ['Bug', 'Incorrect Question', 'Spam', 'Other']

const Report = () => {
  const [type, setType] = useState('')
  const [link, setLink] = useState('')
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (!type || !description) return
    setSubmitted(true)
  }

  const reset = () => {
    setType('')
    setLink('')
    setDescription('')
    setSubmitted(false)
  }

  const typeStyle = (t) => {
    if (type !== t)
      return 'bg-transparent border border-white/10 text-white/35 hover:border-white/20 hover:text-white/50'

    const map = {
      Bug: 'border border-red-500 text-red-400 bg-red-500/5',
      'Incorrect Question': 'border border-yellow-400 text-yellow-400 bg-yellow-400/5',
      Spam: 'border border-purple-400 text-purple-400 bg-purple-400/5',
      Other: 'border border-blue-400 text-blue-400 bg-blue-400/5',
    }
    return map[t]
  }

  return (
    // Responsive grid: 1 col on mobile, 2 cols on desktop
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen md:h-screen bg-[#0a0a0a] text-white md:overflow-hidden">

      {/* LEFT SECTION */}
      <div className="p-6 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/[0.07] bg-[#0d0d0d] md:bg-transparent">
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 border border-white/10 rounded-md px-3 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
            <span className="text-xs text-white/50">Report</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-semibold leading-tight mb-4">
            Report an<br className="hidden md:block" /> issue
          </h1>

          <p className="text-sm md:text-base text-white/40 leading-relaxed max-w-xs mb-8 md:mb-0">
            Found something wrong? Help us improve the platform by reporting issues or incorrect problems.
          </p>
        </div>

        {/* Info Cards */}
        <div className="flex flex-col gap-2 mb-4 md:mb-0">
          {[
            { label: 'What to report', sub: 'Bugs, wrong solutions, spam' },
            { label: 'Review time', sub: 'Usually resolved within 24–48h' },
            { label: 'Quality matters', sub: 'Clear reports get faster fixes' },
          ].map(card => (
            <div
              key={card.label}
              className="flex items-center justify-between px-4 py-3.5 border border-white/[0.07] rounded-xl cursor-pointer hover:border-white/10 transition-colors"
            >
              <div>
                <div className="text-sm font-medium text-white/80">{card.label}</div>
                <div className="text-xs text-white/30 mt-0.5">{card.sub}</div>
              </div>
              <span className="text-sm text-white/25">↗</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SECTION (FORM) */}
      {!submitted ? (
        <div className="p-6 md:p-10 flex flex-col gap-3 overflow-y-auto">
          <div className="space-y-3 flex-1">
            <input
              className="w-full bg-white/4 border border-white/8 rounded-lg px-3.5 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
              type="text"
              placeholder="Problem / page link (optional)"
              value={link}
              onChange={e => setLink(e.target.value)}
            />

            {/* Report Type Grid */}
            <div className="grid grid-cols-2 gap-2">
              {REPORT_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`py-2.5 rounded-lg text-[11px] md:text-xs font-semibold cursor-pointer transition-all ${typeStyle(t)}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <textarea
              className="w-full bg-white/4 border border-white/8 rounded-lg px-3.5 py-3 text-sm text-white placeholder-white/30 outline-none resize-none min-h-37.5 md:min-h-30 flex-1 focus:border-white/20 transition-colors"
              placeholder="Describe the issue clearly..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full mt-4 py-3.5 md:py-3 bg-[#A4873E] text-white rounded-lg text-sm font-semibold cursor-pointer hover:bg-[#A4873E]/90 transition-colors shrink-0"
          >
            Submit report
          </button>
        </div>
      ) : (
        /* Success State */
        <div className="flex flex-col items-center justify-center gap-3 p-10 text-center min-h-100">
          <div className="w-12 h-12 rounded-full border border-red-500/30 flex items-center justify-center mb-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h3 className="text-lg font-medium">Report submitted!</h3>
          <p className="text-sm text-white/35">
            Thanks for helping us improve.<br />We'll look into it soon.
          </p>

          <button
            onClick={reset}
            className="mt-4 px-8 py-3 bg-[#A4873E] text-white rounded-lg text-sm font-semibold cursor-pointer hover:bg-[#A4873E]/90 transition-colors"
          >
            Report another
          </button>
        </div>
      )}
    </div>
  )
}

export default Report