import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Idea, IdeaStatus } from '../lib/types'

interface IdeaCardProps {
  idea: Idea
  onUpdate: () => void
}

const STATUS_CONFIG: Record<IdeaStatus, { icon: string; label: string; color: string }> = {
  parked: { icon: '🅿️', label: 'Parked', color: 'var(--color-parked)' },
  building: { icon: '🚀', label: 'Building', color: 'var(--color-building)' },
  snoozed: { icon: '😴', label: 'Snoozed', color: 'var(--color-snoozed)' },
  killed: { icon: '💀', label: 'Killed', color: 'var(--color-killed)' },
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`
  if (days < 60) return '1 month ago'
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? 's' : ''} ago`
}

function daysUntil(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const days = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (days <= 0) return 'any day now'
  if (days === 1) return 'tomorrow'
  if (days < 30) return `in ${days} days`
  if (days < 60) return 'in about a month'
  return `in ${Math.floor(days / 30)} months`
}

export default function IdeaCard({ idea, onUpdate }: IdeaCardProps) {
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const config = STATUS_CONFIG[idea.status]

  const handleAction = async (newStatus: IdeaStatus) => {
    setLoading(true)
    try {
      const updates: Record<string, unknown> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      }

      if (newStatus === 'snoozed') {
        const newRemind = new Date()
        newRemind.setDate(newRemind.getDate() + 90)
        updates.remind_at = newRemind.toISOString()
        updates.snooze_count = idea.snooze_count + 1
      }

      if (newStatus === 'building' || newStatus === 'killed') {
        updates.resolved_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('ideas')
        .update(updates)
        .eq('id', idea.id)

      if (error) throw error
      onUpdate()
    } catch (err) {
      console.error('Error updating idea:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`idea-card idea-card--${idea.status}`}
      style={{ '--status-color': config.color } as React.CSSProperties}
    >
      <div className="idea-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="idea-card-status">
          <span className="status-icon">{config.icon}</span>
          <span className="status-label">{config.label}</span>
          {idea.snooze_count > 0 && (
            <span className="snooze-badge">
              snoozed {idea.snooze_count}×
            </span>
          )}
        </div>
        <span className="idea-card-expand">{expanded ? '−' : '+'}</span>
      </div>

      <h3 className="idea-card-title">{idea.title}</h3>

      {idea.description && expanded && (
        <p className="idea-card-description">{idea.description}</p>
      )}

      <div className="idea-card-meta">
        <span>Parked {timeAgo(idea.parked_at)}</span>
        {idea.status === 'parked' && (
          <span>Reminder {daysUntil(idea.remind_at)}</span>
        )}
        {idea.status === 'snoozed' && (
          <span>Next check-in {daysUntil(idea.remind_at)}</span>
        )}
      </div>

      {expanded && (idea.status === 'parked' || idea.status === 'snoozed') && (
        <div className="idea-card-actions">
          <button
            className="btn btn-small btn-build"
            onClick={() => handleAction('building')}
            disabled={loading}
          >
            🚀 Let's build it
          </button>
          <button
            className="btn btn-small btn-snooze"
            onClick={() => handleAction('snoozed')}
            disabled={loading}
          >
            😴 Not yet, dude
          </button>
          <button
            className="btn btn-small btn-kill"
            onClick={() => handleAction('killed')}
            disabled={loading}
          >
            💀 Kill it
          </button>
        </div>
      )}
    </div>
  )
}
