import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'
import { timeAgo, issueIcon, isSlaBreached, priorityColor } from '../utils/helpers'
import { ThumbsUp, AlertCircle, ArrowLeft, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
export default function IssueDetailPage() {
  const { id } = useParams(); const { user } = useAuth()
  const [report, setReport] = useState(null); const [loading, setLoading] = useState(true); const [voting, setVoting] = useState(false)
  const load = () => api.get(`/reports/${id}`).then(r => setReport(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [id])
  const vote = async () => {
    if (!user) { toast.error('Login to upvote'); return }
    setVoting(true)
    try { await api.post(`/votes/${id}`); toast.success('Verified!'); load() }
    catch (err) { toast.error(err.response?.data?.detail || 'Could not vote') }
    finally { setVoting(false) }
  }
  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
  if (!report) return <div className="text-center py-20 text-gray-500">Report not found</div>
  const breached = isSlaBreached(report.sla_deadline)
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"><ArrowLeft className="w-4 h-4" />Back</Link>
      <div className="card mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2"><span className="text-2xl">{issueIcon(report.issue_type)}</span><h1 className="text-xl font-bold">{report.title}</h1></div>
            <div className="flex flex-wrap gap-2"><StatusBadge status={report.status} /><span className={`text-sm font-medium ${priorityColor(report.priority)}`}>{report.priority} priority</span>
              {breached && report.status !== 'resolved' && <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded-full"><AlertCircle className="w-3 h-3" />SLA Breached</span>}
            </div>
          </div>
          <button onClick={vote} disabled={voting} className="btn-secondary flex items-center gap-2 text-sm"><ThumbsUp className="w-4 h-4 text-blue-500" />Verify ({report.upvote_count})</button>
        </div>
        <p className="text-gray-600 mb-4">{report.description}</p>
        <div className="grid grid-cols-2 gap-3 text-sm text-gray-500 mb-4">
          <div><span className="font-medium text-gray-700">Department:</span> {report.department?.name || 'Unassigned'}</div>
          <div><span className="font-medium text-gray-700">Type:</span> {report.issue_type}</div>
          <div><span className="font-medium text-gray-700">Submitted:</span> {timeAgo(report.created_at)}</div>
          {report.sla_deadline && <div className={`flex items-center gap-1 ${breached?'text-red-600':''}`}><Clock className="w-4 h-4" />{format(new Date(report.sla_deadline),'MMM d, h:mm a')}</div>}
        </div>
        <div className="rounded-lg overflow-hidden h-48 border border-gray-200">
          <MapContainer center={[report.latitude, report.longitude]} zoom={15} style={{ height:'100%', width:'100%' }} zoomControl={false} scrollWheelZoom={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[report.latitude, report.longitude]} />
          </MapContainer>
        </div>
      </div>
      <div className="card">
        <h2 className="font-semibold mb-4">Status Timeline</h2>
        {report.status_history.length === 0 ? <p className="text-gray-400 text-sm">No history yet</p> : (
          <div className="space-y-4">
            {report.status_history.map((h, i) => (
              <div key={h.id} className="flex gap-3">
                <div className="flex flex-col items-center"><div className="w-3 h-3 bg-blue-600 rounded-full mt-1"></div>{i < report.status_history.length-1 && <div className="w-0.5 bg-gray-200 flex-1 mt-1"></div>}</div>
                <div className="pb-4"><StatusBadge status={h.new_status} />{h.remark && <p className="text-sm text-gray-500 mt-1">{h.remark}</p>}<p className="text-xs text-gray-400 mt-1">{timeAgo(h.timestamp)}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}