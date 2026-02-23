import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { STATUS_COLORS, ISSUE_TYPES, timeAgo } from '../utils/helpers'
import StatusBadge from '../components/StatusBadge'
import { Filter } from 'lucide-react'
export default function MapPage() {
  const [reports, setReports] = useState([]); const [filters, setFilters] = useState({ issue_type:'', status:'' })
  useEffect(() => {
    const p = {}; if (filters.issue_type) p.issue_type = filters.issue_type; if (filters.status) p.status = filters.status
    api.get('/reports/', { params: p }).then(r => setReports(r.data)).catch(console.error)
  }, [filters])
  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="bg-white border-b px-4 py-3 flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-gray-400" />
        <select className="input w-auto text-sm" value={filters.issue_type} onChange={e => setFilters(f => ({ ...f, issue_type:e.target.value }))}>
          <option value="">All Types</option>{ISSUE_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
        </select>
        <select className="input w-auto text-sm" value={filters.status} onChange={e => setFilters(f => ({ ...f, status:e.target.value }))}>
          <option value="">All Statuses</option>
          {['submitted','assigned','acknowledged','in_progress','resolved','rejected','delayed'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
        <span className="text-sm text-gray-400 ml-auto">{reports.length} issues</span>
      </div>
      <div className="flex-1">
        <MapContainer center={[12.9716, 77.5946]} zoom={13} style={{ height:'100%', width:'100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
          {reports.map(r => (
            <CircleMarker key={r.id} center={[r.latitude, r.longitude]} radius={10} fillColor={STATUS_COLORS[r.status]||'#6B7280'} color="white" weight={2} fillOpacity={0.8}>
              <Popup>
                <div className="min-w-[180px]">
                  <div className="font-semibold mb-1">{r.title}</div><StatusBadge status={r.status} />
                  <p className="text-xs text-gray-500 mt-2">{r.description.slice(0,80)}...</p>
                  <div className="text-xs text-gray-400 mt-1 mb-2">👍 {r.upvote_count} · {timeAgo(r.created_at)}</div>
                  <Link to={`/report/${r.id}`} className="text-xs text-blue-600 hover:underline">View details →</Link>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <div className="bg-white border-t px-4 py-2 flex flex-wrap gap-4 text-xs text-gray-500">
        {Object.entries(STATUS_COLORS).map(([s, c]) => <span key={s} className="flex items-center gap-1"><span className="w-3 h-3 rounded-full" style={{ backgroundColor:c }}></span>{s.replace('_',' ')}</span>)}
      </div>
    </div>
  )
}