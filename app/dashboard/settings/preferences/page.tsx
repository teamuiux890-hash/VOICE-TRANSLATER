'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LANGUAGES } from '@/types'
import { Sliders, Save, Loader2, Check } from 'lucide-react'

const TONES = ['Professional', 'Casual', 'Energetic']

export default function PreferencesPage() {
  const [inputLang, setInputLang] = useState('auto')
  const [outputLang, setOutputLang] = useState('es')
  const [tone, setTone] = useState('professional')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
      if (data) {
        setOutputLang(data.primary_language || 'es')
        setTone(data.tone || 'professional')
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').update({ primary_language: outputLang, tone }).eq('user_id', user!.id)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSaving(false)
  }

  return (
    <div className="p-6 lg:p-8 max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Preferences</h1>
        <p className="text-gray-500 text-sm mt-1">Set default languages and output tone</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-500" /> Language Defaults
        </h2>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Default Input Language</label>
          <select value={inputLang} onChange={e => setInputLang(e.target.value)} className="input-field">
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Default Output Language</label>
          <select value={outputLang} onChange={e => setOutputLang(e.target.value)} className="input-field">
            {LANGUAGES.filter(l => l.code !== 'auto').map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Output Tone</label>
          <div className="grid grid-cols-3 gap-3">
            {TONES.map(t => (
              <button
                key={t}
                onClick={() => setTone(t.toLowerCase())}
                className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${tone === t.toLowerCase() ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Preferences'}
        </button>
      </div>
    </div>
  )
}
