'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CreditCard, Zap, Mic, TrendingUp } from 'lucide-react'

export default function BillingPage() {
  const [usage, setUsage] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const month = new Date().toISOString().slice(0, 7)
      const { data } = await supabase.from('usage_stats').select('*').eq('user_id', user.id).eq('month', month).single()
      setUsage(data)

      // Fetch ElevenLabs subscription
      try {
        const res = await fetch('/api/voices')
        // Subscription would be fetched from a separate endpoint
      } catch {}

      setLoading(false)
    }
    load()
  }, [])

  const minutesUsed = usage?.minutes_transcribed || 0
  const charsUsed = usage?.characters_synthesized || 0
  const minutesLimit = 10
  const charsLimit = 10000

  const METERS = [
    {
      label: 'Transcription Minutes (Groq)',
      used: minutesUsed,
      limit: minutesLimit,
      unit: 'min',
      icon: <Mic className="w-4 h-4" />,
      color: 'from-indigo-500 to-violet-500',
    },
    {
      label: 'Characters Synthesized (ElevenLabs)',
      used: charsUsed,
      limit: charsLimit,
      unit: 'chars',
      icon: <Zap className="w-4 h-4" />,
      color: 'from-violet-500 to-purple-500',
    },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing & Usage</h1>
        <p className="text-gray-500 text-sm mt-1">Monitor your API usage and plan details</p>
      </div>

      {/* Current Plan */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-indigo-200 text-sm font-medium">Current Plan</p>
            <h2 className="text-3xl font-bold mt-1">Free</h2>
            <p className="text-indigo-200 text-sm mt-1">10 minutes/month · 10K chars/month</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
        </div>
        <button className="mt-6 bg-white text-indigo-700 font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-indigo-50 transition-colors">
          Upgrade to Creator — $29/mo
        </button>
      </div>

      {/* Usage Meters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-500" /> This Month's Usage
        </h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="h-16 shimmer rounded-xl" />)}
          </div>
        ) : (
          <div className="space-y-6">
            {METERS.map((meter, i) => {
              const pct = Math.min((meter.used / meter.limit) * 100, 100)
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${meter.color} flex items-center justify-center text-white`}>
                        {meter.icon}
                      </div>
                      {meter.label}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {meter.used.toLocaleString()} / {meter.limit.toLocaleString()} {meter.unit}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${meter.color} rounded-full transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{pct.toFixed(1)}% used</p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Plan Comparison */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Need more?</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { name: 'Creator', price: '$29', features: ['120 min/month', '50+ languages', '3 cloned voices', 'Commercial license'] },
            { name: 'Business', price: '$99', features: ['Unlimited minutes', 'Unlimited cloning', 'API access', 'Team accounts'] },
          ].map((plan) => (
            <div key={plan.name} className="border border-gray-200 rounded-xl p-4">
              <p className="text-sm font-bold text-gray-900">{plan.name}</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{plan.price}<span className="text-xs text-gray-400 font-normal">/mo</span></p>
              <ul className="mt-3 space-y-1.5">
                {plan.features.map(f => <li key={f} className="text-xs text-gray-500">✓ {f}</li>)}
              </ul>
              <button className="mt-4 w-full btn-primary text-xs py-2">Upgrade</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
