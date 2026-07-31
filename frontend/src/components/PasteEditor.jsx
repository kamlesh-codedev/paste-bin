import { useState } from 'react'

const defaultPaste = {
  title: '',
  language: 'javascript',
  visibility: 'public',
  expiration: 'never',
  customExpiration: '',
  content: '',
}

function PasteEditor({ initialPaste = {}, mode = 'create', onSubmit, onCancel, isLoading = false }) {
  const [paste, setPaste] = useState({ ...defaultPaste, ...initialPaste })

  const handleChange = ({ target: { name, value } }) => {
    setPaste((currentPaste) => ({ ...currentPaste, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit?.(paste)
  }

  const isCustomExpiration = paste.expiration === 'custom'
  const primaryLabel = mode === 'edit' ? 'Save changes' : 'Create paste'

  return (
    <form className="paste-editor" onSubmit={handleSubmit}>
      <div className="form-grid form-grid-two">
        <label className="field">
          <span>Paste title</span>
          <input name="title" value={paste.title} onChange={handleChange} placeholder="e.g. Array utility functions" maxLength="120" required />
        </label>
        <label className="field">
          <span>Language</span>
          <select name="language" value={paste.language} onChange={handleChange}>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="css">CSS</option>
            <option value="html">HTML</option>
            <option value="json">JSON</option>
            <option value="plaintext">Plain text</option>
          </select>
        </label>
      </div>

      <div className="form-grid form-grid-two">
        <label className="field">
          <span>Visibility</span>
          <select name="visibility" value={paste.visibility} onChange={handleChange}>
            <option value="public">Public — anyone with the link</option>
            <option value="private">Private — only your workspace</option>
          </select>
        </label>
        <label className="field">
          <span>Expiration</span>
          <select name="expiration" value={paste.expiration} onChange={handleChange}>
            <option value="never">Never</option>
            <option value="1-day">After 1 day</option>
            <option value="7-days">After 7 days</option>
            <option value="30-days">After 30 days</option>
            <option value="custom">Custom date and time</option>
          </select>
        </label>
      </div>

      {isCustomExpiration && (
        <label className="field">
          <span>Custom expiration</span>
          <input name="customExpiration" type="datetime-local" value={paste.customExpiration} onChange={handleChange} required />
        </label>
      )}

      <label className="field field-code">
        <span>Code or content</span>
        <textarea
          name="content"
          value={paste.content}
          onChange={handleChange}
          placeholder="Paste your code or notes here..."
          spellCheck="false"
          required
        />
        <span className="field-hint">{paste.content.length.toLocaleString()} characters</span>
      </label>

      <div className="form-actions">
        <button className="button button-ghost" type="button" onClick={onCancel}>Cancel</button>
        <button className="button button-primary" type="submit" disabled={isLoading}>
          {isLoading ? 'Saving…' : primaryLabel}
        </button>
      </div>
    </form>
  )
}

export default PasteEditor
