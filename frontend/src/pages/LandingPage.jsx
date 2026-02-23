import { Link } from 'react-router-dom'
import { MapPin, Shield, Clock, Users, ArrowRight } from 'lucide-react'
const features = [
  { icon: MapPin,   title:'Geo-Tagged Reporting',    desc:'Pin issues precisely on a map. Auto-detect location or drop a manual pin.' },
  { icon: Shield,   title:'Auto Department Routing', desc:'Reports are automatically assigned to the correct municipal department.' },
  { icon: Clock,    title:'SLA Tracking',            desc:'Every issue has a resolution deadline. Delays are flagged publicly.' },
  { icon: Users,    title:'Community Verification',  desc:'Citizens verify and upvote issues to raise priority and prevent spam.' },
]
export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-blue-700 to-blue-800 text-white py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold mb-6">Report. Track. <span className="text-yellow-300">Resolve.</span></h1>
          <p className="text-blue-100 text-xl mb-10">CivicTrack turns citizen complaints into structured, trackable, and prioritized municipal actions.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/signup" className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold px-8 py-3 rounded-lg flex items-center gap-2">Get Started <ArrowRight className="w-4 h-4" /></Link>
            <Link to="/map" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3 rounded-lg border border-white/30">View Public Map</Link>
          </div>
        </div>
      </section>
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How CivicTrack Works</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map(f => (
              <div key={f.title} className="card flex gap-4">
                <div className="bg-blue-50 rounded-lg p-3 h-fit"><f.icon className="w-6 h-6 text-blue-600" /></div>
                <div><h3 className="font-semibold mb-1">{f.title}</h3><p className="text-gray-500 text-sm">{f.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-blue-600 text-white py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to make your neighborhood better?</h2>
        <Link to="/signup" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 rounded-lg inline-flex items-center gap-2 mt-4">Create Free Account <ArrowRight className="w-4 h-4" /></Link>
      </section>
    </div>
  )
}