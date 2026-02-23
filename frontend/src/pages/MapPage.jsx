import { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { MAP_CENTER, MAP_DEFAULT_ZOOM, STATUS_COLORS, ISSUE_TYPES, RADIUS_OPTIONS, STATUS_LABELS } from '../constants'
import StatusBadge from '../components/StatusBadge'
import { Filter, Locate, ChevronDown } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// Custom SVG marker per issue type + status color
function createMarkerIcon(issueType, status) {
  const issueConfig = ISSUE_TYPES.find(t => t.value === issueType) || ISSUE_TYPES[4]
  const statusColor = STATUS_COLORS[status] || '#6B7280'
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      <filter id="shadow">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
      </filter>
      <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26S36 31.5 36 18C36 8.06 27.94 0 18 0z"
        fill="${statusColor}" filter="url(#shadow)"/>
      <circle cx="18" cy="18" r="11" fill="white"/>
      <text x="18" y="23" text-anchor="middle" font-size="13">${getIssueEmoji(issueType)}</text>
    </svg>`
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  })
}

function getIssueEmoji(type) {
  const map = { pothole:'🕳', garbage:'🗑', streetlight:'💡', drainage:'🌊', other:'📋' }
  return map[type] || '📋'
}

function RecenterMap({ center }) {
  const map = useMap()
  useEffect(() => { if (center) map.setView(center, MAP_DEFAULT_ZOOM) }, [center])
  return null
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

export default function MapPage() {
  const { user } = useAuth()
  const [reports, setReports]       = useState([])
  const [filtered, setFiltered]     = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [radius, setRadius]         = useState(() => parseInt(localStorage.getItem('lf_radius') || '2000'))
  const [issueFilter, setIssueFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading]       = useState(true)
  const [locating, setLocating]     = useState(false)

  // Load all reports
  useEffect(() => {
    api.get('/reports/').then(r => { setReports(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        p => setUserLocation([p.coords.latitude, p.coords.longitude]),
        () => setUserLocation(MAP_CENTER)
      )
    } else {
      setUserLocation(MAP_CENTER)
    }
  }, [])

  // Apply filters
  useEffect(() => {
    let result = [...reports]
    if (issueFilter) result = result.filter(r => r.issue_type === issueFilter)
    if (statusFilter) result = result.filter(r => r.status === statusFilter)
    if (userLocation && radius) {
      result = result.filter(r => haversineDistance(userLocation[0], userLocation[1], r.latitude, r.longitude) <= radius)
    }
    setFiltered(result)
  }, [reports, issueFilter, statusFilter, userLocation, radius])

  const locateMe = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      p => { setUserLocation([p.coords.latitude, p.coords.longitude]); setLocating(false) },
      () => setLocating(false)
    )
  }

  const handleRadiusChange = (val) => {
    setRadius(val)
    localStorage.setItem('lf_radius', val)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Filter bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex flex-wrap gap-2 items-center shadow-sm">
        <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />

        <select value={issueFilter} onChange={e => setIssueFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">All Issue Types</option>
          {ISSUE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>

        <select value={radius} onChange={e => handleRadiusChange(Number(e.target.value))}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          {RADIUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label} radius</option>)}
        </select>

        <button onClick={locateMe} disabled={locating}
          className="flex items-center gap-1.5 text-sm text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
          <Locate className="w-4 h-4" /> {locating ? 'Locating...' : 'My Location'}
        </button>

        <span className="ml-auto text-sm text-gray-400 font-medium">{filtered.length} issues</span>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        <MapContainer
          center={userLocation || MAP_CENTER}
          zoom={MAP_DEFAULT_ZOOM}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {userLocation && <RecenterMap center={userLocation} />}
          {userLocation && radius && (
            <Circle center={userLocation} radius={radius}
              pathOptions={{ color: '#2563EB', fillColor: '#DBEAFE', fillOpacity: 0.1, weight: 1.5, dashArray: '6' }} />
          )}
          {userLocation && (
            <Marker position={userLocation} icon={L.divIcon({
              html: `<div style="width:16px;height:16px;background:#2563EB;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
              className: '', iconSize: [16, 16], iconAnchor: [8, 8]
            })} />
          )}
          {filtered.map(r => (
            <Marker key={r.id} position={[r.latitude, r.longitude]}
              icon={createMarkerIcon(r.issue_type, r.status)}>
              <Popup maxWidth={260}>
                <div className="min-w-[220px] p-1">
                  <div className="font-semibold text-gray-900 mb-1.5">{r.title}</div>
                  <div className="flex gap-1.5 mb-2 flex-wrap">
                    <StatusBadge status={r.status} />
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{r.issue_type}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2 leading-relaxed">{r.description?.slice(0, 90)}...</p>
                  <div className="text-xs text-gray-400 mb-3">
                    👍 {r.upvote_count} votes · {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                  </div>
                  <Link to={`/report/${r.id}`}
                    className="block text-center text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                    View Details →
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 flex flex-wrap gap-3 text-xs text-gray-500">
        {Object.entries(STATUS_COLORS).map(([s, c]) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c }}></span>
            {STATUS_LABELS[s]}
          </span>
        ))}
      </div>
    </div>
  )
}
