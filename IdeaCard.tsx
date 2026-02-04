import { Idea, IdeaStatus } from '../types'
import { supabase } from '../lib/supabase'

interface IdeaCardProps {
  idea: Idea
  onUpdate: () => void
}

const STATUS_LABELS: Record<IdeaStatus, string> = {
  parked: '🅿️ Parked',
  snoozed: '😴 Snoozed',
  building: '🚀 Building',
  killed: '💀 Killed'
}

export default function IdeaCard({ idea, onUpdate }: IdeaCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleAction = async (action: 'build' | 'snooze' | 'kill' | 'park') => {
    const updates: Record<string, Partial<Idea>> = {
      build: { 
        status: 'building', 
        resolved_at: new Date().toISOString() 
      },
      snooze: { 
        status: 'snoozed', 
        remind_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        snooze_count: idea.snooze_count + 1
      },
      kill: { 
        status: 'killed', 
        resolved_at: new Date().toISOString() 
      },
      park: { 
        status: 'parked', 
        resolved_at: null, 
        remind_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() 
      }
    }

    const { error } = await supabase
      .from('ideas')
      .update(updates[action])
      .eq('id', idea.id)

    if (error) {
      console.error('Error updating idea:', error)
      return
    }

    onUpdate()
  }

  const renderActions = () => {
    switch (idea.status) {
      case 'parked':
      case 'snoozed':
        return (
          <>
            <button className="action-btn build" onClick={() => handleAction('build')}>
              🚀 Build it
            </button>
            <button className="action-btn snooze" onClick={() => handleAction('snooze')}>
              😴 Not yet
            </button>
            <button className="action-btn" onClick={() => handleAction('kill')}>
              💀 Kill
            </button>
          </>
        )
      case 'building':
        return (
          <>
            <button className="action-btn" onClick={() => handleAction('park')}>
              🅿️ Re-park
            </button>
            <button className="action-btn" onClick={() => handleAction('kill')}>
              💀 Kill
            </button>
          </>
        )
      case 'killed':
        return (
          <button className="action-btn" onClick={() => handleAction('park')}>
            🅿️ Revive
          </button>
        )
      default:
        return null
    }
  }

  const showReminder = idea.status === 'parked' || idea.status === 'snoozed'

  return (
    <div className="idea-card">
      <div className="idea-header">
        <h3 className="idea-title">{idea.title}</h3>
        <span className={`idea-status status-${idea.status}`}>
          {STATUS_LABELS[idea.status]}
        </span>
      </div>
      
      {idea.description && (
        <p className="idea-description">{idea.description}</p>
      )}
      
      <div className="idea-meta">
        <div className="idea-dates">
          <span>Parked: {formatDate(idea.created_at)}</span>
          {showReminder && idea.remind_at && (
            <span>Reminder: {formatDate(idea.remind_at)}</span>
          )}
          {idea.snooze_count > 0 && (
            <span className="snooze-count">
              (snoozed {idea.snooze_count}x)
            </span>
          )}
        </div>
        <div className="idea-actions">
          {renderActions()}
        </div>
      </div>
    </div>
  )
}
