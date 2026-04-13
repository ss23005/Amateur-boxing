import { useState, useEffect, useRef } from 'react'
import api from '../../services/api'

export default function NewMessageModal({ onClose, onStart }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [starting, setStarting] = useState(false)
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

  const handleSelect = async (userId) => {
    setStarting(true)
    try {
      const { data } = await api.get(`/messages/with/${userId}`)
      onStart(data._id)
    } catch (err) {
      console.error('Failed to start conversation', err)
      setStarting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box nm-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">New Message</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="nm-search-wrap">
          <input
            ref={inputRef}
            className="input nm-search-input"
            placeholder="Search by name…"
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
              onClick={() => handleSelect(u._id)}
              disabled={starting}
            >
              <div className="nm-result-avatar">{u.name.charAt(0).toUpperCase()}</div>
              <div className="nm-result-info">
                <span className="nm-result-name">{u.name}</span>
                <span className="nm-result-role">{u.role}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
