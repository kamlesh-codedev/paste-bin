import { Link } from 'react-router-dom'

function AuthLayout({ children }) {
  return (
    <main className="auth-layout">
      <section className="auth-panel">
        <Link className="brand auth-brand" to="/">
          <span className="brand-mark" aria-hidden="true">&lt;/&gt;</span>
          <span>PasteVault</span>
        </Link>
        <p className="auth-tagline">Share code. Share ideas.</p>
        <div className="auth-card">{children}</div>
      </section>
      <aside className="auth-aside" aria-hidden="true">
        <p className="eyebrow">Built for developers</p>
        <h1>Keep your snippets useful, organized, and ready to share.</h1>
        <div className="code-window">
          <span>const paste = {'{'}</span>
          <span>  share: 'instantly',</span>
          <span>  expires: 'on your terms',</span>
          <span>{'}'}</span>
        </div>
      </aside>
    </main>
  )
}

export default AuthLayout
