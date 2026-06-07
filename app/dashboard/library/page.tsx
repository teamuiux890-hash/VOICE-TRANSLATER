'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Translation } from '@/types'
import { Library, Search, Download, Trash2, Play, Pause, Mic, Filter, Globe } from 'lucide-react'

export default function LibraryPage() {
  const [translations, setTranslations] = useState<Translation[]>([])
  const [filtered, setFiltered] = useState<Translation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null)
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<string | null>(null)
  const PER_PAGE = 10
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('translations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        setTranslations(data || [])
        setFiltered(data || [])
      } else {
        // Load local translations for demo mode
        const localData = localStorage.getItem('vocalis_local_translations')
        const list = localData ? JSON.parse(localData) : []
        setTranslations(list)
        setFiltered(list)
      }
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!search) { setFiltered(translations); return }
    const q = search.toLowerCase()
    setFiltered(translations.filter(t =>
      (t.title || '').toLowerCase().includes(q) ||
      (t.source_language || '').toLowerCase().includes(q) ||
      (t.target_language || '').toLowerCase().includes(q) ||
      (t.transcription || '').toLowerCase().includes(q)
    ))
    setPage(1)
  }, [search, translations])

  const handlePlay = (t: Translation) => {
    if (!t.output_audio_url) return
    if (playingId === t.id) {
      audioEl?.pause()
      setPlayingId(null)
      setAudioEl(null)
      return
    }
    audioEl?.pause()
    const audio = new Audio(t.output_audio_url)
    audio.onended = () => { setPlayingId(null); setAudioEl(null) }
    audio.play()
    setPlayingId(t.id)
    setAudioEl(audio)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this translation?')) return
    setDeleting(id)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('translations').delete().eq('id', id)
    } else {
      const localData = localStorage.getItem('vocalis_local_translations')
      if (localData) {
        const list = JSON.parse(localData).filter((x: any) => x.id !== id)
        localStorage.setItem('vocalis_local_translations', JSON.stringify(list))
      }
    }
    setTranslations(t => t.filter(x => x.id !== id))
    setDeleting(null)
  }

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset Library</h1>
          <p className="text-gray-500 text-sm mt-1">{translations.length} translations saved</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by title, language, or content..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 shimmer rounded-xl" />)}
          </div>
        ) : paginated.length === 0 ? (
          <div className="py-20 text-center">
            <Library className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-700 mb-1">{search ? 'No results found' : 'Library is empty'}</h3>
            <p className="text-sm text-gray-400">{search ? 'Try a different search term' : 'Start translating to build your library'}</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-4">Title</div>
              <div className="col-span-2">Languages</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-4 text-right">Actions</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-50">
              {paginated.map((t) => (
                <div key={t.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors group">
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <Mic className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{t.title || 'Untitled Translation'}</p>
                      {t.transcription && (
                        <p className="text-xs text-gray-400 truncate">{t.transcription.slice(0, 50)}...</p>
                      )}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <span className="font-medium">{t.source_language || 'auto'}</span>
                      <Globe className="w-3 h-3" />
                      <span className="font-medium">{t.target_language || '?'}</span>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <span className="text-xs text-gray-500">{new Date(t.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="col-span-4 flex items-center justify-end gap-2">
                    {t.output_audio_url && (
                      <button
                        onClick={() => handlePlay(t)}
                        className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all"
                      >
                        {playingId === t.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        {playingId === t.id ? 'Pause' : 'Play'}
                      </button>
                    )}
                    {t.output_audio_url && (
                      <a
                        href={t.output_audio_url}
                        download={`${t.title || 'translation'}.mp3`}
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-all"
                      >
                        <Download className="w-3.5 h-3.5" /> MP3
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(t.id)}
                      disabled={deleting === t.id}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
