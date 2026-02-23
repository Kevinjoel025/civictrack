import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import StatusBadge from '../components/StatusBadge'
import { formatDistanceToNow } from 'date-fns'
import { ISSUE_TYPES, STATUS_COLORS } from '../constants'
import { Plus, AlertTriangle, CheckCircle, Clock, FileText, TrendingUp, MapPin } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

function getEmoji(type) {
  return { pothole:'🕳️', garbage:'🗑️', streetlight:'💡', drainage:'🌊', other:'📋' }[type] || '📋'
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [reports, setReports]   = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.get('/reports/my').then(r => setReports(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const stats = {
    total:    reports.length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    pending:  reports.filter(r => !['resolved','rejected'].includes(r.status)).length,
    delayed:  reports.filter(r => r.status === 'delayed').length,
    high:     reports.filter(r => r.priority === 'high').length,
  }

  const pieData = [
    { name: 'Resolved', value: stats.resolved,                     color: '#16A34A' },
    { name: 'Pending',  value: stats.pending - stats.delayed,      color: '#2563EB' },
    { name: 'Delayed',  value: stats.delayed,                      color: '#EA580C' },
  ].filter(d => d.value > 0)

  const recentReports = [...reports].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)
  const highPriority  = reports.filter(r => r.priority === 'high' && r.status !== 'resolved')

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening in your area</p>
        </div>
        <Link to="/report/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Report Issue
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label:'Total Reports', value:stats.total,    icon:FileText,    color:'blue',   bg:'bg-blue-50',   text:'text-blue-600' },
          { label:'Resolved',      value:stats.resolved, icon:CheckCircle, color:'green',  bg:'bg-green-50',  text:'text-green-600' },
          { label:'In Progress',   value:stats.pending,  icon:Clock,       color:'yellow', bg:'bg-yellow-50', text:'text-yellow-600' },
          { label:'Delayed',       value:stats.delayed,  icon:AlertTriangle,color:'red',   bg:'bg-red-50',    text:'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 font-medium">{s.label}</span>
              <div className={`${s.bg} ${s.text} p-2 rounded-lg`}>
                <s.icon className="w-4 h-4" />
              </div>
            </div>
            <div className={`text-3xl font-bold ${s.text}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" /> Report Status
          </h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(val, name) => [val, name]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          )}
          <div className="flex flex-wrap gap-3 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                {d.name}: {d.value}
              </div>
            ))}
          </div>
        </div>

        {/* High Priority Alerts */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" /> High Priority Alerts
          </h2>
          {highPriority.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-300" />
              No high priority issues
            </div>
          ) : (
            <div className="space-y-3">
              {highPriority.slice(0, 4).map(r => (
                <Link key={r.id} to={`/report/${r.id}`}
                  className="flex items-start gap-3 p-3 bg-red-50 rounded-xl hover:bg-red-100 transition-colors block">
                  <span className="text-xl flex-shrink-0">{getEmoji(r.issue_type)}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{r.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{formatDistanceToNow(new Date(r.created_at), {addSuffix:true})}</div>
                  </div>
                  <StatusBadge status={r.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" /> Recent Reports
          </h2>
          {recentReports.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No reports yet</p>
              <Link to="/report/new" className="text-blue-600 text-xs mt-2 inline-block hover:underline">+ Report your first issue</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReports.map(r => (
                <Link key={r.id} to={`/report/${r.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors block">
                  <span className="text-lg">{getEmoji(r.issue_type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{r.title}</div>
                    <div className="text-xs text-gray-400">{formatDistanceToNow(new Date(r.created_at), {addSuffix:true})}</div>
                  </div>
                  <StatusBadge status={r.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All my reports */}
      {reports.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">All My Reports</h2>
          <div className="space-y-3">
            {reports.map(r => (
              <Link key={r.id} to={`/report/${r.id}`}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all hover:shadow-sm block
                  ${r.status === 'delayed' ? 'border-orange-200 bg-orange-50' :
                    r.priority === 'high' ? 'border-red-100 bg-red-50/50' : 'border-gray-100 hover:bg-gray-50'}`}>
                <span className="text-2xl">{getEmoji(r.issue_type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 truncate">{r.title}</span>
                    <StatusBadge status={r.status} />
                    {r.status === 'delayed' && (
                      <span className="text-xs text-orange-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Delayed
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{r.description}</p>
                  <div className="flex gap-4 mt-1.5 text-xs text-gray-400">
                    <span>👍 {r.upvote_count} votes</span>
                    <span>{formatDistanceToNow(new Date(r.created_at), {addSuffix:true})}</span>
                    <span className={r.priority === 'high' ? 'text-red-500 font-medium' : r.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'}>
                      ↑ {r.priority} priority
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
