import { useFetch } from '../../hooks/useFetch'
import { Link } from 'react-router-dom'

export default function FighterList() {
  const { data: fighters, loading, error } = useFetch('/fighters')

  if (loading) return <p>Loading fighters...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div>
      <h2>Fighters</h2>
      {fighters?.length === 0 && <p>No fighters yet.</p>}
      <ul>
        {fighters?.map((f) => (
          <li key={f._id}>
            <Link to={`/fighters/${f._id}`}>{f.name}</Link> — {f.weightClass}
          </li>
        ))}
      </ul>
    </div>
  )
}
