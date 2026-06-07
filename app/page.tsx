'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Mic, Globe, Zap, Shield, Star, ChevronDown, Menu, X, Play, Pause, Volume2, Check, ArrowRight, Wand2, Users, BarChart3 } from 'lucide-react'

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#faq', label: 'FAQ' },
]

const FEATURES = [
  {
    icon: <Mic className="w-6 h-6" />,
    title: 'Real-time Transcription',
    desc: 'Powered by Groq Whisper — the fastest speech recognition in the world. Sub-second latency, 99% accuracy.',
    color: 'from-indigo-500 to-violet-500',
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: '50+ Languages',
    desc: 'Translate between 50+ world languages with native-level fluency and cultural nuance preservation.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <Wand2 className="w-6 h-6" />,
    title: 'Voice Cloning',
    desc: 'Train a custom voice model from 1 minute of your audio. Speak any language in your own unique voice.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Studio-Grade Quality',
    desc: 'ElevenLabs-powered synthesis delivers broadcast-quality audio that sounds completely natural.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Privacy First',
    desc: 'End-to-end encrypted audio processing. Your voice data stays yours. GDPR compliant by design.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Usage Analytics',
    desc: 'Track every translation, monitor API usage, and manage your voice library from one dashboard.',
    color: 'from-rose-500 to-pink-500',
  },
]

const STATS = [
  { value: '50+', label: 'Languages Supported' },
  { value: '99%', label: 'Audio Clarity' },
  { value: '<1s', label: 'Latency' },
  { value: '10K+', label: 'Active Users' },
]

const TESTIMONIALS = [
  {
    quote: "Vocalis AI completely changed how I produce content. I record once and publish in 8 languages — all in my own voice.",
    name: 'Marcus Webb',
    role: 'Podcast Host',
    avatar: 'MW',
    rating: 5,
  },
  {
    quote: "We use Vocalis for all our global team meetings. It's like having a professional interpreter who never needs a break.",
    name: 'Priya Sharma',
    role: 'Head of Engineering, GlobalTech',
    avatar: 'PS',
    rating: 5,
  },
  {
    quote: "The voice cloning is uncanny. My Spanish audience tells me my pronunciation is native-level. I don't speak a word of Spanish.",
    name: 'Emma Lindqvist',
    role: 'YouTube Creator',
    avatar: 'EL',
    rating: 5,
  },
  {
    quote: "Finally a tool that understands context, not just words. The emotional fidelity in translation is remarkable.",
    name: 'Kenji Tanaka',
    role: 'Language Researcher, Tokyo University',
    avatar: 'KT',
    rating: 5,
  },
]

