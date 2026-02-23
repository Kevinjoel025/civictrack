import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import StatusBadge from '../components/StatusBadge'
import { formatDistanceToNow } from 'date-fns'
import { Shield, Trash2, RefreshCw, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { STATUS_LABELS } from '../constants'

const ALL_STATUSES = Object.keys(STATUS_LABELS)

function getEmoji(type) {
  return { pothole:'🕳️', garbage:'🗑️', streetlight:'💡', drainage:'🌊', other:'📋' }[type] || '📋'
}

export default function AdminDashboard() {
  const [reports, setReports]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('')
  const [updating, setUpdating] = useState(null)

  const load = () => {
    api.get('/reports/').then(r => setReports(r.data)).catch(console.error).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const updateStatus = async (reportId, status) => {
    setUpdating(reportId)
    try {
      await api.patch(`/reports/${reportId}/status`, { status, remark: `Admin updated to ${status}` })
      toast.success('Status updated')
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed')
    } finally {
      setUpdating(null) }
  }

  const simulateEscalation = async (report) => {
    setUpdating(report.id)
    try {
      await api.patch(`/reports/${report.id}/status`, { status: 'delayed', remark: 'SLA breached — escalated by admin simulation' })
      toast.success('Escalation simulated')
      load()
    } catch { toast.error('Failed') } finally { setUpdating(null) }
  }

  const filtered = filter ? reports.filter(r => r.status === filter) : reports

  const stats = {
    total:    reports.length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    delayed:  reports.filter(r => r.status === 'delayed').length,
    high:     reports.filter(r => r.priority === 'high').length,
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-red-100 p-2 rounded-xl"><Shield className="w-6 h-6 text-red-600" /></div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Manage all reports and simulate department actions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label:'Total', value:stats.total, color:'text-gray-700' },
          { label:'Resolved', value:stats.resolved, color:'text-green-600' },
          { label:'Delayed', value:stats.delayed, color:'text-orange-600' },
          { label:'High Priority', value:stats.high, color:'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">All Statuses</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <button onClick={load} className="flex items-center gap-2 text-sm border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
        <span className="text-sm text-gray-400 self-center">{filtered.length} reports</span>
      </div>

      {/* Reports table */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className={`bg-white rounded-2xl border shadow-sm p-5
              ${r.status === 'delayed' ? 'border-orange-200' : r.priority === 'high' ? 'border-red-100' : 'border-gray-100'}`}>
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xl">{getEmoji(r.issue_type)}</span>
                    <Link to={`/report/${r.id}`} className="font-semibold text-gray-900 hover:text-blue-600">{r.title}</Link>
                    <StatusBadge status={r.status} />
                    {r.status === 'delayed' && <span className="text-xs text-orange-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Delayed</span>}
                  </div>
                  <p className="text-sm text-gray-500 mb-2 truncate">{r.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                    <span>👍 {r.upvote_count} votes</span>
                    <span>🏢 {r.department?.name || 'Unassigned'}</span>
                    <span>{formatDistanceToNow(new Date(r.created_at), {addSuffix:true})}</span>
                    <span className={r.priority === 'high' ? 'text-red-500 font-medium' : ''}>↑ {r.priority}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <select value={r.status} onChange={e => updateStatus(r.id, e.target.value)}
                    disabled={updating === r.id}
                    className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-44">
                    {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                  <button onClick={() => simulateEscalation(r)} disabled={updating === r.id}
                    className="text-xs text-orange-600 border border-orange-200 px-3 py-1.5 rounded-xl hover:bg-orange-50 transition-colors">
                    ⚡ Simulate Escalation
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
