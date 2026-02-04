import { useState, useEffect, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { User } from '@supabase/supabase-js'
import Layout from '../components/Layout'
import IdeaCard from '../components/IdeaCard'
import { supabase } from '../lib/supabase'
import { Idea, IdeaStatus } from '../types'

const TABS: { status: IdeaStatus; icon: string; label: string }[] = [
  { status: 'parked', icon: '🅿️', label: 'Parked' },
  { status: 'snoozed', icon: '😴', label: 'Snoozed' },
  { status: 'building', icon: '🚀', label: 'Building' },
  { status: 'killed', icon: '💀', label: 'Graveyard' },
]

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [currentFilter, setCurrentFilter] = useState<IdeaStatus>('parked')
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [authMessage, setAuthMessage] = useState<{ text: string; isError: boolean } | null>(null)

  // Check auth on mount
  useEffect(() => {
    checkAuth()
    
    // Listen for auth changes (magic link redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user)
        loadIdeas(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      setUser(session.user)
      await loadIdeas(session.user.id)
    }
    setLoading(false)
  }

  const loadIdeas = async (userId: string) => {
    setLoading(true)
    
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading ideas:', error)
    } else {
      setIdeas(data || [])
    }
    
    setLoading(false)
  }

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setAuthLoading(true)
    setAuthMessage(null)

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: window.location.href
      }
    })

    if (error) {
      setAuthMessage({ text: 'Error: ' + error.message, isError: true })
    } else {
      setAuthMessage({ text: '✓ Check your email for the magic link!', isError: false })
    }
    
    setAuthLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIdeas([])
  }

  const getCounts = () => {
    return {
      parked: ideas.filter(i => i.status === 'parked').length,
      snoozed: ideas.filter(i => i.status === 'snoozed').length,
      building: ideas.filter(i => i.status === 'building').length,
      killed: ideas.filter(i => i.status === 'killed').length,
    }
  }

  const filteredIdeas = ideas.filter(i => i.status === currentFilter)
  const counts = getCounts()

  // Auth prompt
  if (!user && !loading) {
    return (
      <Layout wide>
        <div className="auth-prompt">
          <h1>View your ideas</h1>
          <p>Enter your email to get a magic link</p>
          
          <div className="auth-form">
            <form onSubmit={handleAuthSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <button type="submit" className="btn btn-full" disabled={authLoading}>
                {authLoading ? 'Sending...' : 'Send magic link'}
              </button>
            </form>
            {authMessage && (
              <p className={`auth-message ${authMessage.isError ? 'error' : ''}`}>
                {authMessage.text}
              </p>
            )}
          </div>
        </div>
      </Layout>
    )
  }

  // Dashboard
  return (
    <Layout
      wide
      headerRight={
        user && (
          <>
            <span className="user-email">{user.email}</span>
            <button className="btn btn-ghost" onClick={handleLogout}>
              Log out
            </button>
          </>
        )
      }
    >
      <div className="dashboard-header">
        <h1>Your ideas</h1>
        <Link to="/" className="btn btn-small">+ Park new idea</Link>
      </div>

      <div className="tabs">
        {TABS.map(tab => (
          <button
            key={tab.status}
            className={`tab ${currentFilter === tab.status ? 'active' : ''}`}
            onClick={() => setCurrentFilter(tab.status)}
          >
            {tab.icon} {tab.label}
            <span className="tab-count">{counts[tab.status]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner" />
          <p>Loading your ideas...</p>
        </div>
      ) : filteredIdeas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🅿️</div>
          <h3>No ideas here yet</h3>
          <p>Go park some ideas on the home page</p>
        </div>
      ) : (
        <div className="ideas-list">
          {filteredIdeas.map(idea => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onUpdate={() => user && loadIdeas(user.id)}
            />
          ))}
        </div>
      )}
    </Layout>
  )
}
