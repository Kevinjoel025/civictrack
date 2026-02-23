import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { useDropzone } from 'react-dropzone'
import api from '../utils/api'
import { ISSUE_TYPES, MAP_CENTER, DUPLICATE_RADIUS_METERS } from '../constants'
import toast from 'react-hot-toast'
import { MapPin, Upload, X, CheckCircle, AlertTriangle, Loader } from 'lucide-react'

function LocationPicker({ onPick }) {
  useMapEvents({ click(e) { onPick(e.latlng.lat, e.latlng.lng) } })
  return null
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

// Simulated AI image verification
async function verifyImageWithAI(imageBase64, issueType) {
  await new Promise(r => setTimeout(r, 2000)) // simulate API call
  // In production: call Claude API with image + prompt
  // For demo: 85% pass rate simulation
  const passes = Math.random() > 0.15
  return {
    verified: passes,
    message: passes
      ? `✅ Image verified — matches "${issueType}" issue type`
      : `⚠️ Image doesn't clearly show a ${issueType} issue. Please upload a clearer photo.`
  }
}

export default function ReportPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', description: '', issue_type: 'pothole', address: '',
    latitude: MAP_CENTER[0], longitude: MAP_CENTER[1],
  })
  const [imageFile, setImageFile]       = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageBase64, setImageBase64]   = useState(null)
  const [aiStatus, setAiStatus]         = useState(null) // null | 'checking' | 'verified' | 'failed'
  const [aiMessage, setAiMessage]       = useState('')
  const [duplicate, setDuplicate]       = useState(null)
  const [loading, setLoading]           = useState(false)

  // GPS on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(p =>
        setForm(f => ({ ...f, latitude: p.coords.latitude, longitude: p.coords.longitude }))
      )
    }
  }, [])

  // Image dropzone
  const onDrop = useCallback(async (accepted) => {
    const file = accepted[0]
    if (!file) return
    setImageFile(file)
    setAiStatus('checking')
    setAiMessage('')

    // Preview
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target.result
      setImagePreview(base64)
      setImageBase64(base64)

      // AI verification
      const result = await verifyImageWithAI(base64, form.issue_type)
      setAiStatus(result.verified ? 'verified' : 'failed')
      setAiMessage(result.message)
    }
    reader.readAsDataURL(file)
  }, [form.issue_type])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 1
  })

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setImageBase64(null)
    setAiStatus(null)
    setAiMessage('')
  }

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  // Check for duplicates before submit
  const checkDuplicates = async () => {
    try {
      const res = await api.get('/reports/')
      const nearby = res.data.find(r =>
        haversineDistance(form.latitude, form.longitude, r.latitude, r.longitude) <= DUPLICATE_RADIUS_METERS &&
        r.issue_type === form.issue_type
      )
      return nearby || null
    } catch { return null }
  }

  const submit = async e => {
    e.preventDefault()
    if (!imageFile) { toast.error('Please upload an image of the issue'); return }
    if (aiStatus === 'failed') { toast.error('Please upload a clearer image first'); return }
    if (aiStatus === 'checking') { toast.error('Please wait for image verification'); return }

    setLoading(true)

    // Check duplicates
    const dup = await checkDuplicates()
    if (dup) {
      setDuplicate(dup)
      setLoading(false)
      return
    }

    try {
      const payload = { ...form, image_url: imageBase64 }
      const res = await api.post('/reports/', payload)
      toast.success('Issue reported successfully! 🎉')
      navigate(`/report/${res.data.id}`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit')
    } finally {
      setLoading(false)
    }
  }

  // Duplicate modal
  if (duplicate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Similar Issue Already Reported</h2>
          <p className="text-gray-500 text-sm mb-6">
            There's already a report for a <strong>{duplicate.issue_type}</strong> issue within 50 meters of your location.
            Help by upvoting the existing report instead!
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <div className="font-semibold text-gray-800">{duplicate.title}</div>
            <div className="text-sm text-gray-500 mt-1">{duplicate.description?.slice(0, 80)}...</div>
            <div className="text-xs text-gray-400 mt-2">👍 {duplicate.upvote_count} votes</div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setDuplicate(null)}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
              Report Anyway
            </button>
            <button onClick={() => navigate(`/report/${duplicate.id}`)}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
              View & Upvote →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Report an Issue</h1>
        <p className="text-gray-500 text-sm mt-1">Help your community by reporting civic issues.</p>
      </div>

      <form onSubmit={submit} className="space-y-6">
        {/* Issue Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Issue Details</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {ISSUE_TYPES.map(t => (
                <button type="button" key={t.value}
                  onClick={() => { setForm(f => ({...f, issue_type: t.value})); setAiStatus(null); setImageFile(null); setImagePreview(null) }}
                  style={form.issue_type === t.value ? { borderColor: t.color, backgroundColor: t.bg, color: t.color } : {}}
                  className={`p-2.5 rounded-xl border-2 text-xs font-medium transition-all text-center
                    ${form.issue_type === t.value ? 'border-2' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  <div className="text-lg mb-0.5">{getEmoji(t.value)}</div>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input name="title" value={form.title} onChange={handle} required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Large pothole blocking lane" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handle} required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[90px]"
              placeholder="Describe the issue in detail..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address <span className="text-gray-400">(optional)</span></label>
            <input name="address" value={form.address} onChange={handle}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Near landmark..." />
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-1">
            Photo Evidence <span className="text-red-500">*</span>
          </h2>
          <p className="text-xs text-gray-400 mb-4">Upload a clear photo. Our AI will verify it matches the issue type.</p>

          {!imagePreview ? (
            <div {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}>
              <input {...getInputProps()} />
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 font-medium">Drop image here or click to upload</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP up to 10MB</p>
            </div>
          ) : (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="w-full h-52 object-cover rounded-xl" />
              <button type="button" onClick={removeImage}
                className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:bg-red-50">
                <X className="w-4 h-4 text-gray-600" />
              </button>

              {/* AI Verification Status */}
              <div className={`mt-3 px-4 py-3 rounded-xl flex items-center gap-2.5 text-sm
                ${aiStatus === 'checking' ? 'bg-blue-50 text-blue-700' :
                  aiStatus === 'verified' ? 'bg-green-50 text-green-700' :
                  'bg-red-50 text-red-700'}`}>
                {aiStatus === 'checking' && <Loader className="w-4 h-4 animate-spin flex-shrink-0" />}
                {aiStatus === 'verified' && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
                {aiStatus === 'failed' && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                <span>{aiStatus === 'checking' ? 'AI is verifying your image...' : aiMessage}</span>
              </div>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-1">Pin Location</h2>
          <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Click on the map to set the exact location
          </p>
          <div className="rounded-xl overflow-hidden h-64 border border-gray-200">
            <MapContainer center={[form.latitude, form.longitude]} zoom={15} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[form.latitude, form.longitude]} />
              <LocationPicker onPick={(lat, lng) => setForm(f => ({ ...f, latitude: lat, longitude: lng }))} />
            </MapContainer>
          </div>
          <p className="text-xs text-gray-400 mt-2">📍 {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}</p>
        </div>

        <button type="submit" disabled={loading || aiStatus === 'checking' || aiStatus === 'failed' || !imageFile}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
            text-white font-semibold py-3.5 rounded-xl transition-colors text-base">
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  )
}

function getEmoji(type) {
  return { pothole:'🕳️', garbage:'🗑️', streetlight:'💡', drainage:'🌊', other:'📋' }[type] || '📋'
}
