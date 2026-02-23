import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MapPin, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const handleLogout = () => { logout(); navigate('/') }
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex justify-between h-16 items-center">
        <Link to="/" className="flex items-center gap-2 font-bold text-blue-600 text-lg"><MapPin className="w-6 h-6" />CivicTrack</Link>
        <div className="hidden md:flex items-center gap-6">
          <Link to="/map" className="text-sm text-gray-600 hover:text-gray-900">Public Map</Link>
          {user && <><Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">My Reports</Link><Link to="/report/new" className="btn-primary text-sm">+ Report Issue</Link></>}
          {user?.role === 'department' && <Link to="/dept" className="text-sm text-gray-600 hover:text-gray-900">Dept Dashboard</Link>}
        </div>
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{user.name} <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">{user.role}</span></span>
              <button onClick={handleLogout} className="btn-secondary text-sm flex items-center gap-1"><LogOut className="w-4 h-4" />Logout</button>
            </div>
          ) : (
            <div className="flex gap-2"><Link to="/login" className="btn-secondary text-sm">Login</Link><Link to="/signup" className="btn-primary text-sm">Sign Up</Link></div>
          )}
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)}>{open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
      </div>
      {open && (
        <div className="md:hidden border-t px-4 py-4 space-y-3 bg-white">
          <Link to="/map" className="block text-sm" onClick={() => setOpen(false)}>Public Map</Link>
          {user && <><Link to="/dashboard" className="block text-sm" onClick={() => setOpen(false)}>My Reports</Link><Link to="/report/new" className="block text-sm" onClick={() => setOpen(false)}>+ Report</Link></>}
          {!user && <><Link to="/login" className="block text-sm" onClick={() => setOpen(false)}>Login</Link><Link to="/signup" className="block text-sm" onClick={() => setOpen(false)}>Sign Up</Link></>}
          {user && <button onClick={handleLogout} className="block text-sm text-red-600">Logout</button>}
        </div>
      )}
    </nav>
  )
}