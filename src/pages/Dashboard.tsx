import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import IdeaCard from '../components/IdeaCard'
import type { Idea, IdeaStatus, IdeaCounts } from '../lib/types'

const TABS: { status: IdeaStatus | 'all'; label: string; icon: string }[] = [
  { status: 'all', label: 'All', icon: '📋' },
  { status: 'parked', label: 'Parked', icon: '🅿️' },
  { status: 'building', label: 'Building', icon: '🚀' },
  { status: 'snoozed', label: 'Snoozed', icon: '😴' },
  { status: 'killed', label: 'Graveyard', icon: '💀' },
]

export default function Dashboard() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [currentFilter, setCurrentFilter] = useState<IdeaStatus | 'all'>('all')
  const [email, setEmail] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [showEmailPrompt, setShowEmailPrompt] = useState(false)

  const loadIdeas = useCallback(async (userEmail: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('email', userEmail.toLowerCase().trim())
        .order('created_at', { ascending: false })

      if (error) throw error
      setIdeas(data || [])
    } catch (err) {
      console.error('Error loading ideas:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const storedEmail = localStorage.getItem('nyd_email')
    if (storedEmail) {
      setEmail(storedEmail)
      loadIdeas(storedEmail)
    } else {
      setShowEmailPrompt(true)
      setLoading(false)
    }
  }, [loadIdeas])

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (emailInput.trim() && emailInput.includes('@')) {
      const cleanEmail = emailInput.toLowerCase().trim()
      localStorage.setItem('nyd_email', cleanEmail)
      setEmail(cleanEmail)
      setShowEmailPrompt(false)
      loadIdeas(cleanEmail)
    }
  }

  const counts: IdeaCounts & { all: number } = {
    all: ideas.length,
    parked: ideas.filter((i) => i.status === 'parked').length,
    building: ideas.filter((i) => i.status === 'building').length,
    snoozed: ideas.filter((i) => i.status === 'snoozed').length,
    killed: ideas.filter((i) => i.status === 'killed').length,
  }

  const filteredIdeas =
    currentFilter === 'all'
      ? ideas
      : ideas.filter((i) => i.status === currentFilter)

  if (showEmailPrompt) {
    return (
      <Layout>
        <div className="email-prompt animate-fade-in">
          <h2>What's your email, dude?</h2>
          <p>We'll find your parked ideas.</p>
          <form onSubmit={handleEmailSubmit} className="email-prompt-form">
            <input
              type="email"
              placeholder="dude@example.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Find my ideas
            </button>
          </form>
        </div>
      </Layout>
    )
  }

  return (
    <Layout
      wide
      headerRight={
        <div className="header-actions">
          <span className="header-email">{email}</span>
          <Link to="/" className="btn btn-primary btn-small">
            + Park an idea
          </Link>
        </div>
      }
    >
      <div className="dashboard animate-fade-in">
        <div className="dashboard-header">
          <h2>Your Ideas</h2>
          <p className="dashboard-subtitle">
            {counts.all === 0
              ? "You haven't parked anything yet."
              : `${counts.all} idea${counts.all !== 1 ? 's' : ''} parked`}
          </p>
        </div>

        {counts.all > 0 && (
          <div className="tabs">
            {TABS.map((tab) => (
              <button
                key={tab.status}
                className={`tab ${currentFilter === tab.status ? 'active' : ''}`}
                onClick={() => setCurrentFilter(tab.status)}
              >
                {tab.icon} {tab.label}
                <span className="tab-count">
                  {counts[tab.status as keyof typeof counts]}
                </span>
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading your ideas...</p>
          </div>
        ) : filteredIdeas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              {currentFilter === 'all' ? '🅿️' : TABS.find((t) => t.status === currentFilter)?.icon}
            </div>
            <h3>
              {currentFilter === 'all'
                ? 'No ideas parked yet'
                : `No ${currentFilter} ideas`}
            </h3>
            <p>
              {currentFilter === 'all' ? (
                <Link to="/" className="link">
                  Go park your first idea →
                </Link>
              ) : (
                'Check back later, dude.'
              )}
            </p>
          </div>
        ) : (
          <div className="ideas-grid">
            {filteredIdeas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onUpdate={() => loadIdeas(email)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
