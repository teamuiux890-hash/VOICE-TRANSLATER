'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { VoiceProfile } from '@/types'
import { Upload, Loader2, Check, Dna, Trash2, Mic, AlertCircle, X, Info } from 'lucide-react'

export default function CloningLabPage() {
  const [voiceName, setVoiceName] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [voices, setVoices] = useState<VoiceProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        try {
          const { data, error } = await supabase.from('voice_profiles').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
          if (error) throw error
          setVoices(data || [])
          localStorage.setItem(`vocalis_voice_profiles_${user.id}`, JSON.stringify(data || []))
        } catch (dbErr) {
          console.warn('Database voice_profiles fetch failed, falling back to local storage:', dbErr)
          const localData = localStorage.getItem(`vocalis_voice_profiles_${user.id}`)
          if (localData) {
            setVoices(JSON.parse(localData))
          }
        }
      } else {
        // Guest mode local storage load
        const localData = localStorage.getItem('vocalis_voice_profiles_guest')
        if (localData) {
          setVoices(JSON.parse(localData))
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && dropped.type.includes('audio')) setFile(dropped)
  }

  const handleClone = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !voiceName) return

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const targetUserId = user?.id || '00000000-0000-0000-0000-000000000000'
      const formData = new FormData()
      formData.append('audio', file)
      formData.append('name', voiceName)
      formData.append('description', description)
      formData.append('userId', targetUserId)

      const res = await fetch('/api/clone', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Cloning failed')

      if (data.isDemo) {
        setSuccess(`ℹ️ Voice simulated successfully! (Created "${data.name}" for testing)`)
      } else {
        setSuccess(`✅ Voice "${voiceName}" cloned successfully!`)
      }
      setVoiceName('')
      setDescription('')
      setFile(null)

      // Refresh list
      let updatedVoices = []
      if (user) {
        try {
          const { data: updated, error: dbErr } = await supabase.from('voice_profiles').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
          if (dbErr) throw dbErr
          updatedVoices = updated || []
          localStorage.setItem(`vocalis_voice_profiles_${user.id}`, JSON.stringify(updatedVoices))
        } catch (dbErr) {
          console.warn('Database voice_profiles fetch failed, updating local storage:', dbErr)
          const localData = localStorage.getItem(`vocalis_voice_profiles_${user.id}`)
          let currentLocal = localData ? JSON.parse(localData) : []
          if (data && data.profile) {
            currentLocal = [data.profile, ...currentLocal.filter((v: any) => v.id !== data.profile.id)]
          }
          localStorage.setItem(`vocalis_voice_profiles_${user.id}`, JSON.stringify(currentLocal))
          updatedVoices = currentLocal
        }
      } else {
        // Guest/Demo mode local storage save
        const localData = localStorage.getItem('vocalis_voice_profiles_guest')
        let currentLocal = localData ? JSON.parse(localData) : []
        if (data && data.profile) {
          currentLocal = [data.profile, ...currentLocal.filter((v: any) => v.id !== data.profile.id)]
        }
        localStorage.setItem('vocalis_voice_profiles_guest', JSON.stringify(currentLocal))
        updatedVoices = currentLocal
      }
      setVoices(updatedVoices)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (voice: VoiceProfile) => {
    if (!confirm(`Delete "${voice.name}"? This cannot be undone.`)) return
    setDeleting(voice.id)
    try {
      // Delete from ElevenLabs
      if (voice.elevenlabs_voice_id && voice.elevenlabs_voice_id !== 'EXAVITQu4vr4xnSDxMaL') {
        await fetch(`/api/voices/${voice.elevenlabs_voice_id}`, { method: 'DELETE' }).catch(() => {})
      }
      // Delete from DB/localStorage
      if (user) {
        try {
          await supabase.from('voice_profiles').delete().eq('id', voice.id)
        } catch {}
        const localData = localStorage.getItem(`vocalis_voice_profiles_${user.id}`)
        if (localData) {
          const updatedLocal = JSON.parse(localData).filter((v: any) => v.id !== voice.id)
          localStorage.setItem(`vocalis_voice_profiles_${user.id}`, JSON.stringify(updatedLocal))
        }
      } else {
        const localData = localStorage.getItem('vocalis_voice_profiles_guest')
        if (localData) {
          const updatedLocal = JSON.parse(localData).filter((v: any) => v.id !== voice.id)
          localStorage.setItem('vocalis_voice_profiles_guest', JSON.stringify(updatedLocal))
        }
      }
      setVoices(v => v.filter(x => x.id !== voice.id))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Voice Cloning Lab</h1>
        <p className="text-gray-500 text-sm mt-1">Upload an audio sample to clone your voice for multilingual synthesis</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Dna className="w-4 h-4 text-violet-500" /> Clone New Voice
          </h2>

          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6 flex items-start gap-3">
            <Info className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-indigo-700">
              <p className="font-semibold mb-1">For best results:</p>
              <ul className="space-y-0.5 text-xs text-indigo-600">
                <li>• Upload 1–3 minutes of clear, noise-free audio</li>
                <li>• Use consistent speaking tone and pace</li>
                <li>• Avoid background music or noise</li>
              </ul>
            </div>
          </div>

          <form onSubmit={handleClone} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Voice Name *</label>
              <input
                type="text"
                value={voiceName}
                onChange={e => setVoiceName(e.target.value)}
                className="input-field"
                placeholder="e.g., My Professional Voice"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Description</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="input-field"
                placeholder="Optional description"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Audio Sample *</label>
              <div
                onDrop={handleDrop}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragOver ? 'border-violet-400 bg-violet-50' : file ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'}`}
              >
                <label className="cursor-pointer">
                  <input type="file" accept="audio/*,.mp3,.wav,.m4a" className="hidden" onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />
                  {file ? (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                        <Check className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="text-sm font-medium text-green-700">{file.name}</p>
                      <p className="text-xs text-green-600">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
                      <button type="button" onClick={() => setFile(null)} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 mx-auto">
                        <X className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                        <Upload className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-600">Drop audio here or click to browse</p>
                      <p className="text-xs text-gray-400">MP3, WAV, M4A • Max 25MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl px-4 py-3 text-sm">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-xl px-4 py-3 text-sm">
                <Check className="w-4 h-4" /> {success}
              </div>
            )}

            <button
              type="submit"
              disabled={uploading || !voiceName || !file}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Cloning Voice...</>
              ) : (
                <><Dna className="w-4 h-4" /> Clone Voice</>
              )}
            </button>
          </form>
        </div>

        {/* My Voice Profiles */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-6 flex items-center justify-between">
            <span className="flex items-center gap-2"><Mic className="w-4 h-4 text-violet-500" /> My Voice Profiles</span>
            <span className="text-xs text-gray-400 font-normal">{voices.length} voice{voices.length !== 1 ? 's' : ''}</span>
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-16 shimmer rounded-xl" />)}
            </div>
          ) : voices.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Dna className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="font-semibold text-gray-700 mb-1">No voices yet</h3>
              <p className="text-sm text-gray-400">Clone your first voice using the form</p>
            </div>
          ) : (
            <div className="space-y-3">
              {voices.map(voice => (
                <div key={voice.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-violet-100 hover:bg-violet-50/30 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0 shadow-lg shadow-violet-500/20">
                    {voice.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{voice.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${voice.status === 'ready' ? 'bg-green-100 text-green-700' : voice.status === 'training' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {voice.status === 'ready' ? '✓ Ready' : voice.status === 'training' ? '⏳ Training' : '✗ Failed'}
                      </span>
                      <span className="text-xs text-gray-400">{new Date(voice.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(voice)}
                    disabled={deleting === voice.id}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    {deleting === voice.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
