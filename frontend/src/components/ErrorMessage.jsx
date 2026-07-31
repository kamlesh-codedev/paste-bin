function ErrorMessage({ message, onDismiss }) {
  if (!message) return null

  return (
    <div className="alert alert-error" role="alert">
      <span aria-hidden="true">!</span>
      <p>{message}</p>
      {onDismiss && <button className="icon-button" type="button" aria-label="Dismiss error" onClick={onDismiss}>×</button>}
    </div>
  )
}

export default ErrorMessage
