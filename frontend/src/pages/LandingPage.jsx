import { useNavigate } from 'react-router-dom'
import { Sun, Zap, BarChart2, Bell, Shield, Users, ArrowRight, CheckCircle, TrendingUp, Leaf, Battery, ChevronDown } from 'lucide-react'

const NAV_LINKS = ['Features', 'How It Works', 'Pricing', 'Contact']

const FEATURES = [
  { icon: Zap, title: 'Real-Time Monitoring', desc: 'Live panel output, efficiency and temperature data updated every 30 seconds via WebSocket.', color: 'bg-yellow-50 text-yellow-600' },
  { icon: BarChart2, title: 'Advanced Analytics', desc: 'Daily, monthly and yearly energy production charts with panel-by-panel comparison.', color: 'bg-blue-50 text-blue-600' },
  { icon: Bell, title: 'Smart Alerts', desc: 'Automatic critical and warning alerts for offline panels, low efficiency and high temperature.', color: 'bg-red-50 text-red-600' },
  { icon: Shield, title: 'Role-Based Access', desc: 'Separate admin and viewer portals with JWT authentication and secure API access.', color: 'bg-purple-50 text-purple-600' },
  { icon: Users, title: 'User Management', desc: 'Admin can create, manage and assign roles to multiple users across the platform.', color: 'bg-green-50 text-green-600' },
  { icon: TrendingUp, title: 'PDF Reports', desc: 'One-click professional PDF reports with production summary, panel status and alert history.', color: 'bg-orange-50 text-orange-600' },
]

const STATS = [
  { value: '99.9%', label: 'Uptime' },
  { value: '30s', label: 'Data Refresh' },
  { value: '10k+', label: 'Panels Monitored' },
  { value: '$0', label: 'Setup Cost' },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Connect Your Panels', desc: 'Add your solar panels with capacity, location and array grouping details.' },
  { step: '02', title: 'Monitor Live Data', desc: 'Real-time output, efficiency and temperature streamed directly to your dashboard.' },
  { step: '03', title: 'Get Smart Alerts', desc: 'Instant notifications when panels go offline or performance drops below threshold.' },
  { step: '04', title: 'Export Reports', desc: 'Download professional PDF reports for any date range with one click.' },
]

