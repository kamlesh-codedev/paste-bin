import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import PasteCard from '../../components/PasteCard.jsx'
import useAuth from '../../hooks/useAuth.js'
import { deletePaste, getPastes } from '../../services/pasteService.js'
import { getApiErrorMessage } from '../../utils/apiError.js'

const initialPagination = { page: 1, per_page: 10, total: 0, pages: 0 }

function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [pastes, setPastes] = useState([])
  const [pagination, setPagination] = useState(initialPagination)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState('all')
  const [pasteToDelete, setPasteToDelete] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '')

  const loadPastes = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const responseData = await getPastes({ page: currentPage, perPage: initialPagination.per_page })
      
      setPastes(responseData.pastes)
      setPagination(responseData.pagination)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to load your pastes.'))
    } finally {
      setIsLoading(false)
    }
  }, [currentPage])

  useEffect(() => {
    const loadingTimer = window.setTimeout(() => {
      void loadPastes()
    }, 0)

    return () => window.clearTimeout(loadingTimer)
  }, [loadPastes])

  const visiblePastes = useMemo(() => pastes.filter((paste) => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    const matchesSearch = !normalizedSearch
      || paste.title.toLowerCase().includes(normalizedSearch)
      || paste.language.toLowerCase().includes(normalizedSearch)
    const matchesVisibility = visibilityFilter === 'all' || paste.visibility === visibilityFilter
    return matchesSearch && matchesVisibility
  }), [pastes, searchTerm, visibilityFilter])

  const publicPastes = pastes.filter((paste) => paste.visibility === 'public').length
  const privatePastes = pastes.filter((paste) => paste.visibility === 'private').length
  const pageNumbers = Array.from({ length: pagination.pages }, (_, index) => index + 1)

  const handleDelete = async () => {
    if (!pasteToDelete) return

    setIsDeleting(true)
    setError('')

    try {
      const responseData = await deletePaste(pasteToDelete.public_id)
      const nextPage = pastes.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage

      setPasteToDelete(null)
      setSuccessMessage(responseData.message)

      if (nextPage !== currentPage) {
        setCurrentPage(nextPage)
      } else {
        await loadPastes()
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to delete this paste.'))
    } finally {
      setIsDeleting(false)
    }
  }
  

// Add this line right before the return statement:
  const isDashboardPage = location.pathname === '/' || location.pathname === '/dashboard'

  return (
    <div className="page-container dashboard-page">
      
      {/* This condition ensures the header and stats only show on the Dashboard */}
      {isDashboardPage && (
        <>
          <section className="page-header">
            <div>
              <p className="eyebrow">Your workspace</p>
              <h1>Welcome back, {user?.username || user?.email || 'there'}.</h1>
              <p>Keep your useful snippets ready for the next time you need them.</p>
            </div>
            <button className="button button-primary" type="button" onClick={() => navigate('/pastes/new')}>
              <span aria-hidden="true">+</span> Create new paste
            </button>
          </section>

          <section className="stat-grid" aria-label="Paste statistics">
            <article className="stat-card"><span className="stat-icon" aria-hidden="true">▤</span><div><span>Total pastes</span><strong>{pagination.total}</strong><small>Across all pages</small></div></article>
            <article className="stat-card"><span className="stat-icon stat-icon-public" aria-hidden="true">◉</span><div><span>Public pastes</span><strong>{publicPastes}</strong><small>On this page</small></div></article>
            <article className="stat-card"><span className="stat-icon stat-icon-private" aria-hidden="true">◒</span><div><span>Private pastes</span><strong>{privatePastes}</strong><small>On this page</small></div></article>
          </section>
        </>
      )}

      {/* The recent pastes list will show on BOTH pages */}
      <section className="content-card recent-pastes">
        <div className="section-heading">
          <div><h2>Recent pastes</h2><p>Your newest pastes are shown first.</p></div>
          <button className="text-button" type="button" onClick={() => { setSearchTerm(''); setVisibilityFilter('all') }}>Clear filters</button>
        </div>
        {successMessage && <div className="alert alert-success" role="status"><span aria-hidden="true">✓</span><p>{successMessage}</p><button className="icon-button" type="button" aria-label="Dismiss message" onClick={() => setSuccessMessage('')}>×</button></div>}
        <ErrorMessage message={error} onDismiss={() => setError('')} />
        <div className="filter-bar">
          <label className="search-field"><span className="sr-only">Search pastes on this page</span><span aria-hidden="true">⌕</span><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search this page" /></label>
          <label className="filter-select"><span className="sr-only">Filter by visibility</span><select value={visibilityFilter} onChange={(event) => setVisibilityFilter(event.target.value)}><option value="all">All visibility</option><option value="public">Public</option><option value="private">Private</option></select></label>
        </div>
        {isLoading ? (
          <div className="empty-state"><LoadingSpinner label="Loading your pastes" /></div>
        ) : visiblePastes.length ? (
          <div className="paste-list">
            {visiblePastes.map((paste) => (
              <PasteCard
                key={paste.public_id}
                paste={paste}
                onView={(selectedPaste) => navigate(`/pastes/${selectedPaste.public_id}`)}
                onEdit={(selectedPaste) => navigate(`/pastes/${selectedPaste.public_id}/edit`)}
                onShare={(selectedPaste) => navigate(`/share/${selectedPaste.public_id}`)}
                onDelete={setPasteToDelete}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state"><span aria-hidden="true">⌕</span><h3>{pastes.length ? 'No matching pastes' : 'No pastes yet'}</h3><p>{pastes.length ? 'Try a different search term or visibility filter.' : 'Create your first paste to start building your vault.'}</p><button className="button button-secondary" type="button" onClick={() => navigate('/pastes/new')}>Create paste</button></div>
        )}
        {pagination.pages > 0 && <nav className="pagination" aria-label="Paste list pages"><button type="button" disabled={currentPage === 1 || isLoading} onClick={() => setCurrentPage((page) => page - 1)}>Previous</button>{pageNumbers.map((pageNumber) => <button key={pageNumber} className={pageNumber === currentPage ? 'is-current' : ''} type="button" aria-current={pageNumber === currentPage ? 'page' : undefined} disabled={isLoading} onClick={() => setCurrentPage(pageNumber)}>{pageNumber}</button>)}<button type="button" disabled={currentPage === pagination.pages || isLoading} onClick={() => setCurrentPage((page) => page + 1)}>Next</button></nav>}
      </section>
      <ConfirmDialog open={Boolean(pasteToDelete)} title="Delete this paste?" message={`“${pasteToDelete?.title ?? ''}” will be permanently deleted.`} isConfirming={isDeleting} onCancel={() => setPasteToDelete(null)} onConfirm={handleDelete} />
    </div>
  )
}

export default Dashboard