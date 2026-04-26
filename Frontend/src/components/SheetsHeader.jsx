import React, { useState } from 'react'
import 'remixicon/fonts/remixicon.css'

const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

const SheetsHeader = ({ search, setSearch, difficulty, onSearch, onDifficulty, onRandom, onClear }) => {
  const [showDifficulty, setShowDifficulty] = useState(false)

  const handleInputChange = (e) => {
    setSearch(e.target.value)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSearch(e.target.value, difficulty)
  }

  const handleSearchClick = () => {
    onSearch(search, difficulty)
  }

  const handleDifficultySelect = (val) => {
    const next = val === difficulty ? '' : val
    onDifficulty(search, next)
    setShowDifficulty(false)
  }

  const handleClear = () => {
    setSearch('')
    onClear()
  }

  return (
    <div className='flex flex-col gap-4 md:gap-6 p-4 md:p-5 rounded-[20px] bg-[#070707] border border-white/10 w-full'>

      <h2 className='text-2xl md:text-[36px] font-accent font-bold'>
        Consistency <span className='text-[#A4873E]'>Sheet</span>
      </h2>

      <div className='flex flex-col gap-3 md:gap-5'>

        {/* Row 1 — Search */}
        <div className='flex gap-2 md:gap-2.5'>

          <div className='flex gap-3 bg-[#0B0B0B] flex-1 border border-white/10 px-4 md:px-5 py-3 md:py-4 rounded-[20px]'>
            <i className="ri-search-line text-white/50 mt-0.5"></i>
            <input
              type="text"
              value={search}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Search for problem"
              className="w-full h-full outline-none border-none bg-transparent appearance-none focus:outline-none focus:ring-0 placeholder:text-gray-400 text-white text-sm md:text-base"
            />
            {search && (
              <i
                className="ri-close-line text-white/50 cursor-pointer hover:text-white mt-0.5"
                onClick={handleClear}
              />
            )}
          </div>

          <button
            onClick={handleSearchClick}
            className='flex justify-center items-center px-5 md:px-8 py-3 md:py-4 bg-[#A4873E] rounded-[20px] hover:bg-[#8f7235] transition-all text-sm md:text-base whitespace-nowrap'
          >
            Search
          </button>
        </div>

        {/* Row 2 — Filters */}
        <div className='flex gap-2 md:gap-3 flex-wrap'>

          {/* Difficulty Dropdown */}
          <div className='relative'>
            <div
              onClick={() => setShowDifficulty(!showDifficulty)}
              className={`flex gap-2 cursor-pointer justify-center items-center px-4 md:px-8 py-2.5 md:py-4 rounded-[20px] border transition-all text-sm md:text-base
                ${difficulty ? 'border-[#A4873E] text-[#A4873E]' : 'border-white/50 text-white'}`}
            >
              <i className="ri-arrow-down-s-fill"></i>
              <p className='whitespace-nowrap'>{difficulty || 'Difficulty'}</p>
            </div>

            {showDifficulty && (
              <div className='absolute top-12 md:top-14 left-0 z-10 bg-[#0b0b0b] border border-white/10 rounded-[16px] overflow-hidden w-36 md:w-40'>
                {DIFFICULTIES.map((d) => (
                  <div
                    key={d}
                    onClick={() => handleDifficultySelect(d)}
                    className={`px-4 md:px-5 py-2.5 md:py-3 cursor-pointer hover:bg-white/5 transition-all text-xs md:text-sm
                      ${difficulty === d ? 'text-[#A4873E]' : 'text-white/70'}`}
                  >
                    {d}
                  </div>
                ))}
                {difficulty && (
                  <div
                    onClick={() => handleDifficultySelect('')}
                    className='px-4 md:px-5 py-2.5 md:py-3 cursor-pointer hover:bg-white/5 text-red-400 text-xs md:text-sm border-t border-white/10'
                  >
                    Clear
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Random Problem */}
          <div
            onClick={onRandom}
            className='flex gap-2 cursor-pointer justify-center items-center px-4 md:px-8 py-2.5 md:py-4 rounded-[20px] border border-white/50 hover:border-white transition-all text-sm md:text-base whitespace-nowrap'
          >
            <i className="ri-shuffle-line"></i>
            <p className='hidden sm:block'>Random Problem</p>
            <p className='sm:hidden'>Random</p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default SheetsHeader