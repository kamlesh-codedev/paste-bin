function ConfirmDialog({ open, title = 'Are you sure?', message, confirmText = 'Delete', isConfirming = false, onConfirm, onCancel }) {
  if (!open) return null

  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <div className="dialog-icon" aria-hidden="true">!</div>
        <h2 id="dialog-title">{title}</h2>
        <p>{message}</p>
        <div className="dialog-actions">
          <button className="button button-secondary" type="button" onClick={onCancel} disabled={isConfirming}>Cancel</button>
          <button className="button button-danger" type="button" onClick={onConfirm} disabled={isConfirming}>{isConfirming ? 'Deleting…' : confirmText}</button>
        </div>
      </section>
    </div>
  )
}

export default ConfirmDialog
