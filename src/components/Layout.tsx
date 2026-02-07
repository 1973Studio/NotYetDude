import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Footer from './Footer'

interface LayoutProps {
  children: ReactNode
  wide?: boolean
  headerRight?: ReactNode
}

export default function Layout({ children, wide, headerRight }: LayoutProps) {
  return (
    <div className="layout">
      <header>
        <div className={`container ${wide ? 'container-wide' : ''}`}>
          <div className="header-inner">
            <Link to="/" className="logo">notyetdude</Link>
            {headerRight && (
              <div className="header-actions">
                {headerRight}
              </div>
            )}
          </div>
        </div>
      </header>

      <main>
        <div className={`container ${wide ? 'container-wide' : ''}`}>
          {children}
        </div>
      </main>

      <Footer />
    </div>
  )
}
