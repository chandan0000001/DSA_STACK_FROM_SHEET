import React, { useState, useRef } from 'react'

const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

const Contribute = () => {
  const [title, setTitle] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [link, setLink] = useState('')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const tagInputRef = useRef(null)

  const addTag = (val) => {
    const clean = val.trim().replace(',', '')
    if (clean && !tags.includes(clean)) setTags(prev => [...prev, clean])
  }

  const handleTagKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
      setTagInput('')
    } else if (e.key === 'Backspace' && tagInput === '') {
      setTags(prev => prev.slice(0, -1))
    }
  }

  const handleSubmit = () => {
    if (!title || !link || !difficulty) return
    setSubmitted(true)
  }

  const reset = () => {
    setTitle(''); setLink(''); setDifficulty('')
    setTags([]); setTagInput(''); setNotes('')
    setSubmitted(false)
  }

  const diffStyle = (d) => {
    if (difficulty !== d) return 'bg-transparent border border-white/10 text-white/35 hover:border-white/20 hover:text-white/50'
    const map = {
      Easy: 'border border-green-500 text-green-400 bg-green-500/5',
      Medium: 'border border-yellow-400 text-yellow-400 bg-yellow-400/5',
      Hard: 'border border-red-500 text-red-400 bg-red-500/5',
    }
    return map[d]
  }

  return (
    // Changed h-screen to min-h-screen for mobile scrolling, kept h-screen for desktop
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen md:h-screen bg-[#0a0a0a] text-white md:overflow-hidden">

      {/* LEFT SECTION */}
      {/* Changed border-r to border-b on mobile, adjusted padding */}
      <div className="p-6 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/[0.07] bg-[#0d0d0d] md:bg-transparent">
        <div>
          <div className="inline-flex items-center gap-2 border border-white/10 rounded-md px-3 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A4873E] inline-block" />
            <span className="text-xs text-white/50">Contribute</span>
          </div>

          {/* Adjusted text size for mobile */}
          <h1 className="text-3xl md:text-5xl font-semibold leading-tight mb-4">
            Submit your<br className="hidden md:block" /> question
          </h1>
          <p className="text-sm md:text-base text-white/40 leading-relaxed max-w-xs mb-8 md:mb-0">
            Help the community grow by sharing a DSA problem you think belongs on the sheet.
          </p>
        </div>

        {/* Info Cards - Hidden or stacked differently if needed, here we just adjust spacing */}
        <div className="flex flex-col gap-2 mb-8 md:mb-0">
          {[
            { label: 'Problem guidelines', sub: 'What makes a good submission' },
            { label: 'Review process', sub: 'Usually reviewed in 2–3 days' },
            { label: 'Community picks', sub: 'Top voted problems get added' },
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
              placeholder="Problem title"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />

            <input
              className="w-full bg-white/4 border border-white/8 rounded-lg px-3.5 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
              type="text"
              placeholder="LeetCode / GFG link"
              value={link}
              onChange={e => setLink(e.target.value)}
            />

            {/* Difficulty */}
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${diffStyle(d)}`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Tags */}
            <div
              onClick={() => tagInputRef.current?.focus()}
              className="bg-white/4 border border-white/8 rounded-lg px-3 py-2.5 flex flex-wrap gap-2 items-center min-h-11.5 cursor-text"
            >
              {tags.map(tag => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 bg-[#A4873E]/10 border border-[#A4873E]/25 rounded px-2 py-0.5 text-xs text-[#A4873E]"
                >
                  {tag}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTags(prev => prev.filter(t => t !== tag))
                    }}
                    className="bg-transparent border-none text-white/30 cursor-pointer text-sm leading-none"
                  >×</button>
                </span>
              ))}
              <input
                ref={tagInputRef}
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKey}
                placeholder={tags.length === 0 ? 'Add tags (press Enter)' : ''}
                className="bg-transparent border-none outline-none text-white text-sm flex-1 min-w-20 placeholder-white/30"
              />
            </div>

            <textarea
              className="w-full bg-white/4 border border-white/8 rounded-lg px-3.5 py-3 text-sm text-white placeholder-white/30 outline-none resize-none min-h-30 md:min-h-20 focus:border-white/20 transition-colors"
              placeholder="Why should this be added? (optional)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full mt-4 py-3.5 md:py-3 bg-[#A4873E] text-white rounded-lg text-sm font-semibold cursor-pointer hover:bg-[#7d662b] transition-colors shrink-0"
          >
            Submit question
          </button>
        </div>
      ) : (
        /* Success State */
        <div className="flex flex-col items-center justify-center gap-3 p-10 text-center min-h-100">
          <div className="w-12 h-12 rounded-full border border-green-500/30 flex items-center justify-center mb-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 className="text-lg font-medium">Question submitted!</h3>
          <p className="text-sm text-white/35">Thanks for contributing.<br />We'll review it shortly.</p>
          <button
            onClick={reset}
            className="mt-4 px-8 py-3 bg-[#A4873E] text-white rounded-lg text-sm font-semibold cursor-pointer hover:bg-[#7d662b] transition-colors"
          >
            Submit another
          </button>
        </div>
      )}
    </div>
  )
}

export default Contribute