const FAQS = [
  {
    q: 'How long does it take to clone my voice?',
    a: 'Voice cloning takes approximately 30–60 seconds after uploading a 1-minute audio sample. Your voice model is ready to use immediately after processing.',
  },
  {
    q: 'What audio formats are supported?',
    a: 'We support MP3, WAV, M4A, OGG, and FLAC for both input and voice cloning samples. Output is delivered in MP3 for maximum compatibility.',
  },
  {
    q: 'How accurate is the translation?',
    a: 'Our Gemini-powered translation preserves not just words but tone, emotion, and cultural context. Accuracy exceeds 97% for major language pairs.',
  },
  {
    q: 'Is my voice data secure?',
    a: 'All audio is encrypted in transit and at rest. Voice samples are stored securely in Supabase and are never shared with third parties. You can delete your data at any time.',
  },
  {
    q: 'Can I use Vocalis AI for commercial projects?',
    a: 'Yes. All paid plans include commercial licensing for translated content. The cloned voice is exclusively yours under your account.',
  },
  {
    q: 'What\'s the difference between default voices and cloned voices?',
    a: 'Default voices are professional ElevenLabs voice models. Cloned voices are trained specifically on your audio — so the output sounds like YOU speaking the target language.',
  },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Vocalis AI Logo" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold text-gray-900">Vocalis <span className="gradient-text">AI</span></span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="btn-primary text-sm py-2 px-5">
                Get Started Free
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100 space-y-2">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} className="block px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                  {link.label}
                </a>
              ))}
              <div className="pt-4 flex flex-col gap-2">
                <Link href="/login" className="btn-secondary text-center text-sm py-2">Sign In</Link>
                <Link href="/signup" className="btn-primary text-center text-sm py-2">Get Started Free</Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 mesh-gradient">
        <div className="max-w-7xl mx-auto text-center">
          {/* Announcement pill */}
          <div className="inline-flex items-center gap-2 bg-indigo-50/60 border border-indigo-100/80 text-indigo-700 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-8 backdrop-blur-sm hover:bg-indigo-50 hover:border-indigo-200/80 transition-all cursor-pointer">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            Vocalis AI v1.0 is live
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
            Speak to the World <br className="hidden sm:inline" />
            <span className="gradient-text">in Your Own Voice</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Record once. Translate to 50+ languages. Sound exactly like yourself — powered by real-time AI voice translation and cloning.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link href="/signup" className="btn-primary text-sm py-3 px-6 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/20">
              Start Translating <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="btn-secondary text-sm py-3 px-6 flex items-center gap-2 hover:bg-gray-50 active:scale-[0.98] transition-all"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              Hear Demo Voice
            </button>
          </div>

          {/* Premium Demo Console (macOS Window style) */}
          <div className="relative max-w-4xl mx-auto mb-12">
            {/* Floating Badge Left */}
            <div className="absolute -left-12 top-1/4 hidden lg:flex items-center gap-2 bg-white/95 border border-gray-100 rounded-2xl p-3 shadow-xl shadow-gray-100/40 animate-float z-20">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Mic className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Tone Match</p>
                <p className="text-xs font-bold text-gray-800">99.8% Accuracy</p>
              </div>
            </div>

            {/* Floating Badge Right */}
            <div className="absolute -right-12 bottom-1/4 hidden lg:flex items-center gap-2 bg-white/95 border border-gray-100 rounded-2xl p-3 shadow-xl shadow-gray-100/40 animate-float z-20" style={{ animationDelay: '1.5s' }}>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Latency</p>
                <p className="text-xs font-bold text-gray-800">&lt; 800ms Real-Time</p>
              </div>
            </div>

            {/* Main Window */}
            <div className="bg-white rounded-3xl border border-gray-200/80 shadow-2xl shadow-gray-200/50 overflow-hidden text-left">
              {/* Window Title Bar */}
              <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Voice Studio Preview</span>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">Live demo</span>
              </div>

              {/* Console Body */}
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                {/* Left Side: Input */}
                <div className="p-6 sm:p-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Audio Input</span>
                    <span className="text-xs font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md">English (US)</span>
                  </div>
                  <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 min-h-[120px] flex flex-col justify-between">
                    <p className={`text-sm text-gray-700 leading-relaxed transition-opacity duration-500 ${isPlaying ? 'opacity-100' : 'opacity-75'}`}>
                      "Hey, welcome to Vocalis AI. I'm speaking English right now, but watch how my voice is translated into Spanish while keeping my original tone, accent, and style."
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                      <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
                      <span className="text-xs text-gray-400">{isPlaying ? 'Playing original voice...' : 'Source audio ready'}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Output */}
                <div className="p-6 sm:p-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">AI Cloned Translation</span>
                    <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">Spanish (ES)</span>
                  </div>
                  <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 min-h-[120px] flex flex-col justify-between">
                    <p className={`text-sm text-gray-700 leading-relaxed font-medium transition-all duration-1000 ${isPlaying ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-1'}`}>
                      "Hola, bienvenido a Vocalis AI. Estoy hablando en inglés en este momento, pero mira cómo se traduce mi voz al español manteniendo mi tono, acento y estilo original."
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                      <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-indigo-500 animate-pulse' : 'bg-gray-300'}`} />
                      <span className="text-xs text-gray-400">{isPlaying ? 'Synthesizing Spanish clone...' : 'Ready to translate'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Waveform and Playback Bar */}
              <div className="border-t border-gray-100 p-6 flex flex-col sm:flex-row items-center gap-4 bg-gray-50/30">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex-shrink-0 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>

                <div className="flex-1 w-full space-y-1.5">
                  {/* Waveform Animation */}
                  <div className="flex items-end justify-center gap-0.5 h-10 w-full overflow-hidden">
                    {Array.from({ length: 70 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full bg-indigo-500 transition-all duration-300 ${isPlaying ? 'opacity-80' : 'opacity-20'}`}
                        style={{
                          height: isPlaying ? `${Math.sin(i * 0.25) * 15 + Math.random() * 20 + 10}px` : '4px',
                          animationDelay: `${(i * 0.02) % 1}s`,
                        }}
                      />
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 px-1">
                    <span>0:{isPlaying ? '18' : '00'}</span>
                    <span>0:32</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-bold gradient-text mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to go <span className="gradient-text">global</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              A complete voice translation platform built for creators, teams, and enterprises.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-6 card-hover group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline Explainer */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How it <span className="gradient-text">works</span>
            </h2>
            <p className="text-lg text-gray-500">Four steps. Seconds to complete.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', icon: <Mic className="w-6 h-6" />, title: 'Record', desc: 'Speak or upload an audio file in any language' },
              { step: '02', icon: <Zap className="w-6 h-6" />, title: 'Transcribe', desc: 'Groq Whisper converts speech to text instantly' },
              { step: '03', icon: <Globe className="w-6 h-6" />, title: 'Translate', desc: 'Gemini AI translates with emotional context' },
              { step: '04', icon: <Volume2 className="w-6 h-6" />, title: 'Synthesize', desc: 'ElevenLabs speaks in your cloned voice' },
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                {i < 3 && (
                  <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-indigo-200 to-violet-200" />
                )}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-indigo-500/25 relative z-10">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-indigo-400 mb-1">{item.step}</div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="py-24 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by <span className="gradient-text">creators worldwide</span>
            </h2>
            <p className="text-lg text-gray-500">Join thousands of professionals breaking language barriers.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 card-hover">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-base leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, <span className="gradient-text">transparent</span> pricing</h2>
            <p className="text-lg text-gray-500">Start free. Scale as you grow.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Free',
                price: '$0',
                period: '/month',
                desc: 'Perfect to try Vocalis AI',
                features: ['10 minutes/month', '5 languages', 'Default voices', '1 GB storage', 'Community support'],
                cta: 'Get Started Free',
                highlighted: false,
              },
              {
                name: 'Creator',
                price: '$29',
                period: '/month',
                desc: 'For content creators & freelancers',
                features: ['120 minutes/month', '50+ languages', '3 cloned voices', '10 GB storage', 'Priority support', 'Commercial license'],
                cta: 'Start Creating',
                highlighted: true,
              },
              {
                name: 'Business',
                price: '$99',
                period: '/month',
                desc: 'For teams & enterprises',
                features: ['Unlimited minutes', '50+ languages', 'Unlimited cloned voices', '100 GB storage', 'Dedicated support', 'API access', 'Team management'],
                cta: 'Contact Sales',
                highlighted: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`rounded-2xl p-6 border ${plan.highlighted
                  ? 'bg-gradient-to-b from-indigo-600 to-violet-700 border-transparent text-white shadow-2xl shadow-indigo-500/30 scale-105'
                  : 'bg-white border-gray-200'
                }`}
              >
                <div className="mb-6">
                  <p className={`text-sm font-semibold mb-1 ${plan.highlighted ? 'text-indigo-200' : 'text-indigo-600'}`}>{plan.name}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className={`text-sm pb-1 ${plan.highlighted ? 'text-indigo-200' : 'text-gray-500'}`}>{plan.period}</span>
                  </div>
                  <p className={`text-sm mt-2 ${plan.highlighted ? 'text-indigo-200' : 'text-gray-500'}`}>{plan.desc}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <Check className={`w-4 h-4 flex-shrink-0 ${plan.highlighted ? 'text-indigo-200' : 'text-indigo-500'}`} />
                      <span className={plan.highlighted ? 'text-indigo-100' : 'text-gray-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block text-center py-3 px-6 rounded-xl font-semibold text-sm transition-all ${plan.highlighted
                    ? 'bg-white text-indigo-700 hover:bg-indigo-50'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently <span className="gradient-text">asked</span>
            </h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-4 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to speak to the world?
          </h2>
          <p className="text-indigo-200 text-lg mb-8">
            Join 10,000+ creators and professionals using Vocalis AI today.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-8 py-4 rounded-xl text-base transition-all hover:-translate-y-0.5 shadow-xl">
            Start Free — No Credit Card Required <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-16 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <img src="/logo.png" alt="Vocalis AI Logo" className="w-8 h-8 object-contain" />
              <span className="text-lg font-bold text-white">Vocalis AI</span>
            </Link>
            <p className="text-sm leading-relaxed">The world's most advanced voice translation platform. Speak globally, sound local.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              {['Features', 'Pricing', 'Voice Cloning', 'API Docs', 'Changelog'].map(link => (
                <li key={link}><Link href="#" className="hover:text-white transition-colors">{link}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'].map(link => (
                <li key={link}><Link href="#" className="hover:text-white transition-colors">{link}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Stay Updated</h4>
            <p className="text-sm mb-4">Get product updates and AI news.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="you@example.com"
                className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <button className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2024 Vocalis AI. All rights reserved.</p>
          <p>Built with Groq · Gemini · ElevenLabs · Supabase</p>
        </div>
      </footer>
    </div>
  )
}
