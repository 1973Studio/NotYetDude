import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import IdeaForm from '../components/IdeaForm'
import { Link } from 'react-router-dom'

export default function Home() {
  const [showSuccess, setShowSuccess] = useState(false)
  const [storedEmail, setStoredEmail] = useState('')

  useEffect(() => {
    const email = localStorage.getItem('nyd_email')
    if (email) setStoredEmail(email)
  }, [])

  const handleSuccess = () => {
    setShowSuccess(true)
  }

  const handleParkAnother = () => {
    setShowSuccess(false)
    const email = localStorage.getItem('nyd_email')
    if (email) setStoredEmail(email)
  }

  return (
    <Layout
      headerRight={
        storedEmail ? (
          <Link to="/dashboard" className="btn btn-ghost">
            My Ideas
          </Link>
        ) : null
      }
    >
      <section className="hero animate-fade-in">
        <div className="hero-badge">free forever · no signup required</div>
        <h1>
          Got an idea?
          <br />
          <span className="hero-accent">Not yet, dude.</span>
        </h1>
        <p className="hero-sub">
          Park it. Let it simmer. We'll check in with you in 90 days.
          <br />
          If it still excites you then, maybe it's worth building.
        </p>
      </section>

      <section className="how-it-works animate-fade-in animate-delay-1">
        <div className="step">
          <div className="step-number">1</div>
          <h3>Park it</h3>
          <p>Drop your idea below</p>
        </div>
        <div className="step-arrow">→</div>
        <div className="step">
          <div className="step-number">2</div>
          <h3>Forget it</h3>
          <p>Go do something else</p>
        </div>
        <div className="step-arrow">→</div>
        <div className="step">
          <div className="step-number">3</div>
          <h3>Revisit</h3>
          <p>90 days later, decide</p>
        </div>
      </section>

      <section className="form-section animate-fade-in animate-delay-2">
        {!showSuccess ? (
          <IdeaForm onSuccess={handleSuccess} defaultEmail={storedEmail} />
        ) : (
          <div className="success-message">
            <div className="success-icon">🅿️</div>
            <h3>Idea parked, dude ✓</h3>
            <p>
              We'll check in with you in 90 days.
              <br />
              Now go do something else.
            </p>
            <div className="success-actions">
              <button className="btn btn-secondary" onClick={handleParkAnother}>
                Park another idea
              </button>
              <Link to="/dashboard" className="btn btn-ghost">
                View my ideas
              </Link>
            </div>
          </div>
        )}
      </section>
    </Layout>
  )
}
