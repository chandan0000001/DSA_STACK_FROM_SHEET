import { useEffect, useState, Suspense } from 'react'
import { BrowserRouter } from 'react-router-dom'
import AppRoute from './routes/App.routes'
import Navbar from './components/Navbar'
import axiosInstance from './config/Axios.config'
import { useAuth } from './context/auth.context'

const AUTH_FAILURE_MESSAGES = new Set([
  'No refresh token',
  'Unauthorized',
  'Access token expired',
  'Invalid token',
  'Invalid or expired refresh token',
  'Refresh token mismatch',
  'Session expired, please log in again',
])

const App = () => {
  const [streak, setStreak] = useState(0)
  const { user, login, logout } = useAuth()

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await axiosInstance.get('/user/me')
        login(response.data.user)
      } catch (error) {
        const status = error?.response?.status
        const message = error?.response?.data?.message

        if (status === 401 && AUTH_FAILURE_MESSAGES.has(message)) {
          logout()
        }
      }
    }

    const getStreak = async () => {
      try {
        const res = await axiosInstance.get('/user/progress/summary')
        setStreak(res.data.summary.streak)
      } catch (error) {}
    }

    getCurrentUser()
    getStreak()
  }, [])

  return (
    <BrowserRouter>
      <div className='h-screen bg-black flex flex-col'>
        <Navbar streak={streak} currentUserName={user?.name ?? ''} />
        
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center bg-black text-[#A4873E] ">
            {/* &gt; is the safe way to show the '>' character in JSX */}
            <div className="animate-pulse">&gt; don't worry you qus are comming 2 sec </div>
          </div>
        }>
          <AppRoute setStreak={setStreak} />
        </Suspense>
        
      </div>
    </BrowserRouter>
  )
}

export default App
