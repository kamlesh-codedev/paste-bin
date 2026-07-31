import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import PasteEditor from '../../components/PasteEditor.jsx'
import { getPaste, updatePaste } from '../../services/pasteService.js'
import { getApiErrorMessage } from '../../utils/apiError.js'
import { toDateTimeLocal } from '../../utils/dateFormat.js'
import { toPastePayload } from '../../utils/pastePayload.js'

function toEditorValues(paste) {
  return {
    title: paste.title,
    content: paste.content,
    language: paste.language,
    visibility: paste.visibility,
    expiration: paste.expires_at ? 'custom' : 'never',
    customExpiration: toDateTimeLocal(paste.expires_at),
  }
}

function EditPaste() {
  const navigate = useNavigate()
  const location = useLocation()
  const { publicId } = useParams()
  const [paste, setPaste] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

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

  const handleUpdate = async (formValues) => {
    setError('')
    setIsSubmitting(true)

    try {
      const responseData = await updatePaste(publicId, toPastePayload(formValues))
      navigate(`/pastes/${publicId}`, {
        replace: true,
        state: { message: responseData.message },
      })
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to update this paste.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-container editor-page">
      <section className="page-header page-header-compact"><div><p className="eyebrow">Editing {publicId}</p><h1>Edit paste</h1><p>Update the code and details, then save your changes.</p></div></section>
      <section className="content-card">
        <ErrorMessage message={error} onDismiss={() => setError('')} />
        {isLoading ? <div className="editor-loading"><LoadingSpinner label="Loading paste" /></div> : paste && <PasteEditor key={publicId} initialPaste={toEditorValues(paste)} mode="edit" onSubmit={handleUpdate} onCancel={() => navigate(`/pastes/${publicId}`, { state: location.state })} isLoading={isSubmitting} />}
      </section>
    </div>
  )
}

export default EditPaste
