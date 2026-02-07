import { useState, FormEvent } from 'react'
import { supabase } from '../lib/supabase'

interface IdeaFormProps {
  onSuccess: () => void
  defaultEmail: string
}

export default function IdeaForm({ onSuccess, defaultEmail }: IdeaFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState(defaultEmail)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Give your idea a name at least, dude.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('We need your email to remind you in 90 days.')
      return
    }

    setLoading(true)

    try {
      // Calculate 90 days from now
      const remindAt = new Date()
      remindAt.setDate(remindAt.getDate() + 90)

      // Upsert user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert({ email: email.toLowerCase().trim() }, { onConflict: 'email' })
        .select('id')
        .single()

      if (userError) throw userError

      // Create the idea
      const { error: ideaError } = await supabase.from('ideas').insert({
        user_id: userData.id,
        title: title.trim(),
        description: description.trim() || null,
        email: email.toLowerCase().trim(),
        status: 'parked',
        parked_at: new Date().toISOString(),
        remind_at: remindAt.toISOString(),
        snooze_count: 0,
      })

      if (ideaError) throw ideaError

      // Store email locally for next time
      localStorage.setItem('nyd_email', email.toLowerCase().trim())

      setTitle('')
      setDescription('')
      onSuccess()
    } catch (err) {
      console.error('Error parking idea:', err)
      setError('Something went wrong. Try again, dude.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="idea-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title">What's the idea?</label>
        <input
          id="title"
          type="text"
          placeholder="e.g. AI-powered dog translator"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          autoComplete="off"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">
          Any more context? <span className="optional">(optional)</span>
        </label>
        <textarea
          id="description"
          placeholder="Why you think it's a good idea, who it's for, how it might work..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={500}
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Your email</label>
        <input
          id="email"
          type="email"
          placeholder="dude@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <span className="form-hint">So we can remind you in 90 days</span>
      </div>

      {error && <div className="form-error">{error}</div>}

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? (
          <>
            <span className="spinner-small" /> Parking...
          </>
        ) : (
          '🅿️ Park this idea'
        )}
      </button>
    </form>
  )
}
