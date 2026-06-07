'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Mic, LayoutDashboard, Wand2, Library, Settings,
  ChevronLeft, ChevronRight, LogOut, Bell, Search,
  Dna, User, CreditCard, Sliders
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/studio', icon: Mic, label: 'Voice Studio' },
  { href: '/dashboard/cloning', icon: Dna, label: 'Cloning Lab' },
  { href: '/dashboard/library', icon: Library, label: 'Asset Library' },
]

const SETTINGS_ITEMS = [
  { href: '/dashboard/settings', icon: User, label: 'Profile' },
  { href: '/dashboard/settings/billing', icon: CreditCard, label: 'Billing' },
  { href: '/dashboard/settings/preferences', icon: Sliders, label: 'Preferences' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [userName, setUserName] = useState('User')
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Voice Cloned Successfully', description: 'Your custom voice model is ready to use.', time: '2 mins ago', unread: true },
    { id: 2, title: 'Translation Completed', description: 'English to Spanish audio synthesized.', time: '1 hour ago', unread: true },
    { id: 3, title: 'Welcome to Vocalis AI', description: 'Get started by creating your first voice translation.', time: '1 day ago', unread: false }
  ])

  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('full_name').eq('user_id', user.id).single()
        if (data?.full_name) {
          setUserName(data.full_name)
        }
      } else {
        const localProfile = localStorage.getItem('vocalis_demo_profile')
        if (localProfile) {
          const parsed = JSON.parse(localProfile)
          if (parsed.full_name) {
            setUserName(parsed.full_name)
          }
        }
      }
    }
    loadProfile()
    
    // Check every second to react to saves in settings
    const interval = setInterval(loadProfile, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`flex flex-col bg-white border-r border-gray-100 transition-all duration-300 flex-shrink-0 ${collapsed ? 'w-[72px]' : 'w-[240px]'}`}>
        {/* Logo */}
        <div className={`flex items-center h-16 border-b border-gray-100 px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Vocalis AI Logo" className="w-8 h-8 object-contain" />
              <span className="text-lg font-bold text-gray-900">Vocalis</span>
            </Link>
          )}
          {collapsed && (
            <img src="/logo.png" alt="Vocalis AI Logo" className="w-8 h-8 object-contain" />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {/* Main nav */}
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`${isActive(href) ? 'sidebar-item-active' : 'sidebar-item'} ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          ))}

          <div className="pt-4">
            {!collapsed && <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Settings</p>}
            {collapsed && <div className="h-px bg-gray-100 mx-2 my-2" />}
            {SETTINGS_ITEMS.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className={`${isActive(href) ? 'sidebar-item-active' : 'sidebar-item'} ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            ))}
          </div>
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className={`sidebar-item text-red-500 hover:text-red-600 hover:bg-red-50 w-full ${collapsed ? 'justify-center px-0' : ''}`}
            title={collapsed ? 'Sign Out' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Collapse Toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-64">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search translations..."
                className="bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 relative"
              >
                <Bell className="w-4 h-4" />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
                )}
              </button>

              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 py-2 animate-fade-in-up">
                    <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                      <span className="font-semibold text-gray-900 text-sm">Notifications</span>
                      <button 
                        onClick={() => setNotifications(notifications.map(n => ({ ...n, unread: false })))}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-gray-400 text-xs">No notifications yet.</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-2.5 ${n.unread ? 'bg-indigo-50/20' : ''}`}>
                            <div className={`w-1.5 h-1.5 mt-2 rounded-full flex-shrink-0 ${n.unread ? 'bg-indigo-500' : 'bg-transparent'}`} />
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-gray-900">{n.title}</p>
                              <p className="text-[11px] text-gray-500 mt-0.5 leading-normal">{n.description}</p>
                              <span className="text-[10px] text-gray-400 mt-1 block">{n.time}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link href="/dashboard/settings" className="flex items-center gap-2" title={userName}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold uppercase">
                {userName ? userName[0] : 'U'}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
