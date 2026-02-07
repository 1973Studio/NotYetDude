import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import type { IdeaStatus } from '../lib/types'

const ACTION_MAP: Record<string, { status: IdeaStatus; icon: string; title: string; message: string }> = {
  build: {
    status: 'building',
    icon: '🚀',
    title: "Let's go!",
    message: "You've decided to build this. Time to make it happen, dude.",
  },
  snooze: {
    status: 'snoozed',
    icon: '😴',
    title: 'Not yet, dude.',
    message: "We'll check in again in another 90 days. No rush.",
  },
  kill: {
    status: 'killed',
    icon: '💀',
    title: 'Idea killed.',
    message: "Rest in peace, little idea. The graveyard is a noble place.",
  },
}

export default function Action() {
  const { ideaId, action } = useParams<{ ideaId: string; action: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ideaTitle, setIdeaTitle] = useState('')
  const [done, setDone] = useState(false)

  const actionConfig = action ? ACTION_MAP[action] : null

  useEffect(() => {
    const processAction = async () => {
      if (!ideaId || !actionConfig) {
        setError("Invalid action link. Something's off, dude.")
        setLoading(false)
        return
      }

      try {
        // Fetch the idea first
        const { data: idea, error: fetchError } = await supabase
          .from('ideas')
          .select('title, email')
          .eq('id', ideaId)
          .single()

        if (fetchError || !idea) {
          setError("Couldn't find that idea. It may have already been removed.")
          setLoading(false)
          return
        }

        setIdeaTitle(idea.title)

        // Store their email
        localStorage.setItem('nyd_email', idea.email)

        // Update the idea
        const updates: Record<string, unknown> = {
          status: actionConfig.status,
          updated_at: new Date().toISOString(),
        }

        if (actionConfig.status === 'snoozed') {
          const newRemind = new Date()
          newRemind.setDate(newRemind.getDate() + 90)
          updates.remind_at = newRemind.toISOString()
          updates.snooze_count = supabase.rpc ? undefined : 1 // Will increment via RPC or trigger
        }

        if (actionConfig.status === 'building' || actionConfig.status === 'killed') {
          updates.resolved_at = new Date().toISOString()
        }

        const { error: updateError } = await supabase
          .from('ideas')
          .update(updates)
          .eq('id', ideaId)

        if (updateError) throw updateError

        setDone(true)
      } catch (err) {
        console.error('Action error:', err)
        setError('Something went wrong processing your action.')
      } finally {
        setLoading(false)
      }
    }

    processAction()
  }, [ideaId, actionConfig])

  if (!actionConfig) {
    return (
      <Layout>
        <div className="action-page animate-fade-in">
          <div className="action-icon">❓</div>
          <h2>Unknown action</h2>
          <p>That link doesn't look right, dude.</p>
          <Link to="/" className="btn btn-primary">Go home</Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="action-page animate-fade-in">
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Processing...</p>
          </div>
        ) : error ? (
          <>
            <div className="action-icon">😬</div>
            <h2>Oops</h2>
            <p>{error}</p>
            <Link to="/" className="btn btn-primary">Go home</Link>
          </>
        ) : done ? (
          <>
            <div className="action-icon">{actionConfig.icon}</div>
            <h2>{actionConfig.title}</h2>
            {ideaTitle && <p className="action-idea-title">"{ideaTitle}"</p>}
            <p>{actionConfig.message}</p>
            <div className="action-links">
              <Link to="/dashboard" className="btn btn-primary">
                View all my ideas
              </Link>
              <Link to="/" className="btn btn-ghost">
                Park another idea
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </Layout>
  )
}
