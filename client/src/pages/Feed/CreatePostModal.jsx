import { useState, useRef, useCallback } from 'react'
import api from '../../services/api'

export default function CreatePostModal({ onClose, onCreated }) {
  const [step,     setStep]     = useState(1)   // 1 = select, 2 = caption
  const [file,     setFile]     = useState(null)
  const [preview,  setPreview]  = useState(null)
  const [caption,  setCaption]  = useState('')
  const [dragging, setDragging] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const fileRef = useRef()

  const pickFile = (f) => {
    if (!f || !f.type.startsWith('image/')) { setError('Please pick an image file.'); return }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setError('')
    setStep(2)
  }

  const onInputChange = (e) => pickFile(e.target.files?.[0])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    pickFile(e.dataTransfer.files?.[0])
  }, [])

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file && !caption.trim()) { setError('Add a photo or write something.'); return }
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      if (file) fd.append('image', file)
      fd.append('content', caption)

      const { data } = await api.post('/feed', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onCreated(data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to post. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cp-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="cp-modal">

        {/* Header */}
        <div className="cp-header">
          {step === 2 && (
            <button className="cp-back" onClick={() => { setStep(1); setFile(null); setPreview(null) }}>
              ‹ Back
            </button>
          )}
          <h2 className="cp-title">
            {step === 1 ? 'New Post' : 'Add Caption'}
          </h2>
          <button className="cp-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Step 1 — Select image */}
        {step === 1 && (
          <div
            className={`cp-dropzone${dragging ? ' dragging' : ''}`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={onInputChange}
            />
            <div className="cp-drop-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            </div>
            <p className="cp-drop-title">Drag photo here</p>
            <p className="cp-drop-sub">or click to browse from your device</p>
            <button
              className="btn btn-primary"
              type="button"
              style={{ marginTop: 20 }}
              onClick={(e) => { e.stopPropagation(); fileRef.current?.click() }}
            >
              Select Photo
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              style={{ marginTop: 10 }}
              onClick={(e) => { e.stopPropagation(); setStep(2) }}
            >
              Text post (no photo)
            </button>
          </div>
        )}

        {/* Step 2 — Caption + preview */}
        {step === 2 && (
          <form className="cp-compose" onSubmit={handleSubmit}>
            {preview && (
              <div className="cp-preview">
                <img src={preview} alt="Preview" />
              </div>
            )}
            <div className="cp-caption-area">
              <textarea
                className="cp-textarea"
                placeholder="Write a caption…"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={4}
                autoFocus
              />
              {error && <p className="cp-error">{error}</p>}
              <button
                className="btn btn-primary"
                type="submit"
                disabled={loading}
                style={{ width: '100%', marginTop: 12 }}
              >
                {loading ? 'Sharing…' : 'Share'}
              </button>
            </div>
          </form>
        )}

        {error && step === 1 && <p className="cp-error" style={{ padding: '0 24px 16px' }}>{error}</p>}
      </div>
    </div>
  )
}
