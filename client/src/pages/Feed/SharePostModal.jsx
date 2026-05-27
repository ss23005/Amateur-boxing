import { useState, useEffect, useRef } from 'react'
import api from '../../services/api'

export default function SharePostModal({ post, onClose }) {
  const [query,    setQuery]    = useState('')
  const [results,  setResults]  = useState([])
  const [searching, setSearching] = useState(false)
  const [sentTo,   setSentTo]   = useState({})   // { userId: 'sending' | 'sent' }
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const { data } = await api.get(`/users/search?q=${encodeURIComponent(query.trim())}`)
        setResults(data)
      } catch { setResults([]) }
      finally { setSearching(false) }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleSend = async (userId) => {
    if (sentTo[userId]) return
    setSentTo(prev => ({ ...prev, [userId]: 'sending' }))
    try {
      const { data: conv } = await api.get(`/messages/with/${userId}`)
      await api.post(`/messages/${conv._id}`, { postId: post._id })
      setSentTo(prev => ({ ...prev, [userId]: 'sent' }))
    } catch {
      setSentTo(prev => { const s = { ...prev }; delete s[userId]; return s })
    }
  }

  const rawMedia = post.media?.[0]
  const hasImage = rawMedia && (rawMedia.startsWith('data:') || rawMedia.startsWith('http'))
  const authorName = post.author?.name ?? 'Anonymous'

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box spm-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Send Post</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Post preview */}
        <div className="spm-post-preview">
          {hasImage ? (
            <img src={post.media[0]} alt="" className="spm-preview-img" />
          ) : (
            <div className="spm-preview-text">{post.content}</div>
          )}
          <div className="spm-preview-meta">
            <span className="spm-preview-author">{authorName}</span>
            {hasImage && post.content && (
              <span className="spm-preview-caption">{post.content}</span>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="nm-search-wrap" style={{ paddingTop: 12 }}>
          <input
            ref={inputRef}
            className="input nm-search-input"
            placeholder="Search people…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        {/* Results */}
        <div className="nm-results">
          {searching && <p className="nm-status">Searching…</p>}
          {!searching && query.length >= 2 && results.length === 0 && (
            <p className="nm-status">No users found</p>
          )}
          {results.map(u => {
            const state = sentTo[u._id]
            return (
              <div key={u._id} className="nm-result-item spm-result-item">
                <div className="nm-result-avatar">{u.name.charAt(0).toUpperCase()}</div>
                <div className="nm-result-info">
                  <span className="nm-result-name">{u.name}</span>
                  <span className="nm-result-role">{u.role}</span>
                </div>
                <button
                  className={`spm-send-btn${state === 'sent' ? ' spm-send-btn--sent' : ''}`}
                  onClick={() => handleSend(u._id)}
                  disabled={!!state}
                >
                  {state === 'sending' ? '…' : state === 'sent' ? 'Sent' : 'Send'}
                </button>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
