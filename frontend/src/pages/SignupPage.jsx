import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
export default function SignupPage() {
  const { signup } = useAuth(); const navigate = useNavigate()
  const [form, setForm] = useState({ name:'', email:'', password:'', ward:'' }); const [loading, setLoading] = useState(false)
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const submit = async e => {
    e.preventDefault(); setLoading(true)
    try { await signup(form.name, form.email, form.password, form.ward); toast.success('Welcome to letsfix!'); navigate('/dashboard') }
    catch (err) { toast.error(err.response?.data?.detail || 'Signup failed') }
    finally { setLoading(false) }
  }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 font-bold text-xl"><MapPin className="w-7 h-7" />letsfix</Link>
          <h2 className="text-2xl font-bold mt-4">Create your account</h2>
          <p className="text-gray-500 text-sm mt-1">Have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link></p>
        </div>
        <div className="card">
          <form onSubmit={submit} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input name="name" type="text" value={form.name} onChange={handle} className="input" placeholder="Jane Doe" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input name="email" type="email" value={form.email} onChange={handle} className="input" placeholder="you@example.com" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input name="password" type="password" value={form.password} onChange={handle} className="input" placeholder="Min. 6 characters" required minLength={6} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Ward <span className="text-gray-400">(optional)</span></label><input name="ward" type="text" value={form.ward} onChange={handle} className="input" placeholder="e.g. Ward 12" /></div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}