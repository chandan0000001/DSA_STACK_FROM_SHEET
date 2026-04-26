import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth.context'
import SheetsHeader from '../components/SheetsHeader'
import SheetRight from '../components/SheetRight'
import Allproblems from '../components/Allproblems'
import axiosInstance from '../config/Axios.config'

const PAGE_LIMIT = 15

function getProgressErrorMessage(err, fallbackMessage) {
  const apiMessage = err?.response?.data?.message
  if (
    apiMessage === 'Unauthorized User' ||
    apiMessage === 'invalid or expire token'
  ) {
    return 'Login to keep track of your progress'
  }
  return apiMessage || fallbackMessage
}

const ProblemSheet = ({ setStreak }) => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // 🔐 Authentication check
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true })
    }
  }, [user, navigate])
  const [problems, setProblems] = useState([])
  const [allProblems, setAllProblems] = useState([])
  const [doneProblems, setDoneProblems] = useState({})
  const [totalProblems, setTotalProblems] = useState(0)
  const [totalCompleted, setTotalCompleted] = useState(0) // ✅ added
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [showStats, setShowStats] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [progressError, setProgressError] = useState('')
  const [pendingProblems, setPendingProblems] = useState({})

  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState('')

  const fetchProblems = useCallback(async (searchVal = '', diffVal = '', page = 1) => {
    try {
      setLoading(true)
      setError('')

      const params = { page, limit: PAGE_LIMIT }
      if (searchVal) params.search = searchVal
      if (diffVal) params.difficulty = diffVal

      const res = await axiosInstance.get('/problems/list', { params })

      const fetched = res.data?.problems ?? []
      setProblems(fetched)
      setTotalProblems(res.data?.pagination?.totalProblems || 0)
      setTotalPages(res.data?.pagination?.totalPages || 1)
      setCurrentPage(page)

      if (!searchVal && !diffVal && page === 1) setAllProblems(fetched)

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch problems')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchProgress = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/user/progress/summary')
      const summary = res.data?.summary
      const completedIds = summary?.completedProblemIds ?? []

      setDoneProblems(
        completedIds.reduce((acc, id) => {
          acc[id] = true
          return acc
        }, {})
      )
      setTotalCompleted(summary?.totalCompleted ?? 0) // ✅ added
      setStreak(summary?.streak ?? 0)

    } catch (err) {
      setDoneProblems({})
      setTotalCompleted(0) // ✅ added
      setStreak(0)
      setProgressError(
        getProgressErrorMessage(err, 'Login to keep track of your progress')
      )
    }
  }, [setStreak])

  useEffect(() => {
    fetchProblems()
    fetchProgress()

    // ✅ Listen for daily problem updates
    window.addEventListener('daily-progress-updated', fetchProgress)
    return () => window.removeEventListener('daily-progress-updated', fetchProgress)
  }, [fetchProblems, fetchProgress])

  const handleSearch = (searchVal, diffVal) => {
    setSearch(searchVal)
    setDifficulty(diffVal)
    fetchProblems(searchVal, diffVal, 1)
  }

  const handleDifficulty = (searchVal, diffVal) => {
    setDifficulty(diffVal)
    fetchProblems(searchVal, diffVal, 1)
  }

  const handleClearSearch = () => {
    setSearch('')
    fetchProblems('', difficulty, 1)
  }

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return
    fetchProblems(search, difficulty, newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRandom = () => {
    if (allProblems.length === 0) return
    const random = allProblems[Math.floor(Math.random() * allProblems.length)]
    window.open(random.link, '_blank')
  }

  const handleCheck = async (id) => {
    const previousValue = doneProblems[id]
    setProgressError('')
    setPendingProblems((prev) => ({ ...prev, [id]: true }))
    setDoneProblems((prev) => ({
      ...prev,
      [id]: !Boolean(previousValue)
    }))
    setTotalCompleted((prev) => prev + (previousValue ? -1 : 1))

    try {
      const response = await axiosInstance.post('/user/progress/toggle', { problemId: id })
      const summary = response.data?.summary
      const completedIds = summary?.completedProblemIds ?? []

      setDoneProblems(
        completedIds.reduce((acc, pid) => {
          acc[pid] = true
          return acc
        }, {})
      )
      setTotalCompleted(summary?.totalCompleted ?? 0) // ✅ added
      setStreak(summary?.streak ?? 0)

    } catch (err) {
      setDoneProblems((prev) => ({
        ...prev,
        [id]: previousValue ?? false
      }))
      setProgressError(
        getProgressErrorMessage(err, 'Unable to update progress')
      )
      setTotalCompleted((prev) => prev + (previousValue ? 1 : -1))
    } finally {
      setPendingProblems((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
  }

  const getPageNumbers = () => {
    const pages = []
    const delta = 1

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i)
      } else if (
        i === currentPage - delta - 1 ||
        i === currentPage + delta + 1
      ) {
        pages.push('...')
      }
    }
    return pages
  }

  return (
    <div className='w-full bg-black text-white p-3 md:p-5'>

      {/* Mobile Stats Toggle */}
      <div className='flex justify-end mb-3 lg:hidden'>
        <button
          onClick={() => setShowStats(prev => !prev)}
          className='text-xs text-white/40 border border-white/10 px-3 py-1.5 rounded-lg hover:border-white/20 transition-colors'
        >
          {showStats ? 'Hide Stats ↑' : 'Show Stats ↓'}
        </button>
      </div>

      {/* Mobile Stats Panel */}
      {showStats && (
        <div className='lg:hidden mb-4'>
          <SheetRight
            totalProblems={totalProblems}
            totalCompleted={totalCompleted} // ✅ fixed
            onProgressUpdate={fetchProgress}
          />
        </div>
      )}

      <div className='flex gap-6 items-start'>

        {/* LEFT */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <SheetsHeader
            search={search}
            setSearch={setSearch}
            difficulty={difficulty}
            onSearch={handleSearch}
            onDifficulty={handleDifficulty}
            onRandom={handleRandom}
            onClear={handleClearSearch}
          />

          <Allproblems
            problems={problems}
            doneProblems={doneProblems}
            loading={loading}
            error={error}
            progressError={progressError}
            pendingProblems={pendingProblems}
            onCheck={handleCheck}
          />

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 px-1 gap-3">

              <span className="text-xs sm:text-sm text-gray-400">
                Page {currentPage} of {totalPages} · {totalProblems} problems
              </span>

              <div className="flex items-center gap-1">

                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2.5 sm:px-3 py-1.5 rounded text-xs sm:text-sm font-medium
                    bg-zinc-800 text-gray-300 hover:bg-zinc-700
                    disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  ← Prev
                </button>

                {getPageNumbers().map((p, i) =>
                  p === '...'
                    ? (
                      <span key={`ellipsis-${i}`} className="px-1.5 text-gray-500 text-xs sm:text-sm">
                        ...
                      </span>
                    )
                    : (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`px-2.5 sm:px-3 py-1.5 rounded text-xs sm:text-sm font-medium transition
                          ${p === currentPage
                            ? 'bg-white text-black'
                            : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                          }`}
                      >
                        {p}
                      </button>
                    )
                )}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-2.5 sm:px-3 py-1.5 rounded text-xs sm:text-sm font-medium
                    bg-zinc-800 text-gray-300 hover:bg-zinc-700
                    disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  Next →
                </button>

              </div>
            </div>
          )}
        </div>

        {/* RIGHT — hidden on mobile, visible on lg+ */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <SheetRight
            totalProblems={totalProblems}
            totalCompleted={totalCompleted} // ✅ fixed
            onProgressUpdate={fetchProgress}
          />
        </div>

      </div>
    </div>
  )
}

export default ProblemSheet
