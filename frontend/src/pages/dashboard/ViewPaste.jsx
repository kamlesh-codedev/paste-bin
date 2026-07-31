import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import { deletePaste, getPaste } from '../../services/pasteService.js'
import { getApiErrorMessage } from '../../utils/apiError.js'
import { formatDateTime } from '../../utils/dateFormat.js'

function ViewPaste() {
  const { publicId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [paste, setPaste] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCopied, setIsCopied] = useState(false)
  const [isShareCopied, setIsShareCopied] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '')

  useEffect(() => {
    let isCurrent = true

    async function loadPaste() {
      setIsLoading(true)
      setError('')

      try {
        const responseData = await getPaste(publicId)
        if (isCurrent) setPaste(responseData.paste)
      } catch (requestError) {
        if (isCurrent) setError(getApiErrorMessage(requestError, 'Unable to load this paste.'))
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    void loadPaste()
    return () => { isCurrent = false }
  }, [publicId])

  const copyToClipboard = async (value, onCopied) => {
    if (!navigator.clipboard) {
      setError('Copying is not available in this browser.')
      return
    }

    try {
      await navigator.clipboard.writeText(value)
      onCopied(true)
      window.setTimeout(() => onCopied(false), 1800)
    } catch {
      setError('Unable to copy to your clipboard.')
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setError('')

    try {
      const responseData = await deletePaste(publicId)
      navigate('/dashboard', { replace: true, state: { message: responseData.message } })
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to delete this paste.'))
      setIsDeleteDialogOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return <main className="route-loading"><LoadingSpinner label="Loading paste" /></main>
  }

  if (!paste) {
    return <div className="page-container view-paste-page"><ErrorMessage message={error || 'Paste not found.'} /><button className="button button-secondary" type="button" onClick={() => navigate('/dashboard')}>Back to dashboard</button></div>
  }

  const isPublic = paste.visibility === 'public'
  const shareUrl = `${window.location.origin}/share/${paste.public_id}`

  return (
    <div className="page-container view-paste-page">
      <section className="page-header page-header-compact">
        <div><p className="eyebrow">Paste ID: {paste.public_id}</p><h1>{paste.title}</h1><div className="badge-group"><span className="badge badge-language">{paste.language}</span><span className={`badge ${isPublic ? 'badge-public' : 'badge-private'}`}>{isPublic ? 'Public' : 'Private'}</span></div></div>
        <div className="header-actions"><button className="button button-secondary" type="button" onClick={() => copyToClipboard(paste.content, setIsCopied)}>{isCopied ? 'Copied!' : 'Copy code'}</button><button className="button button-primary" type="button" onClick={() => navigate(`/pastes/${publicId}/edit`)}>Edit paste</button></div>
      </section>
      {successMessage && <div className="alert alert-success" role="status"><span aria-hidden="true">✓</span><p>{successMessage}</p><button className="icon-button" type="button" aria-label="Dismiss message" onClick={() => setSuccessMessage('')}>×</button></div>}
      <ErrorMessage message={error} onDismiss={() => setError('')} />
      <section className="view-paste-grid">
        <article className="code-card">
          <div className="code-card-toolbar"><span><i aria-hidden="true" /> <i aria-hidden="true" /> <i aria-hidden="true" /></span><span>{paste.language}</span></div>
          <pre><code>{paste.content}</code></pre>
        </article>
        <aside className="paste-details content-card">
          <h2>Paste details</h2>
          <dl><div><dt>Created</dt><dd>{formatDateTime(paste.created_at)}</dd></div><div><dt>Last updated</dt><dd>{formatDateTime(paste.updated_at)}</dd></div><div><dt>Expiration</dt><dd>{formatDateTime(paste.expires_at, 'Not provided by API')}</dd></div><div><dt>Visibility</dt><dd>{isPublic ? 'Anyone with the link' : 'Only your workspace'}</dd></div></dl>
          <div className="stack-actions"><button className="button button-secondary button-block" type="button" onClick={() => copyToClipboard(shareUrl, setIsShareCopied)}>{isShareCopied ? 'Share link copied!' : '↗ Share paste'}</button><button className="button button-danger-outline button-block" type="button" onClick={() => setIsDeleteDialogOpen(true)}>Delete paste</button></div>
        </aside>
      </section>
      <ConfirmDialog open={isDeleteDialogOpen} title="Delete this paste?" message="This action cannot be undone." isConfirming={isDeleting} onCancel={() => setIsDeleteDialogOpen(false)} onConfirm={handleDelete} />
    </div>
  )
}

export default ViewPaste
