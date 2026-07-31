import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import PasteEditor from '../../components/PasteEditor.jsx'
import { createPaste } from '../../services/pasteService.js'
import { getApiErrorMessage } from '../../utils/apiError.js'
import { toPastePayload } from '../../utils/pastePayload.js'

function CreatePaste() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async (formValues) => {
    setError('')
    setIsSubmitting(true)

    try {
      const responseData = await createPaste(toPastePayload(formValues))
      navigate(`/pastes/${responseData.paste.public_id}`, {
        replace: true,
        state: { message: responseData.message },
      })
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to create this paste.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-container editor-page">
      <section className="page-header page-header-compact"><div><p className="eyebrow">New snippet</p><h1>Create a paste</h1><p>Save code, notes, and examples you want to find again.</p></div></section>
      <section className="content-card"><ErrorMessage message={error} onDismiss={() => setError('')} /><PasteEditor onSubmit={handleCreate} onCancel={() => navigate('/dashboard')} isLoading={isSubmitting} /></section>
    </div>
  )
}

export default CreatePaste