const PLANS = [
  { name: 'Starter', price: 'Free', desc: 'Perfect for home systems', features: ['Up to 10 panels', 'Real-time monitoring', 'Basic alerts', 'PDF reports'], highlight: false },
  { name: 'Pro', price: '$29', desc: 'For small businesses', features: ['Up to 100 panels', 'Advanced analytics', 'Email notifications', 'User management', 'Priority support'], highlight: true },
  { name: 'Enterprise', price: 'Custom', desc: 'For large installations', features: ['Unlimited panels', 'Custom integrations', 'MQTT/SCADA support', 'Dedicated support', 'SLA guarantee'], highlight: false },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-solar-500 rounded-lg flex items-center justify-center">
              <Sun size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">SolarEdge</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(' ','-')}`} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">Sign In</button>
            <button onClick={() => navigate('/login')} className="btn-primary text-sm px-4 py-2">Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 bg-gradient-to-b from-solar-50/50 via-white to-white relative overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-solar-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-solar-50 text-solar-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-solar-100">
            <span className="w-1.5 h-1.5 bg-solar-500 rounded-full pulse-dot" />
            Real-time Solar Monitoring Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Monitor Your Solar<br />
            <span className="text-solar-500">Panels Smarter</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Complete MERN stack solar management system with real-time monitoring, smart alerts, advanced analytics and professional PDF reports — all in one place.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button onClick={() => navigate('/login')} className="btn-primary flex items-center gap-2 px-6 py-3 text-base shadow-lg shadow-solar-200">
              Start Monitoring <ArrowRight size={18} />
            </button>
            <a href="#features" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors px-4 py-3">
              See Features <ChevronDown size={16} />
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-6 mt-20 pt-10 border-t border-gray-100">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-solar-600 font-semibold text-sm mb-2 uppercase tracking-wider">Features</p>
            <h2 className="text-3xl font-bold text-gray-900">Everything you need to manage solar</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Built for solar installers, facility managers and homeowners who demand real-time visibility.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-solar-600 font-semibold text-sm mb-2 uppercase tracking-wider">How It Works</p>
            <h2 className="text-3xl font-bold text-gray-900">Up and running in minutes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 bg-solar-500 text-white rounded-2xl flex items-center justify-center text-lg font-bold mx-auto mb-4 shadow-lg shadow-solar-200">
                  {step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Green impact banner */}
      <section className="py-16 px-6 bg-gradient-to-r from-green-600 to-solar-500">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-white text-center md:text-left">
            <h2 className="text-2xl font-bold mb-2">Making a green difference</h2>
            <p className="text-white/80 text-sm">Every kWh monitored is a step toward a cleaner planet.</p>
          </div>
          <div className="flex gap-12">
            {[{icon:Leaf,val:'412 kg',label:'CO₂ Avoided'},{icon:Battery,val:'2,048',label:'kWh Generated'},{icon:Sun,val:'18',label:'Panels Active'}].map(({icon:Icon,val,label})=>(
              <div key={label} className="text-center text-white">
                <Icon size={24} className="mx-auto mb-2 opacity-80" />
                <p className="text-2xl font-bold">{val}</p>
                <p className="text-xs text-white/70 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-solar-600 font-semibold text-sm mb-2 uppercase tracking-wider">Pricing</p>
            <h2 className="text-3xl font-bold text-gray-900">Simple, transparent pricing</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map(({ name, price, desc, features, highlight }) => (
              <div key={name} className={`rounded-2xl p-8 border-2 ${highlight ? 'bg-solar-500 border-solar-500 shadow-xl shadow-solar-200' : 'bg-white border-gray-100'}`}>
                <p className={`font-semibold text-sm mb-1 ${highlight ? 'text-white/70' : 'text-gray-500'}`}>{name}</p>
                <p className={`text-4xl font-bold mb-1 ${highlight ? 'text-white' : 'text-gray-900'}`}>{price}<span className={`text-base font-normal ${highlight ? 'text-white/70' : 'text-gray-400'}`}>{price !== 'Free' && price !== 'Custom' ? '/mo' : ''}</span></p>
                <p className={`text-sm mb-6 ${highlight ? 'text-white/70' : 'text-gray-400'}`}>{desc}</p>
                <div className="space-y-3 mb-8">
                  {features.map(f => (
                    <div key={f} className="flex items-center gap-2">
                      <CheckCircle size={15} className={highlight ? 'text-white' : 'text-green-500'} />
                      <span className={`text-sm ${highlight ? 'text-white' : 'text-gray-600'}`}>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate('/login')}
                  className={`w-full py-2.5 rounded-xl font-medium text-sm transition-colors ${highlight ? 'bg-white text-solar-600 hover:bg-solar-50' : 'bg-solar-500 text-white hover:bg-solar-600'}`}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-solar-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-solar-200">
            <Sun size={28} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to go solar smart?</h2>
          <p className="text-gray-500 mb-8">Join thousands of solar system owners who trust SolarEdge to monitor and optimize their energy production.</p>
          <button onClick={() => navigate('/login')} className="btn-primary flex items-center gap-2 mx-auto px-8 py-3 text-base shadow-lg shadow-solar-200">
            Start for Free <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-gray-400 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-solar-500 rounded-lg flex items-center justify-center">
                  <Sun size={16} className="text-white" />
                </div>
                <span className="font-bold text-white">SolarEdge</span>
              </div>
              <p className="text-sm leading-relaxed">Real-time solar panel management system built with the MERN stack.</p>
            </div>
            {[
              { title: 'Product', links: ['Dashboard','Analytics','Alerts','Reports'] },
              { title: 'Company', links: ['About','Blog','Careers','Press'] },
              { title: 'Support', links: ['Documentation','API Reference','Contact Us','Status'] },
            ].map(({ title, links }) => (
              <div key={title}>
                <p className="text-white font-semibold text-sm mb-4">{title}</p>
                <ul className="space-y-2">
                  {links.map(l => <li key={l}><a href="#" className="text-sm hover:text-white transition-colors">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs">© 2026 SolarEdge. All rights reserved.</p>
            <div className="flex gap-6">
              {['Privacy Policy','Terms of Service','Cookie Policy'].map(l => (
                <a key={l} href="#" className="text-xs hover:text-white transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
