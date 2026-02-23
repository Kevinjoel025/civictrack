import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import api from '../utils/api'
import { ISSUE_TYPES } from '../utils/helpers'
import toast from 'react-hot-toast'
import { MapPin } from 'lucide-react'
function LocationPicker({ onPick }) {
  useMapEvents({ click(e) { onPick(e.latlng.lat, e.latlng.lng) } }); return null
}
export default function ReportPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title:'', description:'', issue_type:'pothole', address:'', latitude:12.9716, longitude:77.5946 })
  const [loading, setLoading] = useState(false)
  useEffect(() => { if (navigator.geolocation) navigator.geolocation.getCurrentPosition(p => setForm(f => ({ ...f, latitude:p.coords.latitude, longitude:p.coords.longitude }))) }, [])
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const submit = async e => {
    e.preventDefault(); setLoading(true)
    try { const r = await api.post('/reports/', form); toast.success('Issue reported!'); navigate(`/report/${r.data.id}`) }
    catch (err) { toast.error(err.response?.data?.detail || 'Failed') }
    finally { setLoading(false) }
  }
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Report an Issue</h1>
      <p className="text-gray-500 text-sm mb-8">Fill in details and drop a pin on the map.</p>
      <form onSubmit={submit} className="space-y-6">
        <div className="card space-y-4">
          <h2 className="font-semibold">Issue Details</h2>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input name="title" value={form.title} onChange={handle} className="input" placeholder="e.g. Large pothole on Main Street" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
            <select name="issue_type" value={form.issue_type} onChange={handle} className="input">{ISSUE_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}</select>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea name="description" value={form.description} onChange={handle} className="input min-h-[100px]" placeholder="Describe the issue..." required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Address <span className="text-gray-400">(optional)</span></label><input name="address" value={form.address} onChange={handle} className="input" placeholder="Near landmark..." /></div>
        </div>
        <div className="card">
          <h2 className="font-semibold mb-1">Pin Location</h2>
          <p className="text-xs text-gray-400 mb-3 flex items-center gap-1"><MapPin className="w-3 h-3" />Click on the map to set exact location</p>
          <div className="rounded-lg overflow-hidden h-64 border border-gray-200">
            <MapContainer center={[form.latitude, form.longitude]} zoom={14} style={{ height:'100%', width:'100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
              <Marker position={[form.latitude, form.longitude]} />
              <LocationPicker onPick={(lat, lng) => setForm(f => ({ ...f, latitude:lat, longitude:lng }))} />
            </MapContainer>
          </div>
          <p className="text-xs text-gray-400 mt-2">📍 {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}</p>
        </div>
        <button type="submit" className="btn-primary w-full py-3 text-base" disabled={loading}>{loading ? 'Submitting...' : 'Submit Report'}</button>
      </form>
    </div>
  )
}