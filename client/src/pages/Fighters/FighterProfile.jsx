import { useParams } from 'react-router-dom'
import { useFetch } from '../../hooks/useFetch'

export default function FighterProfile() {
  const { id } = useParams()
  const { data: fighter, loading, error } = useFetch(`/fighters/${id}`)

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>
  if (!fighter) return null

  const { record } = fighter
  return (
    <div>
      <h2>{fighter.name}</h2>
      <p>{fighter.weightClass}</p>
      <p>Record: {record.wins}W - {record.losses}L - {record.draws}D</p>
      <p>{fighter.bio}</p>
    </div>
  )
}
