import { Link } from 'react-router-dom'
import { MapPin, Shield, Clock, Users, ArrowRight, CheckCircle } from 'lucide-react'
import { APP_NAME, APP_TAGLINE } from '../constants'

const features = [
  { icon: MapPin,   title: 'Geo-Tagged Reporting',    desc: 'Pin issues precisely on a map. Auto-detect your location or drop a manual pin.' },
  { icon: Shield,   title: 'Auto Department Routing', desc: 'Reports are automatically assigned to the correct municipal department.' },
  { icon: Clock,    title: 'SLA Tracking',            desc: 'Every issue has a resolution deadline. Delays are flagged publicly.' },
  { icon: Users,    title: 'Community Verification',  desc: 'Citizens verify and upvote issues to raise priority and prevent spam.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-600/50 text-blue-100 px-4 py-1.5 rounded-full text-sm mb-6">
            <MapPin className="w-4 h-4" /> Hyperlocal Civic Transparency Platform
          </div>
          <h1 className="text-5xl font-bold mb-4">{APP_NAME}</h1>
          <p className="text-blue-200 text-xl mb-3">{APP_TAGLINE}</p>
          <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
            Turn citizen complaints into structured, trackable, and prioritized municipal actions — with full transparency.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/signup" className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold px-8 py-3 rounded-xl flex items-center gap-2 transition-colors">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/map" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3 rounded-xl border border-white/30 transition-colors">
              View Public Map
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">How {APP_NAME} Works</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">A complete loop from citizen report to public resolution.</p>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map(f => (
              <div key={f.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex gap-4">
                <div className="bg-blue-50 rounded-xl p-3 h-fit"><f.icon className="w-6 h-6 text-blue-600" /></div>
                <div><h3 className="font-semibold mb-1">{f.title}</h3><p className="text-gray-500 text-sm">{f.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-blue-600 text-white py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to fix your neighborhood?</h2>
        <p className="text-blue-100 mb-8">Join {APP_NAME} and start holding your municipality accountable.</p>
        <Link to="/signup" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 rounded-xl inline-flex items-center gap-2 transition-colors">
          Create Free Account <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <footer className="bg-gray-900 text-gray-400 text-sm py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-2 text-white font-semibold mb-2">
          <div className="bg-blue-600 rounded-lg p-1"><MapPin className="w-3 h-3" /></div>
          {APP_NAME}
        </div>
        <p>{APP_TAGLINE}</p>
      </footer>
    </div>
  )
}
