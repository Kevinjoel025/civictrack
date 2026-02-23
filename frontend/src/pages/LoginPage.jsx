import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
export default function LoginPage() {
  const { login } = useAuth(); const navigate = useNavigate()
  const [form, setForm] = useState({ email:'', password:'' }); const [loading, setLoading] = useState(false)
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const submit = async e => {
    e.preventDefault(); setLoading(true)
    try { const user = await login(form.email, form.password); toast.success(`Welcome back, ${user.name}!`); navigate(user.role === 'department' ? '/dept' : '/dashboard') }
    catch (err) { toast.error(err.response?.data?.detail || 'Login failed') }
    finally { setLoading(false) }
  }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 font-bold text-xl"><MapPin className="w-7 h-7" />CivicTrack</Link>
          <h2 className="text-2xl font-bold mt-4">Sign in</h2>
          <p className="text-gray-500 text-sm mt-1">No account? <Link to="/signup" className="text-blue-600 hover:underline">Sign up</Link></p>
        </div>
        <div className="card">
          <form onSubmit={submit} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input name="email" type="email" value={form.email} onChange={handle} className="input" placeholder="you@example.com" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input name="password" type="password" value={form.password} onChange={handle} className="input" placeholder="••••••••" required /></div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}