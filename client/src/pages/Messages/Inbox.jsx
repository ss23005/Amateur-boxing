import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFetch } from '../../hooks/useFetch'
import { useAuth } from '../../hooks/useAuth'
import NewMessageModal from './NewMessageModal'

export default function Inbox() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: conversations, loading, error } = useFetch('/messages')
  const [showNew, setShowNew] = useState(false)

  const handleConversationStart = (conversationId) => {
    setShowNew(false)
    navigate(`/messages/${conversationId}`)
  }

  if (loading) return <div className="loading-state">Loading inbox…</div>
  if (error) return (
    <div className="page">
      <div className="error-banner">Error: {error}</div>
    </div>
  )

  return (
    <div className="page">
      <div className="page-header" data-tutorial="messages-main">
        <div>
          <p className="page-eyebrow">Direct Messages</p>
          <h1 className="page-title">Inbox</h1>
        </div>
        <button className="btn btn-red btn-sm" onClick={() => setShowNew(true)}>
          + New Message
        </button>
      </div>

      {(!conversations || conversations.length === 0) && (
        <div className="empty-state">
          <p className="empty-state-title">No Conversations</p>
          <p className="empty-state-desc">Start a conversation with someone you follow.</p>
        </div>
      )}

      <div className="inbox-list">
        {conversations?.map((c) => {
          const other = c.participants?.find(p => String(p._id) !== String(user?._id))
          const name = other?.name ?? 'Conversation'
          const initial = name.charAt(0).toUpperCase()
          const preview = c.lastMessagePreview
          return (
            <Link key={c._id} to={`/messages/${c._id}`} className="inbox-item">
              <div className="inbox-avatar">{initial}</div>
              <div className="inbox-item-info">
                <span className="inbox-name">{name}</span>
                {preview && <span className="inbox-preview">{preview}</span>}
              </div>
              <span className="inbox-arrow">›</span>
            </Link>
          )
        })}
      </div>

      {showNew && (
        <NewMessageModal
          onClose={() => setShowNew(false)}
          onStart={handleConversationStart}
        />
      )}
    </div>
  )
}
