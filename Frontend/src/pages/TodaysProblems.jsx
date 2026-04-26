import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Tproblem from '../components/Tproblem'
import axiosInstance from '../config/Axios.config.js'

const TodaysProblems = ({ setStreak }) => {
  const navigate = useNavigate()
  const [problems, setProblems] = useState([])
  const [solvedProblems, setSolvedProblems] = useState([])
  const [isCompleted, setIsCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [finishers, setFinishers] = useState([])
  const [myRank, setMyRank] = useState(null)
  const [finishersLoading, setFinishersLoading] = useState(true)
  const [showFinishers, setShowFinishers] = useState(false)
  const [showSheetRedirect, setShowSheetRedirect] = useState(false)
  const [pendingProblems, setPendingProblems] = useState({})

  const getDailyProblemErrorMessage = (err) => {
    const status = err?.response?.status
    const message = err?.response?.data?.message

    if (
      status === 401 ||
      message === 'No refresh token' ||
      message === 'Unauthorized' ||
      message === 'Access token expired' ||
      message === 'Invalid or expired refresh token' ||
      message === 'Session expired, please log in again' ||
      message === 'Refresh token mismatch'
    ) {
      setShowSheetRedirect(true)
      return "Please login to see today's problems"
    }

    setShowSheetRedirect(false)
    return message || 'Failed to load daily problems'
  }

  useEffect(() => {
    const fetchDailyProblems = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await axiosInstance.get('/problem/daily')
        const { daily } = res.data
        setProblems(daily.problems || [])
        setSolvedProblems(daily.solvedProblems || [])
        setIsCompleted(daily.isCompleted || false)
      } catch (err) {
        setError(getDailyProblemErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    fetchDailyProblems()
  }, [])

  useEffect(() => {
    const fetchFinishers = async () => {
      try {
        setFinishersLoading(true)
        const res = await axiosInstance.get('/problem/daily/finishers')
        setFinishers(res.data.finishers || [])
        setMyRank(res.data.myRank || null)
      } catch (err) {
      } finally {
        setFinishersLoading(false)
      }
    }
    fetchFinishers()
  }, [isCompleted])

  const toggleSolved = async (problemId) => {
    const previousSolvedProblems = solvedProblems
    const wasSolved = solvedProblems.some((id) => id.toString() === problemId.toString())

    setPendingProblems((prev) => ({ ...prev, [problemId]: true }))
    setSolvedProblems((prev) =>
      wasSolved
        ? prev.filter((id) => id.toString() !== problemId.toString())
        : [...prev, problemId]
    )

    try {
      const res = await axiosInstance.post('/problem/daily/toggle', { problemId })
      setSolvedProblems(res.data.solvedProblems)
      setIsCompleted(res.data.isCompleted)
      if (res.data.summary && setStreak) {
        setStreak(res.data.summary.streak)
      }
      window.dispatchEvent(new Event('daily-progress-updated'))
    } catch (err) {
      setSolvedProblems(previousSolvedProblems)
    } finally {
      setPendingProblems((prev) => {
        const next = { ...prev }
        delete next[problemId]
        return next
      })
    }
  }

  const FinishersList = () => (
    <div className='flex flex-col gap-4 p-4 md:p-5 rounded-[20px] bg-[#070707] border border-white/10 h-fit'>
      <h2 className='text-lg md:text-xl font-bold text-white'>🏆 All Solved</h2>

      <div className='grid grid-cols-3 text-white/40 text-xs font-medium px-1 pb-1 border-b border-white/10'>
        <p>Rank</p>
        <p>User</p>
        <p className='text-right'>Solved</p>
      </div>

      {myRank && (
        <div className='flex items-center justify-between bg-yellow-400/10 border border-yellow-400/20 rounded-[12px] px-4 py-3'>
          <div className='flex items-center gap-2'>
            <i className="ri-medal-line text-yellow-400 text-lg"></i>
            <p className='text-yellow-400 font-semibold text-sm'>Your Rank</p>
          </div>
          <p className='text-yellow-400 font-bold text-lg'>#{myRank.rank}</p>
        </div>
      )}

      {finishersLoading ? (
        <p className='text-white/30 text-sm text-center py-4'>Loading...</p>
      ) : finishers.length === 0 ? (
        <div className='flex flex-col items-center gap-2 py-6'>
          <i className="ri-trophy-line text-white/20 text-4xl"></i>
          <p className='text-white/30 text-sm text-center'>
            No finishers yet.<br />Be the first!
          </p>
        </div>
      ) : (
        <div className='flex flex-col gap-2'>
          {finishers.map((f) => (
            <div
              key={f.user?._id}
              className={`grid grid-cols-3 items-center px-3 py-3 rounded-[12px] border transition-all
                ${myRank && f.rank === myRank.rank
                  ? 'bg-yellow-400/10 border-yellow-400/20'
                  : 'bg-[#0b0b0b] border-white/5'
                }`}
            >
              <p className={`font-bold text-sm
                ${f.rank === 1 ? 'text-yellow-400' :
                  f.rank === 2 ? 'text-gray-300' :
                  f.rank === 3 ? 'text-orange-400' : 'text-white/50'}`}
              >
                {f.rank === 1 ? '🥇' : f.rank === 2 ? '🥈' : f.rank === 3 ? '🥉' : `#${f.rank}`}
              </p>
              <p className='text-white text-sm font-medium truncate'>
                {f.user?.name || 'Unknown'}
              </p>
              <p className='text-green-400 text-sm font-semibold text-right'>
                {f.solvedCount}
              </p>
            </div>
          ))}
        </div>
      )}

      {!myRank && !finishersLoading && (
        <p className='text-white/20 text-xs text-center mt-2'>
          Complete all problems to appear here
        </p>
      )}
    </div>
  )

  return (
    <div className='text-white p-4 md:p-10'>

      {/* Mobile Finishers Toggle */}
      <div className='flex justify-end mb-3 lg:hidden'>
        <button
          onClick={() => setShowFinishers(prev => !prev)}
          className='text-xs text-white/40 border border-white/10 px-3 py-1.5 rounded-lg hover:border-white/20 transition-colors'
        >
          {showFinishers ? 'Hide Leaderboard ↑' : 'Show Leaderboard ↓'}
        </button>
      </div>

      {/* Mobile Finishers Panel */}
      {showFinishers && (
        <div className='lg:hidden mb-4'>
          <FinishersList />
        </div>
      )}

      <div className='flex gap-6'>

        {/* LEFT */}
        <div className='flex flex-col gap-4 md:gap-6 flex-1 min-w-0'>
          <div className='flex flex-col gap-4 md:gap-6 p-4 md:p-5 rounded-[20px] bg-[#070707] border border-white/10 w-full'>
            <div>
              <h2 className='text-2xl md:text-[36px] text-white font-heading font-bold'>
                Today's Problems
              </h2>
              <p className='text-sm md:text-base text-white/50'>
                Complete today's problem and level up your streak.
              </p>
            </div>

            <div className='grid grid-cols-2 gap-3 md:gap-10 md:flex md:flex-row'>

              <div className="rounded-2xl flex gap-3 md:gap-5 md:w-70 cursor-pointer bg-[#0b0b0b] border border-white/10 p-3 md:p-5">
                <div className="h-10 w-10 md:h-14 md:w-14 flex justify-center items-center rounded-[16px] md:rounded-[20px] bg-[#181818] shrink-0">
                  <i className="ri-code-s-line text-xl md:text-[30px] text-yellow-300"></i>
                </div>
                <div className='flex flex-col gap-1 md:gap-2'>
                  <p className="text-2xl md:text-3xl font-bold">{problems.length}</p>
                  <p className="text-xs md:text-base text-gray-400">Problems</p>
                </div>
              </div>

              <div className="rounded-2xl flex gap-3 md:gap-5 md:w-70 cursor-pointer bg-[#0b0b0b] border border-white/10 p-3 md:p-5">
                <div className="h-10 w-10 md:h-14 md:w-14 flex justify-center items-center rounded-[16px] md:rounded-[20px] bg-[#181818] shrink-0">
                  <i className="ri-terminal-box-line text-xl md:text-[30px] text-green-400"></i>
                </div>
                <div className='flex flex-col gap-1 md:gap-2'>
                  <p className="text-2xl md:text-3xl font-bold">
                    {solvedProblems.length}/{problems.length}
                  </p>
                  <p className="text-xs md:text-base text-gray-400">
                    {isCompleted ? '🎉 All Done!' : 'Solved'}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {loading ? (
            <div className='flex justify-center items-center mt-10'>
              <p className='text-white/50 text-base md:text-lg'>Loading today's problems...</p>
            </div>
          ) : error ? (
            <div className='flex justify-center items-center mt-10'>
              <div className='flex flex-col items-center gap-4 text-center'>
                <p className='text-red-400 text-base md:text-lg'>{error}</p>
                {showSheetRedirect && (
                  <>
                    <p className='text-white/60 text-sm md:text-base'>
                      Don't want to login? Use the DSA Sheet instead.
                    </p>
                    <button
                      onClick={() => navigate('/problems')}
                      className='px-5 py-2.5 rounded-xl bg-[#A4873E]/10 border border-[#A4873E]/30 text-[#A4873E] hover:bg-[#A4873E]/20 transition font-medium'
                    >
                      Go to DSA Sheet
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <Tproblem
              problems={problems}
              solvedProblems={solvedProblems}
              pendingProblems={pendingProblems}
              onToggle={toggleSolved}
            />
          )}
        </div>

        {/* RIGHT — desktop only */}
        <div className='hidden lg:block w-72 flex-shrink-0'>
          <FinishersList />
        </div>

      </div>
    </div>
  )
}

export default TodaysProblems
