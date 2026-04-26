import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

// Lazy Loading the pages
const ProblemSheet = lazy(() => import('../pages/ProblemSheet'))
const Home = lazy(() => import('../pages/Home'))
const PlaceholderPage = lazy(() => import('../pages/PlaceholderPage'))
const Login = lazy(() => import('../pages/Login'))
const Profile = lazy(() => import('../pages/Profile'))
const Register = lazy(() => import('../pages/Register'))
const TodaysProblems = lazy(() => import('../pages/TodaysProblems'))
const HowTo = lazy(() => import('../pages/HowTo'))
const ForgotPassword = lazy(() => import('../pages/Forgotpassword'))
const ResetPassword = lazy(() => import('../pages/Resetpassword'))
const VerifyEmail = lazy(() => import('../pages/VerifyEmail'))
const Contribute = lazy(() => import('../pages/Contribute'))
const Report = lazy(() => import('../pages/Report'))
const ContactUs = lazy(() => import('../pages/ContactUs'))
const Rooms = lazy(() => import('../pages/Rooms'))
const RoomDetails = lazy(() => import('../pages/RoomDetails'))
const PublicProfile = lazy(() => import('../pages/PublicProfile'))

const AppRoute = ({ setStreak }) => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route
        path='/problems'
        element={
          <ProtectedRoute>
            <ProblemSheet setStreak={setStreak} />
          </ProtectedRoute>
        }
      />
      <Route path='/daily-problem' element={<TodaysProblems setStreak={setStreak} />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/contribute' element={<Contribute />} />
      <Route path='/report-bug' element={<Report />} />
      <Route path='/contact' element={<ContactUs />} />
      <Route path='/profile' element={<Profile />} />
      <Route path='/profile/:userId' element={<PublicProfile />} />
      <Route path='/rooms' element={<Rooms />} />
      <Route path='/room/:id' element={<RoomDetails />} />
      <Route path='/howto' element={<HowTo />} />
      <Route path='/forgot-password' element={<ForgotPassword />} />
      <Route path='/verify-email/:token' element={<VerifyEmail />} />
      <Route path='/reset-password/:token' element={<ResetPassword />} />
    </Routes>
  )
}

export default AppRoute
