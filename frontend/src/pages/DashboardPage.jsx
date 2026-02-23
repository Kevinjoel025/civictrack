import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import StatusBadge from '../components/StatusBadge'
import { timeAgo, issueIcon, priorityColor } from '../utils/helpers'
import { Plus, AlertCircle } from 'lucide-react'
export default function DashboardPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState([]); const [loading, setLoading] = useState(true)
  useEffect(() => { api.get('/reports/my').then(r => setReports(r.data)).catch(console.error).finally(() => setLoading(false)) }, [])
  const stats = { total:reports.length, resolved:reports.filter(r=>r.status==='resolved').length, pending:reports.filter(r=>!['resolved','rejected'].includes(r.status)).length, delayed:reports.filter(r=>r.status==='delayed').length }
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div><h1 className="text-2xl font-bold">My Reports</h1><p className="text-gray-500 text-sm mt-1">Welcome back, {user?.name}</p></div>
        <Link to="/report/new" className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />Report Issue</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[{label:'Total',value:stats.total,color:'text-gray-700'},{label:'Pending',value:stats.pending,color:'text-yellow-600'},{label:'Resolved',value:stats.resolved,color:'text-green-600'},{label:'Delayed',value:stats.delayed,color:'text-red-600'}].map(s => (
          <div key={s.label} className="card text-center"><div className={`text-3xl font-bold ${s.color}`}>{s.value}</div><div className="text-xs text-gray-500 mt-1">{s.label}</div></div>
        ))}
      </div>
      {loading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
        : reports.length === 0 ? (
          <div className="card text-center py-16"><AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" /><h3 className="text-gray-500 font-medium mb-4">No reports yet</h3><Link to="/report/new" className="btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" />Submit First Report</Link></div>
        ) : (
          <div className="space-y-4">
            {reports.map(r => (
              <Link key={r.id} to={`/report/${r.id}`} className="card flex items-start gap-4 hover:shadow-md transition-shadow block">
                <div className="text-3xl">{issueIcon(r.issue_type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1"><h3 className="font-semibold truncate">{r.title}</h3><StatusBadge status={r.status} /></div>
                  <p className="text-gray-500 text-sm truncate">{r.description}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-400">
                    <span>🕐 {timeAgo(r.created_at)}</span><span>👍 {r.upvote_count}</span>
                    <span className={`font-medium ${priorityColor(r.priority)}`}>{r.priority} priority</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
    </div>
  )
}