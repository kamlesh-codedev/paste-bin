import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ErrorMessage from '../components/ErrorMessage.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import { getPublicPaste } from '../services/pasteService.js'
import { getApiErrorMessage } from '../utils/apiError.js'
import { formatDateTime } from '../utils/dateFormat.js'

const stateCopy = {
  403: ['This paste is private', 'This paste is only available within the author’s workspace.', '⌘'],
  404: ['Paste not found', 'This link may be incorrect, or the paste may have been removed.', '⌘'],
  410: ['This paste has expired', 'The author set an expiration time for this shared paste.', '◷'],
}

function PublicPaste() {
  const { publicId } = useParams()
  const [paste, setPaste] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState('')
  const [errorStatus, setErrorStatus] = useState(null)

  useEffect(() => {
    let isCurrent = true

    async function loadPublicPaste() {
      setIsLoading(true)
      setError('')
      setErrorStatus(null)

      try {
        const responseData = await getPublicPaste(publicId)
        if (isCurrent) setPaste(responseData.paste)
      } catch (requestError) {
        if (isCurrent) {
          setErrorStatus(requestError?.response?.status || null)
          setError(getApiErrorMessage(requestError, 'Unable to load this shared paste.'))
        }
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    void loadPublicPaste()
    return () => { isCurrent = false }
  }, [publicId])

  const handleCopy = async () => {
    if (!paste || !navigator.clipboard) {
      setError('Copying is not available in this browser.')
      return
    }

    try {
      await navigator.clipboard.writeText(paste.content)
      setIsCopied(true)
      window.setTimeout(() => setIsCopied(false), 1800)
    } catch {
      setError('Unable to copy to your clipboard.')
    }
  }

  if (isLoading) {
    return <main className="public-page public-state"><LoadingSpinner label="Loading shared paste" /></main>
  }

  if (!paste && stateCopy[errorStatus]) {
    const [title, description, icon] = stateCopy[errorStatus]
    return <main className="public-page public-state"><Link className="brand" to="/"><span className="brand-mark" aria-hidden="true">&lt;/&gt;</span><span>PasteVault</span></Link><section className="public-state-card"><span className="state-icon" aria-hidden="true">{icon}</span><h1>{title}</h1><p>{description}</p><Link className="button button-primary" to="/login">Go to PasteVault</Link></section></main>
  }

  if (!paste) {
    return <main className="public-page public-state"><Link className="brand" to="/"><span className="brand-mark" aria-hidden="true">&lt;/&gt;</span><span>PasteVault</span></Link><section className="public-state-card"><span className="state-icon" aria-hidden="true">!</span><h1>Unable to load this paste</h1><ErrorMessage message={error} /><Link className="button button-primary" to="/login">Go to PasteVault</Link></section></main>
  }

  return (
    <main className="public-page">
      <header className="public-header"><Link className="brand" to="/"><span className="brand-mark" aria-hidden="true">&lt;/&gt;</span><span>PasteVault</span></Link><Link className="button button-ghost button-small" to="/login">← Back to PasteVault</Link></header>
      <section className="public-paste-container">
        <div className="public-paste-heading"><div><p className="eyebrow">Shared with PasteVault</p><h1>{paste.title}</h1><div className="badge-group"><span className="badge badge-language">{paste.language}</span><span className="badge badge-public">Public</span></div></div><button className="button button-secondary" type="button" onClick={handleCopy}>{isCopied ? 'Copied!' : 'Copy code'}</button></div>
        <ErrorMessage message={error} onDismiss={() => setError('')} />
        <div className="public-meta"><span>Created {formatDateTime(paste.created_at)}</span><span>{paste.expires_at ? `Expires ${formatDateTime(paste.expires_at)}` : 'Never expires'}</span></div>
        <article className="code-card"><div className="code-card-toolbar"><span><i aria-hidden="true" /> <i aria-hidden="true" /> <i aria-hidden="true" /></span><span>{paste.language}</span></div><pre><code>{paste.content}</code></pre></article>
      </section>
    </main>
  )
}

export default PublicPaste
