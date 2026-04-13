import { useState, useEffect, useRef } from 'react'
import api from '../../services/api'

export default function SharePostModal({ post, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [sent, setSent] = useState(null)   // userId of who it was sent to
  const [sending, setSending] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const { data } = await api.get(`/users/search?q=${encodeURIComponent(query.trim())}`)
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleSend = async (userId) => {
    if (sending) return
    setSending(true)
    try {
      // Get or create conversation
      const { data: convo } = await api.get(`/messages/with/${userId}`)
      // Send the post as a message
      await api.post(`/messages/${convo._id}`, {
        content: '',
        postId: post._id,
      })
      setSent(userId)
      setTimeout(onClose, 1200)
    } catch (err) {
      console.error('Share failed', err)
      setSending(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box nm-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Share Post</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="spm-post-preview">
          <p className="spm-post-text">
            {post.content?.length > 80 ? post.content.slice(0, 80) + '…' : post.content}
          </p>
        </div>

        <div className="nm-search-wrap" style={{ marginTop: 12 }}>
          <input
            ref={inputRef}
            className="input nm-search-input"
            placeholder="Search who to send to…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <div className="nm-results">
          {searching && <p className="nm-status">Searching…</p>}
          {!searching && query.length >= 2 && results.length === 0 && (
            <p className="nm-status">No users found</p>
          )}
          {results.map(u => (
            <button
              key={u._id}
              className="nm-result-item"
              onClick={() => handleSend(u._id)}
              disabled={sending || sent === u._id}
            >
              <div className="nm-result-avatar">{u.name.charAt(0).toUpperCase()}</div>
              <div className="nm-result-info">
                <span className="nm-result-name">{u.name}</span>
                <span className="nm-result-role">{u.role}</span>
              </div>
              {sent === u._id && <span className="spm-sent-label">Sent!</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
