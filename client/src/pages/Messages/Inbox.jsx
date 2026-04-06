import { useFetch } from '../../hooks/useFetch'
import { Link } from 'react-router-dom'

export default function Inbox() {
  const { data: conversations, loading, error } = useFetch('/messages')

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div>
      <h2>Inbox</h2>
      {conversations?.length === 0 && <p>No conversations yet.</p>}
      <ul>
        {conversations?.map((c) => {
          const other = c.participants?.find((p) => p._id !== c._id)
          return (
            <li key={c._id}>
              <Link to={`/messages/${c._id}`}>{other?.name ?? 'Conversation'}</Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
