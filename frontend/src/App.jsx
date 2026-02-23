import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import ReportPage from './pages/ReportPage'
import IssueDetailPage from './pages/IssueDetailPage'
import MapPage from './pages/MapPage'
import DeptDashboard from './pages/DeptDashboard'
export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/report/:id" element={<IssueDetailPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/report/new" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
            <Route path="/dept" element={<ProtectedRoute roles={['department','admin']}><DeptDashboard /></ProtectedRoute>} />
            <Route path="*" element={<div className="flex items-center justify-center min-h-[60vh] text-gray-400 text-6xl">404</div>} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}