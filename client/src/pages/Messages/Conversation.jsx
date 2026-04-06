import { useParams } from 'react-router-dom'
import { useFetch } from '../../hooks/useFetch'

export default function Conversation() {
  const { id } = useParams()
  const { data: conversation, loading, error } = useFetch(`/messages/${id}`)

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>
  if (!conversation) return null

  return (
    <div>
      <h2>Conversation</h2>
      {conversation.messages?.map((msg, i) => (
        <div key={i} style={{ marginBottom: '0.5rem' }}>
          <strong>{msg.sender?.name ?? 'User'}:</strong> {msg.content}
        </div>
      ))}
    </div>
  )
}
