import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <main className="not-found-page">
      <Link className="brand" to="/"><span className="brand-mark" aria-hidden="true">&lt;/&gt;</span><span>PasteVault</span></Link>
      <section><p className="not-found-code">404</p><p className="eyebrow">Lost snippet?</p><h1>We couldn’t find that page.</h1><p>The link may be outdated, or this page may have moved.</p><Link className="button button-primary" to="/dashboard">Return to dashboard</Link></section>
    </main>
  )
}

export default NotFound
