import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MapPin, LogOut, Menu, X, LayoutDashboard, Plus, Map, Shield } from 'lucide-react'
import { useState } from 'react'
import { APP_NAME } from '../constants'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }
  const isActive = (path) => location.pathname === path

  const navLink = (to, label, Icon) => (
    <Link to={to}
      className={`flex items-center gap-1.5 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg
        ${isActive(to) ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
      {Icon && <Icon className="w-4 h-4" />} {label}
    </Link>
  )

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex justify-between h-16 items-center">

        {/* Logo — goes to dashboard if logged in, landing if not */}
        <Link to={user ? "/dashboard" : "/"}
          className="flex items-center gap-2 font-bold text-blue-600 text-xl tracking-tight">
          <div className="bg-blue-600 text-white rounded-lg p-1.5">
            <MapPin className="w-4 h-4" />
          </div>
          {APP_NAME}
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLink("/map", "Public Map", Map)}
          {user && navLink("/dashboard", "Dashboard", LayoutDashboard)}
          {user?.role === 'admin' && navLink("/admin", "Admin", Shield)}
          {user?.role === 'department' && navLink("/dept", "Department", LayoutDashboard)}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/report/new"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors">
                <Plus className="w-4 h-4" /> Report Issue
              </Link>
              <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-800">{user.name}</div>
                  <div className="text-xs text-gray-400 capitalize">{user.role}</div>
                </div>
                <button onClick={handleLogout}
                  className="ml-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">Login</Link>
              <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t px-4 py-4 space-y-2 bg-white">
          <Link to="/map" className="block text-sm py-2 text-gray-700" onClick={() => setOpen(false)}>Public Map</Link>
          {user && <>
            <Link to="/dashboard" className="block text-sm py-2 text-gray-700" onClick={() => setOpen(false)}>Dashboard</Link>
            <Link to="/report/new" className="block text-sm py-2 text-blue-600 font-medium" onClick={() => setOpen(false)}>+ Report Issue</Link>
          </>}
          {user?.role === 'admin' && <Link to="/admin" className="block text-sm py-2 text-gray-700" onClick={() => setOpen(false)}>Admin</Link>}
          {!user && <>
            <Link to="/login" className="block text-sm py-2 text-gray-700" onClick={() => setOpen(false)}>Login</Link>
            <Link to="/signup" className="block text-sm py-2 text-gray-700" onClick={() => setOpen(false)}>Sign Up</Link>
          </>}
          {user && <button onClick={handleLogout} className="block text-sm py-2 text-red-500 w-full text-left">Logout</button>}
        </div>
      )}
    </nav>
  )
}
