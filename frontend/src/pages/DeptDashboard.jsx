import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import StatusBadge from '../components/StatusBadge'
import { timeAgo, issueIcon, isSlaBreached } from '../utils/helpers'
import { AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
const STATUSES = ['acknowledged','in_progress','resolved','rejected']
export default function DeptDashboard() {
  const [depts, setDepts] = useState([]); const [deptId, setDeptId] = useState(null)
  const [reports, setReports] = useState([]); const [loading, setLoading] = useState(true); const [updating, setUpdating] = useState(null)
  useEffect(() => { api.get('/departments/').then(r => { setDepts(r.data); if (r.data.length) setDeptId(r.data[0].id) }) }, [])
  useEffect(() => { if (!deptId) return; setLoading(true); api.get(`/departments/${deptId}/reports`).then(r => setReports(r.data)).finally(() => setLoading(false)) }, [deptId])
  const updateStatus = async (reportId, status) => {
    setUpdating(reportId)
    try { await api.patch(`/reports/${reportId}/status`, { status, remark:`Status updated to ${status}` }); toast.success('Updated'); setReports(rs => rs.map(r => r.id===reportId ? {...r,status} : r)) }
    catch (err) { toast.error(err.response?.data?.detail || 'Failed') }
    finally { setUpdating(null) }
  }
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div><h1 className="text-2xl font-bold">Department Dashboard</h1><p className="text-gray-500 text-sm mt-1">Manage assigned issues</p></div>
        <select className="input w-auto" value={deptId||''} onChange={e => setDeptId(Number(e.target.value))}>{depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
      </div>
      {loading ? <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div> : (
        <div className="space-y-4">
          {reports.length === 0 && <div className="card text-center py-12 text-gray-400">No issues assigned</div>}
          {reports.map(r => (
            <div key={r.id} className={`card ${isSlaBreached(r.sla_deadline)&&r.status!=='resolved'?'border-red-200 bg-red-50':''}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xl">{issueIcon(r.issue_type)}</span>
                    <Link to={`/report/${r.id}`} className="font-semibold hover:text-blue-600">{r.title}</Link>
                    <StatusBadge status={r.status} />
                    {isSlaBreached(r.sla_deadline)&&r.status!=='resolved'&&<span className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />SLA Breached</span>}
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{r.description.slice(0,120)}...</p>
                  <div className="text-xs text-gray-400 flex gap-4">
                    <span>👍 {r.upvote_count}</span><span>🕐 {timeAgo(r.created_at)}</span>
                  </div>
                </div>
                <select className="input text-sm w-44" value={r.status} onChange={e => updateStatus(r.id, e.target.value)} disabled={updating===r.id}>
                  <option value={r.status} disabled>{r.status.replace('_',' ')}</option>
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}