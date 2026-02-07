export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-inner">
          <p className="footer-tagline">
            Stop starting. Start parking.
          </p>
          <div className="footer-links">
            <a
              href="https://buymeacoffee.com/notyetdude"
              className="link coffee-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              ☕ Buy me a coffee
            </a>
            <span className="footer-sep">·</span>
            <span className="footer-credit">
              Made with patience by{' '}
              <a
                href="https://theviking.io/"
                className="link"
                target="_blank"
                rel="noopener noreferrer"
              >
                The Viking
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
