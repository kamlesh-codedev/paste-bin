function LoadingSpinner({ label = 'Loading' }) {
  return (
    <span className="loading-spinner" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </span>
  )
}

export default LoadingSpinner
