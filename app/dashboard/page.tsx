'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Mic, Library, Dna, TrendingUp, Clock, ArrowRight, Zap, Globe } from 'lucide-react'
import { Translation, UsageStats, UserProfile } from '@/types'

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [translations, setTranslations] = useState<Translation[]>([])
  const [usage, setUsage] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Fallback to local storage for demo mode
        const localProfile = localStorage.getItem('vocalis_demo_profile')
        if (localProfile) {
          setProfile(JSON.parse(localProfile))
        } else {
          setProfile({
            full_name: 'Guest User',
            onboarding_completed: true,
            primary_language: 'en',
            tone: 'professional',
          } as any)
        }
        const localTrans = localStorage.getItem('vocalis_local_translations')
        const list = localTrans ? JSON.parse(localTrans).slice(0, 5) : []
        setTranslations(list)
        setUsage({
          minutes_transcribed: 0.8,
          characters_synthesized: 1420,
          tokens_used: 180,
        } as any)
        setLoading(false)
        return
      }

      const month = new Date().toISOString().slice(0, 7)

      const [profileRes, translationsRes, usageRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('translations').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('usage_stats').select('*').eq('user_id', user.id).eq('month', month).single(),
      ])

      setProfile(profileRes.data)
      setTranslations(translationsRes.data || [])
      setUsage(usageRes.data)
      setLoading(false)
    }
    loadData()
  }, [])

  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const minutesUsed = usage?.minutes_transcribed || 0
  const charsUsed = usage?.characters_synthesized || 0

  const STAT_CARDS = [
    {
      label: 'Translations This Month',
      value: translations.length.toString(),
      icon: <Globe className="w-5 h-5" />,
      color: 'from-indigo-500 to-violet-500',
      change: '+12%',
    },
    {
      label: 'Minutes Transcribed',
      value: `${minutesUsed.toFixed(1)}m`,
      icon: <Zap className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500',
      change: '+5%',
    },
    {
      label: 'Characters Synthesized',
      value: charsUsed > 1000 ? `${(charsUsed / 1000).toFixed(1)}K` : charsUsed.toString(),
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'from-violet-500 to-purple-500',
      change: '+18%',
    },
    {
      label: 'Files in Library',
      value: translations.length.toString(),
      icon: <Library className="w-5 h-5" />,
      color: 'from-emerald-500 to-teal-500',
      change: 'Total',
    },
  ]

  const QUICK_ACTIONS = [
    { href: '/dashboard/studio', icon: <Mic className="w-6 h-6" />, label: 'New Translation', desc: 'Start recording or upload audio', color: 'bg-indigo-600 text-white' },
    { href: '/dashboard/cloning', icon: <Dna className="w-6 h-6" />, label: 'Clone Your Voice', desc: 'Upload 1-minute sample', color: 'bg-violet-600 text-white' },
    { href: '/dashboard/library', icon: <Library className="w-6 h-6" />, label: 'Asset Library', desc: 'Browse all translations', color: 'bg-gray-900 text-white' },
  ]

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-64 shimmer rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 shimmer rounded-2xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Welcome back, <span className="gradient-text">{firstName}</span> 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening with your Voice Studio today.</p>
        </div>
        <Link href="/dashboard/studio" className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2 hidden sm:flex">
          <Mic className="w-4 h-4" /> New Translation
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-4`}>
              {stat.icon}
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </div>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map((action, i) => (
            <Link key={i} href={action.href} className={`${action.color} rounded-2xl p-5 card-hover flex items-start gap-4`}>
              <div className="opacity-90">{action.icon}</div>
              <div>
                <p className="font-semibold text-base">{action.label}</p>
                <p className="text-sm opacity-70 mt-0.5">{action.desc}</p>
              </div>
              <ArrowRight className="w-5 h-5 opacity-50 ml-auto self-center" />
            </Link>
          ))}
        </div>
      </div>

      {/* Usage */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="stat-card">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-500" /> API Usage This Month
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-600">Transcription (Groq)</span>
                <span className="font-medium text-gray-900">{minutesUsed.toFixed(1)} / 10 min</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: `${Math.min((minutesUsed / 10) * 100, 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-600">Synthesis (ElevenLabs)</span>
                <span className="font-medium text-gray-900">{charsUsed.toLocaleString()} / 10,000 chars</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full" style={{ width: `${Math.min((charsUsed / 10000) * 100, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Translations */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" /> Recent Translations
            </h3>
            <Link href="/dashboard/library" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">View all →</Link>
          </div>
          {translations.length === 0 ? (
            <div className="text-center py-8">
              <Mic className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No translations yet</p>
              <Link href="/dashboard/studio" className="text-sm text-indigo-600 font-medium hover:text-indigo-700">
                Create your first →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {translations.map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <Mic className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{t.title || 'Untitled'}</p>
                    <p className="text-xs text-gray-400">{t.source_language} → {t.target_language}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(t.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
