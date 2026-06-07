'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Camera, Save, Loader2, Check, AlertCircle, Key } from 'lucide-react'

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
        setProfile({ ...(data as any || {}), email: user.email })
        setName(data?.full_name || '')
      } else {
        // Fallback for demo mode
        const localProfile = localStorage.getItem('vocalis_demo_profile')
        const parsed = localProfile ? JSON.parse(localProfile) : { full_name: 'Guest User', email: 'guest@example.com' }
        setProfile({ full_name: parsed.full_name, email: parsed.email || 'guest@example.com' })
        setName(parsed.full_name || 'Guest User')
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error: updateError } = await supabase.from('profiles').update({ full_name: name }).eq('user_id', user.id)
        if (updateError) throw updateError
      } else {
        // Update local storage in demo mode
        const localProfile = localStorage.getItem('vocalis_demo_profile')
        const parsed = localProfile ? JSON.parse(localProfile) : {}
        const updated = { ...parsed, full_name: name }
        localStorage.setItem('vocalis_demo_profile', JSON.stringify(updated))
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordReset = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email) {
      await supabase.auth.resetPasswordForEmail(user.email)
      alert('Password reset email sent!')
    } else {
      alert('Demo Mode: Password reset email simulation sent!')
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile & Security</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account information</p>
      </div>

      {/* Avatar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Profile</h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {name?.[0]?.toUpperCase() || 'U'}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-gray-50">
              <Camera className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{name || 'User'}</p>
            <p className="text-sm text-gray-500">{profile?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Email</label>
            <input type="email" value={profile?.email || ''} className="input-field opacity-60 cursor-not-allowed" disabled />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed here</p>
          </div>
        </div>

        {error && <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg px-3 py-2 text-sm mt-4"><AlertCircle className="w-4 h-4" />{error}</div>}

        <button onClick={handleSave} disabled={saving} className="btn-primary mt-4 flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Security */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Key className="w-4 h-4 text-indigo-500" /> Security
        </h2>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="text-sm font-medium text-gray-900">Password</p>
            <p className="text-xs text-gray-500">Last changed: Never</p>
          </div>
          <button onClick={handlePasswordReset} className="btn-secondary text-sm py-2 px-4">
            Reset Password
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-red-600 mb-4">Danger Zone</h2>
        <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
          <div>
            <p className="text-sm font-medium text-gray-900">Delete Account</p>
            <p className="text-xs text-gray-500">This will permanently delete all your data</p>
          </div>
          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}
