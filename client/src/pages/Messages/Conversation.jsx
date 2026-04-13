import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useSocket } from '../../hooks/useSocket'
import api from '../../services/api'

export default function Conversation() {
  const { id } = useParams()
  const { user } = useAuth()
  const socketRef = useSocket()

  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)

  // Load conversation
  useEffect(() => {
    setLoading(true)
    api.get(`/messages/${id}`)
      .then(({ data }) => {
        setConversation(data)
        setMessages(data.messages || [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load conversation')
        setLoading(false)
      })
  }, [id])

  // Socket: join room + listen
  useEffect(() => {
    const socket = socketRef.current
    if (!socket || !id) return

    socket.emit('join_room', id)

    const handleReceive = (data) => {
      setMessages(prev => [...prev, data.message])
    }
    socket.on('receive_message', handleReceive)

    return () => {
      socket.off('receive_message', handleReceive)
    }
  }, [id, socketRef])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(async (e) => {
    e.preventDefault()
    if (!text.trim() || sending) return

    setSending(true)
    try {
      const { data: newMsg } = await api.post(`/messages/${id}`, { content: text.trim() })
      setMessages(prev => [...prev, newMsg])
      setText('')

      // Emit to other participants
      socketRef.current?.emit('send_message', {
        roomId: id,
        message: newMsg,
      })
    } catch (err) {
      console.error('Send failed', err)
    } finally {
      setSending(false)
    }
  }, [id, text, sending, socketRef])

  if (loading) return <div className="loading-state">Loading…</div>
  if (error) return <div className="page"><div className="error-banner">{error}</div></div>
  if (!conversation) return null

  const other = conversation.participants?.find(p => String(p._id) !== String(user?._id))

  return (
    <div className="page conv-page">
      <Link to="/messages" className="back-link">← Back to Inbox</Link>

      <div className="conv-header">
        <div className="conv-header-avatar">{other?.name?.charAt(0)?.toUpperCase() ?? '?'}</div>
        <div>
          <p className="page-eyebrow">Messages</p>
          <h1 className="page-title">{other?.name ?? 'Conversation'}</h1>
        </div>
      </div>

      <div className="conv-thread">
        {messages.length === 0 && (
          <p className="conv-empty">No messages yet — say hello!</p>
        )}
        {messages.map((msg, i) => {
          const isMe = String(msg.sender?._id ?? msg.sender) === String(user?._id)
          return (
            <div key={msg._id ?? i} className={`conv-bubble-row${isMe ? ' conv-bubble-row--me' : ''}`}>
              {!isMe && (
                <div className="conv-bubble-avatar">
                  {(msg.sender?.name ?? other?.name ?? '?').charAt(0).toUpperCase()}
                </div>
              )}
              <div className={`conv-bubble${isMe ? ' conv-bubble--me' : ''}`}>
                {msg.sharedPost && (
                  <div className="conv-shared-post">
                    <p className="conv-shared-label">Shared post</p>
                    <p className="conv-shared-content">{msg.sharedPost.content}</p>
                  </div>
                )}
                {msg.content && <span>{msg.content}</span>}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form className="conv-input-row" onSubmit={handleSend}>
        <input
          className="conv-input"
          placeholder="Type a message…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend(e)}
          autoFocus
        />
        <button
          type="submit"
          className="conv-send-btn"
          disabled={!text.trim() || sending}
        >
          Send
        </button>
      </form>
    </div>
  )
}
