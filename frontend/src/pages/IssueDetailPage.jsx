import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'
import StatusTimeline from '../components/StatusTimeline'
import { formatDistanceToNow, format } from 'date-fns'
import { isPast } from 'date-fns'
import { ThumbsUp, AlertCircle, ArrowLeft, Clock, Building2, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import { STATUS_COLORS } from '../constants'

function getEmoji(type) {
  return { pothole:'🕳️', garbage:'🗑️', streetlight:'💡', drainage:'🌊', other:'📋' }[type] || '📋'
}

export default function IssueDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [report, setReport]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting]   = useState(false)
  const [voted, setVoted]     = useState(false)

  const load = () => api.get(`/reports/${id}`).then(r => setReport(r.data)).finally(() => setLoading(false))
  useEffect(() => {
    load()
    const votedIds = JSON.parse(localStorage.getItem('lf_voted') || '[]')
    setVoted(votedIds.includes(Number(id)))
  }, [id])

  const vote = async () => {
    if (!user) { toast.error('Login to upvote'); return }
    if (voted) { toast.error('Already voted'); return }
    setVoting(true)
    try {
      await api.post(`/votes/${id}`)
      // Track voted in localStorage
      const votedIds = JSON.parse(localStorage.getItem('lf_voted') || '[]')
      localStorage.setItem('lf_voted', JSON.stringify([...votedIds, Number(id)]))
      setVoted(true)
      toast.success('Thanks for verifying! 👍')
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not vote')
    } finally {
      setVoting(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
  if (!report) return <div className="text-center py-20 text-gray-500">Report not found</div>

  const breached = report.sla_deadline ? isPast(new Date(report.sla_deadline)) : false
  const isHighPriority = report.priority === 'high'
  const statusColor = STATUS_COLORS[report.status] || '#6B7280'

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Delayed / High Priority Banner */}
      {(breached && report.status !== 'resolved') && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
          <div>
            <div className="font-semibold text-orange-800 text-sm">SLA Deadline Breached</div>
            <div className="text-orange-600 text-xs mt-0.5">This issue has exceeded its expected resolution time and has been escalated.</div>
          </div>
        </div>
      )}

      {isHighPriority && report.status !== 'resolved' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="text-sm font-semibold text-red-800">High Priority Issue — Community attention needed</div>
        </div>
      )}

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{getEmoji(report.issue_type)}</span>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{report.title}</h1>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  <StatusBadge status={report.status} />
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                    ${report.priority === 'high' ? 'bg-red-100 text-red-700' :
                      report.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'}`}>
                    {report.priority} priority
                  </span>
                </div>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">{report.description}</p>
          </div>
        </div>

        {/* Upvote */}
        <div className="flex items-center gap-4 py-4 border-y border-gray-100 mb-5">
          <button onClick={vote} disabled={voting || voted}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all
              ${voted ? 'bg-blue-600 text-white cursor-default' :
                'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'}`}>
            <ThumbsUp className="w-4 h-4" />
            {voted ? 'Verified ✓' : 'Verify & Upvote'}
          </button>
          <div className="text-sm text-gray-500">
            <span className="font-semibold text-gray-800 text-lg">{report.upvote_count}</span> community verifications
          </div>
        </div>

        {/* Meta info */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-5">
          <div className="flex items-center gap-2 text-gray-500">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span><span className="font-medium text-gray-700">Dept:</span> {report.department?.name || 'Unassigned'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Clock className="w-4 h-4 text-gray-400" />
            <span><span className="font-medium text-gray-700">Reported:</span> {formatDistanceToNow(new Date(report.created_at), {addSuffix:true})}</span>
          </div>
          {report.sla_deadline && (
            <div className={`flex items-center gap-2 col-span-2 ${breached ? 'text-orange-600' : 'text-gray-500'}`}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span><span className="font-medium">SLA Deadline:</span> {format(new Date(report.sla_deadline), 'MMM d, yyyy h:mm a')} {breached ? '⚠️ Overdue' : ''}</span>
            </div>
          )}
          {report.address && (
            <div className="flex items-center gap-2 text-gray-500 col-span-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{report.address}</span>
            </div>
          )}
        </div>

        {/* Image */}
        {report.image_url && (
          <div className="mb-5">
            <p className="text-sm font-medium text-gray-700 mb-2">Photo Evidence</p>
            <img src={report.image_url} alt="Issue" className="w-full max-h-64 object-cover rounded-xl border border-gray-100" />
          </div>
        )}

        {/* Map */}
        <div className="rounded-xl overflow-hidden h-52 border border-gray-100">
          <MapContainer center={[report.latitude, report.longitude]} zoom={16}
            style={{ height:'100%', width:'100%' }} zoomControl={false} scrollWheelZoom={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[report.latitude, report.longitude]} />
          </MapContainer>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-6">Resolution Timeline</h2>
        <StatusTimeline currentStatus={report.status} history={report.status_history} />
      </div>
    </div>
  )
}
