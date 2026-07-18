import { useEffect, useRef } from 'react'

// Auto-discovers every image dropped into client/src/assets/avatars/
const modules = import.meta.glob('../../assets/avatars/*.{png,jpg,jpeg,webp,svg,avif}', { eager: true })
const PRESET_AVATARS = Object.values(modules).map(m => m.default)

export default function AvatarPicker({ selected, onSelect, onClose }) {
  const backdropRef = useRef(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (PRESET_AVATARS.length === 0) {
    return (
      <div className="modal-backdrop" ref={backdropRef} onClick={e => { if (e.target === backdropRef.current) onClose() }}>
        <div className="modal-box" style={{ maxWidth: 360, textAlign: 'center' }}>
          <div className="modal-header">
            <h2 className="modal-title">Choose Avatar</h2>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 12 }}>
            No avatar images found. Add images to<br />
            <code style={{ fontSize: 12 }}>client/src/assets/avatars/</code> and rebuild.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="modal-backdrop"
      ref={backdropRef}
      onClick={e => { if (e.target === backdropRef.current) onClose() }}
    >
      <div className="modal-box avatar-picker-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Choose your avatar</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="avatar-picker-grid">
          {PRESET_AVATARS.map((src) => (
            <button
              key={src}
              type="button"
              className={`avatar-picker-option${selected === src ? ' avatar-picker-option--selected' : ''}`}
              onClick={() => { onSelect(src); onClose() }}
            >
              <img src={src} alt="" draggable={false} />
              {selected === src && (
                <span className="avatar-picker-check">
                  <svg viewBox="0 0 12 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 5 5 9 11 1"/>
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
