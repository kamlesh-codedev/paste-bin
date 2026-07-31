import { formatDateTime } from '../utils/dateFormat.js'

function PasteCard({ paste, onView, onEdit, onShare, onDelete }) {
  const isPublic = paste.visibility === 'public'
  const hasExpiration = Object.prototype.hasOwnProperty.call(paste, 'expires_at')
  const preview = paste.content
    ? paste.content.replace(/\s+/g, ' ').slice(0, 150)
    : 'Open this paste to view its content.'
  const expirationLabel = hasExpiration
    ? paste.expires_at ? `Expires ${formatDateTime(paste.expires_at)}` : 'Never expires'
    : 'Expiration available in paste details'

  return (
    <article className="paste-card">
      <div className="paste-card-main">
        <div className="paste-card-heading">
          <div>
            <h3>{paste.title}</h3>
            <p className="paste-card-meta">Created {formatDateTime(paste.created_at)}</p>
          </div>
          <div className="badge-group">
            <span className="badge badge-language">{paste.language}</span>
            <span className={`badge ${isPublic ? 'badge-public' : 'badge-private'}`}>
              {isPublic ? 'Public' : 'Private'}
            </span>
          </div>
        </div>
        <p className="paste-card-preview">{preview}</p>
        <p className="paste-card-expiration"><span aria-hidden="true">◷</span> {expirationLabel}</p>
      </div>
      <div className="paste-card-actions" aria-label={`Actions for ${paste.title}`}>
        <button className="button button-secondary button-small" type="button" onClick={() => onView?.(paste)}>View</button>
        <button className="icon-button" type="button" aria-label={`Edit ${paste.title}`} onClick={() => onEdit?.(paste)}>✎</button>
        <button className="icon-button" type="button" aria-label={`Share ${paste.title}`} onClick={() => onShare?.(paste)}>↗</button>
        <button className="icon-button icon-button-danger" type="button" aria-label={`Delete ${paste.title}`} onClick={() => onDelete?.(paste)}>⌫</button>
      </div>
    </article>
  )
}

export default PasteCard
